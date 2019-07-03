import React from "react";
import ReactTable from 'react-table';
import "react-table/react-table.css";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'

import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

import "./commands.css";
import { Container, Row, Col } from 'react-bootstrap'

import Music from "./Music";

export default class Triage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {triageResult: [], loading: true, soundPlaying: false}
    this.columns = [
      {"Header": "Component",
        "accessor": "component",
        "maxWidth": "120",
        style: { textAlign: "right"}},
      {
        "Header": "Result", "accessor": "result", "maxWidth": "80",
        Cell: row => (
          <span>
            <span style={{
              color: row.value === 'Good' ? '#1fff2e'
                : row.value === 'Bad' ? '#ff2e00'
                  : '#ffd557',
              transition: 'all .3s ease'
            }}>
		&#x25cf;
            </span> {
            row.value === 'Good' ? ' Pass'
              : row.value === 'Bad' ? 'Fail'
              : row.value
          }
            </span>
        )
      },
      {
        "Header": "Details", "accessor": "details", width: 800, maxWidth: "1000",
        Cell: row => (<div align="left">{row.value}</div>)
      },
    ];

    this.handleCheckClicked = this.handleCheckClicked.bind(this);
    this.fetchTriage = this.fetchTriage.bind(this);
  }

  fetchTriage(state, instance) {
    this.setState({ sourcesLoading: true, triageResult: [] });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    console.log(sweetHome.backendUrl + '/dispatch/triage.json');
    request({
      "method":"GET",
      'uri': sweetHome.backendUrl + '/dispatch/triage.json',
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res.components);
      // Now just get the rows of triage results
      this.setState({
        triageResult: res.components,
        loading: false
      });
    });
  }


  onShutdown() {
    request({
      "method":"POST",
      'uri': sweetHome.backendUrl + '/dispatch/shutdown?mode=poweroff',
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of triage results
    });
  }


  onReboot() {
    request({
      "method":"POST",
      'uri': sweetHome.backendUrl + '/dispatch/shutdown?mode=reboot',
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      // Now just get the rows of triage results
    });
  }

  handleCheckClicked(e) {
  }

  render() {
    const data = this.state.triageResult;

      return <div>

        <Row>
          <Col>
            <button type="button" class="CommandButton" onClick={() => this.fetchTriage()}>
              <span>Reload</span>
            </button>
          </Col>
          <Col> <Music url={sweetHome.backendUrl + '/dispatch/music'}/> </Col>
          <Col>
            <button type="button" onClick={ () => this.onReboot()} class="CommandButton">
              <span>Reboot Computer</span>
            </button>
            <button type="button" onClick={ () => this.onShutdown()} class="CommandButton">
              <span>Power off</span>
            </button>
          </Col>
        </Row>

        <ReactTable
          data={data}
          style={{fontSize: 12, borderRadius: 0, borderWidth: 0, textAlign: "left"}}
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
