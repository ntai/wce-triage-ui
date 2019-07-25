import React from 'react';

import {
  Route,
  HashRouter,
  Link,
  Switch
} from "react-router-dom";

import Triage from './commands/Triage';
import LoadDiskImage from './commands/LoadDiskImage';
import SaveDiskImage from './commands/SaveDiskImage';
import WipeDisk from './commands/DiskWipe';

import { Navbar, Nav } from 'react-bootstrap';
import Messages from './Messages';

import "./components.css";


export default class Commands extends React.Component {
  constructor(props) {
    super(props);
    this.state = { key: "triage", message: "No message" }
  }

  render() {
    return (
      <HashRouter>

      <div>
        <div>
          <Navbar variant="light" expand={"md"}>
            <Nav className="mr-auto" variant="tabs" defaultActiveKey="/triage">
              <Nav.Item><Nav.Link as={Link} to="/triage" href="/triage">Triage</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link as={Link} to="/load" href="/load">Load Disk</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link as={Link} to="/save" href="/save">Create Disk Image</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link as={Link} to="/wipe" href="/wipe">Wipe Disk</Nav.Link></Nav.Item>
            </Nav>
          </Navbar>
        </div>
        <div>
          <Switch>
            <Route exact path="/triage" component={Triage}/>
            <Route exact path="/load" component={LoadDiskImage}/>
            <Route exact path="/save" component={SaveDiskImage}/>
            <Route exact path="/wipe" component={WipeDisk}/>
          </Switch>
        </div>
        <br />
          <Messages wock={this.props.wock}/>
        </div>
      </HashRouter>
  );
  }
}

