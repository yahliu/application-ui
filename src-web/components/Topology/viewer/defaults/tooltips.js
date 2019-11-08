/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import msgs from '../../../../../nls/platform.properties'
import _ from 'lodash'

export const getNodeTooltips = (searchUrl, node, locale ) => {
  const tooltips = []
  const {name, namespace, type, layout={}} = node
  const { hasPods, pods } = layout
  if (type==='pod') {
    addPodTooltips(node, tooltips, searchUrl, locale)
  } else {
    let kind=undefined
    switch (type) {
    case 'persistent_volume':
      kind='persistentvolume'
      break
    case 'persistent_volume_claim':
      kind='persistentvolumeclaim'
      break
    default:
      kind=type
      break
    }
    const href = searchUrl && kind ? `${searchUrl}?filters={"textsearch":"kind:${kind} name:${name}"}` : undefined
    tooltips.push({name:getType(type, locale), value:name, href})
    if (hasPods) {
      pods.forEach(pod=>{
        addPodTooltips(pod, tooltips, searchUrl, locale)
      })
    }
  }
  if (namespace) {
    const href = `${searchUrl}?filters={"textsearch":"kind:namespace name:${namespace}"}`
    tooltips.push({name:msgs.get('resource.namespace', locale), value:namespace, href})
  }
  return tooltips
}

function addPodTooltips(pod, tooltips, searchUrl, locale) {
  const {name} = pod
  const href = searchUrl ? `${searchUrl}?filters={"textsearch":"kind:pod name:${name}"}` : null
  tooltips.push({name:getType('pod', locale), value:name, href})
}

function getType(type, locale) {
  const nlsType = msgs.get(`resource.${type}`, locale)
  return !nlsType.startsWith('!resource.') ? nlsType : _.capitalize(_.startCase(type))
}
