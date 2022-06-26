import React, {CSSProperties} from 'react';
import {sweetHome} from "../../looseend/home";
import {tableIcons, value_to_bgcolor, value_to_color} from "./TriageTableTheme";
import OperationProgressBar from './OperationProgressBar';
import '../commands/commands.css';
import {TaskInfo, RunReportType} from "../common/types";
import Mui5Table from "./Mui5Table";
import {Divider} from "@mui/material";
import Typography from "@mui/material/Typography";

type RunnerPropsType = {
  runningStatus: undefined | RunReportType;
  statuspath: string;
}

type RunnerStateType = {
  sequenceNumber: number | undefined;
  tasks: TaskInfo[];
  taskPages: number;
  tasksLoading: boolean;
  fontSize: number;
}

/* TaskInfo = {
 *     step: "" | number;
 *     taskCategory: string;
 *     taskProgress: number;
 *     taskEstimate: number;
 *     taskElapse: number;
 *     taskStatus: TaskStatusType;
 *     taskMessage: null | string;
 *     taskExplain: string;
 *     taskVerdict?: string[];
 * }
 */

/*
* Task details
*/
function TaskDetails({task}: {task: TaskInfo}) {
    // This is a bug in type description. iconProps must exist.
    // @ts-ignore
    if (task.taskVerdict) {
      return (
          <div className="preformat"
               style={{fontSize: 12, textAlign: 'left', backgroundColor: '#eeeeee', padding: 2}}>
            {task.taskExplain}
            {task.taskVerdict.map(elem => <p>{elem}</p>)}
          </div>
      )
    } else {
      return (
          <div className="preformat">
            {task.taskExplain}
          </div>
      )
    }
}


export default class RunnerProgress extends React.Component<RunnerPropsType, RunnerStateType> {
  constructor(props: any) {
    super(props);
    this.state = {
      /* Status update sequence number */
      sequenceNumber: undefined,

      /* Disk operation tasks (aka tasks) */
      tasks: [],
      /* Page number of the table */
      taskPages: 1,
      /* Loading tasks */
      tasksLoading: true,
      
      fontSize: 12,
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
        console.log( this.props.runningStatus);
        const tasks = JSON.parse(JSON.stringify(this.state.tasks));
        const step_no = this.props.runningStatus.step;
        tasks[step_no] = this.props.runningStatus.task;
        this.setState({tasks: tasks})
      }
      else {
        console.log("tasks is not defined yet.")
      }
    }
  }

  fetchTasks() {
    // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
    // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
    this.setState({ tasksLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    fetch(sweetHome.backendUrl + this.props.statuspath) // "/dispatch/disk-load-status.json"
        .then(reply => reply.json())
        .then(res => {
          // Now just get the rows of data to your React Table (and update anything else like total pages or loading)
          if (res.tasks) {
            this.setState({
              tasks: res.tasks,
              taskPages: res.pages
            });
          }
        })
        .finally( () => {
          this.setState({
            tasksLoading: false,
          });
        });
  }

  render() {
    const {tasks, tasksLoading, fontSize } = this.state;
    if (tasks === undefined)
        return null;

    function columnHeaderStyle(style: React.CSSProperties) {
      return Object.assign<React.CSSProperties,React.CSSProperties,React.CSSProperties>({}, {color: "white", alignContent: "center"}, style);
    }

    function columnCellStyle(style: React.CSSProperties) {
      return Object.assign<React.CSSProperties,React.CSSProperties,React.CSSProperties>( {}, {paddingTop: 1, paddingBottom: 1, paddingLeft: 8, paddingRight: 8}, style);
    }


    return (
        <React.Fragment>
        <Mui5Table<TaskInfo>
          icons={tableIcons}
          margin="dense"
          style={ {marginTop: 30, marginBottom: 1, minWidth: 750, fontSize: 13, borderRadius: 0, borderWidth: 0, textAlign: "left"} }
          columns={[
            {
              title: "Step",
              render: (row, rowIndex) => row.taskCategory,
              cellStyle: columnCellStyle({fontSize: fontSize, textAlign: "right", minWidth: 300, maxWidth: 450}),
              headerStyle: columnHeaderStyle({textAlign: "right"}),
            },
            {
              title: "Estimate",
              render: (row, _) => `${row.taskEstimate}`,
              cellStyle: columnCellStyle({fontSize: fontSize,  width: 120, textAlign: "center"}),
              headerStyle: columnHeaderStyle({}),
            },
            {
              title: "Elapsed",
              render: (row, _) => `${row.taskElapse}`,
              cellStyle: columnCellStyle({fontSize: fontSize,  width: 120, textAlign: "center"}),
              headerStyle: columnHeaderStyle({}),
            },
            {
              title: 'Status',
              cellStyle: columnCellStyle({fontSize: fontSize, width: 140 }),
              headerStyle: columnHeaderStyle({}),
              render: (row, _) => (
                <span>
                  <span style={{
                    color: row.taskStatus === 'waiting' ? value_to_color(0)
                      : row.taskStatus === 'running' ?  value_to_color(1)
                        : row.taskStatus === 'done' ? value_to_color(100)
                          : row.taskStatus === 'fail' ? value_to_color(999)
                            : '#404040',
                    transition: 'all .3s ease'
                  }}>
              &#x25cf;
            </span> {
                  row.taskStatus === 'waiting' ? 'Holding'
                    : row.taskStatus === 'running' ? `In progress`
                    : row.taskStatus === 'done' ? `Completed`
                      : row.taskStatus === 'fail' ? `Failed`
                        : 'Bug'
                }
            </span>
              )
            },
            {
              title: 'Progress',
              cellStyle: columnCellStyle({fontSize: fontSize,  minWidth: 120, maxWidth: 300}),
              headerStyle: columnHeaderStyle({}),
              render: (row, _) => (<OperationProgressBar value={row.taskProgress} />)
            },
            {
              title: "Description",
              cellStyle: columnCellStyle({fontSize: fontSize,  minWidth: 350, maxWidth: 400}),
              headerStyle: columnHeaderStyle({}),
              render: (row, _) => (<Typography sx={{fontSize: "0.8rem"}}>{row.taskMessage}</Typography>)
            }
          ]}
          rows={tasks}
          isLoading={tasksLoading} // Display the loading overlay when we need it
          options={
            {
              paging: false,
              sorting: false,
              draggable: false,
              toolbar: false,
              search: false,
              showTitle: false,
              detailPanelColumnAlignment: "left",
              size: "small",
              rowStyle: rowData => { return { backgroundColor: value_to_bgcolor(rowData.taskProgress), paddingTop: 0, paddingBottom: 0, paddingLeft: 8, paddingRight: 8 } },
              headerStyle: { backgroundColor: "#333333", color: "white", borderSpacing: 1 }
            }
          }
          detailPanel={[{
            tooltip: "Show task details",
            // This is a bug in type description. iconProps must exist.
            // @ts-ignore
            iconProps: { size: "small" },
            render: rowData => {
              if (rowData.taskVerdict) {
                return (
                  <div className="preformat"
                       style={{fontSize: 12, textAlign: 'left', backgroundColor: '#eeeeee', padding: 2}}>
                    {rowData.taskExplain}
                    {rowData.taskVerdict.map(elem => <p>{elem}</p>)}
                  </div>
                )
              } else {
                return (
                  <div className="preformat">
                    {rowData.taskExplain}
                  </div>
                )
              }
            },
          },
          ]
         }
        />
        </React.Fragment>
    );
  }
}
