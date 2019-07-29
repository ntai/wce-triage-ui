import React, { Component } from 'react';
import {ScrollView, Text, StyleSheet} from 'react-native-web';

import {sweetHome} from './../looseend/home'
import request from "request-promise";

import * as io from 'socket.io-client';


const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Arial',
    textAlign: 'left'
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
    wock.on('message', this.handleMessage.bind(this));
  }

  handleMessage(msg) {
    const messages = this.state.messages.concat(msg.message);
    console.log("got message." + messages);
    this.setState({messages: messages});
  }

  render() {
    const messages = this.state.messages;

    return (
      <ScrollView>
        {messages.map((msg) => {
          return <Text style={styles.baseText}>{msg}</Text>
        })}
      </ScrollView>
    );
  }
}
