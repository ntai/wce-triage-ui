import React from 'react';
import Commands from './components/Commands';
import './App.css';
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import {sweetHome} from "./looseend/home";
import CssBaseline from '@material-ui/core/CssBaseline';
import wcelogo from './wcelogo.svg';

/*
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
 */

type AppState = {
    frontendVersion: string;
    backendVersion: string;
};

class App extends React.Component {
    state: AppState = {
        frontendVersion: "",
        backendVersion: ""
    };

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        fetch(sweetHome.backendUrl + "/version.json")
            .then(res => res.json())
            .then(result => {
                console.log(result);
                this.setState({
                    backendVersion: result.version.backend,
                    frontendVersion: result.version.frontend
                })
            });
    }

    render() {
        return (
            <div className="App bg-white">
                <CssBaseline/>
                <Container maxWidth={false}>
                    <Grid container item xs={12}>
                        <Grid container item xs={6}>
                            <img src={wcelogo} className="App-logo" alt="wcelogo"/>
                        </Grid>
                        <Grid item>
                            <Typography>WCE Triage {this.state.frontendVersion}/{this.state.backendVersion}</Typography>
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
