import React, { Component } from 'react'
import {
  Text,
  View
} from 'react-native'

export default class Messages extends Component {
  constructor() {
    super()
    this.state = {
      messages: 'No Message'
    }
  }

  updateText = (msg) => {
    this.setState({messages: msg})
  }

  render() {
    return (
      <View>
        <Text>
          {this.state.messages}
        </Text>
      </View>
    );
  }
}
