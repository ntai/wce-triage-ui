import React, { Component } from 'react'
import {Text, View} from 'react-bootstrap'

import Websocket from 'react-websocket';
import {sweetHome} from './../looseend/home'
import request from "request-promise";

export default class Messages extends Component {
  constructor() {
    super()
    this.state = {
      messages: ['', '', 'UI Version 0.1.0']
    }
  }

  handleMessage = (msg) => {
    this.setState({messages: [ this.state.messages[1], this.state.messages[2], msg ]})
  }

  fetchMessages(state, instance) {
    // Request the data however you want.  Here, we'll use our mocked service we created earlier
    request({
      "method":"GET",
      'uri': sweetHome.backendUrl + '/dispatch/messages',
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      this.setState({messages: res.messages});
    });
  }

  componentDidMount() {
    this.timer = setInterval(()=> this.fetchMessages(), 1000);
  }

  componentWillUnmount() {
    this.timer = null; // here...
  }

  render() {
    return (
      <div align={"left"}>
          <p>{this.state.messages[0]}</p><p>{this.state.messages[1]}</p><p>{this.state.messages[2]}</p>
      </div>
    );
  }
}
