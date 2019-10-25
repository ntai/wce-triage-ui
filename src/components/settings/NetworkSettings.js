import React, {Component} from "react";
import {sweetHome} from '../../looseend/home';
import socketio from "socket.io-client";

import "../commands/commands.css";

export default class NetworkSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      networks: [],
      resetting: false,
    };
  }
  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("networksettings", this.onNetworkSettingsUpdate.bind(this));
  }

  onNetworkSettingsUpdate(update) {
    this.setState({runningStatus: update, makingImage: true})
  }

  render() {
    const { networks  } = this.state;

    return (
      <div>
New and exciting settings coming here.
      </div>
    );
  }
}
