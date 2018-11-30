/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import * as d3 from 'd3'
import 'd3-selection-multi'
import _ from 'lodash'
import {counterZoom} from '../../../lib/client/diagram-helper'

import { FilterResults, NODE_RADIUS } from './constants.js'

const lineFunction = d3.line()
  .x(d=>d.x)
  .y(d=>d.y)
  .curve(d3.curveBundle)

export default class LinkHelper {
  /**
   * Helper class to be used by TopologyDiagram.
   *
   * Contains functions to draw and manage links between nodes in the diagram.
   */
  constructor(svg, links, selfLinks, nodes, typeToShapeMap, diagramOptions) {
    this.links = links.concat(Object.values(selfLinks))
    this.svg = svg
    this.nodeMap = _.keyBy(nodes, 'layout.uid')
    this.typeToShapeMap = typeToShapeMap
    this.diagramOptions = diagramOptions
  }

  /**
   * Removes links from the diagram.
   *
   */
  removeOldLinksFromDiagram = () => {
    // filtered list is of the links that still exist
    // if d3 finds a node that doesn't exist in this list, it removes it
    this.svg.select('g.links')
      .selectAll('g.link')
      .data(this.links.filter((link)=>{
        let {source, target} = link
        const {layout} = link
        if (layout) {
          source = layout.source.uid
          target = layout.target.uid
        }
        return layout && this.nodeMap[source] && this.nodeMap[target]
      }), (l) => {
        return l.uid
      }).exit().remove()
  }

  /**
   * Adds new links to the SVG diagram.
   *
   * @param {*} currentZoom
   */
  addLinksToDiagram = (currentZoom) => {
    const links = this.svg.select('g.links')
      .selectAll('g.link')
    // if nodes have been consolidated, a link might not be drawn
      .data(this.links.filter(({layout})=>!!layout), l => {
        return l.uid
      })
      .enter().append('g')
      .attrs({
        'class': 'link',
        'transform': currentZoom
      })

    // add path
    links.append('path')
      .attrs((d) => {
        const {uid, layout} = d
        return {
          id: `link-${uid}`,
          ...getLinkMarkers(layout)
        }
      })


    // labels
    if (this.diagramOptions.showLineLabels) {
      const labels = this.svg.select('g.links')
        .selectAll('g.label')
      // if nodes have been consolidated, a link might not be drawn
        .data(this.links.filter(({layout})=>!!layout), l => {
          return l.uid
        })
        .enter().append('g')
        .attrs({
          'class': 'label',
          'transform': currentZoom
        })

      labels.append('text')
        .attr('class', 'linkText')
        .append('textPath')
        .attrs(({uid}) => {
          return {
            'xlink:href': `#link-${uid}`
          }
        })
        .styles({
          'text-anchor': 'middle',
        })
        .text((d) => { return d.label })
    }
  }

