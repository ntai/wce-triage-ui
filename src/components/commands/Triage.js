import React from "react";
import "react-table/react-table.css";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'


import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { makeStyles } from '@material-ui/core/styles';

import PressPlay from "./PressPlay";
import socketio from "socket.io-client";
import cloneDeep from "lodash/cloneDeep";

// import Text from "react-native-web/dist/exports/Text";

import MaterialTable from "material-table";
import {Paper} from "@material-ui/core";
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

import "./commands.css";


const triageTheme = createMuiTheme({

  overrides: {
    MuiTableCell: {
      root: {
        paddingTop: 4,
        paddingBottom: 4,
        '&:last-child': {paddingRight: 5},
      },
      paddingDefault: {
        padding: '10px 3px 10px 4px',
      },
    },
  },
});


export default class Triage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      triageResult: [],
      loading: true,
      soundPlaying: false,
      fontSize: 16,
      opticals: []
    };


    this.fetchTriage = this.fetchTriage.bind(this);
  }

  fetchTriage(state, instance) {
    this.setState({sourcesLoading: true, triageResult: []});
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
    this.setState( {fontSize: fontSize});
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

    return <div>
      <Grid container spacing={0} xs={100}>

        <Grid container item>

          <Grid xs={2}>
              <Button variant="contained" onClick={() => this.fetchTriage()}>
                Refresh Triage
              </Button>
          </Grid>

          <Grid item xs={2}>
            <PressPlay title={"Sound"}   kind={"mp3"}     onPlay={ () => this.onMusicPlay()} url={sweetHome.backendUrl + '/dispatch/music'}/>
          </Grid>
          <Grid item xs={2}>
            <PressPlay title={"Optical"} kind={"optical"} onPlay={ () => this.onOpticalTest()} url={sweetHome.backendUrl + '/dispatch/opticaldrivetest'}/>
          </Grid>

          <Grid item xs={2}>
              <Button variant="contained" color="secondary" onClick={ () => this.onReboot()}>
                Reboot Computer
              </Button>
          </Grid>
          <Grid item xs={2}>
              <Button variant="contained" color="secondary" onClick={ () => this.onShutdown()} >
                Power off
              </Button>
          </Grid>

          <Grid item xs={2}>
              <Button variant="outlined" onClick={() => this.setFontSize(fontSize+2)}>
                {'Font \u25b3'}
              </Button>
              <Button variant="outlined" onClick={() => this.setFontSize(fontSize-2)}>
                {'Font \u25bd'}
              </Button>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <MaterialTable
            data={data}
            style={{fontSize: this.state.fontSize, borderRadius: 0, borderWidth: 0, textAlign: "left"}}
            isLoading={this.state.loading}
            onFetchData={this.fetchTriage}
            options={ {paging: false, sorting: false, draggable: false, toolbar: false, search: false, showTitle: false, detailPanelType: "single", detailPanelColumnAlignment: "left",
            rowStyle: rowData => { return { backgroundColor: "white" }} } }
            columns={ [
              {
                "title": "Component",
                "field": "component",
                cellStyle: { width: "100", textAlign: "right"}
              },
              {
                "title": "Result",
                "field": "result",
                cellStyle: { "width": "80", textAlign: "left"},
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
            } ] } />
        </Grid>
      </Grid>
    </div>
  }
}
