import React from "react";
import cloneDeep from 'lodash/cloneDeep';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
//
import request from 'request-promise';

// Dropdown menu
// import ReactSelect from 'react-select';
import ReactSelect from 'react-select';
import {Container, Row, Col, ButtonToolbar, ButtonGroup} from 'react-bootstrap'

import {sweetHome} from './../../looseend/home';
import socketio from "socket.io-client";

import {RunnerProgress, value_to_color} from "./RunnerProgress";
import Disks from "./Disks";
import Catalog from "./Catalog";

import "./commands.css";


export default class SaveDiskImage extends React.Component {
  constructor() {
    super();
    this.state = {
      /* Selected disk image destination. Because the selection can be multiple by original implementation, the value her is always a single elemnt array. */
      imageTypes: [],
      imageType: undefined,

      makingImage: false,
      sourceDisk: undefined,
      
      /* Selected disks */
      selected: {},

      resetting: false,
    };
    this.disk_selection_changed = this.disk_selection_changed.bind(this);
    this.did_reset = this.did_reset.bind(this);

    this.setImageType = this.setImageType.bind(this);
    this.setImageTypes = this.setImageTypes.bind(this);

  }

  setImageType(selected) {
    console.log(selected);
    this.setState({imageType: selected})
  }

  setImageTypes(catalog) {
    console.log(catalog);
    this.setState({imageTypes: catalog, imageType: undefined})
  }

  getImagingUrl() {
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const imagingType = this.state.imageType;

    if (selectedDevices.length === 0 || !imagingType) {
      return undefined;
    }

    // time to make donuts
    const sourceDisk = selectedDevices[0];
    return sweetHome.backendUrl + "/dispatch/save?deviceName=" + sourceDisk + "&type=" + imagingType.value;
  }

  onSave() {
    const savingUrl = this.getImagingUrl();
    console.log(savingUrl);

    // time to make donuts
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const selectedDisk = selectedDevices[0];
    var remainings = {}
    Object.keys(this.state.selected).slice(1).map( tag => remainings[tag] = true )
    this.setState({ makingImage: true, selected: remainings, sourceDisk: selectedDisk });

    request({
      "method":"POST",
      "uri": savingUrl,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        target: null,
        makingImage: true
      });
    });

    // this.onLoad();
  }

  onReset() {
    this.setState( {resetting: true});
    this.setState( {destination: undefined, sources: []});
  }

  disk_selection_changed(selectedDisks) {
    this.setState( {selected: selectedDisks});
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onAbort() {
    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/stop-save",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      this.setState({
        makingImage: false,
      });
    });
  }

  render() {
    const { makingImage, resetting } = this.state;
    const imagingUrl = this.getImagingUrl();

    return (
      <div>
        <Container>
          <Row>
            <Col sm={1}>
              <Button className="mr-2" variant="danger" onClick={() => this.onSave()} disabled={imagingUrl === undefined}>Save</Button>
            </Col>

            <Col sm={3}>
            <Catalog title={"Disk image type"} catalogTypeChanged={this.setImageType} catalogTypesChanged={this.setImageTypes}/>
            </Col>

            <Col sm={1}>
              <Button className="mr-2" onClick={() => this.onReset()}>Reset</Button>
            </Col>
            <Col sm={1}>
              <Button className="mr-2" variant="danger" onClick={() => this.onAbort()} disabled={!makingImage}>Abort</Button>
            </Col>
          </Row>
          <Row>
            <label visible={imagingUrl !== undefined}>{imagingUrl}</label>
          </Row>
        </Container>
        <Disks runner={"saveimage"} resetting={resetting} did_reset={this.did_reset} disk_selection_changed={this.disk_selection_changed} />

        <br />

        <RunnerProgress runner={"saveimage"} statuspath={"/dispatch/disk-save-status.json"}/>

      </div>
    );
  }
}