  moveLinks = (transition, currentZoom) => {
    // don't move looped dragged links
    let links = this.svg.select('g.links').selectAll('g.link').filter(({layout:{source:{dragged}}})=>{
      return !dragged
    })
      .attr('transform', currentZoom)

    const isHidden = (layout) =>{
      let {search=FilterResults.nosearch} = layout
      const {isLoop, source} = layout
      if (isLoop) {
        ({search=FilterResults.nosearch} = source)
      }
      return (search===FilterResults.hidden)
    }
    // if name search only show related links
    links
      .style('visibility', ({layout})=>{
        return isHidden(layout) ? 'hidden' : 'visible'
      })

    // if name search only set paths of related links
    links = links.filter(({layout})=>{
      return !isHidden(layout)
    })

    // set link path then back it away from node
    // so that end markers just touch the shape
    links.selectAll('path')
      .filter(({layout: {linePath}})=>{
        return !linePath
      })
      .attr('d', ({layout}) => {
        layout.linePath = lineFunction(layout.lineData)
        return layout.linePath
      })
    links.selectAll('path')
      .attrs(({layout},i,ns) => {
        const {x, y} = layout.transform ? layout.transform : {x:0, y:0}
        return {
          'd': getBackedOffPath(ns[i], layout, this.typeToShapeMap),
          'transform': `translate(${x}, ${y})`
        }
      })

    links
      .styles(({layout}) => {
        // set opacity to 0 if new path
        // we will transition it back when in new position
        const {linePath, lastPath} = layout
        const opacity = (!lastPath || linePath!==lastPath) ? 0.1 : 1.0
        layout.lastPath = linePath
        return {
          'opacity': opacity
        }
      })

    links
      .transition(transition)
      .style('opacity': 1.0)

    // move line labels
    if (this.diagramOptions.showLineLabels) {
      let labels = this.svg.select('g.links').selectAll('g.label')
        .attr('transform', currentZoom)

      labels
        .style('visibility', ({layout: {search=FilterResults.nosearch}})=>{
          return (search===FilterResults.hidden) ? 'hidden' : 'visible'
        })

      labels = labels.filter(({layout: {search=FilterResults.nosearch}})=>{
        return (search!==FilterResults.hidden)
      })

      labels.selectAll('text')
        .selectAll('textPath')
        .text(({layout={}, label}) => {
          return !label ? '' : (layout.isParallel ? '< both >' :
            (layout.isLoop ? label :
              (layout.isSwapped ? `< ${label}` : `${label} >`)))
        })
        .attrs(() => {
          return {
            'startOffset': '50%'
          }
        })
        .style('opacity', ({layout}) => {
          return layout.hidden ? 0.0 : 1.0
        })
    }
  }
}

export const dragLinks = (svg, d, typeToShapeMap) => {
  svg.select('g.links').selectAll('g.link').each((l,i,ns)=>{
    if (l.layout.source.uid === d.layout.uid || l.layout.target.uid === d.layout.uid) {
      const link = d3.select(ns[i])
      const path = link.selectAll('path')
      const layout = l.layout

      // set node position
      const {isLoop, source, target, isSwapped} = layout
      if (isLoop) {
        source.x = target.x = d.layout.x
        source.y = target.y = d.layout.y
      } else if (source.uid === d.layout.uid) {
        source.x = d.layout.x
        source.y = d.layout.y
      } else {
        target.x = d.layout.x
        target.y = d.layout.y
      }
      if (isSwapped) {
        delete layout.isSwapped
        path.attrs(() => {
          return {
            ...getLinkMarkers(layout)
          }
        })
      }

      // update path
      setDraggedLineData(layout)
      path.attr('d', () => {
        return lineFunction(layout.lineData)
      })
      path.attr('d', ({layout},i,ns) => {
        return getBackedOffPath(ns[i], layout, typeToShapeMap)
      })
    }
  })
}

export const setDraggedLineData = (layout) => {
  // calculate new lineData
  const {isLoop, source, target} = layout
  const {x: sx, y: sy} = source
  const {x: tx, y: ty} = target
  if (isLoop) {
    // path moved
    layout.lineData = getLoopLineData(sx, sy)
  } else {
    // else straighten out line
    layout.lineData = [
      {x: sx, y: sy},
      {x: tx, y: ty}
    ]
  }

  // path was originally created from the node position without transform applied
  // transform was then applied to the path after it was created
  // therefore to counteract that original transform we need to subtract it now
  // because we're now using the actual mouse position of the node
  const {x: xx, y: yy} = layout.transform ? layout.transform : {x:0, y:0}
  layout.lineData.forEach(pt=>{
    pt.x -= xx
    pt.y -= yy
  })
  delete layout.linePath
  delete layout.backedOff
}

