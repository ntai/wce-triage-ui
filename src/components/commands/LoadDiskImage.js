import React from "react";
import cloneDeep from 'lodash/cloneDeep';

import { Button, Modal, ButtonToolbar, ButtonGroup } from "react-bootstrap";
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
import Catalog from "./Catalog";

import "./commands.css";
import WipeOption from "./WipeOption";


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
      /* The disk images sources */
      subsetSources: [],
      /* Selected disk image source. Because the selection can be multiple by original implementation, the value her is always a single elemnt array. */
      source: undefined,
      /* Fetching the disk images */
      sourcesLoading: true,

      /* wipe */
      wipeOptions: [],
      wipeOption: undefined,


      /* The restore types */
      restoreTypes: [],
      restoreType: undefined,

      /* target disks */
      targetDisks: {},

      diskRestoring: false,
      runningStatus: undefined,

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: "",

      resetting : false
    };

    this.fetchSources = this.fetchSources.bind(this);
    this.setRestoreType = this.setRestoreType.bind(this);
    this.setRestoreTypes = this.setRestoreTypes.bind(this);
    this.closeErrorMessageModal = this.closeErrorMessageModal.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  diskSelectionChanged(selectedDisks) {
    this.setState( {targetDisks: selectedDisks});
  }

  did_reset() {
    this.setState( {resetting: false});
  }


  onReset() {
    this.setState( {resetting: true,
      source: undefined,
      sources: [],
      subsetSources: [],
      targetDisks: []
    });
    this.fetchSources();
    // this.setState( {wipeOption: undefined})
  }

  setSource(source) {
    const restoreType = this.state.restoreTypes.filter(rt => rt.value === source.restoreType)[0];
    this.setState({source: source, restoreType: restoreType});
    console.log("Restore type:");
    console.log(restoreType);
    this.forceUpdate();
  }

  selectWipe(selected) {
    this.setState({wipeOption: selected})
  }

  setWipeOptions(wipers) {
    this.setState({wipeOptions: wipers, wipeOption: wipers[0]})
  }

  setRestoreType(selected) {
    const restoreTypeID = selected.value;
    console.log("selected restoreType: " + restoreTypeID);

    var subset = [];
    if (this.state.sources) {
      subset = this.state.sources.filter(source => source.restoreType === restoreTypeID);
      if (subset.length > 1) {
        subset.sort( function(a, b) { return a.mtime < b.mtime; })
      }
    }

    var source = undefined;

    if (subset.length > 0) {
      source = subset[0];
    }
    this.setState({restoreType: selected, subsetSources: subset, source: source})
  }

  setRestoreTypes(catalog) {
    this.setState({restoreTypes: catalog, restoreType: undefined})
  }

  closeErrorMessageModal() {
    this.setState({modaling: false});
  }

  showErrorMessageModal(title, msg) {
    this.setState({modaling: true, errorTitle: title, errorMessage: msg});
  }

  componentDidMount() {
    this.fetchSources()
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("loadimage", this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(update) {
    this.setState({runningStatus: update, diskRestoring: update.device !== ''});
  }

  getRestoringUrl() {
    const targetDisks = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);
    const resotringSource = this.state.source;
    const restoreType = this.state.restoreType;

    if (targetDisks.length === 0 || !resotringSource || !restoreType) {
      return undefined;
    }

    // time to make donuts
    var wipe = "";
    if (this.state.wipeOption !== undefined) {
      wipe = "&wipe=" + this.state.wipeOption.value;
      console.log(this.state.wipeOption)
    }

    console.log(targetDisks);

    if (targetDisks.length > 1) {
      var url = sweetHome.backendUrl + "/dispatch/load?deviceNames=";
      var sep = "";
      var targetDisk;
      for (targetDisk of targetDisks) {
        url = url + sep + targetDisk;
        sep = ",";
      }
      url = url + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value + wipe;
      return url;
    }
    else {
      const targetDisk = targetDisks[0];
      return sweetHome.backendUrl + "/dispatch/load?deviceName=" + targetDisk + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value + wipe;
    }
  }

  onLoad() {
    const restoringUrl = this.getRestoringUrl();

    if (restoringUrl === undefined) {
      this.showErrorMessageModal("Please select...", "No disk, source or restore type selected.");
      return;
    }

    console.log(restoringUrl);

    // time to make donuts
    // const selectedDevices = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);
    // const targetDisk = selectedDevices[0];
    // var remainings = {}
    // Object.keys(this.state.targetDisks).slice(1).map( tag => remainings[tag] = true )
    // this.setState({ targetDisks: remainings, target: targetDisk });

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
      const srcs = res.sources.map( src => ({value: src.fullpath, label: src.name, filesize: src.size, mtime: src.mtime, restoreType: src.restoreType}));
      var src = undefined;
      var restoreType = undefined;
      // if there is only one image source, pick it.
      if (srcs.length === 1) {
        src = srcs[0];
        restoreType = src.restoreType;
      }
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        sources: srcs,
        subsetSources: srcs,
        source: src,
        restoreType: restoreType,
        sourcesLoading: false,
      });
    });
  }

 
  render() {
    const { sources, subsetSources, source, wipeOption, restoreType, diskRestoring, resetting, runningStatus, targetDisks } = this.state;
    const restoringUrl = this.getRestoringUrl();

    return (
      <div>
        <ButtonToolbar>
            <Button variant="danger" size="sm" onClick={() => this.onLoad()} disabled={restoringUrl === undefined}>Load</Button>
          <Col sm={2}>
            <WipeOption title={"Wipe"} wipeOption={wipeOption} wipeOptionChanged={this.selectWipe.bind(this)} wipeOptionsChanged={this.setWipeOptions.bind(this)}/>
          </Col>

          <Col sm={4}>
              <ReactSelect
                // handing down undefined doesn't change the selection. Dummy value '' sets it.
                value={source || ''}
                style={{fontSize: 12, textAlign: "left"}}
                placeholder="Select source"
                options={subsetSources}
                onChange={(value) => this.setSource(value)}
              />
            </Col>

          <Col sm={3}>
            <Catalog title={"Restore type"} catalogType={restoreType} catalogTypeChanged={this.setRestoreType} catalogTypesChanged={this.setRestoreTypes} />
          </Col>

          <ButtonGroup>
              <Button size="sm" onClick={() => this.onReset()}>Reset</Button>
              <Button size="sm" variant="danger" onClick={() => this.onAbort()} disabled={!diskRestoring}>Abort</Button>
            </ButtonGroup>
        </ButtonToolbar>

        <Disks running={diskRestoring} selected={targetDisks} runningStatus={runningStatus} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged.bind(this)} />
        <br />
        <RunnerProgress runningStatus={runningStatus} statuspath={"/dispatch/disk-load-status.json"} />

        <ErrorMessageModal
          errorMessage={this.state.errorMessage}
          show={this.state.modaling}
          onHide={this.closeErrorMessageModal}
        />
      </div>
    );
  }
}

