/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 ****************************************************************************** */
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project

'use strict'

import msgs from '../../../../../nls/platform.properties'
import _ from 'lodash'
import R from 'ramda'
import { getClusterName } from '../../utils/diagram-helpers-utils'

const clusterLabels = 'cluster.metadata.labels'

const TypeFilters = {
  cluster: {
    filterTypes: {
      clusterStatuses: 'clusterStatuses',
      providers: 'providers',
      purpose: 'purpose',
      region: 'region',
      k8type: 'k8type'
    },
    searchTypes: new Set(),
    ignored: new Set()
  },
  weave: {
    filterTypes: {
      podStatuses: 'podStatuses',
      hostIPs: 'hostIPs',
      namespaces: 'namespaces',
      labels: 'labels'
    },
    searchTypes: new Set(['podStatuses', 'labels']),
    ignored: new Set(['internet', 'host', 'cluster'])
  },
  application: {
    filterTypes: {
      resourceStatuses: 'resourceStatuses',
      resourceTypes: 'resourceTypes',
      clusterNames: 'clusterNames',
      namespaces: 'namespaces',
      hostIPs: 'hostIPs'
    },
    searchTypes: new Set(['podStatuses', 'labels']),
    ignored: new Set()
  },
  policy: {
    filterTypes: {
      providers: 'providers',
      purpose: 'purpose',
      region: 'region',
      k8type: 'k8type'
    },
    searchTypes: new Set(),
    ignored: new Set()
  }
}

export const getAllFilters = (
  mode,
  typeToShapeMap,
  isLoaded,
  nodes,
  options,
  activeFilters,
  knownTypes,
  userIsFiltering,
  locale
) => {
  const availableFilters = {}
  let otherTypeFilters = []

  // if nothing loaded we can't calculate what types are available
  if (!nodes || nodes.length === 0) {
    return {
      availableFilters,
      otherTypeFilters,
      activeFilters
    }
  }

  /////////////// AVAIALBLE TYPE FILTERS //////////////////////
  nodes = nodes || []
  const map = nodes.map(({ type }) => type).reduce((acc, curr) => {
    if (typeof acc[curr] === 'undefined') {
      acc[curr] = 1
    } else {
      acc[curr] += 1
    }
    return acc
  }, {})
  const sorted = Object.keys(map).sort((a, b) => {
    const ret = map[b] - map[a]
    if (ret !== 0) {
      return ret
    }
    return a.localeCompare(b)
  })

  // determine what should go in main type filter bar and what should go in 'other' button
  const optionsTemp = options || {}
  let { availableTypes } = optionsTemp
  const unknownTypes = []
  if (availableTypes) {
    // other is any type not in available types
    const set = new Set(availableTypes)
    otherTypeFilters = Object.keys(map).filter(a => {
      return !set.has(a)
    })
  } else {
    // else take 8 most popular types, and any above is other
    otherTypeFilters = []
    availableTypes = sorted
      .filter(a => {
        // anything w/o a shape is other automaically
        if (!typeToShapeMap[a]) {
          otherTypeFilters.push(a)
          unknownTypes.push(a)
          return false
        }
        return true
      })
      .filter((a, idx) => {
        if (idx > 7) {
          // then if the toolbar will be too full, put the rest in other
          otherTypeFilters.push(a)
          return false
        }
        return true
      })
      .sort()
  }

  // if lots of unknown types, assign some unknown types to spare shapes
  if (unknownTypes.length > 3 && availableTypes.length < 3) {
    const set = new Set(unknownTypes)
    sorted.filter(a => set.has(a)).some((a, idx) => {
      const spareKey = `spare${idx + 1}`
      typeToShapeMap[a] = typeToShapeMap[spareKey]
      availableTypes.push(a)
      otherTypeFilters = otherTypeFilters.filter(b => a !== b)
      delete typeToShapeMap[spareKey]
      return idx >= 5 // only 5 spares
    })
  }

  // if there are still other shapes, add to available
  if (otherTypeFilters.length > 0) {
    availableTypes = _.union(availableTypes, ['other'])
  }
  availableFilters['type'] = availableTypes

  ///////////////// ACTIVE TYPE FILTERS //////////////////////////////////////////
  const { initialActiveTypes } = options
  if (initialActiveTypes) {
    // if options specify initial active types use those in case no active types specified yet
    activeFilters = Object.assign(
      {},
      { type: initialActiveTypes },
      activeFilters
    )
  } else {
    activeFilters = _.cloneDeep(activeFilters)
    if (!userIsFiltering) {
      activeFilters.type = availableTypes
    }
  }
  // if an other type it's active status is covered by 'other' type
  if (otherTypeFilters.length > 0) {
    const set = new Set(availableTypes)
    activeFilters.type = activeFilters.type.filter(a => set.has(a))
  }

  // if using the filter view, get avaiable filters for that view
  // ex: purpose section when looking at filter view in clusters mode
  if (mode) {
    addAssortedAvailableFilters(
      mode,
      availableFilters,
      activeFilters,
      nodes,
      locale
    )
  }

  return {
    availableFilters,
    otherTypeFilters,
    activeFilters
  }
}

