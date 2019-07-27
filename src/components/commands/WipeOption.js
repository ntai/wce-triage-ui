import React from "react";

import request from 'request-promise';

// Dropdown menu
// import ReactSelect from 'react-select';
import ReactSelect from 'react-select';
import {sweetHome} from './../../looseend/home';

import "./commands.css";

export default class WipeOption extends React.Component {
  constructor() {
    super();
    this.state = {
      wipeOptions: [],
      wipeOptionsLoading: true,
    };
  }

  selectWipeOption(selected) {
    this.props.wipeOptionChanged(selected);
  }

  componentDidMount() {
    this.fetchWipeOptions();
  }

  fetchWipeOptions(state, instance) {
    this.setState({ wipeOptionsLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/wipe-types.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res.wipeTypes);
      const wipeOptions = res.wipeTypes.map(rt => ({label: rt.name, value: rt.id}))

      this.setState({
        // marshall this for ReactSelect
        wipeOptions: wipeOptions,
        wipeOption: undefined,
        wipeOptionsLoading: false
      });

      this.props.wipeOptionsChanged(this.state.wipeOptions);
    });
  }

  render() {
    const { wipeOptions} = this.state;
    return (
      <div>
        <ReactSelect style={{fontSize: 14, textAlign: "left"}} value={this.props.wipeOption || ''} options={wipeOptions} onChange={this.selectWipeOption.bind(this)} placeholder={this.props.title}/>
      </div>
    );
  }
}

