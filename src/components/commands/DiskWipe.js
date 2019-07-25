import React from "react";
import cloneDeep from 'lodash/cloneDeep';

import { Button, Modal, ButtonToolbar, ButtonGroup } from "react-bootstrap";
//
import request from 'request-promise';

// Dropdown menu
import { Container, Row, Col } from 'react-bootstrap'

import {sweetHome} from './../../looseend/home';

import Disks from "./Disks";
import '../../bootstrap.min.css';

import "./commands.css";


export default class WipeDisk extends React.Component {
  constructor() {
    super();
    this.state = {
      /* selected disks */
      selected: {},
      diskWiping: false,

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: "",

      resetting : false
    };

    this.disk_selection_changed = this.disk_selection_changed.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  disk_selection_changed(selectedDisks) {
    console.log(selectedDisks);
    this.setState( {selected: selectedDisks});
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onReset() {
    this.setState( {resetting: true});
  }


  getWipeUrl() {
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);

    if (selectedDevices.length === 0) {
      return undefined;
    }

    // time to make donuts
    const targetDisk = selectedDevices[0];
    return sweetHome.backendUrl + "/dispatch/wipe?deviceName=" + targetDisk;
  }

  
  onWipe() {
    const wipeUrl = this.getWipeUrl();

    if (wipeUrl === undefined) {
      this.showErrorMessageModal("Please select...", "No disk, source or restore type selected.");
      return;
    }

    console.log(wipeUrl);

    // time to make donuts
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const targetDisk = selectedDevices[0];
    var remainings = {}
    Object.keys(this.state.selected).slice(1).map( tag => remainings[tag] = true )
    this.setState({ diskWiping: true, selected: remainings, target: targetDisk });

    request({
      "method":"POST",
      "uri": wipeUrl,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        target: null,
        diskWiping: true
      });
    });
  }


  onAbort() {
    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/stop-wipe",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      this.setState({
        diskWiping: false,
      });
    });
  }


  render() {
    const { resetting, diskWiping } = this.state;
    const wipeUrl = this.getWipeUrl();

    return (
      <div>
        <ButtonToolbar>

          <Button variant="danger"  onClick={() => this.onWipe()} disabled={wipeUrl === undefined}>Wipe Disk</Button>

            <Button onClick={() => this.onReset()}>Reset</Button>
            <Button variant="danger" onClick={() => this.onAbort()} disabled={!diskWiping}>Abort</Button>
        </ButtonToolbar>

        <Row>
          <label visible={wipeUrl !== undefined}>{wipeUrl}</label>
        </Row>

        <Disks runner={"zerowipe"} resetting={resetting} did_reset={this.did_reset} disk_selection_changed={this.disk_selection_changed} />
      </div>
    );
  }
}

