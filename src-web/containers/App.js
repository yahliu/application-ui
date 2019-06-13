/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

// seems to be an issue with this rule and redux
/* eslint-disable import/no-named-as-default */

import React from 'react'
import PropTypes from 'prop-types'
import SecondaryHeader from '../components/SecondaryHeader'
import { Route, Switch, Redirect } from 'react-router-dom'
import resources from '../../lib/shared/resources'
import client from '../../lib/shared/client'
import loadable from 'loadable-components'
import config from '../../lib/shared/config'
import Modal from '../components/common/Modal'

export const ApplicationsTab = loadable(() => import(/* webpackChunkName: "applications" */ './ApplicationsTab'))
export const OverviewPage = loadable(() => import(/* webpackChunkName: "dashboard" */ './OverviewPage'))
export const ClustersTab = loadable(() => import(/* webpackChunkName: "clusters" */ './ClustersTab'))
export const SearchPage = loadable(() => import(/* webpackChunkName: "search" */ './SearchPage'))
export const ResourceDetailsPage = loadable(() => import(/* webpackChunkName: "resourcedetails" */ '../components/details/ResourceDetailsPage'))
export const TopologyTab = loadable(() => import(/* webpackChunkName: "topology" */ './TopologyTab'))
export const WelcomeTab = loadable(() => import(/* webpackChunkName: "empty" */ './WelcomePageTab'))
export const ModalApollo = loadable(() => import(/* webpackChunkName: "modalApollo" */ '../components/common-apollo/ModalApollo'))
export const ActionModalApollo = loadable(() => import(/* webpackChunkName: "actionModalApollo" */ '../components/common-apollo/ActionModalApollo'))

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
    const { match, location } = this.props
    const showSecondaryHeader = location.pathname &&
      !location.pathname.startsWith('/multicloud/welcome') &&
      !location.pathname.startsWith('/multicloud/overview') &&
      !location.pathname.startsWith('/multicloud/search')
    return (
      <div className='expand-vertically'>
        {showSecondaryHeader && <SecondaryHeader />}
        <Switch>
          <Route path={`${match.url}/applications`} render={() => <ApplicationsTab secondaryHeaderProps={{title: 'routes.applications'}} />} />
          <Route path={`${match.url}/clusters:filters?`} render={() => <ClustersTab secondaryHeaderProps={{title: 'routes.clusters'}} />} />
          <Route path={`${match.url}/overview`} render={() => <OverviewPage secondaryHeaderProps={{title: 'routes.overview'}} />} />
          <Route path={`${match.url}/topology`} render={() => <TopologyTab serverProps={serverProps} />} />
          <Route path={`${match.url}/welcome`} render={() => <WelcomeTab />} />
          { /* TODO: searchFeature remove feature flag */
            config['featureFlags:search'] === true &&
              <Route path={`${match.url}/search`} render={() => <SearchPage secondaryHeaderProps={{title: 'routes.search'}} />} />
          }
          { config['featureFlags:search'] === true && <Route path={`${match.url}/details/:cluster`} render={() => <ResourceDetailsPage />} /> }
          <Redirect to={`${config.contextPath}/welcome`} />
        </Switch>
        <Modal locale={serverProps.context.locale} />
        <ModalApollo locale={serverProps.context.locale} />
        <ActionModalApollo locale={serverProps.context.locale} />
        <input type='hidden' id='app-access' style={{display: 'none'}} value={serverProps.xsrfToken.toString('base64')} />
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
