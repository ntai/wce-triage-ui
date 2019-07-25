import React from "react";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'
import "../../bootstrap.min.css";
import { Container, Row, Col, Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap'

import "./commands.css";

// stub to run optical test
class OpticalDriveTest {
  constructor() {
  }

  play() {
  }
  pause() {}
}

class PressPlay extends React.Component {
  state = {
    play: false
  }
  player = undefined;

  togglePlay = () => {
    this.props.onPlay();
    this.setState({ play: !this.state.play }, () => {
      if (this.player === undefined)
        this.player = this.props.kind === "mp3" ? new Audio(this.props.url) : new OpticalDriveTest();
      this.state.play ? this.player.play() : this.player.pause();
    });
  }

  render() {
    return (
      <div>
        <Container>
        <Button onClick={this.togglePlay}>{this.props.title  + ": " + (this.state.play ? '\u25a0' : '\u25B6')}</Button>
        </Container>
      </div>
    );
  }
}

export default PressPlay;
