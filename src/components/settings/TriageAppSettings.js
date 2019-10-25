import React from "react";

import { Platform, FlatList, TouchableHighlight, View, Text } from "react-native-web";
//
import request from 'request-promise';

// Dropdown menu
// import ReactSelect from 'react-select';
import ReactSelect from 'react-select';
import {Container, Row, Col, ButtonToolbar, ButtonGroup, Modal, Button, Tab, ListGroup, ListGroupItem} from 'react-bootstrap'

import {sweetHome} from '../../looseend/home';
import socketio from "socket.io-client";
import NetworkSettings from './NetworkSettings';

import "../commands/commands.css";



export default class TriageAppSettings extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      settingsLoading: true,
      networks: []
    }
  }

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("settings", this.onSettingsUpdate.bind(this));
  }
  onSettingsUpdate(update) {
    this.setState({settings: update, settingsLoading: false });
  }

  _onPress(item) {

  }

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };


  render() {
    return <div>
      <Tab.Container id="list-group-tabs-example" defaultActiveKey="#link1">
        <Row>
          <Col sm={4}>
            <ListGroup>
              <ListGroup.Item action href="#networksettings">
                Networks
              </ListGroup.Item>
              <ListGroup.Item action href="#wipesettings">
                Wipe Options
              </ListGroup.Item>
              <ListGroup.Item action href="#pxeboot">
                Client Boot
              </ListGroup.Item>
              <ListGroup.Item action href="#diskimages">
                Disk Images
              </ListGroup.Item>
            </ListGroup>
          </Col>
          <Col sm={8}>
            <Tab.Content>
              <Tab.Pane eventKey="#networksettings">
                <NetworkSettings />
              </Tab.Pane>
              <Tab.Pane eventKey="#wipesettings">
              </Tab.Pane>
              <Tab.Pane eventKey="#pxeboot">
              </Tab.Pane>
              <Tab.Pane eventKey="#diskimages">
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </div>
  }
}
