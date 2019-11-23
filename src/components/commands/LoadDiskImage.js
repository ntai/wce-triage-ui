import React from "react";
// import cloneDeep from 'lodash/cloneDeep';
import request from 'request-promise';
import {sweetHome} from './../../looseend/home';
import socketio from "socket.io-client";
import {RunnerProgress} from "./RunnerProgress";
import Disks from "./Disks";
import Catalog from "./Catalog";
import WipeOption from "./WipeOption";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import DiskImageSelector from './DiskImageSelector';
import "./commands.css";
import cloneDeep from "lodash/cloneDeep";
import BuildIcon from '@material-ui/icons/Build';
import RestoreIcon from '@material-ui/icons/Restore';
import RefreshIcon from "@material-ui/icons/Refresh";
import CancelIcon from "@material-ui/icons/Cancel";


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

      resetting : false
    };

    this.fetchSources = this.fetchSources.bind(this);
    this.setRestoreType = this.setRestoreType.bind(this);
    this.setRestoreTypes = this.setRestoreTypes.bind(this);
    this.did_reset = this.did_reset.bind(this);
  }

  diskSelectionChanged(selectedDisks, clicked) {
    if (!clicked)
      return;
    var newSelection = cloneDeep(this.state.targetDisks);

    if (this.state.targetDisks[clicked.deviceName]) {
        newSelection[clicked.deviceName] = false;
    }
    else {
      if (!clicked.mounted)
        newSelection[clicked.deviceName] = clicked;
    }
    this.setState( {targetDisks: newSelection});
  }

  did_reset() {
    this.setState( {resetting: false});
  }


  onReset() {
    this.setState( {resetting: true,
      source: undefined,
      sources: [],
      subsetSources: [],
      targetDisks: {}
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
    console.log("LoadDiskImage::setRestoreTypes");
    console.log(catalog);
    this.setState({restoreTypes: catalog, restoreType: undefined})
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
    // Make array rather than json object.
    const targetDiskList = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);
    const resotringSource = this.state.source;
    const restoreType = this.state.restoreType;

    if (targetDiskList.length === 0 || !resotringSource || !restoreType) {
      return undefined;
    }

    // time to make donuts
    var wipe = "";
    if (this.state.wipeOption !== undefined) {
      wipe = "&wipe=" + this.state.wipeOption.value;
      console.log(this.state.wipeOption)
    }

    console.log(targetDiskList);

    if (targetDiskList.length > 1) {
      var url = sweetHome.backendUrl + "/dispatch/load?deviceNames=";
      var sep = "";
      var targetDisk;
      for (targetDisk of targetDiskList) {
        url = url + sep + targetDisk;
        sep = ",";
      }
      url = url + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value + wipe;
      return encodeURI(url);
    }
    else {
      const targetDisk = targetDiskList[0];
      return encodeURI(sweetHome.backendUrl + "/dispatch/load?deviceName=" + targetDisk + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value + wipe);
    }
  }

  onLoad() {
    const restoringUrl = this.getRestoringUrl();
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
    const { sources, subsetSources, source, wipeOption, restoreType, diskRestoring, resetting, runningStatus, targetDisks, restoreTypes } = this.state;
    const restoringUrl = this.getRestoringUrl();

    return (
      <div>
        <Grid container spacing={0} >
          <Grid item xs={1}>
              <Button startIcon={<BuildIcon />} variant="contained" color="secondary" onClick={() => this.onLoad()} disabled={restoringUrl === undefined}>Load</Button>
          </Grid>
          <Grid item xs={2}>
              <WipeOption title={"Wipe"} wipeOption={wipeOption} wipeOptionChanged={this.selectWipe.bind(this)} wipeOptionsChanged={this.setWipeOptions.bind(this)}/>
          </Grid>
            <Grid item xs={4}>
              <DiskImageSelector setSource={this.setSource.bind(this)} sources={subsetSources} source={source} />
            </Grid>

            <Grid item xs={2}>
              <Catalog title={"Restore type"} catalogType={restoreType} catalogTypes={restoreTypes} catalogTypeChanged={this.setRestoreType} catalogTypesChanged={this.setRestoreTypes} />
            </Grid>
            <Grid item xs={2}>
              <ButtonGroup>
                <Button startIcon={<RefreshIcon />} size="small" variant="contained" color="primary" onClick={() => this.onReset()}>Reset</Button>
                <Button startIcon={<CancelIcon />} size="small" variant="contained" color="secondary" onClick={() => this.onAbort()} disabled={!diskRestoring}>Abort</Button>
              </ButtonGroup>
            </Grid>

          <Grid item xs={12} >
            <Disks running={diskRestoring} selected={targetDisks} runningStatus={runningStatus} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged.bind(this)} />
          </Grid>
          <Grid item xs={12} >
            <RunnerProgress runningStatus={runningStatus} statuspath={"/dispatch/disk-load-status.json"} />
          </Grid>
        </Grid>
      </div>
    );
  }
}

