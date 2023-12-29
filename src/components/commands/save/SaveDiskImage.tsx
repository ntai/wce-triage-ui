import React from "react";
import {sweetHome} from '../../../looseend/home';
import {io} from "socket.io-client";
import RunnerProgress from "../../parts/RunnerProgress";
import Disks from "../../parts/Disks";
import Catalog from "../../parts/Catalog";
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid'
import SaveIcon from '@mui/icons-material/Save';

import "../commands.css";
import RefreshIcon from "@mui/icons-material/Refresh";
import CancelIcon from "@mui/icons-material/Cancel";
import {ItemType, RunReportType, DiskType, DeviceSelectionType} from "../../common/types";


type SaveDiskImageStateType = {
  imageTypes: ItemType[];
  imageType?: string;

  makingImage: boolean;
  sourceDisk?: string;
  runningStatus?: RunReportType;

  /* Selected disks */
  selectedDisks: DeviceSelectionType<DiskType>;

  resetting: boolean;
};


export default class SaveDiskImage extends React.Component<any,SaveDiskImageStateType> {
  constructor(props: any) {
    super(props);
    this.state = {
      /* Selected disk image destination. Because the selection can be multiple by original implementation, the value her is always a single element array. */
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
    const loadWock = io(sweetHome.websocketUrl);
    loadWock.on("saveimage", this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(update: RunReportType) {
    this.setState({runningStatus: update, makingImage: true})
  }

  setImageType(selected?: string) {
    console.log(selected);
    this.setState({imageType: selected})
  }

  setImageTypes(catalog: ItemType[]) {
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
    return sweetHome.backendUrl + "/dispatch/save?deviceName=" + sourceDisk + "&type=" + imagingType;
  }

  onSave() {
    const savingUrl = this.getImagingUrl();
    console.log(savingUrl);
    if (savingUrl === undefined)
        return;

    fetch(savingUrl, {"method":"POST"}).then(_ => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({ makingImage: true });
    });
  }

  onReset() {
    this.setState( {resetting: true, selectedDisks: {}});
  }

  diskSelectionChanged(selectedDisks: DeviceSelectionType<DiskType>, clicked?: DiskType) {
    if (clicked && !clicked.mounted) {
      this.setState( {selectedDisks: {[clicked.deviceName]: clicked}});
    }
  }

  did_reset() {
    this.setState( {resetting: false});
  }

  onAbort() {
    fetch(sweetHome.backendUrl + "/dispatch/stop-save", {"method":"POST"}).then(res => {
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
            <Button size="small" startIcon={<SaveIcon />} variant="contained" color="primary" onClick={() => this.onSave()} disabled={imagingUrl === undefined}>Save</Button>
          </Grid>

          <Grid item xs={5}>
            <Catalog title={"Disk image type"} catalogType={this.state.imageType} catalogTypeChanged={this.setImageType} catalogTypesChanged={this.setImageTypes}/>
          </Grid>

          <Grid item xs={1}>
            <Button startIcon={<RefreshIcon />} size="small" variant="contained" color="primary" onClick={() => this.onReset()}>Reset</Button>
          </Grid>
          <Grid item xs={1}>
            <Button startIcon={<CancelIcon />} size="small" variant="contained" color="secondary" onClick={() => this.onAbort()} disabled={!makingImage}>Abort</Button>
          </Grid>

          <Grid item xs={12}>
            <Disks running={makingImage} maxSelected={1} selected={selectedDisks} runningStatus={runningStatus} resetting={resetting} did_reset={this.did_reset} diskSelectionChanged={this.diskSelectionChanged.bind(this)} />
          </Grid>

          <Grid item xs={12}>
          <RunnerProgress runningStatus={runningStatus} statuspath={"/dispatch/disk-save-status"}/>
          </Grid>

        </Grid>
      </div>
    );
  }
}
