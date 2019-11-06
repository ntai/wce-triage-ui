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
      /* Status update sequence number */
      sequenceNumber: undefined,

      /* Disk operation tasks (aka tasks) */
      tasks: [],
      /* Page number of the table */
      taskPages: 1,
      /* Loading tasks */
      tasksLoading: true,
    };

    this.fetchTasks = this.fetchTasks.bind(this);
  }

  componentDidMount() {
    this.fetchTasks()
  }

  componentDidUpdate() {
    if (this.props.runningStatus === undefined) {
      return;
    }

    if (this.state.sequenceNumber === this.props.runningStatus._sequence_)
      return;

    this.setState({sequenceNumber: this.props.runningStatus._sequence_});

    console.log(this.props.runningStatus._sequence_);

    if (this.props.runningStatus.tasks !== undefined) {
      this.setState({tasks: this.props.runningStatus.tasks})
    }

    if (this.props.runningStatus.step !== undefined) {
      if (this.state.tasks !== undefined) {
        console.log( this.props.runningStatus)
        var tasks = cloneDeep(this.state.tasks);
        const step_no = this.props.runningStatus.step;
        const task = this.props.runningStatus.task;
        tasks[step_no] = task;
        this.setState({tasks: tasks})
      }
      else {
    	console.log("tasks is not defined yet.")
      }
    }
  }

  fetchTasks(state, instance) {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({ tasksLoading: true });
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
        tasks: res.tasks,
        taskPages: res.pages,
        tasksLoading: false
      });
    });
  }

  render() {
    const {tasks, taskPages, tasksLoading } = this.state;

    return (
      <div>
        <ReactTable
          columns={[
            {
              Header: "Step",
              width: 250,
              accessor: "taskCategory",
              style: {textAlign: "right"},
            },
            {
              Header: "Estimate",
              width: 60,
              accessor: "taskEstimate"
            },
            {
              Header: "Elapsed",
              width: 60,
              accessor: "taskElapse"
            },
            {
              Header: 'Status',
              width: 100,
              accessor: 'taskStatus',
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
              accessor: 'taskProgress',
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
              width: 300,
              accessor: "taskMessage",
              style: {textAlign: "left"},
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

            }
          ]}
          manual // Forces table not to paginate or sort automatically, so we can handle it server-side
          style={{fontSize: 12, borderRadius: 0, textAligh: "left"}}
          data={tasks}
          pages={taskPages}      // Display the total number of pages
          loading={tasksLoading} // Display the loading overlay when we need it
          onFetchData={this.fetchTasks} // Request new data when things change
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
