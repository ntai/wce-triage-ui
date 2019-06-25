import React from "react";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
import "./commands.css";

//
import request from 'request-promise';
import Websocket from 'react-websocket';

// Dropdown menu
import Select from 'react-dropdown-select';
import { Container, Row, Col } from 'react-bootstrap'

import {sweetHome} from './../../looseend/home';

export default class LoadDiskImage extends React.Component {
  constructor() {
    super();
    this.state = {
      sources: [],
      source: [],
      sourcesLoading: true,
      disks: [],
      diskPages: null,
      disksLoading: true,
      steps: [],
      stepPages: 1,
      stepsLoading: true,

      loadingDisk: false,
      targetDisk: 0,

      selected: {},
      selectAll: 0,

      mounted: {}
    };

    this.fetchSources = this.fetchSources.bind(this);
    this.fetchDisks = this.fetchDisks.bind(this);
    this.fetchSteps = this.fetchSteps.bind(this);
  }

  setSource = selectValues => this.setState({ "source": selectValues });

  componentWillMount() {
    this.fetchSources()
    this.fetchDisks()
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.state.data.forEach(x => {
        newSelected[x.deviceName] = true;
      });
    }

    this.setState({
      selected: newSelected,
      selectAll: this.state.selectAll === 0 ? 1 : 0
    });
  }

  toggleRow(deviceName) {
    const newSelected = Object.assign({}, this.state.selected);
    newSelected[deviceName] = !this.state.selected[deviceName];
    this.setState({
      selected: newSelected,
      selectAll: 2
    });
  }


  onLoad() {
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    if (selectedDevices.length === 0)
      return;

    const loadingSource = this.state.source;
    if (! loadingSource)
      return;

    // time to make donuts
    const loadingDisk = selectedDevices[0];
    var remainings = {}
    Object.keys(this.state.selected).slice(1).map( tag => remainings[tag] = true )

    this.setState({ loadingDisk: true, selected: remainings, target: loadingDisk });

    request({
      "method":"POST",
      "uri": sweetHome.backendUrl + "/dispatch/load?deviceName=" + loadingDisk + "&source=" + loadingSource[0].fullpath,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        target: null,
        sourcesLoading: false
      });
    });

    // this.onLoad();
  }

  onReset() {
    this.fetchSources()
    this.fetchDisks()
  }

  onSourceChange(src) {
    this.setState( { source: src } );
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
      var source = [];
      if (res.sources.length > 0) {
        // FIXME: should pick the latest depending on the mod time
        source = [res.sources[0]];
      }
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        sources: res.sources,
        source: source,
        sourcesLoading: false
      });
    });
  }

  fetchDisks(state, instance) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({ disksLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/disks.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
      this.setState({
        disks: res.disks,
        diskPages: res.pages,
        disksLoading: false,
        mounted: {}, // FIXME: filter disk by mounted === 1
        selected: {} // FIXME: filter disk by selected === 1
      });
    });
  }

  fetchSteps(state, instance) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({ stepsLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/disk-load-status.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
      this.setState({
        steps: res.steps,
        stepPages: res.pages,
        stepsLoading: false
      });
    });
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

  handleWock(msg) {
    const serverMessage = JSON.parse(msg);
    const loadStatus = serverMessage.get('loadStatus');
    if (loadStatus) { this.setStatus({ steps: loadStatus})}
  }

  render() {
    const { sources, source, sourcesLoading, disks, diskPages, steps, disksLoading, stepPages, stepsLoading } = this.state;
    return (
      <div>
        <Container>
          <Row>
            <Col sm={1}>
              <button onClick={() => this.onLoad()}>Load</button>
            </Col>
            <Col sm={9}>
              <Select
                placeholder="Select source"
                style={{"aligh": "left"}}
                loading={sourcesLoading}
                multi={false}
                options={sources}
                values={source}
                dropdownGap={2}
                onDropdownOpen={ () => this.fetchSources() }
                onChange={source => this.setSource(source)}
                labelField={"name"}
                valueField={"name"}
              />
            </Col>
            <Col sm={1}>
              <button onClick={() => this.onReset()}>Reset</button>
            </Col>
          </Row>
        </Container>

        <ReactTable
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
                    onChange={() => this.toggleRow(original.deviceName)}
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
              accessor: "",
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
              Header: "Elapsed",
              width: 100,
              accessor: "elapseTime"
            },
            {
              Header: 'Progress',
              width: 80,
              accessor: 'progress',
            },
            {
              Header: '-',
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
                      backgroundColor: row.value > 100 ? '#FF1f1f'
                        : row.value > 99 ? '#00ef0f'
                        : row.value > 0 ? '#5f8fff'
                        : '#efefef',
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
          className="-striped"
        />
        <br />

        <ReactTable
          columns={[
            {
              Header: "Step",
              width: 150,
              accessor: "category"
            },
            {
              Header: "Elapsed",
              accessor: "elapseTime"
            },
            {
              Header: 'Status',
              accessor: 'status',
              Cell: row => (
                <span>
                  <span style={{
                   color: row.value === 'waiting' ? '#808080'
                     : row.value === 'running' ?  '#0000ff'
                     : row.value === 'done' ? '#00ff00'
                     : row.value === 'fail' ? '#ff0000'
                     : '#404040',
                    transition: 'all .3s ease'
                }}>
              &#x25cf;
            </span> {
                  row.value === 'waiting' ? 'Holding'
                    : row.value === 'running' ? `In progress`
                    : row.value === 'done' ? `Completed`
                    : row.value === 'fail' ? `Failed`
                    : 'Bug'
                }
          </span>
              )
            },
            {
              Header: 'Progress',
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
                      backgroundColor: row.value > 66 ? '#85cc00'
                        : row.value > 33 ? '#ffbf00'
                          : '#ff2e00',
                      borderRadius: '2px',
                      transition: 'all .2s ease-out'
                    }}
                  />
                </div>
              )
            }
          ]}
          manual // Forces table not to paginate or sort automatically, so we can handle it server-side
          data={steps}
          pages={stepPages}      // Display the total number of pages
          loading={stepsLoading} // Display the loading overlay when we need it
          onFetchData={this.fetchSteps} // Request new data when things change
          defaultPageSize={10}
          className="-striped -highlight"
        />
        <Websocket url={sweetHome.websocketUrl + "/dispatch/wock"} onMessage={this.handleWock.bind(this)}/>
      </div>
    );
  }
}

