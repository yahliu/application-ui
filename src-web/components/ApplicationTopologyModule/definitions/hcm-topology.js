/*******************************************************************************
 * Licensed Materials - Property of IBM
 * 5737-E67
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import _ from 'lodash'

export default {
  getTopologyElements,
}

export function getTopologyElements(resourceItem) {
  const { nodes = [], links = [] } = resourceItem

  // We need to change "to/from" to "source/target" to satisfy D3's API.
  let modifiedLinks = links.map(l => ({
    source: l.from.uid,
    target: l.to.uid,
    label: l.type,
    type: l.type,
    uid: l.from.uid + l.to.uid
  }))

  // filter out links to self, then add as a new svg circular arrow on node
  const nodeMap = _.keyBy(nodes, 'uid')
  modifiedLinks = modifiedLinks.filter(l => {
    if (l.source !== l.target) {
      return true
    } else {
      nodeMap[l.source].selfLink = l
    }
  })

  // get just the clusters
  const clusterMap = {}
  const clusters = nodes.reduce((prev, curr) => {
    if (curr.cluster !== null && !prev.find(c => c.id === curr.cluster)) {
      const node = nodes.find(n => n.id === curr.cluster)
      if (node && node.name) {
        // if weave can't find a cluster it creates an 'unmanaged' cluster
        clusterMap[curr.cluster] =
          node.type === 'unmanaged' ? node.type : node.name
        prev.push({
          id: curr.cluster,
          index: prev.length,
          name: node.name
        })
      }
    }
    return prev
  }, [])

  return {
    clusters,
    links: modifiedLinks,
    nodes: nodes
  }
}