export const getAvailableFilters = (
  mode,
  nodes,
  options,
  activeFilters,
  locale
) => {
  const availableFilters = {}
  if (mode) {
    addAssortedAvailableFilters(
      mode,
      availableFilters,
      activeFilters,
      nodes,
      locale
    )
  }
  return availableFilters
}

//search filters also show related nodes, like searching on name
export const getSearchFilter = (mode, filters = {}) => {
  const ret = { filters: {}, search: undefined }
  const searchTypes = _.get(TypeFilters, `${mode}.searchTypes`, new Set())
  Object.entries(filters).forEach(([type, value]) => {
    if (searchTypes.has(type)) {
      if (value && value.size > 0) {
        if (!ret.search) {
          ret.search = {}
        }
        ret.search[type] = value
      }
    } else {
      ret.filters[type] = value
    }
  })
  return ret
}

/////////////////////////////// AVAILABLE FILTERS //////////////////////////////////////////
const addAssortedAvailableFilters = (
  mode,
  availableFilters,
  activeFilters,
  nodes,
  locale
) => {
  if (nodes && nodes.length > 0) {
    switch (mode) {
    case 'cluster':
      addAvailableClusterFilters(availableFilters, nodes, locale)
      break

    case 'policy':
      addAvailablePolicyFilters(
        availableFilters,
        activeFilters,
        nodes,
        locale
      )
      break

    default:
      addAvailableRelationshipFilters(
        mode,
        availableFilters,
        activeFilters,
        nodes,
        locale
      )
      break
    }
  }
}

const filterAvailable = (
  specs,
  clusterLabelsInfo,
  filterTypes,
  availableFilters
) => {
  const labels = _.get(specs, clusterLabelsInfo, {})
  Object.keys(filterTypes).forEach(filterType => {
    const filter = availableFilters[filterType]
    switch (filterType) {
    case 'providers':
      filter.availableSet.add(labels.cloud)
      break
    case 'purpose':
      filter.availableSet.add(labels.environment)
      break
    case 'region':
      filter.availableSet.add(labels.region)
      break
    case 'k8type':
      filter.availableSet.add(labels.vendor)
      break
    }
  })
}
const addAvailableClusterFilters = (availableFilters, nodes, locale) => {
  // initialize filter
  const filterTypes = TypeFilters['cluster'].filterTypes
  Object.keys(filterTypes).forEach(type => {
    let name
    let availableSet = new Set()
    switch (type) {
    case 'clusterStatuses':
      name = msgs.get('topology.filter.category.clusterStatuses', locale)
      availableSet = new Map([
        [
          'recent',
          msgs.get('topology.filter.category.status.recent', locale)
        ],
        [
          'offline',
          msgs.get('topology.filter.category.status.offline', locale)
        ],
        [
          'violations',
          msgs.get('topology.filter.category.status.violations', locale)
        ]
      ])
      break
    case 'providers':
      name = msgs.get('topology.filter.category.providers', locale)
      break
    case 'purpose':
      name = msgs.get('topology.filter.category.purpose', locale)
      break
    case 'region':
      name = msgs.get('topology.filter.category.region', locale)
      break
    case 'k8type':
      name = msgs.get('topology.filter.category.k8type', locale)
      break
    }
    availableFilters[type] = {
      name,
      availableSet
    }
  })

  // loop thru policies adding available filters
  nodes.forEach(({ specs }) => {
    filterAvailable(specs, clusterLabels, filterTypes, availableFilters)
  })
}

