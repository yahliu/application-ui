/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import SecondaryHeader from '../components/SecondaryHeader'
import { Route, Switch, Redirect } from 'react-router-dom'
import resources from '../../lib/shared/resources'
import client from '../../lib/shared/client'
import loadable from 'loadable-components'
import config from '../../lib/shared/config'
import Modal from '../components/common/Modal'

export const TopologyTab = loadable(() => import(/* webpackChunkName: "topology" */ './TopologyTab'))
export const DashboardTab = loadable(() => import(/* webpackChunkName: "dashboard" */ './DashboardTab'))
export const ClustersTab = loadable(() => import(/* webpackChunkName: "clusters" */ './ClustersTab'))
export const ApplicationsTab = loadable(() => import(/* webpackChunkName: "applications" */ './ClustersApplicationsTab'))
export const PodsTab = loadable(() => import(/* webpackChunkName: "pods" */ './ClustersPodsTab'))
export const ChartsTab = loadable(() => import(/* webpackChunkName: "charts" */ './ClustersChartsTab'))
export const ReleasesTab = loadable(() => import(/* webpackChunkName: "releases" */ './ClustersReleasesTab'))
export const RepositoriesTab = loadable(() => import(/* webpackChunkName: "repositories" */ './ClustersRepositoriesTab'))
export const EmptyTab = loadable(() => import(/* webpackChunkName: "empty" */ './EmptyTab'))

resources(() => {
  require('../../scss/common.scss')
})

class App extends React.Component {
  /* FIXME: Please fix disabled eslint rules when making changes to this file. */
  /* eslint-disable react/prop-types, react/jsx-no-bind */

  constructor(props) {
    super(props)

    if (client)
      this.serverProps = JSON.parse(document.getElementById('propshcm').textContent)
  }

  getServerProps() {
    if (client)
      return this.serverProps
    return this.props.staticContext
  }

  render() {
    const serverProps = this.getServerProps()
    const { match } = this.props

    return (
      <div className='expand-vertically'>
        <SecondaryHeader />
        <Switch>
          <Route path={`${match.url}/overview`} render={() => <DashboardTab serverProps={serverProps} />} />
          <Route path={`${match.url}/topology`} render={() => <TopologyTab serverProps={serverProps} />} />
          <Route path={`${match.url}/clusters:filters?`} render={() => <ClustersTab secondaryHeaderProps={{title: 'routes.clusters'}} />} />
          <Route path={`${match.url}/applications`} render={() => <ApplicationsTab secondaryHeaderProps={{title: 'routes.applications'}} />} />
          <Route path={`${match.url}/pods:filters?`} render={() => <PodsTab secondaryHeaderProps={{title: 'routes.pods'}} />} />
          <Route path={`${match.url}/charts`} render={() => <ChartsTab secondaryHeaderProps={{title: 'routes.charts'}} />} />
          <Route path={`${match.url}/releases:filters?`} render={() => <ReleasesTab secondaryHeaderProps={{title: 'routes.releases'}} />} />
          <Route path={`${match.url}/repositories`} render={() => <RepositoriesTab secondaryHeaderProps={{title: 'routes.repositories'}} />} />
          <Route path={`${match.url}/admin`} render={() => <EmptyTab secondaryHeaderProps={{title: 'routes.admin'}} />} />
          <Route path={`${match.url}/compliance`} render={() => <EmptyTab secondaryHeaderProps={{title: 'routes.compliance'}} />} />
          <Route path={`${match.url}/event`} render={() => <EmptyTab secondaryHeaderProps={{title: 'routes.event'}} />} />
          <Redirect to={`${config.contextPath}/overview`} />
        </Switch>
        <Modal locale={serverProps.context.locale} />
      </div>
    )
  }

  getChildContext() {
    return {
      locale: this.getServerProps().context.locale
    }
  }
}

App.childContextTypes = {
  locale: PropTypes.string
}

export default props => ( // eslint-disable-line react/display-name
  <div className='expand-vertically'>
    <Route path={config.contextPath} serverProps={props} component={App} />
  </div>
)
