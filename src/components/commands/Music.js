import React from "react";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'
import "./commands.css";

class Music extends React.Component {
  state = {
    play: false
  }
  audio = new Audio(this.props.url)

  togglePlay = () => {
    this.setState({ play: !this.state.play }, () => {
      this.state.play ? this.audio.play() : this.audio.pause();
    });
  }

  render() {
    return (
      <div>
        <button class="CommandButton" onClick={this.togglePlay}>{this.state.play ? '\u25a0' : '\u25B6'}</button>
      </div>
    );
  }
}

export default Music;
