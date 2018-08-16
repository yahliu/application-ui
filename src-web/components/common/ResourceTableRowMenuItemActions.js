/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2017, 2018. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import { updateModal } from '../../actions/common'
import { createDashboard, deployApplication } from '../../actions/applications'
import lodash from 'lodash'

export const resourceActions = (action, dispatch, resourceType, data) => {
  switch (action) {
  case 'table.actions.applications.dashboard': {
    return dispatch(createDashboard(data.Name))
  }
  case 'table.actions.applications.deploy': {
    return dispatch(deployApplication(data.Name))
  }
  case 'table.actions.applications.undeploy': {
    return dispatch(updateModal(
      { open: true, type: 'undeploy-application', resourceType,
        label: { primaryBtn: `modal.undeploy-${resourceType.name.toLowerCase()}.heading`, label: `modal.undeploy-${resourceType.name.toLowerCase()}.label`, heading: `modal.undeploy-${resourceType.name.toLowerCase()}.heading` },
        data: { apiVersion: resourceType.api_version, kind: resourceType.name, ...data }}))
  }
  case 'table.actions.edit': {
    const _data = { ...data }
    delete _data.status
    delete _data.metadata.selfLink
    delete _data.metadata.uid
    delete _data.metadata.generation
    delete _data.metadata.creationTimestamp
    delete _data.custom
    lodash.has(_data, 'spec.template.metadata.creationTimestamp') && delete _data.spec.template.metadata.creationTimestamp
    return dispatch(updateModal(
      { open: true, type: 'resource', action: 'put', resourceType, editorMode: 'json',
        label: { primaryBtn: 'modal.button.submit', label: `modal.edit-${resourceType.name.toLowerCase()}.label`, heading: `modal.edit-${resourceType.name.toLowerCase()}.heading` },
        data: { apiVersion: resourceType.api_version, kind: resourceType.name, ..._data }}))
  }
  case 'table.actions.applications.remove':
  case 'table.actions.policy.remove':
  case 'table.actions.remove': {
    return dispatch(updateModal(
      { open: true, type: 'resource-remove', resourceType,
        label: { primaryBtn: `modal.remove-${resourceType.name.toLowerCase()}.heading`, label: `modal.remove-${resourceType.name.toLowerCase()}.label`, heading: `modal.remove-${resourceType.name.toLowerCase()}.heading` },
        data: { apiVersion: resourceType.api_version, kind: resourceType.name, ...data }}))
  }
  case 'table.actions.scale': {
    return dispatch(updateModal(
      { open: true, type: 'resource-scale', resourceType,
        label: { primaryBtn: `modal.scale-${resourceType.name.toLowerCase()}.heading`, label: `modal.scale-${resourceType.name.toLowerCase()}.label`, heading: `modal.scale-${resourceType.name.toLowerCase()}.heading` },
        data: { apiVersion: resourceType.api_version, kind: resourceType.name, ...data }}))
  }
  case 'table.actions.edit.scope': {
    return dispatch(updateModal(
      { open: true, type: 'image-scope', resourceType,
        label: { primaryBtn: `modal.edit-${resourceType.name.toLowerCase()}.heading`, label: `modal.edit-${resourceType.name.toLowerCase()}.label`, heading: `modal.edit-${resourceType.name.toLowerCase()}.heading` },
        data: { apiVersion: resourceType.api_version, kind: resourceType.name, ...data }}))
  }
  case 'table.actions.suspend':
  case 'table.actions.rollback':
  default:

  }
}
