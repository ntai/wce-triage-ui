import React from "react";
import request from 'request-promise';
import {sweetHome} from './../../looseend/home';
import cloneDeep from "lodash/cloneDeep";
import "./commands.css";
import MaterialTable from "material-table";
import {tableTheme, tableIcons} from "./TriageTableTheme";
import OperationProgressBar from './OperationProgressBar';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import DiskDetails from "./DiskDetails";


export default class Disks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      diskStatusLoading: true,

      /* disk loading update sequence number */
      sequenceNumber: undefined,

      /* Mounted disks */
      mounted: {},

      /* Wipe options */
      wipeOptions: [],
      wipeOptionsLoading: true,
    };

    this.fetchDisks = this.fetchDisks.bind(this);
  }


  fetchDisks(state, instance) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({diskStatusLoading: true});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
        "method": "GET",
        "uri": sweetHome.backendUrl + "/dispatch/disks.json",
        "json": true,
        "titles": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      var mounted = {};
      var selected = {};
      var disk;
      for (disk of res.disks) {
        mounted[disk.deviceName] = disk.mounted;
        selected[disk.deviceName] = false;
      }
      this.setState({
        disks: res.disks,
        diskStatusLoading: false,
        mounted: mounted
      });
      this.props.diskSelectionChanged(selected);
    });
  }

  fetchWipeOptions(state, instance) {
    this.setState({wipeOptionsLoading: true});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
        "method": "GET",
        "uri": sweetHome.backendUrl + "/dispatch/wipe-types.json",
        "json": true,
        "titles": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      const wipeOptions = res.wipeTypes.map(rt => ({label: rt.name, value: rt.id}))
      this.setState({wipeOptions: wipeOptions, wipeOptionsLoading: false});
    });
  }

  resetDiskWipeOption() {
    var disks = cloneDeep(this.state.disks);
    var disk;

    for (disk of disks) {
      disk.wipe = this.wipeOptions[0];
    }
    this.setState({disks: disks})
  }


  componentDidMount() {
    this.fetchWipeOptions();
    this.fetchDisks();
  }

  onReset() {
    this.setState(  {
      /* Raw disks */
      disks: [],
      /* Fetching list of disks */
      diskStatusLoading: true,

      /* Mounted disks */
      mounted: {},

      /* available wipeOptions */
      wipeOptions: [],

    });
    this.fetchDisks();
    this.props.did_reset();
  }

  componentDidUpdate() {
    var disk;
    var disks = undefined;
    var target_update = false;


    if (this.props.resetting)
      this.onReset();

    for (disk of this.state.disks) {
      const is_target = this.props.selected[disk.deviceName] ? 1 : 0;
      if (disk['target'] !== is_target) {
        target_update = true;
        break;
      }
    }

    if (target_update) {
      disks = cloneDeep(this.state.disks);
      for (disk of disks) {
        const is_target = this.props.selected[disk.deviceName] ? 1 : 0;
        disk['target'] = is_target;
      }
      this.setState({disks: disks});
    }
    else {
      if (this.props.runningStatus === undefined) {
        return;
      }

      if (this.state.sequenceNumber === this.props.runningStatus._sequence_)
        return;

      this.setState({sequenceNumber: this.props.runningStatus._sequence_});

      disks = cloneDeep(this.state.disks);

      if (this.props.runningStatus.device && this.props.runningStatus.runEstimate && this.props.runningStatus.runTime) {
        const devname = this.props.runningStatus.device;
        const runTime = this.props.runningStatus.runTime;
        const runEstimate = this.props.runningStatus.runEstimate;
        const runMessage = this.props.runningStatus.runMessage;
        for (disk of disks) {
          if (disk.deviceName === devname) {
            // Little trick to show "some" progress if run time is smol and run estimate is big.
            // cuz, after rounded, it can be zero and no visible bar on the screen and that's annoying.
            if (this.props.runningStatus.runStatus === "Preflight")
              disk.progress = 0;
            if (this.props.runningStatus.runStatus === "Running")
              disk.progress = Math.max(runTime > 0 ? 1 : 0, Math.min(99, Math.round(runTime / runEstimate * 100)))
            if (this.props.runningStatus.runStatus === "Success")
              disk.progress = 100;
            if (this.props.runningStatus.runStatus === "Failed")
              disk.progress = 999;

            disk.runEstiamte = runEstimate;
            disk.runTime = runTime;
            disk.runMessage = runMessage;
            break;
          }
        }
      }

      this.setState({disks: disks});
    }
  }

  setNewSelection(newSelection, clicked) {
    this.props.diskSelectionChanged(newSelection, clicked);
  }

  requestUnmountDisk(deviceName, mountState) {
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/unmount?deviceName=" + deviceName + "&mount=" + mountState,
      "json": true,
      "titles": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      this.onReset();
    });
  }


  render() {
    const { disks, diskStatusLoading, wipeOptions } = this.state;

    return (
      <div>
        <ThemeProvider theme={tableTheme} />
        <MaterialTable
          icons={tableIcons}
          style={ {marginTop: 1, marginBottom: 1, marginLeft: 0, marginRight: 0} }
          disabled={diskStatusLoading || this.props.running}
          onSelectionChange={this.setNewSelection.bind(this)}
          columns={[
            {
              title: "Disk",
              field: "deviceName",
              cellStyle: {
                backgroundColor: '#eeeeee',
                width: 120
              },
              headerStyle: {
                backgroundColor: '#eeeeee',
              }
            },
            {
              title: "Mounted",
              field: "mounted",
              cellStyle: { width: 30 },
              headerStyle: {
                maxWidth: 75,
              },
              render: row => ( <input
                  type="checkbox"
                  className="checkbox"
                  checked={this.state.mounted[row.deviceName] === true}
                  onChange={() => this.requestUnmountDisk(row.deviceName, this.state.mounted[row.deviceName])}
                />
              )
            },
            {
              title: "Bus",
              field: "bus",
              cellStyle: { width: 40 },
              headerStyle: {
                maxWidth: 60,
              },
            },
            {
              title: "Model",
              field: "model",
              cellStyle: { width: 300 },
              headerStyle: {
                width: 300,
              },
            },
            {
              title: "Estimate",
              field: "runEstiamte",
              cellStyle: { width: 80, textAlign: 'center' },
              headerStyle: {
                maxWidth: 80,
              },
            },
            {
              title: "Elapsed",
              field: "runTime",
              cellStyle: { width: 80, textAlign: 'center'  },
              headerStyle: {
                maxWidth: 80,
              },
            },
            {
              title: "Status",
              field: "runMessage",
              cellStyle: { minWidth: 200 },
              headerStyle: {
                minWidth: 200,
              },
            },
            {
              title: 'Progress',
              cellStyle: { minWidth: 120 },
              headerStyle: {
                minWidth: 120,
                maxWidth: 200
              },
              field: 'progress',
              render: row => (
                <div>
                  <OperationProgressBar value={row.progress} />
                </div>
              )
            }
            ] }
          data={disks}
          isLoading={diskStatusLoading} // Display the loading overlay when we need it
          options={{
            selection: true,
            selectionProps: rowData => ( { disabled: rowData.mounted, checked: rowData.target } ),
            rowStyle: rowData => ({ backgroundColor: rowData.tableData.checked ? '#37b15933' : '' }),
            paging: false,
            draggable: false,
            toolbar: false,
            search: false,
            showTitle: false,
            detailPanelColumnAlignment: "left",
          }}
          detailPanel={rowData => <DiskDetails disk={rowData} />}
        />
      </div>
    );
  }
}

