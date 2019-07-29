import React from 'react';
import Triage from './commands/Triage';
import LoadDiskImage from './commands/LoadDiskImage';
import SaveDiskImage from './commands/SaveDiskImage';
import { Tab, Tabs } from 'react-bootstrap';
import Messages from './Messages';
import WipeDisk from "./commands/DiskWipe";
import TriageAppSettings from "./commands/TriageAppSettings";

export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = { key: "triage", message: "No message", settings: false }
  }

  render() {
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
}
