import React from "react";
import ReactTable from 'react-table';
import "react-table/react-table.css";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'

import "./commands.css";
import "../../bootstrap.min.css";
import { Tree, Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap'

import PressPlay from "./PressPlay";
import socketio from "socket.io-client";
import cloneDeep from "lodash/cloneDeep";
import Text from "react-native-web/dist/exports/Text";

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

    this.columns = [
      {
        "Header": "Component",
        "accessor": "component",
        "maxWidth": "120",
        style: {textAlign: "right"}
      },
      {
        "Header": "Result", "accessor": "result", "maxWidth": "80", style: {textAlign: "left"},

        Cell: row => (
          // circle with color
          <span>
            <span style={{
              color: row.value ? '#1fff2e' : '#ff2e00',
              transition: 'all .3s ease'
            }}>
              {row.value ? '\u25cf' : '\u25a0' }
            </span>
            {row.value ? ' Pass' : ' Fail'}
          </span>
        )
      },
      {
        "Header": "Details", "accessor": "message", width: 800,
        Cell: row => (<div align="left">{row.value}</div>)
      },
    ];

    this.fetchTriage = this.fetchTriage.bind(this);
  }

  fetchTriage(state, instance) {
    this.setState({sourcesLoading: true, triageResult: []});
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    console.log(sweetHome.backendUrl + '/dispatch/triage.json');
    request({
        "method": "GET",
        'uri': sweetHome.backendUrl + '/dispatch/triage.json',
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      console.log(res.components);
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

        <ButtonToolbar>
          <ButtonGroup  className="mr-2" aria-label="First group">
            <Button  onClick={() => this.fetchTriage()}>
              <span>Reload/Refresh Triage</span>
            </Button>
          </ButtonGroup>
          <br />
          <ButtonGroup  className="mr-2" aria-label="First group">
            <span className="align-middle"> <PressPlay title={"Sound"}   kind={"mp3"}     onPlay={ () => this.onMusicPlay()} url={sweetHome.backendUrl + '/dispatch/music'}/> </span>
            <span className="align-middle"> <PressPlay title={"Optical"} kind={"optical"} onPlay={ () => this.onOpticalTest()} url={sweetHome.backendUrl + '/dispatch/opticaldrivetest'}/> </span>
          </ButtonGroup>
            <br />
          <ButtonGroup  className="mr-2">
            <Button variant="danger" onClick={ () => this.onReboot()}>
              <span>Reboot Computer</span>
            </Button>
            <Button variant="danger" onClick={ () => this.onShutdown()} >
              <span>Power off</span>
            </Button>
          </ButtonGroup>
              <br />
              <Text>

              </Text>
          <ButtonGroup  className="mr-2">
            <Button variant="outline-info" onClick={() => this.setFontSize(fontSize+2)}>
              <span>{'Font \u25b3'}</span>
            </Button>
            <Button variant="outline-info" onClick={() => this.setFontSize(fontSize-2)}>
              <span>{'Font \u25bd'}</span>
            </Button>
          </ButtonGroup>
        </ButtonToolbar>

        <ReactTable
          data={data}
          style={{fontSize: this.state.fontSize, borderRadius: 0, borderWidth: 0, textAlign: "left"}}
          defaultPageSize={15}
          showPagination={false}
          showPageSizeOptions={false}
          columns={this.columns}
          pages={1}
          loading={this.state.loading}
          onFetchData={this.fetchTriage}
          className="-striped"
      />
      </div>
  }
}
