/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2018, 2019. All Rights Reserved.
 *
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 *******************************************************************************/
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
import R from 'ramda'
import React from 'react'
import {
  getAge,
  getClusterCount,
  getClusterCountString,
  getSearchLink,
  groupByChannelType,
  getChannelLabel,
  CHANNEL_TYPES
} from '../../lib/client/resource-helper'
import { cellWidth } from '@patternfly/react-table'
import { Link } from 'react-router-dom'
import queryString from 'query-string'
import config from '../../lib/shared/config'
import { RESOURCE_TYPES } from '../../lib/shared/constants'
import msgs from '../../nls/platform.properties'
import ChannelLabels from '../components/common/ChannelLabels'
import TableRowActionMenu from '../components/common/TableRowActionMenu'
import {
  Button,
  Label,
  Split,
  SplitItem,
  Tooltip
} from '@patternfly/react-core'
import {
  InfoCircleIcon,
  OutlinedQuestionCircleIcon
} from '@patternfly/react-icons'
import _ from 'lodash'

export default {
  defaultSortField: 'name',
  uriKey: 'name',
  primaryKey: 'name',
  secondaryKey: 'namespace',
  pluralKey: 'table.plural.application',
  emptyTitle: getEmptyTitle,
  emptyMessage: getEmptyMessage,
  groupFn: item => {
    if (isArgoApp(item)) {
      const key = _.pick(item, ['repoURL', 'path', 'chart', 'targetRevision'])
      if (!key.targetRevision) {
        key.targetRevision = 'HEAD'
      }
      return JSON.stringify(key)
    }
    return null
  },
  groupSummaryFn: (items, locale) => {
    if (items.length > 1) {
      return {
        cells: [
          { title: createApplicationLink(items, locale) }, // pass full array for count
          { title: '' }, // Empty Namespace
          { title: createClustersLink(items, locale) }, // pass full array for all clusters
          { title: createChannels(items[0], locale) },
          { title: '' }, // Empty Time window
          { title: '' }, // Empty Created
          { title: '' } // Empty Actions
        ]
      }
    } else {
      return {
        cells: [
          { title: createApplicationLink(items, locale) },
          { title: createNamespaceText(items[0], locale) },
          { title: createClustersLink(items[0], locale) },
          { title: createChannels(items[0], locale) },
          { title: getTimeWindow(items[0], locale) },
          { title: getAge(items[0], locale) },
          {
            title: (
              <TableRowActionMenu
                actions={tableActionsResolver(items[0])}
                item={items[0]}
                resourceType={RESOURCE_TYPES.HCM_APPLICATIONS}
              />
            )
          }
        ]
      }
    }
  },
  tableKeys: [
    {
      msgKey: 'table.header.name',
      resourceKey: 'name',
      transformFunction: createApplicationLink,
      transforms: [cellWidth(20)]
    },
    {
      msgKey: 'table.header.namespace',
      tooltipKey: 'table.header.application.namespace.tooltip',
      resourceKey: 'namespace',
      transforms: [cellWidth(20)],
      transformFunction: createNamespaceText,
      textFunction: createNamespaceText
    },
    {
      msgKey: 'table.header.clusters',
      tooltipKey: 'table.header.application.clusters.tooltip',
      resourceKey: 'clusterCount',
      transformFunction: createClustersLink,
      textFunction: createClustersText
    },
    {
      msgKey: 'table.header.resource',
      tooltipKey: 'table.header.application.resource.tooltip',
      resourceKey: 'hubChannels',
      transformFunction: createChannelsRow,
      textFunction: createChannelsText
    },
    {
      msgKey: 'table.header.timeWindow',
      tooltipKey: 'table.header.application.timeWindow.tooltip',
      resourceKey: 'hubSubscriptions',
      transformFunction: getTimeWindow,
      textFunction: getTimeWindow
    },
    {
      msgKey: 'table.header.created',
      resourceKey: 'created',
      transformFunction: getAge
    }
  ],
  tableActionsResolver: tableActionsResolver
}

function tableActionsResolver(item) {
  const actions = [
    {
      key: 'table.actions.applications.view',
      link: {
        url: item => getApplicationLink(item)
      }
    }
  ]
  if (!isArgoApp(item)) {
    actions.push({
      key: 'table.actions.applications.edit',
      link: {
        url: item => getApplicationLink(item, true),
        state: { cancelBack: true }
      }
    })
  }
  actions.push({
    key: 'table.actions.applications.search',
    link: {
      url: item => {
        const [apigroup, apiversion] = item.apiVersion.split('/')
        return getSearchLink({
          properties: {
            name: item.name,
            namespace: item.namespace,
            cluster: item.cluster,
            kind: item.kind.toLowerCase(),
            apigroup,
            apiversion
          }
        })
      }
    }
  })
  actions.push({
    key: 'table.actions.applications.remove',
    modal: true,
    delete: true
  })
  return actions
}

function getApplicationLink(item = {}, edit = false) {
  const { name, namespace = 'default' } = item
  const params = queryString.stringify({
    apiVersion: item.apiVersion,
    cluster: item.cluster === 'local-cluster' ? undefined : item.cluster
  })
  return `${config.contextPath}/${encodeURIComponent(
    namespace
  )}/${encodeURIComponent(name)}${edit ? '/edit' : ''}?${params}`
}

