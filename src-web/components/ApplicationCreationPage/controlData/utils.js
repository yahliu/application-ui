/** *****************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.

 *******************************************************************************/
// Copyright (c) 2020 Red Hat, Inc.
// Copyright Contributors to the Open Cluster Management project
'use strict'

import React from 'react'
import msgs from '../../../../nls/platform.properties'
import { HCMChannelList, HCMSecretsList } from '../../../../lib/client/queries'
import apolloClient from '../../../../lib/client/apollo-client'
import { RESOURCE_TYPES } from '../../../../lib/shared/constants'
import SharedResourceWarning from '../components/SharedResourceWarning'

import _ from 'lodash'

const onlineClustersCheckbox = 'online-cluster-only-checkbox'
const existingRuleCheckbox = 'existingrule-checkbox'
const localClusterCheckbox = 'local-cluster-checkbox'

export const loadExistingChannels = type => {
  return {
    query: HCMChannelList,
    loadingDesc: 'creation.app.loading.channels',
    setAvailable: setAvailableChannelSpecs.bind(null, type)
  }
}

export const loadExistingSecrets = () => {
  const getQueryVariables = (control, globalControl) => {
    const nsControl = globalControl.find(
      ({ id: idCtrl }) => idCtrl === 'namespace'
    )
    if (nsControl.active) {
      delete control.exception
      return { namespace: nsControl.active }
    } else {
      control.exception = msgs.get('creation.app.loading.secrets.ns.err')
      return {}
    }
  }
  return {
    query: HCMSecretsList,
    variables: getQueryVariables,
    loadingDesc: 'creation.app.loading.secrets',
    setAvailable: setAvailableSecrets.bind(null)
  }
}