export const getBackedOffPath = (svgPath, layout, typeToShapeMap) => {
  const {lineData, backedOff, source, target} = layout
  let {linePath} = layout
  if (!backedOff) {
    const {isMajorHub:isMajorSrcHub, isMinorHub:isMinorSrcHub, type:srcType} = source
    const {isMajorHub:isMajorTgtHub, isMinorHub:isMinorTgtHub, type:tgtType} = target
    const srcRadius = (typeToShapeMap[srcType]||{}).nodeRadius || NODE_RADIUS
    const tgtRadius = (typeToShapeMap[tgtType]||{}).nodeRadius || NODE_RADIUS
    const srcBackoff = isMajorSrcHub ? 18 : (isMinorSrcHub ? 15 : 0)
    const tgtBackoff = isMajorTgtHub ? 18 : (isMinorTgtHub ? 15 : 5)
    lineData[0] = svgPath.getPointAtLength(srcRadius+srcBackoff)
    lineData[lineData.length-1] =
       svgPath.getPointAtLength(svgPath.getTotalLength()-tgtRadius-tgtBackoff)
    linePath = layout.linePath = lineFunction(layout.lineData)
    layout.backedOff = true
  }
  return linePath
}

// do parallel, avoidance, self link layouts
export const layoutEdges = (newLayout, nodes, cyEdges, edges, showLineLabels, selfLinks, adapter) => {
  const laidoutEdges = []
  let nodeMap = null
  if (cyEdges.length>0) {
    let preparedColaRouting = false
    nodeMap = _.keyBy(nodes, 'layout.uid')
    cyEdges.forEach(edge=>{
      const {edge: {layout, uid}} = edge.data()

      // set path data on new edges
      // avoidance -- curve around nodes -- we use webcola's line router
      // else just a straight line
      if (!layout.lineData || newLayout) {
        layout.lineData = []
        delete layout.linePath
        delete layout.backedOff
        let {source: {uid: sid}, target: {uid: tid}} = layout
        const colaEdge = edge.scratch().cola
        if (nodeMap[sid] && nodeMap[tid]) {

          // flip line so that line label isn't upside down :(
          if (showLineLabels) {
            layout.isSwapped = nodeMap[sid].position.x > nodeMap[tid].position.x
            if (layout.isSwapped) {
              [tid, sid] = [sid, tid]
              if (colaEdge) {
                [colaEdge.target, colaEdge.source] = [colaEdge.source, colaEdge.target]
              }
            }
          }

          const {position: {x:x1, y:y1}} = nodeMap[sid]
          const {position: {x:x2, y:y2}} = nodeMap[tid]

          // if cola layout and a line is long, route the line around the nodes
          if (adapter && Math.hypot(x2 - x1, y2 - y1) > NODE_RADIUS*6) {

            if (!preparedColaRouting) {
              adapter.prepareEdgeRouting(20)
              // nodes need inner bounds
              adapter.nodes().forEach(node=>{
                node.innerBounds = node.bounds.inflate(-20)
              })
              preparedColaRouting = true
            }
            layout.lineData = adapter.routeEdge(colaEdge, 0)

          } else {
            // else do nothing--just a straight line
          }

          // add endpoints
          layout.lineData.unshift({x:x1, y:y1})
          layout.lineData.push({x:x2, y:y2})
        }
      }

      laidoutEdges.push({
        layout,
        uid
      })
    })

    // parallel -- two line between same nodes--we just put "both" as the label on the line
    // mark edges that are parellel so we offset them when drawing
    edges.forEach(({source, target})=>{
      edges.forEach(other=>{
        const {source:tgt, target:src, layout} = other
        if (source===src && target===tgt) {
          layout.isParallel = true
        }
      })
    })
  }

  // add self-links
  if (nodes.length) {
    nodeMap = nodeMap || _.keyBy(nodes, 'layout.uid')
    nodes.forEach(({layout: {selfLink}})=>{
      if (selfLink) {
        const {nodeLayout, link: {uid}} = selfLink
        let link = selfLinks[uid]
        if (!link) {
          link = selfLinks[uid] = selfLink.link
        }
        let {layout={}} = link
        if (!layout.lineData || newLayout) {
          const node = nodeMap[nodeLayout.uid]
          const {position: {x, y}} = node
          // loops-- curve back to itself
          delete layout.linePath
          delete layout.backedOff
          const lineData = getLoopLineData(x,y)
          layout = link.layout = Object.assign(layout, {
            source: nodeLayout,
            target: nodeLayout,
            search: nodeLayout.search,
            isLoop: true,
            lineData
          })
        }
        laidoutEdges.push({
          layout,
          uid
        })
      }
    })
  }
  return laidoutEdges
}


