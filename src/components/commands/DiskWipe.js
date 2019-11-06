import React from "react";
import cloneDeep from 'lodash/cloneDeep';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Grid from '@material-ui/core/Grid';
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home';
import Disks from "./Disks";
import '../../bootstrap.min.css';
import "./commands.css";
import socketio from "socket.io-client";

export default class WipeDisk extends React.Component {
  constructor() {
    super();
    this.state = {
      /* target disks */
      targetDisks: {},
      diskWiping: false,

      runningStatus: undefined,

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: "",

      resetting : false
    };

    this.diskSelectionChanged = this.diskSelectionChanged.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("zerowipe", this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(update) {
    this.setState({runningStatus: update, diskWiping: update.device !== ''});
  }

  diskSelectionChanged(targetDisksDisks) {
    console.log(targetDisksDisks);
    this.setState( {targetDisks: targetDisksDisks});
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onReset() {
    this.setState( {resetting: true});
  }


  getWipeUrl() {
    const targetDisks = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);

    if (targetDisks.length === 0) {
      return undefined;
    }

    if (targetDisks.length > 1) {
      var url = sweetHome.backendUrl + "/dispatch/wipe?deviceNames=";
      var sep = "";
      var targetDisk;
      for (targetDisk of targetDisks) {
        url = url + sep + targetDisk;
        sep = ",";
      }
      return url;
    }
    else {
      const targetDisk = targetDisks[0];
      return sweetHome.backendUrl + "/dispatch/wipe?deviceName=" + targetDisk;
    }
  }

  
  onWipe() {
    const wipeUrl = this.getWipeUrl();

    if (wipeUrl === undefined) {
      this.showErrorMessageModal("Please select...", "No disk, source or restore type targetDisks.");
      return;
    }

    console.log(wipeUrl);

    // time to make donuts
    const targetDiskDevices = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);

    request({
      "method":"POST",
      "uri": wipeUrl,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({diskWiping: true});
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
    const { resetting, diskWiping, targetDisks, runningStatus } = this.state;
    const wipeUrl = this.getWipeUrl();

    return (
      <div>
        <Grid container>
        <Grid container item sm={12}>
        <Grid item sm={4}>
            <ButtonGroup>
              <Button variant="danger"  onClick={() => this.onWipe()} disabled={wipeUrl === undefined}>Wipe Disk</Button>
              <Button onClick={() => this.onReset()}>Reset</Button>
              <Button variant="danger" onClick={() => this.onAbort()} disabled={!diskWiping}>Abort</Button>
            </ButtonGroup>
        </Grid>
	</Grid>
        <Grid container item sm={12}>
          <Disks runner={"zerowipe"} runningStatus={runningStatus} r selected={targetDisks} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged} />
	</Grid>
	</Grid>
      </div>
    );
  }
}

