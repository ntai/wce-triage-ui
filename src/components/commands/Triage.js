import React from "react";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';

import PressPlay from "./PressPlay";
import socketio from "socket.io-client";
import cloneDeep from "lodash/cloneDeep";
import Typography from '@material-ui/core/Typography';
import MaterialTable from "material-table";
import "./commands.css";
import CircularProgress from '@material-ui/core/CircularProgress';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import RefreshIcon from '@material-ui/icons/Refresh';
import LoopIcon from '@material-ui/icons/Loop';
import StopIcon from '@material-ui/icons/Stop';
import {Tooltip} from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(0, 0),
    textAlign: 'left',
    rounded: true,
    fontSize: 11,
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));


function CpuInfo(props) {
  const [loading, setLoading] = React.useState(true);
  const [cpu_info, set_cpu_info] = React.useState(undefined);

  React.useEffect(() => {
    request({
      "method": "GET",
      'uri': sweetHome.backendUrl + '/dispatch/cpu_info.json',
      "json": true,
      "headers": {
	 "User-Agent": "WCE Triage"
      }
    }).then(res => {
      set_cpu_info(res.cpu_info);
      props.onMount(res.cpu_info);
      setLoading(false);
    });
  });

  if (loading) {
    return <CircularProgress/>
  }
  else {
    return (
      <Typography variant={"subtitle"}>
        {cpu_info.name +  " " + cpu_info.description + " " + cpu_info.config}
      </Typography>
    )
  }
}

function CpuRating(props) {
  const classes = useStyles();
  const [cpu_info, set_cpu_info] = React.useState(undefined);

  var summary = "CPU Rating: Expand to see. It may take a couple of minutes.";
  const mounted = (info) => (set_cpu_info(info));

  if (cpu_info) {
    summary = "CPU Rating: " + cpu_info.rating;
  }

  return (
    <div className={classes.root}>
      <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
      <ExpansionPanelSummary
      expandIcon={<ExpandMoreIcon/>}
      aria-controls="panel1a-content"
      id="panel1a-header"
      >
        <Typography variant="body2">
          {summary}
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
         <CpuInfo onMount={mounted} />
      </ExpansionPanelDetails>

      </ExpansionPanel>
    </div>
  );
}


