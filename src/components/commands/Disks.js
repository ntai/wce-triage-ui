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

export default class Disks extends React.Component {
  constructor() {
    super();
    this.state = {
      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      disksLoading: true,

      /* Selected disks */
      selected: {},
      /* ReactSelect all status */
      selectAll: 0,

      /* Mounted disks */
      mounted: {},
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
      var disk;
      for (disk of res.disks) {
        mounted[disk.deviceName] = disk.mounted;
      }
      this.setState({
        disks: res.disks,
        disksLoading: false,
        mounted: mounted, // FIXME: filter disk by mounted === 1
        selected: {}
      });
    });
  }


  componentWillMount() {
    this.fetchDisks();
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on(this.props.runner, this.onRunnerUpdate.bind(this));
  }

  onReset() {
    this.setState(  {
      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      disksLoading: true,

      /* Selected disks */
      selected: {},
      /* ReactSelect all status */
      selectAll: 0,

      /* Mounted disks */
      mounted: {},
    });
    this.fetchDisks();
    this.props.did_reset();
  }

  onRunnerUpdate(runner) {
    var disks = cloneDeep(this.state.disks);
    console.log("disk status " + runner.device + " " + runner.runEstimate + " " + runner.runTime);

    if (runner.device && runner.runEstimate && runner.runTime) {
      const devname = runner.device;
      var disk;

      for (disk of disks) {
        if (disk.deviceName === devname) {
          disk.progress = runner.progress;
          disk.runEstiamte = runner.runEstimate;
          disk.runTime = runner.runTime;
          disk.runStatus = runner.runStatus;
          break;
        }
      }
    }

    this.setState({
      disks: disks
    })
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
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[deviceName] = !this.state.selected[deviceName];
    this.setNewSelection(newSelected, 2);
  }

  setNewSelection(newSelected, selectAllState) {
    this.setState({
      selected: newSelected,
      selectAll: selectAllState
    });
    this.props.disk_selection_changed(newSelected);
  }

  requestUnmount(deviceName, mountState) {
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

  componentWillUpdate(nextProps, nextState, nextContext) {
    if (this.props.resetting) {
      this.onReset();
    }
  }

  render() {
    const { disks, diskPages, disksLoading } = this.state;

    return (
      <div>
        <ReactTable
          disabled={disksLoading}
          columns={[
            {
              id: "checkbox",
              accessor: "",
              Cell: ({ original }) => {
                return (
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={this.state.selected[original.deviceName] === true}
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
                    onChange={() => this.requestUnmount(original.deviceName, this.state.mounted[original.deviceName]) }
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
              accessor: "runStatus"
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

