import React from "react";

import request from 'request-promise';

// Dropdown menu
// import ReactSelect from 'react-select';
import ReactSelect from 'react-select';
import { FormLabel, Col } from "react-bootstrap";

import {sweetHome} from './../../looseend/home';

import "./commands.css";

export default class Catalog extends React.Component {
  constructor() {
    super();
    this.state = {
      catalogTypes: [],
      catalogTypesLoading: true,
    };

    this.selectCatalogType = this.selectCatalogType.bind(this);
  }

  selectCatalogType(selected) {
    console.log(selected);
    if (this.props.catalogType !== selected)
      this.props.catalogTypeChanged(selected);
  }

  componentDidMount() {
    this.fetchCatalogTypes();
  }

  fetchCatalogTypes(state, instance) {
    this.setState({ catalogTypesLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/restore-types.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      const catalogs = res.restoreTypes.map(rt => ({label: rt.name, value: rt.id}))
      this.setState({
        // marshall this for ReactSelect
        catalogTypes: catalogs,
        catalogTypesLoading: false
      });
      this.props.catalogTypesChanged(catalogs);
    });
  }

  render() {
    const { catalogTypes} = this.state;

    return (
      <div>
        <ReactSelect style={{fontSize: 14, textAlign: "left"}} value={this.props.catalogType || ''} options={catalogTypes} onChange={this.selectCatalogType} placeholder={this.props.title}/>
      </div>
    );
  }
}

