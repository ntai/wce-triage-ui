import React, { Component } from 'react'
import {
  Text,
  View
} from 'react-native'

export default class Messages extends Component {
  constructor() {
    super()
    this.state = {
      messages: 'UI Version 0.1.0'
    }
  }

  updateText = (msg) => {
    this.setState({messages: msg})
  }

  render() {
    return (
      <View>
        <Text align={left}>
          {this.state.messages}
        </Text>
      </View>
    );
  }
}