export const getLoopLineData = (x,y) => {
  return [
    {x:x+1, y:y},
    {x:x-90, y:y+20},
    {x:x-20, y:y-90},
    {x:x-1, y:y},
  ]
}


//interrupt any transition and make sure it has its final value
export const interruptLinks = (svg) => {
  svg.select('g.links').selectAll('g.link').interrupt().call((selection)=>{
    selection.each((d,i,ns) => {
      d3.select(ns[i]).style('opacity', 1.0)
    })
  })
}

export const counterZoomLinks = (svg, currentZoom, showLineLabels) => {
  if (svg) {
    const opacity = counterZoom(currentZoom.k, 0.35, 0.85, 0.5, 0.85)
    svg.select('g.links').selectAll('g.link')
      .each(({layout}, i, ns)=>{
        const {target:{search}} = layout
        const link = d3.select(ns[i])
        link.selectAll('path')
          .attrs(() => {
            return getLinkMarkers(layout, search)
          })
          .styles({
            'stroke-opacity': opacity
          })
      })

      // move line labels
    if (showLineLabels) {
      const fontSize = counterZoom(currentZoom.k, 0.2, 0.85, 10, 20)
      const labels = svg.select('g.links').selectAll('g.label')
      labels
        .selectAll('text.linkText')
        .style('font-size', fontSize+'px')
    }
  }
}

export const getLinkMarkers = ({isSwapped}, search=FilterResults.nosearch) => {
  let beg = 'url(#squarehead)'

  // if in search mode, use a faded arrow when pointing to a faded related shape
  // if path was reversed (to keep the textpath on top of the line) swap markers
  const isFaded = !(search===FilterResults.nosearch || search===FilterResults.match)
  let end = `url(#${isSwapped?'reversed':''}arrowhead${isFaded?'faded':''})`
  if (isSwapped) {
    [beg, end] = [end, beg]
  }
  return {
    'marker-start': beg,
    'marker-end': end
  }
}

export const defineLinkMarkers = (svg) => {

  const defineArrowheadMarker = (defs, id, className, reversed) =>{
    defs
      .append('marker')
      .attrs({
        id,
        refX: 2,
        refY: 7,
        orient: 'auto',
        markerWidth: 16,
        markerHeight: 16,
        markerUnits: 'userSpaceOnUse',
        xoverflow: 'visible'
      })
      .append('svg:path')
      .attr('d', reversed ? 'M2,7 L12,2 L12,14, L2,7' : 'M2,2 L2,14 L12,7 L2,2')
      .attr('class', className)
  }

  const defineSquareheadMarker = (defs, id, className) =>{
    defs
      .append('marker')
      .attrs({
        id: 'squarehead',
        refX: 4,
        refY: 4,
        orient: 'auto',
        markerWidth: 7,
        markerHeight: 7,
        markerUnits: 'userSpaceOnUse',
        xoverflow: 'visible'
      })
      .append('svg:rect')
      .attrs({
        x: '1',
        y: '1',
        width: '5',
        height: '5'
      })
      .attr('class', className)
  }

  const defs = svg.append('defs')
  defineArrowheadMarker(defs, 'arrowhead', 'arrowDecorator')
  defineArrowheadMarker(defs, 'arrowheadfaded', 'arrowDecorator faded')
  defineArrowheadMarker(defs, 'reversedarrowhead', 'arrowDecorator', true)
  defineArrowheadMarker(defs, 'reversedarrowheadfaded', 'arrowDecorator faded', true)
  defineSquareheadMarker(defs, 'squarehead', 'squareDecorator')
}