export const addAvailableRelationshipFilters = (
  mode,
  availableFilters,
  activeFilters,
  nodes,
  locale
) => {
  // what k8 types are being shown
  const activeTypes = new Set(activeFilters.type || [])
  const ignoreNodeTypes = TypeFilters[mode].ignored || new Set()
  const filterTypes = TypeFilters[mode].filterTypes
  Object.keys(filterTypes).forEach(type => {
    let name = null
    let availableSet = new Set()
    switch (type) {
    case 'resourceTypes':
      name = msgs.get('topology.filter.category.resourceTypes', locale)
      break
    case 'hostIPs':
      name = msgs.get('topology.filter.category.hostIPs', locale)
      break
    case 'namespaces':
      name = msgs.get('topology.filter.category.namespaces', locale)
      break
    case 'resourceStatuses':
      name = msgs.get('topology.filter.category.resourceStatuses', locale)
      availableSet = new Map([
        [
          'green',
          msgs.get('topology.filter.category.status.success', locale)
        ],
        [
          'orange',
          msgs.get('topology.filter.category.status.pending', locale)
        ],
        [
          'yellow',
          msgs.get('topology.filter.category.status.warning', locale)
        ],
        ['red', msgs.get('topology.filter.category.status.error', locale)]
      ])
      break
      // case 'clusterNames':
      //   name = msgs.get('topology.filter.category.clustername', locale)
      //   break
    }
    if (name) {
      availableFilters[type] = {
        name,
        availableSet
      }
    }
  })

  let hasPods = false
  nodes.forEach(node => {
    const { type, name: nodeName } = node
    let { namespace } = node
    if (
      !ignoreNodeTypes.has(type) &&
      (activeTypes.has(type) || activeTypes.has('other'))
    ) {
      namespace =
        namespace && namespace.length > 0 ? namespace : 'cluster-scoped'

      // filter filters
      const podStatus = _.get(node, 'specs.podModel')
      const design = _.get(node, 'specs.isDesign')
      hasPods |= !!podStatus
      Object.keys(filterTypes).forEach(filterType => {
        const filter = availableFilters[filterType]
        if (filter) {
          switch (filterType) {
          case 'hostIPs':
            if (podStatus && Object.keys(podStatus).length > 0) {
              _.flatten(Object.values(podStatus)).forEach(pod => {
                filter.availableSet.add(pod.hostIP)
              })
            }
            break

          case 'namespaces':
            filter.availableSet.add(namespace)
            break

          case 'clusterNames':
            if (type === 'cluster') {
              filter.availableSet.add(nodeName)
            }
            break
          case 'resourceTypes':
            // Only filter none design and none cluster types
            if (!isDesignOrCluster(design, type)) {
              filter.availableSet.add(type)
            }
            break
          }
        }
      })
    }
  })

  // if no pods, remove pod filters
  if (!hasPods) {
    delete availableFilters['hostIPs']
  }
}

const addAvailablePolicyFilters = (
  availableFilters,
  activeFilters,
  nodes,
  locale
) => {
  // initialize filter
  const filterTypes = TypeFilters['policy'].filterTypes
  Object.keys(filterTypes).forEach(type => {
    let name
    const availableSet = new Set()
    switch (type) {
    case 'providers':
      name = msgs.get('topology.filter.category.providers', locale)
      break
    case 'purpose':
      name = msgs.get('topology.filter.category.purpose', locale)
      break
    case 'region':
      name = msgs.get('topology.filter.category.region', locale)
      break
    case 'k8type':
      name = msgs.get('topology.filter.category.k8type', locale)
      break
    }
    availableFilters[type] = {
      name,
      availableSet
    }
  })

  // loop thru policies adding available filters
  const activeTypes = new Set(activeFilters.type || [])
  nodes.forEach(({ type, specs }) => {
    if (type === 'cluster' && activeTypes.has(type)) {
      filterAvailable(specs, clusterLabels, filterTypes, availableFilters)
    }
  })
}

////////////////////////   FILTER NODES     ///////////////////////////////////

export const filterNodes = (mode, nodes, activeFilters) => {
  switch (mode) {
  case 'cluster':
    return filterClusterNodes(nodes, activeFilters)

  case 'weave':
    return filterRelationshipNodes(nodes, activeFilters)

  case 'application':
    return filterRelationshipNodes(nodes, activeFilters)

  case 'policy':
    return filterPolicyNodes(nodes, activeFilters)

  default:
    return nodes
  }
}

const filterClusterNodes = (nodes, activeFilters) => {
  const {
    clusterStatuses,
    type,
    purpose = new Set(),
    providers = new Set(),
    region = new Set(),
    k8type = new Set()
  } = activeFilters
  const typeSet = new Set(type)
  return nodes.filter(node => {
    const { specs } = node
    const hasType = typeSet.has(node.type)
    let hasClusterStatus = true
    let hasProviders = true
    let hasPurpose = true
    let hasRegion = true
    let hasK8type = true
    if (hasType && node.type === 'cluster') {
      // filter by cluster status
      if (clusterStatuses && clusterStatuses.size > 0) {
        const { isOffline, hasViolations, isRecent } = _.get(
          node,
          'specs.clusterStatus',
          {}
        )
        if (
          !(
            (clusterStatuses.has('offline') && isOffline) ||
            (clusterStatuses.has('violations') && hasViolations) ||
            (clusterStatuses.has('recent') && isRecent)
          )
        ) {
          hasClusterStatus = false
        }
      }

      const labels = _.get(specs, clusterLabels, {})
      hasProviders = providers.size === 0 || providers.has(labels.cloud)
      hasPurpose = purpose.size === 0 || purpose.has(labels.environment)
      hasRegion = region.size === 0 || region.has(labels.region)
      hasK8type = k8type.size === 0 || k8type.has(labels.vendor)
    }
    return (
      hasType &&
      hasClusterStatus &&
      hasProviders &&
      hasPurpose &&
      hasRegion &&
      hasK8type
    )
  })
}

