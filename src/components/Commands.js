import React from 'react';
import Triage from './commands/Triage';
import LoadDiskImage from './commands/LoadDiskImage';
import SaveDiskImage from './commands/SaveDiskImage';
// import { Tab, Tabs } from 'react-bootstrap';
import Messages from './Messages';
import WipeDisk from "./commands/WipeDisk";
import TriageAppSettings from "./settings/TriageAppSettings";


import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';


class TabPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = { children: props.children, index: props.index, title: props.title};
  }

  render() {
    const {children, index} = this.state;
      return (
        <div>
          <Typography
            component="div"
            role="tabpanel"
            hidden={this.props.value !== index}
            id={`wrapped-tabpanel-${index}`}
            aria-labelledby={`wrapped-tab-${index}`}
          >
            <Box p={3}>{children}</Box>
          </Typography>
        </div>
      );
  }
}


function a11yProps(index) {
  return {
    id: `wrapped-tab-${index}`,
    'aria-controls': `wrapped-tabpanel-${index}`,
  };
}

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
}));


export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = { key: "triage", message: "No message", settings: false, selectedTab: 0 };
    this.handleChange = this.handleChange.bind(this);
  }

  dummy1() {
    return (
     <div>
        <div>
          <Tabs id="wce-ui-main"
                activeKey={this.state.key}
                onSelect={key => this.setState({ key })}
          >
            <Tab key="triage" eventKey="triage" title="Triage">
              <Triage wock={this.props.wock}/>
            </Tab>
            <Tab key="loadImage" eventKey="loadImage" title="Load Disk Image">
              <LoadDiskImage wock={this.props.wock}/>
            </Tab>
            <Tab key="saveImage" eventKey="SaveImage" title="Create Disk Image">
              <SaveDiskImage wock={this.props.wock}/>
            </Tab>
            <Tab key="wipe" eventKey="wipeDisk" title="Wipe Disk">
              <WipeDisk wock={this.props.wock}/>
            </Tab>
            <Tab key="settings" eventKey="settings" title="Settings" disabled={!this.state.settings}>
              <TriageAppSettings wock={this.props.wock}/>
            </Tab>
          </Tabs>
        </div>
        <Messages wock={this.props.wock}/>
      </div>
    );
  }

  handleChange(event, newValue) {
    console.log(newValue);
    this.setState( {selectedTab: newValue } );
  };

  render() {
    const selectedTab = this.state.selectedTab;
    console.log( "selectedTab: " + selectedTab)

    return (
      <div>
        <div>
          <AppBar position="static">
            <Tabs value={selectedTab} onChange={this.handleChange} aria-label="WCE Triage SPAs">
              <Tab label="Triage" {...a11yProps(0)} />
              <Tab label="Load Disk Image" {...a11yProps(1)} />
              <Tab label="Create Disk Image" {...a11yProps(2)} />
              <Tab label="Wipe Disk" {...a11yProps(3)} />
            </Tabs>
          </AppBar>
          <TabPanel value={selectedTab} index={0} visible={selectedTab === 0} title="Triage">
            <Triage wock={this.props.wock}/>
          </TabPanel>
          <TabPanel value={selectedTab} index={1} visible={selectedTab === 1} title="Load">
            <LoadDiskImage wock={this.props.wock}/>
          </TabPanel>
          <TabPanel value={selectedTab} index={2} visible={selectedTab === 2} title="Save">
            <SaveDiskImage wock={this.props.wock}/>
          </TabPanel>
          <TabPanel value={selectedTab} index={3} visible={selectedTab === 3} title="Wipe">
            <WipeDisk wock={this.props.wock}/>
          </TabPanel>
        </div>
        <Messages wock={this.props.wock}/>
      </div>
    );
  }
}