export default class Triage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      triageResult: [],
      loading: true,
      show_cpu_info: false,
      cpu_info: undefined,
      cpu_info_loading: true,
      soundPlaying: false,
      fontSize: 14,
      opticals: []
    };


    this.fetchTriage = this.fetchTriage.bind(this);
  }

  fetchTriage(state, instance) {
    this.setState({loading: true, triageResult: []});
    request({
        "method": "GET",
        'uri': sweetHome.backendUrl + '/dispatch/triage.json',
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      // Now just get the rows of triage results
      this.setState({
        triageResult: res.components,
        loading: false
      });
    });
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("triageupdate", this.onTriageUpdate.bind(this));
    this.fetchTriage();
  }

  setFontSize(fontSize) {
    this.setState({fontSize: fontSize});
  }


  onShutdown() {
    request({
        "method": "POST",
        'uri': sweetHome.backendUrl + '/dispatch/shutdown?mode=poweroff',
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      // Now just get the rows of triage results
    });
  }


  onReboot() {
    request({
        "method": "POST",
        'uri': sweetHome.backendUrl + '/dispatch/shutdown?mode=reboot',
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      // Now just get the rows of triage results
    });
  }

  onMusicPlay() {
    var rows = cloneDeep(this.state.triageResult);
    var row;

    for (row of rows) {
      if (row.component === "Sound") {
        row.result = true
        break;
      }
    }

    this.setState({triageResult: rows});
  }

  onOpticalTest() {
    request({
        "method": "POST",
        'uri': sweetHome.backendUrl + '/dispatch/opticaldrivetest',
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      //
    });
  }

  onBenchmark() {
    this.fetchCpuInfo();
    this.setState({show_cpu_info: true});
  }

  onTriageUpdate(update) {
    console.log(update);
    var rows = cloneDeep(this.state.triageResult);
    var row;
    var updated;

    for (row of rows) {
      if (row.component === update.component) {
        if (row.device === update.device) {
          row.result = update.result;
          row.details = update.message;
          updated = row;
          break;
        }
      }
    }

    console.log(updated);

    this.setState({ triageResult: rows } );
  }

  render() {
    const data = this.state.triageResult;
    const fontSize = this.state.fontSize;

    return <div >
      <Grid container spacing={1}>

        <Grid item xs={1}>
            <Button startIcon={<RefreshIcon />} variant="contained" size="small" onClick={() => this.fetchTriage()}>
              Refresh
            </Button>
        </Grid>

        <Grid item xs={1}>
          <PressPlay tooltip={"Test sound"}  title={"\u266B"} kind={"mp3"}     onPlay={ () => this.onMusicPlay()} url={sweetHome.backendUrl + '/dispatch/music'}/>
        </Grid>
        <Grid item xs={1}>
          <PressPlay tooltip={"Test CD/DVD drive"} title={"\u25CE"} kind={"optical"} onPlay={ () => this.onOpticalTest()} url={sweetHome.backendUrl + '/dispatch/opticaldrivetest'}/>
        </Grid>

        <Grid item xs={2}>
          <Tooltip title={"Reboot computer"}>
            <Button startIcon={<LoopIcon />} variant="contained" size="small" color="secondary" onClick={ () => this.onReboot()}>
              Reboot
            </Button>
          </Tooltip>
          <Tooltip title={"Turn off computer"}>
            <Button startIcon={<StopIcon />} variant="contained" size="small" color="secondary" onClick={ () => this.onShutdown()} >
              Off
            </Button>
          </Tooltip>
        </Grid>

        <Grid item xs={2}>
          <Button variant="outlined" size="small" onClick={() => this.setFontSize(fontSize+2)}>
            {'Font \u25b3'}
          </Button>
          <Button variant="outlined" size="small" onClick={() => this.setFontSize(fontSize-2)}>
            {'Font \u25bd'}
          </Button>
        </Grid>

        <Grid item xs={5}>
          <CpuRating />
        </Grid>

        <Grid item xs={12}>
          <MaterialTable
            data={data}
            style={{borderRadius: 0, borderWidth: 0, textAlign: "left", fontSize: this.state.fontSize, paddingTop: 5, paddingBottom: 5 }}
            isLoading={this.state.loading}
            onFetchData={this.fetchTriage}
            options={ {paging: false, sorting: false, draggable: false,
              toolbar: false, search: false, showTitle: false, detailPanelType: "single", detailPanelColumnAlignment: "left",
              rowStyle: { backgroundColor: "white", fontSize: this.state.fontSize, paddingTop: 3, paddingBottom: 3, },
              }}
            columns={ [
              {
                "title": "Component",
                "field": "component",
                cellStyle: { width: "100", textAlign: "right", fontSize: this.state.fontSize, paddingTop: 3, paddingBottom: 3 }
              },
              {
                "title": "Result",
                "field": "result",
                cellStyle: { "minWidth": 10 + this.state.fontSize * 5, textAlign: "left", fontSize: this.state.fontSize, paddingTop: 3, paddingBottom: 3 },
                render: row => (
                  // circle with color
                  <span>
                    <span style={{
                      color: row.result ? '#1fff2e' : '#ff2e00',
                      transition: 'all .3s ease'
                    }}>
                      {row.value ? '\u25cf' : '\u25a0' }
                    </span>
                              {row.result ? ' Pass' : ' Fail'}
                  </span>
                )
              },
              {
                "title": "Details",
                "field": "message",
                cellStyle: { fontSize: this.state.fontSize, paddingTop: 3, paddingBottom: 3 }
            } ] } />
        </Grid>
      </Grid>
    </div>
  }
}
