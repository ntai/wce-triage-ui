import React from "react";
import "./commands.css";
import { Grid, Button } from '@material-ui/core'


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
        <Grid item spacing={2}>
          <Button variant={"contained"} color={"primary"} onClick={this.togglePlay}>{this.props.title  + ": " + (this.state.play ? '\u25a0' : '\u25B6')}</Button>
        </Grid>
      </div>
    );
  }
}

export default PressPlay;
