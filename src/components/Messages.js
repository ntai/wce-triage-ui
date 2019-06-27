import React, { Component } from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native-web';

import {sweetHome} from './../looseend/home'
import request from "request-promise";

import * as io from 'socket.io-client';


const styles = StyleSheet.create({
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#34495e',
  },
});


export default class Messages extends Component {
  constructor() {
    super()
    this.state = {
      messages: []
    }
  }

  componentWillMount() {
    this.fetchMessages();
  }

  /* Initial message loading */
  fetchMessages() {
    // Request the data however you want.
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

  /* set up the wock for message */
  componentDidMount() {
    const wock = io.connect(sweetHome.websocketUrl);
    wock.on('connection', this.onConn.bind(this));
  }

  onConn(wock) {
    console("got connection.");
    wock.join('message');
  }

  handleMessage(msg) {
    console("got message." + msg);
    this.setState({messages: this.state.messages + [msg]})
  }
  render() {
    return (
      <ScrollView>
        {this.state.messages.map((msg) => {
          return <Text>{msg}</Text>
        })}
      </ScrollView>
    );
  }
}
