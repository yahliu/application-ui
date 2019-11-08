/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2019. All Rights Reserved.
 *
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import { Search as CarbonSearch } from 'carbon-components-react'
import { getSearchNames } from './helpers/filterHelper'
import msgs from '../../../../nls/platform.properties'

class Search extends React.Component {

  static propTypes = {
    locale: PropTypes.string,
    onNameSearch: PropTypes.func,
    searchName: PropTypes.string,
  }

  constructor (props) {
    super(props)
    this.state = {
      searchName: props.searchName,
    }
    this.nameSearchMode = false
  }

  componentDidMount () {
    this.closeBtn = this.nameSearchRef.getElementsByClassName('bx--search-close')[0]
    this.closeBtn.addEventListener('click', ()=>{
      this.closeBtnClicked = true
    })
  }

  handleSearch = ({target}) => {
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout)
    }

    // if user clicks close button, stop search immediately
    const searchName = (target.value||'')
    this.setState({searchName})
    if (this.closeBtnClicked) {
      this.props.onNameSearch(searchName)
      delete this.closeBtnClicked
    } else {
      if (searchName.length>0 || this.nameSearchMode) {
        // if not in search mode yet, wait for an input > 2 chars
        // if in search mode, keep in mode until no chars left
        const {searchNames} = getSearchNames(searchName)
        const refreshSearch = searchNames.filter(s=>s.length>1).length>0
        if (refreshSearch || searchName.length===0) {
          this.typingTimeout = setTimeout(() => {
            this.props.onNameSearch(searchName)
          }, searchName.length>0 ? 500 : 1500)
          this.nameSearchMode = searchName.length>0
        }
      }
    }
  }

  setNameSearchRef = ref => {this.nameSearchRef = ref}

  shouldComponentUpdate(nextProps, nextState){
    return this.state.searchName !== nextState.searchName
  }

  render() {
    const { locale } = this.props
    const {searchName} = this.state
    const searchTitle = msgs.get('name.label', locale)
    const searchMsgKey = 'search.label.links'
    return (
      <div role='region' className='search-filter' ref={this.setNameSearchRef}
        aria-label={searchTitle} id={searchTitle}>
        <CarbonSearch id='search-name' labelText='' aria-label='Seach-input' value={searchName}
          placeHolderText={msgs.get(searchMsgKey, locale)}
          onChange={this.handleSearch}
        />
      </div>
    )
  }

}

export default Search