export const getUniqueChannelName = (channelPath, groupControlData) => {
  //create a unique name for a new channel, based on path and type
  if (!channelPath || !groupControlData) {
    return ''
  }

  //get the channel type and append to url to make sure different type of channels are unique, yet using the same url
  const channelTypeSection = groupControlData.find(
    ({ id }) => id === 'channelType'
  )

  let channelTypeStr
  let channelType
  if (channelTypeSection) {
    channelTypeStr = _.get(channelTypeSection, 'active', [''])[0]
  }

  switch (channelTypeStr) {
  case 'github':
    channelType = 'g'
    break
  case 'helmrepo':
    channelType = 'h'
    break
  case 'objectstore':
    channelType = 'o'
    break
  default:
    channelType = 'ns'
  }

  let channelName = _.trim(channelPath)
  if (_.startsWith(channelName, 'https://')) {
    channelName = _.trimStart(channelName, 'https://')
  }
  if (_.startsWith(channelName, 'http://')) {
    channelName = _.trimStart(channelName, 'http://')
  }
  if (_.endsWith(channelName, '.git')) {
    channelName = _.trimEnd(channelName, '.git')
  }

  channelName = _.replace(channelName, /\./g, '')
  channelName = _.replace(channelName, /:/g, '')
  channelName = _.replace(channelName, /\//g, '-')

  channelName = _.trimEnd(channelName, '-')
  channelName = channelName.toLowerCase()

  //max name for ns or resources is 63 chars
  // trim channel name to max 58 char to allow a max of 63 char length
  //for the channel authentication (which is channelName-auth) object and channel ns (channelName-ns)
  if (channelName.length > 58) {
    channelName = channelName.substring(channelName.length - 56)
  }
  channelName = `${channelType}${channelName}`

  return channelName
}

//check if this is a channel already defined by the current app
export const isUsingSameChannel = (urlControl, globalControl, channelName) => {
  let usingSameChannel = false
  const channelsControl = globalControl.find(
    ({ id: idCtrl }) => idCtrl === 'channels'
  )
  if (channelsControl) {
    //get all active channels and see if this channel name was created prior to this; reuse it if found
    const activeDataChannels = _.get(channelsControl, 'active', [])
    activeDataChannels.forEach(channelInfo => {
      const channelNameInfo = channelInfo.find(
        ({ id: idChannelInfo }) => idChannelInfo === 'channelName'
      )
      if (
        channelNameInfo &&
        _.get(channelNameInfo, 'active', '') === channelName &&
        _.get(urlControl, 'groupControlData') !== channelInfo
      ) {
        usingSameChannel = true
      }
    })
  }

  return usingSameChannel
}

export const updateChannelControls = (
  urlControl,
  globalControl,
  setLoadingState
) => {
  getGitBranches(_.get(urlControl, 'groupControlData'), setLoadingState)

  //update existing placement rule section when user changes the namespace
  const nsControl = globalControl.find(
    ({ id: idCtrl }) => idCtrl === 'namespace'
  )
  const { active, availableData, groupControlData } = urlControl
  const pathData = availableData[active]

  const nameControl = groupControlData.find(
    ({ id: idCtrlCHName }) => idCtrlCHName === 'channelName'
  )
  const namespaceControl = groupControlData.find(
    ({ id: idChannelNS }) => idChannelNS === 'channelNamespace'
  )
  //use this to record if the namespace for the channel used already exists
  //this could happen when using an existing channel OR a new channel and the ns was created before but not deleted
  const namespaceControlExists = groupControlData.find(
    ({ id: idCtrlNSExists }) => idCtrlNSExists === 'channelNamespaceExists'
  )
  let existingChannel = false
  let usingSameChannel = false
  // change channel name and namespace to reflect repository path
  if (active) {
    // if existing channel, reuse channel name and namespace
    if (pathData && pathData.metadata) {
      nameControl.active = pathData.metadata.name
      namespaceControl.active = pathData.metadata.namespace
      existingChannel = true
    } else {
      //generate a unique name for this channel
      const channelName = getUniqueChannelName(active, groupControlData)
      const channelNS = `${channelName}-ns`

      usingSameChannel = isUsingSameChannel(
        nsControl,
        globalControl,
        channelName
      )

      if (usingSameChannel) {
        // if existing channel, reuse channel name and namespace
        nameControl.active = channelName
        namespaceControl.active = channelNS
        namespaceControlExists.active = true
      } else {
        nameControl.active = channelName
        namespaceControl.active = ''
        namespaceControlExists.active =
          _.get(nsControl, 'availableData', {})[channelNS] === undefined
            ? false
            : true
      }
    }
  } else {
    nameControl.active = ''
    namespaceControl.active = ''
    namespaceControlExists.active = false
  }

  // update reconcile rate based on selected channel url
  // if existing channel, make channel reconcile rate readonly
  // NOTE: existing channels with no reconcile rate set, will use the default medium rate
  let rateValue = 'medium'
  if (pathData && pathData.raw) {
    rateValue = _.get(
      pathData.raw,
      'metadata.annotations["apps.open-cluster-management.io/reconcile-rate"]',
      'medium'
    )
  }
  const reconcileRate = groupControlData.find(
    ({ id }) => id === 'gitReconcileRate' || id === 'helmReconcileRate'
  )
  if (reconcileRate) {
    reconcileRate.active = rateValue
    reconcileRate.disabled = existingChannel ? true : false
  }

  const secretName = groupControlData.find(
    ({ id }) =>
      id === 'githubSecret' || id === 'helmSecret' || id === 'objectstoreSecret'
  )
  if (secretName) {
    if (existingChannel && pathData && pathData.secretRef) {
      secretName.type = 'text'
      secretName.active = pathData.secretRef
    } else {
      secretName.type = 'hidden'
      secretName.active = ''
    }
  }

  let control
  // if existing channel, hide user/token controls; show it when using the same channel in the same app
  const type = !existingChannel || usingSameChannel ? 'text' : 'hidden'
  const checkboxType =
    !existingChannel || usingSameChannel ? 'checkbox' : 'hidden'
  const setType = (cid, isPasswordField, isCheckbox) => {
    control = groupControlData.find(({ id }) => id === cid)
    let setCtrlType = isCheckbox ? checkboxType : type
    if (isPasswordField) {
      setCtrlType = type === 'hidden' ? type : 'password'
    }
    _.set(control, 'type', setCtrlType)
    if (type === 'hidden') {
      _.set(control, 'active', '')
    }
  }
  const { id } = urlControl
  switch (id) {
  case 'githubURL':
    setType('githubUser')
    setType('githubAccessId', true)
    setType('gitInsecureSkipVerify', false, true)
    break
  case 'objectstoreURL':
    setType('accessKey')
    setType('secretKey', true)
    break
  case 'helmURL':
    setType('helmUser')
    setType('helmPassword', true)
    setType('helmInsecureSkipVerify', false, true)
    break
  }

  return globalControl
}

export const updateControlsForNS = (
  initiatingControl,
  nsControl,
  globalControl
) => {
  const controlList = getExistingPRControlsSection(
    initiatingControl,
    globalControl
  )
  controlList.forEach(control => {
    const existingRuleControl = _.get(control, 'placementrulecombo')
    const existingruleCheckbox = _.get(control, existingRuleCheckbox)
    const selectedRuleNameControl = _.get(control, 'selectedRuleName')
    //update placement rule controls
    if (existingRuleControl && existingruleCheckbox) {
      _.set(existingruleCheckbox, 'active', false)
      _.set(existingRuleControl, 'active', '')
      _.set(existingRuleControl, 'type', 'hidden')
      selectedRuleNameControl && _.set(selectedRuleNameControl, 'active', '')

      updateNewRuleControlsData('', control)
    }

    //update ansible secret controls
    const ansibleSecretName = _.get(control, 'ansibleSecretName')
    const ansibleTowerHost = _.get(control, 'ansibleTowerHost')
    const ansibleTowerToken = _.get(control, 'ansibleTowerToken')
    if (ansibleSecretName && ansibleTowerHost && ansibleTowerToken) {
      _.set(ansibleSecretName, 'active', '')
      _.set(ansibleTowerHost, 'active', '')
      _.set(ansibleTowerToken, 'active', '')
      _.set(ansibleTowerHost, 'type', 'text')
      _.set(ansibleTowerToken, 'type', 'text')
    }
  })

  return globalControl
}

const retrieveGitDetails = async (
  branchName,
  groupControlData,
  setLoadingState
) => {
  try {
    const gitControl = groupControlData.find(({ id }) => id === 'githubURL')
    const branchCtrl = groupControlData.find(({ id }) => id === 'githubBranch')
    const githubPathCtrl = groupControlData.find(
      ({ id }) => id === 'githubPath'
    )
    const userCtrl = groupControlData.find(({ id }) => id === 'githubUser')

    const tokenCtrl = groupControlData.find(
      ({ id }) => id === 'githubAccessId'
    )

    const gitUrl = _.get(gitControl, 'active', '')
    if (!gitUrl) {
      branchCtrl.active = ''
      branchCtrl.available = []
      return
    }

    //check only github repos
    const url = new URL(gitUrl)
    if (url.host !== 'github.com') {
      return
    }

    // Check for existing channel
    const selectedChannel = _.get(
      _.get(gitControl, 'availableData', {}),
      gitUrl
    )
    const queryVariables = {
      gitUrl,
      namespace: _.get(selectedChannel, 'metadata.namespace', ''),
      secretRef: _.get(selectedChannel, 'secretRef', ''),
      user: _.get(userCtrl, 'active'),
      accessToken: _.get(tokenCtrl, 'active')
    }

    githubPathCtrl.active = ''
    githubPathCtrl.available = []

    if (branchName) {
      //get folders for branch
      setLoadingState(githubPathCtrl, true)
      const pathQueryVariables = {
        ...queryVariables,
        branch: branchName
      }
      apolloClient.getGitChannelPaths(pathQueryVariables).then(
        result => {
          const items = _.get(result, 'data.items', []) || []
          items.forEach(path => {
            githubPathCtrl.available.push(path)
          })
          setLoadingState(githubPathCtrl, false)
        },
        () => {
          //on error
          setLoadingState(githubPathCtrl, false)
        }
      )
    } else {
      //get branches
      setLoadingState(branchCtrl, true)
      const onError = () => {
        branchCtrl.exception = msgs.get('creation.app.loading.branch.error')
        setLoadingState(branchCtrl, false)
      }
      apolloClient.getGitChannelBranches(queryVariables).then(result => {
        if (_.get(result, 'errors')) {
          onError()
        } else {
          branchCtrl.active = ''
          branchCtrl.available = []

          const items = _.get(result, 'data.items', []) || []
          items.forEach(branch => {
            branchCtrl.available.push(branch)
          })
          delete branchCtrl.exception
          setLoadingState(branchCtrl, false)
        }
      }, onError)
    }
  } catch (err) {
    //return err
  }
}

export const updateGitBranchFolders = async (
  branchControl,
  globalControls,
  setLoadingState
) => {
  const groupControlData = _.get(branchControl, 'groupControlData', [])
  const branchName = _.get(branchControl, 'active', '')
  retrieveGitDetails(branchName, groupControlData, setLoadingState)
}

export const getGitBranches = async (groupControlData, setLoadingState) => {
  retrieveGitDetails(null, groupControlData, setLoadingState)
}

export const setAvailableRules = (control, result) => {
  const { loading } = result
  const { data = {} } = result
  const { placementrules } = data
  control.available = []
  control.availableMap = {}
  control.isLoading = false

  const error = placementrules ? null : result.error

  if (error) {
    control.isFailed = true
  } else if (placementrules) {
    if (placementrules.length > 0) {
      control.availableData = _.keyBy(placementrules, 'metadata.name')
      control.available = Object.keys(control.availableData).sort()
      //remove default placement rule name if this is not on the list of available placements
      //in that case the name was set by the reverse function on control initialization
      if (control.active && !control.available.includes(control.active)) {
        control.active = null
      }
    } else {
      control.availableData = []
    }
  } else {
    control.isLoading = loading
  }

  return control
}

export const setAvailableNSSpecs = (control, result) => {
  const { loading } = result
  const { data = {} } = result
  const { items } = data
  control.available = []
  control.availableMap = {}
  control.isLoading = false
  const error = items ? null : result.error
  if (error) {
    control.isFailed = true
  } else if (items) {
    control.availableData = _.keyBy(items, 'metadata.name')
    control.available = Object.keys(control.availableData).sort()
  } else {
    control.isLoading = loading
  }

  return control
}

export const getExistingPRControlsSection = (initiatingControl, control) => {
  //returns the existing placement rule options for the channel selection
  const result = []

  if (_.get(initiatingControl, 'groupControlData')) {
    //the update happened on a single channel, get that channel only PRs
    const controlDataList = _.get(initiatingControl, 'groupControlData')

    const channelInfo = {}

    controlDataList.forEach(controlDataObject => {
      channelInfo[controlDataObject.id] = controlDataObject
    })

    result.push(channelInfo)
  } else {
    //this is a global update, get all channels PRs
    const channelsControl = control.find(({ id }) => id === 'channels')

    if (channelsControl) {
      (_.get(channelsControl, 'active') || []).forEach(channelControls => {
        const channelInfo = {}
        channelControls.forEach(controlDataObject => {
          channelInfo[controlDataObject.id] = controlDataObject
        })
        result.push(channelInfo)
      })
    }
  }

  return result
}

export const updateNewRuleControlsData = (selectedPR, control) => {
  const onlineControl = _.get(control, onlineClustersCheckbox)
  const clusterSelectorControl = _.get(control, 'clusterSelector')
  const localClusterControl = _.get(control, localClusterCheckbox)

  if (selectedPR) {
    const clusterConditionsList = _.get(
      selectedPR,
      'raw.spec.clusterConditions',
      []
    )
    const localClusterData = clusterConditionsList.filter(
      rule =>
        _.get(rule, 'status', '').toLowerCase() === 'true' &&
        _.get(rule, 'type', '') === 'ManagedClusterConditionAvailable'
    )

    if (localClusterData.length > 0) {
      _.set(onlineControl, 'type', 'checkbox')
      _.set(onlineControl, 'disabled', true)
      _.set(onlineControl, 'active', true)
    } else {
      _.set(onlineControl, 'type', 'hidden')
    }

    const clusterSelectorData = _.get(
      selectedPR,
      'raw.spec.clusterSelector.matchLabels',
      null
    )

    clusterSelectorData !== null
      ? _.set(clusterSelectorControl, 'type', 'custom')
      : _.set(clusterSelectorControl, 'type', 'hidden')

    clusterSelectorControl.active.mode = clusterSelectorData !== null

    if (clusterSelectorData) {
      clusterSelectorControl.active.clusterLabelsList.splice(
        0,
        clusterSelectorControl.active.clusterLabelsList.length
      )

      const newData = []
      let idx = 0
      Object.keys(clusterSelectorData).forEach(key => {
        newData.push({
          id: idx,
          labelName: key,
          labelValue: clusterSelectorData[key],
          validValue: true
        })
        idx = idx + 1
      })

      clusterSelectorControl.active.mode =
        clusterSelectorControl.active.clusterLabelsList.length > 0

      if (newData.length === 0) {
        newData.push({
          id: 0,
          labelName: '',
          labelValue: '',
          validValue: false
        })
      }

      clusterSelectorControl.showData = newData
      clusterSelectorControl.active = {
        mode: true,
        clusterLabelsList: newData,
        clusterLabelsListID: newData.length
      }
    }

    _.set(localClusterControl, 'type', 'hidden')
  } else {
    _.set(localClusterControl, 'type', 'checkbox')

    _.set(onlineControl, 'type', 'checkbox')
    _.set(onlineControl, 'active', false)
    _.set(onlineControl, 'disabled', false)

    _.set(clusterSelectorControl, 'type', 'custom')
    _.set(clusterSelectorControl, 'active.mode', true)

    clusterSelectorControl.active.clusterLabelsListID = 1
    clusterSelectorControl.active.clusterLabelsList = [
      { id: 0, labelName: '', labelValue: '', validValue: false }
    ]
    clusterSelectorControl.showData = []
  }

  return control
}

export const setAvailableChannelSpecs = (type, control, result) => {
  const { loading } = result
  const { data = {} } = result
  const { items } = data
  control.available = []
  control.availableMap = {}
  control.isLoading = false
  const error = items ? null : result.error
  if (error) {
    control.isFailed = true
  } else if (items) {
    control.availableData = _.keyBy(
      items
        .filter(({ type: p }) => {
          return p.toLowerCase().startsWith(type)
        })
        .filter(({ objectPath: path }) => {
          return !path
            .toLowerCase()
            .includes('multiclusterhub-repo.open-cluster-management')
        }),
      'objectPath'
    )
    control.available = Object.keys(control.availableData).sort()
  } else {
    control.isLoading = loading
  }

  return control
}

export const setAvailableSecrets = (control, result) => {
  const { loading } = result
  const { data = {} } = result
  const { secrets } = data
  control.available = []
  control.availableMap = {}
  control.isLoading = false
  const error = secrets ? null : result.error
  if (error) {
    control.isFailed = true
  } else if (secrets) {
    control.availableData = _.keyBy(secrets, 'name')
    control.available = Object.keys(control.availableData).sort()
  } else {
    control.isLoading = loading
  }

  updatePrePostControls(control)

  return control
}

export const updatePrePostControls = urlControl => {
  const groupControlData = _.get(urlControl, 'groupControlData')

  const { active, availableData } = urlControl

  const selectedSecret = availableData && availableData[active]

  const ansibleHost =
    groupControlData &&
    groupControlData.find(({ id }) => id === 'ansibleTowerHost')
  const ansibleToken =
    groupControlData &&
    groupControlData.find(({ id }) => id === 'ansibleTowerToken')

  if (!selectedSecret) {
    //new secret, show host task info
    _.set(ansibleHost, 'type', 'text')
    _.set(ansibleToken, 'type', 'password')
  } else {
    //existing secret, hide and clean host and token
    _.set(ansibleHost, 'type', 'hidden')
    _.set(ansibleToken, 'type', 'hidden')
    _.set(ansibleHost, 'active', '')
    _.set(ansibleToken, 'active', '')
  }

  return urlControl
}

export const getSharedPlacementRuleWarning = control => (
  <SharedResourceWarning
    resourceType={RESOURCE_TYPES.HCM_PLACEMENT_RULES}
    control={control}
  />
)

export const getSharedSubscriptionWarning = control => (
  <SharedResourceWarning
    resourceType={RESOURCE_TYPES.HCM_SUBSCRIPTIONS}
    control={control}
  />
)
