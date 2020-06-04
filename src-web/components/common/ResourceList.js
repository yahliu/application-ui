/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 * Copyright (c) 2020 Red Hat, Inc.
 *
 * US Government Users Restricted Rights - Use, duplication or disclosure
 * restricted by GSA ADP Schedule Contract with IBM Corp.
 *******************************************************************************/

'use strict'

import React from 'react'
import ResourceTable from './ResourceTable'
import { REQUEST_STATUS } from '../../actions/index'
import NoResource from './NoResource'
import { connect } from 'react-redux'
import {
  changeTablePage,
  searchTable,
  sortTable,
  fetchResources,
  updateSecondaryHeader,
  forcedResourceReloadFinished,
  delResourceSuccessFinished,
  mutateResourceSuccessFinished
} from '../../actions/common'
import { updateResourceFilters, combineFilters } from '../../actions/filters'
import TableHelper from '../../util/table-helper'
import { Loading, Notification } from 'carbon-components-react'
import { withRouter } from 'react-router-dom'
import msgs from '../../../nls/platform.properties'
import config from '../../../lib/shared/config'
import TagInput from './TagInput'
import { showCreate } from '../../../lib/client/access-helper'
import resources from '../../../lib/shared/resources'
import {
  refetchIntervalChanged,
  manualRefetchTriggered
} from '../../shared/utils/refetch'

resources(() => {
  require('../../../scss/resource-list.scss')
})

class ResourceList extends React.Component {
  /* FIXME: Please fix disabled eslint rules when making changes to this file. */
  /* eslint-disable react/prop-types, react/jsx-no-bind */

  constructor(props) {
    super(props)
    this.state = {
      xhrPoll: false
    }
  }

  componentDidMount() {
    const { updateSecondaryHeader, tabs, title } = this.props
    updateSecondaryHeader(msgs.get(title, this.context.locale), tabs)

    const { fetchResources, selectedFilters = [] } = this.props
    fetchResources(selectedFilters)

    this.startPolling()
    document.addEventListener('visibilitychange', this.onVisibilityChange)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectedFilters !== this.props.selectedFilters) {
      this.setState({ xhrPoll: false })
      this.props.fetchResources(nextProps.selectedFilters)
    }
    if (nextProps.forceReload) {
      this.reload()
      this.props.forcedReloadFinished()
    }
  }

  componentWillUnmount() {
    this.stopPolling()
    document.removeEventListener('visibilitychange', this.onVisibilityChange)
  }

  startPolling() {
    if (
      this.props.refetch &&
      this.props.refetch.interval &&
      this.props.refetch.interval > 0
    ) {
      var intervalId = setInterval(
        this.reload.bind(this),
        this.props.refetch.interval
      )
      this.setState({ intervalId: intervalId })
    }
  }

  stopPolling() {
    if (this.state && this.state.intervalId) {
      clearInterval(this.state.intervalId)
    }
  }

  onVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.startPolling()
    } else {
      this.props.mutateSuccessFinished()
      this.props.deleteSuccessFinished()
      this.stopPolling()
    }
  };

  componentDidUpdate(prevProps) {
    // if old and new interval are different, restart polling
    if (refetchIntervalChanged(prevProps, this.props)) {
      this.stopPolling()
      this.startPolling()
    }

    // manual refetch
    if (manualRefetchTriggered(prevProps, this.props)) {
      this.reload()
      // reset polling after manual refetch
      this.stopPolling()
      this.startPolling()
    }
  }

  reload() {
    if (this.props.status === REQUEST_STATUS.DONE) {
      this.setState({ xhrPoll: true })
      const { fetchResources, selectedFilters = [] } = this.props
      fetchResources(selectedFilters)
    }
  }

  render() {
    const {
      userRole,
      items,
      itemIds,
      mutateStatus,
      deleteStatus,
      deleteMsg,
      page,
      pageSize,
      sortDirection,
      totalFilteredItems,
      status,
      sortTable,
      sortColumn,
      changeTablePage,
      searchTable,
      staticResourceData,
      searchValue,
      resourceType,
      err,
      children,
      resourceFilters,
      onSelectedFilterChange,
      selectedFilters,
      updateBrowserURL,
      clientSideFilters,
      tableTitle,
      tableName
    } = this.props

    let locale = 'en-US'
    try {
      locale = this.context()
    } catch (e) {
      locale = 'en-US'
    }

    if (status === REQUEST_STATUS.ERROR && !this.state.xhrPoll) {
      if (err && err.data && err.data.Code === 1) {
        return (
          <NoResource
            title={msgs.get('no-cluster.title', locale)}
            detail={msgs.get('no-cluster.detail', locale)}
          >
            {actions}
          </NoResource>
        )
      }
      //eslint-disable-next-line no-console
      console.error(err)
      return (
        <Notification
          title=""
          className="persistent"
          subtitle={msgs.get('error.default.description', locale)}
          kind="error"
        />
      )
    }

    if (status !== REQUEST_STATUS.DONE && !this.state.xhrPoll) {
      return <Loading withOverlay={false} className="content-spinner" />
    }

    const actions = React.Children.map(children, action => {
      if (action.props.disabled || !showCreate(userRole)) {
        return null
      }
      return React.cloneElement(action, { resourceType })
    })
    if (items || searchValue || clientSideFilters) {
      if (
        searchValue !== clientSideFilters &&
        clientSideFilters &&
        !this.state.xhrPoll
      ) {
        searchTable(clientSideFilters, false)
      }
      return (
        <div id="resource-list">
          {deleteStatus === REQUEST_STATUS.DONE && (
            <Notification
              title={msgs.get('success.update.resource', locale)}
              subtitle={msgs.get(
                'success.delete.description',
                [deleteMsg],
                locale
              )}
              kind="success"
            />
          )}
          {mutateStatus === REQUEST_STATUS.DONE && (
            <Notification
              title=""
              subtitle={msgs.get('success.create.description', locale)}
              kind="success"
            />
          )}
          {config['featureFlags:filters'] &&
            resourceType.filter && (
              <div className="resource-list-filter">
                <TagInput
                  tags={selectedFilters}
                  availableFilters={resourceFilters}
                  onSelectedFilterChange={onSelectedFilterChange}
                  updateBrowserURL={updateBrowserURL}
                />
              </div>
          )}
          <ResourceTable
            actions={actions}
            staticResourceData={staticResourceData}
            page={page}
            pageSize={pageSize}
            itemIds={itemIds}
            sortDirection={sortDirection}
            sortColumn={sortColumn}
            status={status}
            items={items}
            totalFilteredItems={totalFilteredItems}
            resourceType={resourceType}
            changeTablePage={changeTablePage}
            handleSort={TableHelper.handleSort.bind(
              this,
              sortDirection,
              sortColumn,
              sortTable
            )}
            handleSearch={TableHelper.handleInputValue.bind(this, searchTable)}
            searchValue={searchValue}
            defaultSearchValue={clientSideFilters}
            tableActions={staticResourceData.tableActions}
            tableTitle={tableTitle}
            tableName={tableName}
            locale={locale}
          />
        </div>
      )
    }

    const resourceName = msgs.get(
      'no-resource.' + resourceType.name.toLowerCase(),
      locale
    )
    return (
      <NoResource
        title={msgs.get('no-resource.title', [resourceName], locale)}
        detail={msgs.get('no-resource.detail', [resourceName], locale)}
      >
        {actions}
      </NoResource>
    )
  }

  handleResourceAddedEvent(event) {
    this.props.addResource(event)
  }

  handleResourceModifiedEvent(event) {
    this.props.modifyResource(event)
  }

  handleResourceDeletedEvent(event) {
    this.props.deleteResource(event)
  }
}

