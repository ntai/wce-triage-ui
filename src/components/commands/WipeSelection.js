import React from "react";
import ReactSelect from 'react-select';

import "./commands.css";

export default class WipeSelection extends React.Component {
  constructor() {
    super();
    this.state = {
      wipeOption: undefined,
    };

    this.selectWipeOption = this.selectWipeOption.bind(this);
  }

  selectWipeOption(selected) {
    this.props.wipeOptionChanged(this.props.deviceName, selected, this.state.wipeOption);
    this.setState({wipeOption: selected})
  }

   render() {
    const {wipeOption} = this.state;
    const wipeOptions = this.props.wipeOptions;

    return (
      <div>
        <ReactSelect style={{fontSize: 10}} value={wipeOption || ''} options={wipeOptions} onChange={this.selectWipeOption} placeholder={this.props.title}/>
      </div>
    );
  }
}

