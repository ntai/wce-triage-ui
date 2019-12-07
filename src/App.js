import React from 'react';
import Commands from './components/Commands';
import './commands.less';
import './App.css';
import {Image, Linking, Text, StyleSheet} from 'react-native-web';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Grid';
import request from "request-promise";
import {sweetHome} from "./looseend/home";

import CssBaseline from '@material-ui/core/CssBaseline';

const styles = StyleSheet.create({
  WCE: {
    fontWeight: 'bold',
    fontSize: 30,
  },
  Version: {
    align: "right",
    marginTop: 30,
    marginLeft: 40,
    verticalAlign: "bottom",
    fontSize: 14,
    color: "grey",
  },
  Logo: {width: 500, height: 80, resizeMode: "contain", scale: 1},

  WholeView: {
    marginTop: 0,
    marginLeft: 10,
  },

});

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      frontendVersion: "",
      backendVersion: ""
    }
  }

  componentWillMount() {
    // fetch backend version
    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/version.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res);
      this.setState({
        // marshall this for ReactSelect
        backendVersion: res.version.backend,
        frontendVersion: res.version.frontend
      })
    });
  }

  render() {
    return (
      <div className="App bg-white">
        <CssBaseline />
        <Container fluid={"true"}>
          <Grid container item xs={12}>
            <Grid container item xs={6}>
              <Image onPress={() => Linking.openURL('https://www.worldcomputerexchange.org')}
                     source={require('./wce_logo.svg')} style={styles.Logo}/>
            </Grid>
              <Grid item>
              <Text style={styles.Version}>WCE Triage {this.state.frontendVersion}/{this.state.backendVersion}</Text>
              </Grid>
          </Grid>

          <Grid item xs={12}>
            <Commands/>
          </Grid>

        </Container>
      </div>
    );
  }
}

export default App;
