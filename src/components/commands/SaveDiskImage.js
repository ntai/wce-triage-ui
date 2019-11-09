import React from "react";
import request from 'request-promise';
import {sweetHome} from './../../looseend/home';
import socketio from "socket.io-client";
import {RunnerProgress} from "./RunnerProgress";
import Disks from "./Disks";
import Catalog from "./Catalog";
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import "./commands.css";
import cloneDeep from "lodash/cloneDeep";


export default class SaveDiskImage extends React.Component {
  constructor() {
    super();
    this.state = {
      /* Selected disk image destination. Because the selection can be multiple by original implementation, the value her is always a single elemnt array. */
      imageTypes: [],
      imageType: undefined,

      makingImage: false,
      sourceDisk: undefined,
      runningStatus: undefined,
      
      /* Selected disks */
      selectedDisks: {},

      resetting: false,
    };
    this.did_reset = this.did_reset.bind(this);
    this.setImageType = this.setImageType.bind(this);
    this.setImageTypes = this.setImageTypes.bind(this);
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("saveimage", this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(update) {
    this.setState({runningStatus: update, makingImage: true})
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
    const selectedDevices = Object.keys(this.state.selectedDisks).filter( devName => this.state.selectedDisks[devName]);
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

    request({
      "method":"POST",
      "uri": savingUrl,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({ makingImage: true });
    });
  }

  onReset() {
    this.setState( {resetting: true, destination: undefined});
  }

  diskSelectionChanged(selectedDisks, clicked) {
    var newSelection = {};

    if (!clicked.mounted) {
      newSelection[clicked.deviceName] = clicked;
      this.setState( {selectedDisks: newSelection});
    }
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
    const { runningStatus, makingImage, resetting, selectedDisks } = this.state;
    const imagingUrl = this.getImagingUrl();

    return (
      <div>
        <Grid container>
          <Grid item xs={1}>
            <Button size="sm" variant="contained" color="primary" onClick={() => this.onSave()} disabled={imagingUrl === undefined}>Save</Button>
          </Grid>

          <Grid item xs={5}>
            <Catalog title={"Disk image type"} catalogType={this.state.imageType} catalogTypeChanged={this.setImageType} catalogTypesChanged={this.setImageTypes}/>
          </Grid>

          <Grid item xs={1}>
            <Button size="sm" variant="contained" color="primary" onClick={() => this.onReset()}>Reset</Button>
          </Grid>
          <Grid item xs={1}>
            <Button size="sm" variant="contained" color="secondary" onClick={() => this.onAbort()} disabled={!makingImage}>Abort</Button>
          </Grid>

          <Grid item xs={12}>
          <Disks running={makingImage} selected={selectedDisks} runningStatus={runningStatus} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged.bind(this)} />
          </Grid>

          <Grid item xs={12}>
          <RunnerProgress runningStatus={runningStatus} statuspath={"/dispatch/disk-save-status.json"}/>
          </Grid>

        </Grid>
      </div>
    );
  }
}