const mapStateToProps = (state, ownProps) => {
  const { list: typeListName, name: resourceName } = ownProps.resourceType,
        visibleResources = ownProps.getVisibleResources(state, {
          storeRoot: typeListName
        })

  const pendingActions = state[typeListName].pendingActions
  const items = visibleResources.normalizedItems
  if (items && pendingActions) {
    Object.keys(items).forEach(key => {
      if (pendingActions.find(pending => pending.name === items[key].Name)) {
        items[key].hasPendingActions = true
      }
    })
  }
  const userRole = state.role && state.role.role

  return {
    userRole,
    items,
    itemIds: visibleResources.items,
    totalFilteredItems: visibleResources.totalResults,
    totalPages: visibleResources.totalPages,
    status: state[typeListName].status,
    page: state[typeListName].page,
    pageSize: state[typeListName].itemsPerPage,
    sortDirection: state[typeListName].sortDirection,
    sortColumn: state[typeListName].sortColumn,
    searchValue: state[typeListName].search,
    err: state[typeListName].err,
    mutateStatus: state[typeListName].mutateStatus,
    mutateErrorMsg: state[typeListName].mutateErrorMsg,
    deleteStatus: state[typeListName].deleteStatus,
    deleteMsg: state[typeListName].deleteMsg,
    forceReload: state[typeListName].forceReload,
    resourceFilters: state[typeListName].filters,
    selectedFilters:
      state['resourceFilters'].selectedFilters &&
      state['resourceFilters'].selectedFilters[resourceName],
    mutateSuccessFinished: state.mutateSuccessFinished,
    refetch: state.refetch
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const { updateBrowserURL, resourceType } = ownProps
  return {
    fetchResources: selectedFilters => {
      dispatch(fetchResources(resourceType, combineFilters(selectedFilters)))
    },
    changeTablePage: page => dispatch(changeTablePage(page, resourceType)),
    searchTable: (search, updateURL) => {
      if (updateURL !== false) {
        updateBrowserURL && updateBrowserURL(search)
      }
      dispatch(searchTable(search, resourceType))
    },
    sortTable: (sortDirection, sortColumn) =>
      dispatch(sortTable(sortDirection, sortColumn, resourceType)),
    updateSecondaryHeader: (title, tabs) =>
      dispatch(updateSecondaryHeader(title, tabs)),
    onSelectedFilterChange: selectedFilters => {
      updateBrowserURL && updateBrowserURL(selectedFilters)
      dispatch(updateResourceFilters(resourceType, selectedFilters))
    },
    forcedReloadFinished: () =>
      dispatch(forcedResourceReloadFinished(ownProps.resourceType)),
    mutateSuccessFinished: () =>
      dispatch(mutateResourceSuccessFinished(ownProps.resourceType)),
    deleteSuccessFinished: () =>
      dispatch(delResourceSuccessFinished(ownProps.resourceType))
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(ResourceList)
)
