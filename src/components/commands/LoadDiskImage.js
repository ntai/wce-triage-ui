import React from "react";
import cloneDeep from 'lodash/cloneDeep';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
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

function value_to_color(value) {
  return value > 100 ? '#FF1f1f'
    : value === 100 ? '#00ef0f'
      : value > 0 ? '#5f8fff'
        : '#dadada';
}

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

      /* Raw disks */
      disks: [],
      /* Disk table - page 1 always */
      diskPages: null,
      /* Fetching list of disks */
      disksLoading: true,

      /* Disk operation steps (aka tasks) */
      steps: [],
      /* Page number of the table */
      stepPages: 1,
      /* Loading steps */
      stepsLoading: true,

      /* Restroing a disk */
      diskRestoring: false,
      /* Target disk for loadiing */
      targetDisk: 0,

      /* Selected disks */
      selected: {},
      /* ReactSelect all status */
      selectAll: 0,

      /* Mounted disks */
      mounted: {},

      /* Error message modal dialog */
      modaling: false,
      errorMessage: "",
      errorTitle: ""
    };

    this.fetchSources = this.fetchSources.bind(this);
    this.fetchDisks = this.fetchDisks.bind(this);
    this.fetchSteps = this.fetchSteps.bind(this);

    this.setRestoreType = this.setRestoreType.bind(this);

    this.closeErrorMessageModal = this.closeErrorMessageModal.bind(this);
  }

  setSource(source) {
    console.log(source);
    this.setState({source: source,
      restoreType: this.state.restoreTypes.filter( rt => rt.value == source.restoreType)[0]});
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
    this.fetchDisks()
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on('loadimage', this.onResoringState.bind(this));
  }

  onResoringState(restoring) {
    var steps = restoring.steps;

    // if the browser reloaded, nothing I can do.
    if (this.state.steps === undefined && steps === undefined)
      return;

    if (steps === undefined) {
      steps = cloneDeep(this.state.steps)
    }

    const step_no = restoring.step;
    const progress = restoring.progress;
    const elapseTime = restoring.elapseTime;
    const message = restoring.message;
    const status = restoring.status;

    if (step_no) {
      steps[step_no].progress = progress;
      steps[step_no].elapseTime = elapseTime;
      steps[step_no].message = message;
      steps[step_no].status = status;
    }

    var disks = cloneDeep(this.state.disks);
    console.log("disk status " + restoring.device + " " + restoring.runEstimate + " " + restoring.runTime);

    if (restoring.device && restoring.runEstimate && restoring.runTime) {
      const devname = restoring.device;
      var disk;

      for (disk of disks) {
        if (disk.deviceName === devname) {
          disk.progress = Math.round(restoring.runTime / restoring.runEstimate * 100);
          disk.runEstiamte = restoring.runEstimate;
          disk.runTime = restoring.runTime;
          disk.runStatus = restoring.runStatus;
          break;
        }
      }
    }

    this.setState({
      steps: steps,
      stepsLoading: false,
      disks: disks,
      disksLoading: false,
    })
  }

  toggleSelectAll() {
    let newSelected = {};

    if (this.state.selectAll === 0) {
      this.state.disks.forEach(x => {
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

  getRestoringUrl() {
    const selectedDevices = Object.keys(this.state.selected).filter( devName => this.state.selected[devName]);
    const resotringSource = this.state.source;
    const restoreType = this.state.restoreType;

    if (selectedDevices.length == 0 || !resotringSource || !restoreType) {
      return undefined;
    }

    // time to make donuts
    const targetDisk = selectedDevices[0];
    return sweetHome.backendUrl + "/dispatch/load?deviceName=" + targetDisk + "&source=" + resotringSource.value + "&size=" + resotringSource.filesize + "&restoretype=" + restoreType.value;
  }

  onLoad() {
    const restoringUrl = this.getRestoringUrl();

    if (restoringUrl == undefined) {
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

    // this.onLoad();
  }

  onReset() {
    this.setState( {source: undefined, sources: []});
    this.fetchSources()
    this.fetchDisks()
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

  render() {
    const { sources, source, sourcesLoading, restoreTypes, restoreType, restoreTypesLoading, diskRestoring, disks, diskPages, steps, disksLoading, stepPages, stepsLoading, selected } = this.state;
    const restoringUrl = this.getRestoringUrl();


    return (
      <div>
        <Container>
          <Row>
            <Col sm={1}>
              <Button variant="danger" size="sm" onClick={() => this.onLoad()} disabled={restoringUrl == undefined}>Load</Button>
            </Col>
            <Col sm={4}>
              <ReactSelect
                // handing down undefined doesn't change the selection. Dummy value '' sets it.
                value={source || ''}
                style={{fontSize: 13, textAlign: "left"}}
                placeholder="Select source"
                options={sources}
                onChange={(value) => this.setSource(value)}
              />
            </Col>

            <label>
                Restore type:
            </label>
            <Col sm={3}>
              <ReactSelect value={restoreType || ''} options={restoreTypes} onChange={this.setRestoreType}/>
            </Col>
            <Col sm={1}>
              <Button size="sm" onClick={() => this.onReset()}>Reset</Button>
            </Col>
            <Col sm={1}>
              <Button size="sm" variant="danger" onClick={() => this.onAbort()} disabled={!diskRestoring}>Abort</Button>
            </Col>
          </Row>
          <Row>
            <label visible={restoringUrl != undefined}>{restoringUrl}</label>
          </Row>
        </Container>

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
        <br />

        <ReactTable
          columns={[
            {
              Header: "Step",
              width: 250,
              accessor: "category",
              style: {textAlign: "right"},
            },
            {
              Header: "Estimate",
              width: 60,
              accessor: "timeEstimate"
            },
            {
              Header: "Elapsed",
              width: 60,
              accessor: "elapseTime"
            },
            {
              Header: 'Status',
              width: 100,
              accessor: 'status',
              Cell: row => (
                <span>
                  <span style={{
                   color: row.value === 'waiting' ? value_to_color(0)
                     : row.value === 'running' ?  value_to_color(1)
                     : row.value === 'done' ? value_to_color(100)
                     : row.value === 'fail' ? value_to_color(999)
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
              width: 100,
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
                      width: `${Math.min(100, row.value)}%`,
                      height: '100%',
                      backgroundColor: value_to_color(row.value),
                      borderRadius: '2px',
                      transition: 'all .2s ease-out'
                    }}
                  />
                </div>
              )
            },
            {
              Header: "Description",
              width: 200,
              accessor: "message",
              style: {textAlign: "left"},
            },
          ]}
          manual // Forces table not to paginate or sort automatically, so we can handle it server-side
          style={{fontSize: 12, borderRadius: 0, textAligh: "left"}}
          data={steps}
          pages={stepPages}      // Display the total number of pages
          loading={stepsLoading} // Display the loading overlay when we need it
          onFetchData={this.fetchSteps} // Request new data when things change
          defaultPageSize={15}
          showPagination={false}
          sortable={false}
          className="-striped -highlight"
        />

        <ErrorMessageModal
          errorMessage={this.state.errorMessage}
          show={this.state.modaling}
          onHide={this.closeErrorMessageModal}
        />
      </div>
    );
  }
}

