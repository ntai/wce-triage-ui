import React from "react";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
//
import request from 'request-promise';

import {sweetHome} from './../../looseend/home';
import cloneDeep from "lodash/cloneDeep";
import socketio from "socket.io-client";
import {value_to_color} from "./RunnerProgress";

import "./commands.css";
import WipeSelection from "./WipeSelection";

export default class Disks extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      disksLoading: true,
      /* disk loading update sequence number */
      sequenceNumber: undefined,

      /* ReactSelect all status */
      selectAll: 0,

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
    this.setState({disksLoading: true});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
        "method": "GET",
        "uri": sweetHome.backendUrl + "/dispatch/disks.json",
        "json": true,
        "headers": {
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
        disksLoading: false,
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
        "headers": {
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
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      disksLoading: true,

      /* ReactSelect all status */
      selectAll: 0,

      /* Mounted disks */
      mounted: {},

      /* available wipeOptions */
      wipeOptions: [],

    });
    this.fetchDisks();
    this.props.did_reset();
  }

  componentDidUpdate() {
    if (this.props.runningStatus === undefined) {
      return;
    }

    if (this.state.sequenceNumber === this.props.runningStatus._sequence_)
      return;

    this.setState({sequenceNumber: this.props.runningStatus._sequence_});

    var disks = cloneDeep(this.state.disks);

    if (this.props.runningStatus.device && this.props.runningStatus.runEstimate && this.props.runningStatus.runTime) {
      const devname = this.props.runningStatus.device;
      var disk;
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
            disk.progress = Math.max( runTime > 0 ? 1 : 0, Math.round(runTime / runEstimate * 100))
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
    this.setState({disks: disks });
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.state.disks.forEach(x => {
        newSelected[x.deviceName] = true;
      });
    }

    this.setNewSelection(newSelected, this.state.selectAll === 0 ? 1 : 0);
  }

  toggleSelection(deviceName) {
    var newSelected = Object.assign({}, this.props.selected);
    newSelected[deviceName] = !this.props.selected[deviceName];
    this.setNewSelection(newSelected, 2);
  }

  setNewSelection(newSelected, selectAllState) {
    this.setState({ selectAll: selectAllState });
    this.props.diskSelectionChanged(newSelected);
  }

  requestUnmountDisk(deviceName, mountState) {
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/unmount?deviceName=" + deviceName + "&mount=" + mountState,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
      this.setState({
        mounted: {} // FIXME: do something from the reply
      });
    });
  }


  render() {
    const { disks, diskPages, disksLoading, wipeOptions } = this.state;
    var selectedDisks = {};
    var disk;
    var deviceName;

    for (disk of disks) {
      selectedDisks[disk.deviceName] = false;
    }
    if (this.props.selected) {
      for (deviceName of Object.keys(this.props.selected)) {
        selectedDisks[deviceName] = this.props.selected[deviceName];
      }
    }

    return (
      <div>
        <ReactTable
          disabled={disksLoading || this.props.running}
          columns={[
            {
              id: "checkbox",
              accessor: "",
              Cell: ({ original }) => {
                return (
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedDisks[original.deviceName]}
                    disabled={this.state.mounted[original.deviceName] === true}
                    onChange={() => this.toggleSelection(original.deviceName)}
                  />
                );
              },
              Header: x => {
                return (
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={this.state.selectAll === 1}
                    ref={input => {
                      if (input) {
                        input.indeterminate = this.state.selectAll === 2;
                      }
                    }}
                    onChange={() => this.toggleSelectAll()}
                  />
                );
              },
              sortable: false,
              width: 45
            },

            {
              Header: "Disk",
              accessor: "deviceName",
              width: 100
            },
            {
              Header: "Mounted",
              width: 80,
              accessor: "mounted",
              Cell: ({ original }) => {
                return (
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={this.state.mounted[original.deviceName] === true}
                    onChange={() => this.requestUnmountDisk(original.deviceName, this.state.mounted[original.deviceName]) }
                  />
                );
              },
            },
            {
              Header: "Bus",
              width: 45,
              accessor: "bus"
            },
            {
              Header: "Model",
              width: 400,
              accessor: "model"
            },
            {
              Header: "Estimate",
              width: 100,
              accessor: "runEstiamte"
            },
            {
              Header: "Elapsed",
              width: 100,
              accessor: "runTime"
            },
            {
              Header: "Status",
              accessor: "runMessage"
            },
            {
              Header: 'Progress',
              width: 200,
              accessor: 'progress',
              Cell: row => (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#dadada',
                    borderRadius: '2px'
                  }}
                >
                  <div
                    style={{
                      width: `${row.value}%`,
                      height: '100%',
                      backgroundColor: value_to_color(row.value),
                      borderRadius: '2px',
                      transition: 'all .2s ease-out'
                    }}
                  />
                </div>
              )
            },
          ]}
          manual // Forces table not to paginate or sort automatically, so we can handle it server-side
          data={disks}
          pages={diskPages}      // Display the total number of pages
          loading={disksLoading} // Display the loading overlay when we need it
          onFetchData={this.fetchDisks} // Request new data when things change
          defaultPageSize={4}
          showPagination={false}
          className="-striped"
        />
      </div>
    );
  }
}

