import React from "react";
import cloneDeep from 'lodash/cloneDeep';

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";
//
import request from 'request-promise';

import {sweetHome} from './../../looseend/home';
import socketio from "socket.io-client";

import "./commands.css";

function value_to_color(value) {
  return value > 100 ? '#FF1f1f'
    : value === 100 ? '#00ef0f'
      : value > 0 ? '#5f8fff'
        : '#dadada';
};


class RunnerProgress extends React.Component {
  constructor() {
    super();
    this.state = {
      /* Disk operation steps (aka tasks) */
      steps: [],
      /* Page number of the table */
      stepPages: 1,
      /* Loading steps */
      stepsLoading: true,
    };

    this.fetchSteps = this.fetchSteps.bind(this);
  }

  componentWillMount() {
    this.fetchSteps()
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    // 'loadimage'
    loadWock.on(this.props.runner, this.onRunnerUpdate.bind(this));
  }

  onRunnerUpdate(runner) {
    var steps = runner.steps;

    // if the browser reloaded, nothing I can do.
    if (this.state.steps === undefined && steps === undefined)
      return;

    if (steps === undefined) {
      steps = cloneDeep(this.state.steps)
    }

    const step_no = runner.step;
    const progress = runner.progress;
    const elapseTime = runner.elapseTime;
    const message = runner.message;
    const status = runner.status;

    if (step_no) {
      steps[step_no].progress = progress;
      steps[step_no].elapseTime = elapseTime;
      steps[step_no].message = message;
      steps[step_no].status = status;
    }
    this.setState({
      steps: steps,
      stepsLoading: false,
    })
  }

  fetchSteps(state, instance) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({ stepsLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + this.props.statuspath, // "/dispatch/disk-load-status.json"
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

  render() {
    const {steps, stepPages, stepsLoading } = this.state;

    return (
      <div>
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
      </div>
    );
  }
}


export { value_to_color, RunnerProgress}
