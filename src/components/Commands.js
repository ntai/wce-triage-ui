import React from 'react';
import Triage from './commands/Triage';
import LoadDiskImage from './commands/LoadDiskImage';
import { Tab, Tabs } from 'react-bootstrap';


export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = { key: "triage", message: "No message" }
  }

  render() {
    return (
      <div>
      <div>
        <Tabs id="wce-ui-main"
              activeKey={this.state.key}
              onSelect={key => this.setState({ key })}>
          <Tab key="triage" eventKey="triage" title="Triage">
            <Triage />
          </Tab>
          <Tab key="loadImage" eventKey="loadImage" title="Load Disk Image">
            <LoadDiskImage />
          </Tab>
        </Tabs>
      </div>
      <div>
      {this.state.message}
      </div>
      </div>
  );
  }
}

