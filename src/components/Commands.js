import React from 'react';
import Triage from './commands/triage/Triage';
import LoadDiskImage from './commands/load/LoadDiskImage';
import SaveDiskImage from './commands/save/SaveDiskImage';
import Messages from './Messages';
import WipeDisk from "./commands/wipe/WipeDisk";
import TriageAppSettings from "./settings/TriageAppSettings";


import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import DiskImageManagement from "./commands/diskimage/DiskImageManagement";


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
            <Box p={1}>{children}</Box>
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


export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = { key: "triage", message: "No message", settings: false, selectedTab: 0 };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event, newValue) {
    console.log(newValue);
    this.setState( {selectedTab: newValue } );
  };

  render() {
    const selectedTab = this.state.selectedTab;

    return (
      <div>
        <div style={{ padding: 0 }}>
          <AppBar position="static">
            <Tabs value={selectedTab} onChange={this.handleChange} aria-label="WCE Triage SPAs">
              <Tab label="Triage" {...a11yProps(0)} />
              <Tab label="Load Disk Image" {...a11yProps(1)} />
              <Tab label="Create Disk Image" {...a11yProps(2)} />
              <Tab label="Wipe Disk" {...a11yProps(3)} />
              <Tab label="Disk Image" {...a11yProps(4)} />
            </Tabs>
          </AppBar>
          <TabPanel value={selectedTab} index={0} visible={selectedTab === 0} title="Triage">
            <Triage/>
          </TabPanel>
          <TabPanel value={selectedTab} index={1} visible={selectedTab === 1} title="Load">
            <LoadDiskImage/>
          </TabPanel>
          <TabPanel value={selectedTab} index={2} visible={selectedTab === 2} title="Save">
            <SaveDiskImage/>
          </TabPanel>
          <TabPanel value={selectedTab} index={3} visible={selectedTab === 3} title="Wipe">
            <WipeDisk/>
          </TabPanel>
          <TabPanel value={selectedTab} index={4} visible={selectedTab === 4} title="Disk Images">
            <DiskImageManagement/>
          </TabPanel>
          {/*
          <Tab key="settings" eventKey="settings" title="Settings" disabled={!this.state.settings}>
            <TriageAppSettings/>
          </Tab>
*/}
        </div>
        <Messages/>
      </div>
    );
  }
}
