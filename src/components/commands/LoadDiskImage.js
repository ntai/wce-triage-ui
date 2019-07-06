import React from "react";
import cloneDeep from 'lodash/cloneDeep';

// Import React Table
import "./commands.css";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
//
import request from 'request-promise';

// Dropdown menu
// import ReactSelect from 'react-select';
import ReactSelect from 'react-select';
import { Container, Row, Col } from 'react-bootstrap'

import {sweetHome} from './../../looseend/home';
import socketio from "socket.io-client";

import {RunnerProgress, value_to_color} from "./RunnerProgress";
import Disks from "./Disks";

class ErrorMessageModal extends React.Component {
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Image loading
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h4>{this.props.errorTitle}</h4>
          <p>
            {this.props.errorMessage}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default class LoadDiskImage extends React.Component {
  constructor() {
    super();
    this.state = {
      /* The disk images sources */
      sources: [],
      /* Selected disk image source. Because the selection can be multiple by original implementation, the value her is always a single elemnt array. */
      source: undefined,
      /* Fetching the disk images */
      sourcesLoading: true,

      /* The restore types */
      restoreTypes: [],
      restoreType: undefined,
      restoreTypesLoading: true,

      /* selected disks */
      selected: {},

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: "",

      resetting : false
    };

    this.fetchSources = this.fetchSources.bind(this);
    this.setRestoreType = this.setRestoreType.bind(this);
    this.closeErrorMessageModal = this.closeErrorMessageModal.bind(this);
    this.disk_selection_changed = this.disk_selection_changed.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  disk_selection_changed(selectedDisks) {
    this.setState( {selected: selectedDisks});
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onReset() {
    this.setState( {resetting: true});
    this.setState( {source: undefined, sources: []});
    this.fetchSources();
  }

  setSource(source) {
    console.log(source);
    this.setState({source: source,
      restoreType: this.state.restoreTypes.filter( rt => rt.value === source.restoreType)[0]});
  }

  setRestoreType(selected) {
    console.log(selected);
    this.setState({restoreType: selected})
  }

  closeErrorMessageModal() {
    this.setState({modaling: false});
  }

  showErrorMessageModal(title, msg) {
    this.setState({modaling: true, errorTitle: title, errorMessage: msg});
  }

  componentWillMount() {
    this.fetchSources()
    this.fetchRestoreTypes()
  }

  getRestoringUrl() {
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const resotringSource = this.state.source;
    const restoreType = this.state.restoreType;

    if (selectedDevices.length === 0 || !resotringSource || !restoreType) {
      return undefined;
    }

    // time to make donuts
    const targetDisk = selectedDevices[0];
    return sweetHome.backendUrl + "/dispatch/load?deviceName=" + targetDisk + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value;
  }

  onLoad() {
    const restoringUrl = this.getRestoringUrl();

    if (restoringUrl === undefined) {
      this.showErrorMessageModal("Please select...", "No disk, source or restore type selected.");
      return;
    }

    console.log(restoringUrl);

    // time to make donuts
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const targetDisk = selectedDevices[0];
    var remainings = {}
    Object.keys(this.state.selected).slice(1).map( tag => remainings[tag] = true )
    this.setState({ diskRestoring: true, selected: remainings, target: targetDisk });

    request({
      "method":"POST",
      "uri": restoringUrl,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        target: null,
        diskRestoring: true
      });
    });
  }


  onAbort() {
    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/stop-load",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      this.setState({
        diskRestoring: false,
      });
    });
  }


  fetchSources(state, instance) {
    this.setState({ sourcesLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/disk-images.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        sources: res.sources.map( src => ({value: src.fullpath, label: src.name, filesize: src.size, mtime: src.mtime, restoreType: src.restoreType})),
        source: undefined,
        sourcesLoading: false,
      });
    });
  }

  fetchRestoreTypes(state, instance) {
    this.setState({ restoreTypesLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/restore-types.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res.restoreTypes);

      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        // marshall this for ReactSelect
        restoreTypes: res.restoreTypes.map(rt => ({label: rt.name, value: rt.id})),
        restoreType: undefined,
        restoreTypesLoading: false
      });
    });
  }

  render() {
    const { sources, source, restoreTypes, restoreType, diskRestoring, resetting} = this.state;
    const restoringUrl = this.getRestoringUrl();

    return (
      <div>
        <Container>
          <Row>
            <Col sm={1}>
              <Button variant="danger" size="sm" onClick={() => this.onLoad()} disabled={restoringUrl === undefined}>Load</Button>
            </Col>
            <Col sm={4}>
              <ReactSelect
                // handing down undefined doesn't change the selection. Dummy value '' sets it.
                value={source || ''}
                style={{fontSize: 12, textAlign: "left"}}
                placeholder="Select source"
                options={sources}
                onChange={(value) => this.setSource(value)}
              />
            </Col>

            <label>
                Restore type:
            </label>
            <Col sm={3}>
              <ReactSelect style={{fontSize: 12, textAlign: "left"}} value={restoreType || ''} options={restoreTypes} onChange={this.setRestoreType}/>
            </Col>
            <Col sm={1}>
              <Button size="sm" onClick={() => this.onReset()}>Reset</Button>
            </Col>
            <Col sm={1}>
              <Button size="sm" variant="danger" onClick={() => this.onAbort()} disabled={!diskRestoring}>Abort</Button>
            </Col>
          </Row>
          <Row>
            <label visible={restoringUrl !== undefined}>{restoringUrl}</label>
          </Row>
        </Container>

        <Disks runner={"loadimage"} resetting={resetting} did_reset={this.did_reset} disk_selection_changed={this.disk_selection_changed} />
        <br />
        <RunnerProgress runner={"loadimage"} statuspath={"/dispatch/disk-load-status.json"}/>

        <ErrorMessageModal
          errorMessage={this.state.errorMessage}
          show={this.state.modaling}
          onHide={this.closeErrorMessageModal}
        />
      </div>
    );
  }
}

