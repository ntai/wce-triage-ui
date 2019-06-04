import React from 'react';
import ReactTable from 'react-table';
import "react-table/react-table.css";
//
import request from 'request-promise';
import {sweetHome} from './../../looseend/home'

import { Link, DirectLink, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

export default class Triage extends React.Component {
  constructor(props) {
    super(props);

    this.state = { triageResult : [], loading : true}
    this.columns = [
      { "Header" : "Component", "accessor" : "component", "width": "110"},
      { "Header" : "Result", "accessor" : "result", "width": "80",
        Cell: row => (
          <span>
                  <span style={{
                    color: row.value === 'Good' ? '#002eff'
                      : row.value === 'Bad' ? '#ff2e00'
                        : '#57d557',
                    transition: 'all .3s ease'
                  }}>
              &#x25cf;
            </span> {
            row.value === 'Good' ? ' Pass'
              : row.value === 'Bad' ? `Fail`
              : '?'
          }
          </span>
        )
      },
      { "Header" : "Details", "accessor" : "details",  "width": "400", "align" : "left" },
      ];

    this.handleCheckClicked = this.handleCheckClicked.bind(this);
    this.fetchTriage = this.fetchTriage.bind(this)
  }

  fetchTriage(state, instance) {
    this.setState({ sourcesLoading: true });
    // Request the data however you want.  Here, we'll use our mocked service we created earlier

    request({
      "method":"GET",
      'uri': sweetHome.baseUrl + '/dispatch/triage.json',
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res.components);
      // Now just get the rows of triage results
      this.setState({
        triageResult: res.components,
        loading: false
      });
    });
  }

  handleCheckClicked(e) {
  }

  render() {
    const data = this.state.triageResult;

      return <div>
      <ReactTable
          data={data}
          columns={this.columns}
          pages={1}
          loading={this.state.loading}
          onFetchData={this.fetchTriage}
          className="-striped"
          defaultPageSize={10}
      />
      </div>
  }
}