export const processResourceStatus = (resourceStatuses, resourceStatus) => {
  const orangeOrYellow =
    resourceStatus === 'orange' || resourceStatus === 'yellow'

  return (
    (resourceStatuses.has('green') && resourceStatus === 'green') ||
    (resourceStatuses.has('yellow') && resourceStatus === 'yellow') ||
    (resourceStatuses.has('orange') && orangeOrYellow) ||
    (resourceStatuses.has('red') && resourceStatus === 'red')
  )
}

export const notDesignNode = nodeType => {
  return (
    nodeType !== 'application' &&
    nodeType !== 'subscription' &&
    nodeType !== 'placements'
  )
}

export const isDesignOrCluster = (isDesign, nodeType) => {
  return isDesign === true || nodeType === 'cluster'
}

export const nodeParentExists = (nodeParent, includedNodes) => {
  return (
    nodeParent !== undefined &&
    nodeParent.parentType !== 'cluster' &&
    !includedNodes.has(nodeParent.parentId)
  )
}

export const filterRelationshipNodes = (nodes, activeFilters) => {
  const {
    hostIPs = new Set(),
    namespaces = new Set(),
    resourceStatuses = new Set(),
    clusterNames = new Set(),
    resourceTypes = new Set()
  } = activeFilters
  const parentList = new Set()
  const includedNodes = new Set()
  const filteredNodes = nodes.filter(node => {
    const { type: nodeType, namespace, id } = node

    if (isDesignOrCluster(node.specs.isDesign, nodeType)) {
      return true
    }

    // include type if a direct match
    const hasType =
      resourceTypes.size === 0 ? true : resourceTypes.has(nodeType)

    // filter for resource statuses
    let hasResourceStatus = true
    if (resourceStatuses.size !== 0) {
      const resourceStatus = _.get(node, 'specs.pulse')
      if (resourceStatus) {
        hasResourceStatus = processResourceStatus(
          resourceStatuses,
          resourceStatus
        )
      }
    }

    // if host ips filter is on, only let pods and deployments with pods of that host ip
    let hasHostIps = true
    if (hostIPs.size !== 0) {
      hasHostIps = false
      const podStatus = _.get(node, 'specs.podModel')
      if (podStatus) {
        hasHostIps = Array.from(hostIPs).some(ip => {
          return (
            _.flatten(_.flatten(Object.values(podStatus))).find(
              pod => pod.hostIP === ip
            ) !== undefined
          )
        })
      }
    }

    // filter namespaces
    const hasNamespace =
      namespaces.size === 0 || namespaces.has(namespace || 'cluster-scoped')

    // filter by cluster name
    let hasClustername = true
    if (notDesignNode(nodeType) && clusterNames.size !== 0) {
      hasClustername = false
      const clusterNamesArray = R.split(',', getClusterName(id, node) || [])
      clusterNamesArray.forEach(clsN => {
        hasClustername = hasClustername || clusterNames.has(clsN)
      })
    }

    const result =
      hasType &&
      hasNamespace &&
      hasHostIps &&
      hasResourceStatus &&
      hasClustername

    const nodeParent = _.get(node, 'specs.parent')

    if (result) {
      includedNodes.add(id)
      if (nodeParentExists(nodeParent, includedNodes)) {
        parentList.add(nodeParent.parentId)
      }
    }

    return result
  })

  if (parentList.size > 0) {
    nodes.forEach(node => {
      const { id } = node
      if (parentList.has(id)) {
        filteredNodes.push(node)
      }
    })
  }
  return filteredNodes
}

const filterPolicyNodes = (nodes, activeFilters) => {
  const {
    type,
    purpose = new Set(),
    providers = new Set(),
    region = new Set(),
    k8type = new Set()
  } = activeFilters
  const typeSet = new Set(type)
  return nodes.filter(node => {
    const { specs } = node
    const hasType = typeSet.has(node.type)
    let hasProviders = true
    let hasPurpose = true
    let hasRegion = true
    let hasK8type = true
    if (hasType && node.type === 'cluster') {
      const labels = _.get(specs, 'cluster.labels', {})
      hasProviders = providers.size === 0 || providers.has(labels.cloud)
      hasPurpose = purpose.size === 0 || purpose.has(labels.environment)
      hasRegion = region.size === 0 || region.has(labels.region)
      hasK8type = k8type.size === 0 || k8type.has(labels.vendor)
    }
    return hasType && hasProviders && hasPurpose && hasRegion && hasK8type
  })
}