export function createApplicationLink(item = {}, locale) {
  const group = Array.isArray(item)
  const firstItem = group ? item[0] : item
  const { name, cluster } = firstItem
  const remoteClusterString =
    cluster !== 'local-cluster' &&
    ((group && item.length == 1) || (!group && isArgoApp(item)))
      ? msgs.get('application.remote.cluster', [cluster], locale)
      : undefined
  return (
    <Split hasGutter style={{ alignItems: 'baseline' }}>
      <SplitItem align="baseline">
        <Link to={getApplicationLink(firstItem)}>{name}</Link>
      </SplitItem>
      {group &&
        isArgoApp(item[0]) && (
          <SplitItem>
            {item.length > 1 ? (
              <Tooltip
                position="top"
                content={msgs.get('application.argo.group', locale)}
              >
                <Label icon={<InfoCircleIcon />} color="blue">
                  {msgs.get('dashboard.card.overview.cards.argo.app', locale)} ({
                    item.length
                  })
                </Label>
              </Tooltip>
            ) : (
              <Label color="blue">
                {msgs.get('dashboard.card.overview.cards.argo.app', locale)}
              </Label>
            )}
          </SplitItem>
      )}
      {remoteClusterString && (
        <SplitItem>
          <Tooltip position="top" content={remoteClusterString}>
            <span className="pf-c-table__column-help-action">
              <Button variant="plain" aria-label={remoteClusterString}>
                <OutlinedQuestionCircleIcon />
              </Button>
            </span>
          </Tooltip>
        </SplitItem>
      )}
    </Split>
  )
}

function getClusterCounts(item) {
  const clusterCount = R.path(['clusterCount'], item) || {}
  const localPlacement = (R.path(['hubSubscriptions'], item) || []).some(
    sub => sub.localPlacement
  )
  return {
    remoteCount: clusterCount.remoteCount,
    localPlacement: localPlacement || clusterCount.localCount
  }
}

function createClustersLink(item = {}, locale = '') {
  const multiArgo = Array.isArray(item)
  if (!multiArgo && isArgoApp(item)) {
    let link
    if (item.destinationCluster) {
      link = getSearchLink({
        properties: {
          name: item.destinationCluster,
          kind: 'cluster'
        }
      })
    }
    const clusterText =
      item.destinationCluster || msgs.get('cluster.name.unknown', locale)
    return link ? (
      <a className="cluster-count-link" href={link}>
        {clusterText}
      </a>
    ) : (
      clusterText
    )
  }

  const [apigroup] = (multiArgo ? item[0] : item).apiVersion.split('/')
  let remoteCount, localPlacement, clusterNames
  if (multiArgo) {
    const names = new Set()
    item.forEach(i => {
      if (i.destinationCluster) {
        names.add(i.destinationCluster)
      }
    })
    clusterNames = Array.from(names)
    localPlacement = clusterNames.includes('local-cluster')
    remoteCount = clusterNames.length - (localPlacement ? 1 : 0)
  } else {
    const clusterCounts = getClusterCounts(item)
    localPlacement = clusterCounts.localPlacement
    remoteCount = clusterCounts.remoteCount
  }

  return getClusterCount({
    locale,
    remoteCount,
    localPlacement,
    name: item.name,
    namespace: item.namespace,
    kind: 'application',
    apigroup,
    clusterNames
  })
}

function createClustersText(item = {}, locale = '') {
  if (isArgoApp(item)) {
    return item.destinationCluster || msgs.get('cluster.name.unknown', locale)
  }
  const { remoteCount, localPlacement } = getClusterCounts(item)
  return getClusterCountString(locale, remoteCount, localPlacement)
}

function createNamespaceText(item = {}) {
  return isArgoApp(item) ? item.destinationNamespace : item.namespace
}

function isArgoApp(item = {}) {
  return item.apiVersion && item.apiVersion.includes('argoproj.io')
}

function getChannels(item = {}) {
  if (isArgoApp(item)) {
    return [
      {
        type: item.chart ? 'helmrepo' : 'git',
        pathname: item.repoURL,
        gitPath: item.path,
        chart: item.chart,
        targetRevision: item.targetRevision || 'HEAD'
      }
    ]
  }
  return (R.path(['hubChannels'], item) || []).map(ch => ({
    type: ch['ch.type'],
    pathname: ch['ch.pathname'],
    gitBranch: ch['sub._gitbranch'],
    gitPath: ch['sub._gitpath'],
    package: ch['sub.package'],
    packageFilterVersion: ch['sub.packageFilterVersion']
  }))
}

function createChannels(item = {}, locale = '') {
  const channels = getChannels(item)
  return (
    <ChannelLabels
      channels={channels}
      locale={locale}
      isArgoApp={isArgoApp(item)}
    />
  )
}

function createChannelsRow(item = {}, locale = '') {
  return !isArgoApp(item) ? createChannels(item, locale) : null
}

function createChannelsText(item = {}, locale = '') {
  const channels = getChannels(item).map(ch => ({
    type: ch['ch.type']
  }))
  const channelMap = groupByChannelType(channels || [])
  return CHANNEL_TYPES.filter(chType => channelMap[chType])
    .map(chType => getChannelLabel(chType, channelMap[chType].length, locale))
    .join(' ')
}

function getTimeWindow(item = {}, locale = '') {
  // Check for 'active' or 'blocked' subscription, ignoring 'none'
  return (R.path(['hubSubscriptions'], item) || []).some(sub =>
    ['active', 'blocked'].includes(sub.timeWindow)
  )
    ? msgs.get('table.cell.timeWindow.yes', locale)
    : ''
}

function getEmptyTitle(locale = '') {
  return msgs.get('no-resource.application.title', locale)
}

function getEmptyMessage(locale = '') {
  const buttonName = msgs.get('actions.create.application', locale)
  const buttonText = `<span class="emptyStateButtonReference">${buttonName}</span>`
  const message = msgs.get(
    'no-resource.application.message',
    [buttonText],
    locale
  )
  return (
    <p>
      <span dangerouslySetInnerHTML={{ __html: message }} />
      <br />
      {msgs.get('no-resource.documentation.message', locale)}
    </p>
  )
}
