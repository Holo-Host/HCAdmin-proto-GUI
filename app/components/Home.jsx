import React, { Component } from 'react';
import logo from '../holo-logo.svg';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import cmd from 'node-cmd'
import './Home.css';

import { makeData, Logo, Tips } from "../utils/utils";
import { hcJoin,hcUninstall } from "../utils/hc-install";
import { advancedExpandTableHOC } from "./systemTable";
import { manageAllApps,manageAllDownloadedApps } from "../utils/dataRefactor";
import { filterApps } from "../utils/table-filters";
import { getRunningApps } from "../utils/runningApp";

// Import React Table
import ReactTable from "react-table";
import "react-table/react-table.css";

type Props = {
};

const AdvancedExpandReactTable = advancedExpandTableHOC(ReactTable);

export default class Home extends Component {

  constructor(props) {
    super(props);
    this.state = {
      installed_apps: [],
      downloaded_apps:[],
      runningApps:[]
    };
    this.setApps=this.setApps.bind(this);
    this.getInstalledApps=this.getInstalledApps.bind(this);
    this.getDownloadedApps=this.getDownloadedApps.bind(this);
    this.renderStatusButton=this.renderStatusButton.bind(this);
    this.renderRunningButton=this.renderRunningButton.bind(this);
  }
  componentDidMount() {
    this.setApps()
  }

  setApps=()=>{
    this.getInstalledApps();
    this.getDownloadedApps();
    this.setState({runningApps:getRunningApps()});
  };

  getInstalledApps=()=>{
    let self = this;
    cmd.get(
      `hcadmin status`,
      function(err, data, stderr) {
        if (!err) {
          console.log('/.holochain contains these files :\n>>', data)
          self.setState({
            installed_apps: manageAllApps(data)
          });
          console.log("Apps state: ", self.state)
        } else {
          console.log('error', err)
        }

      }
    );
  };

  getDownloadedApps=()=>{
    let self = this;
    cmd.get(
      `cd ~/.hcadmin/holochain-download && ls`,
      function(err, data, stderr) {
        if (!err) {
          console.log('~/.hcadmin/holochain-download contains these files :\n>>', data)
          self.setState({
            downloaded_apps: manageAllDownloadedApps(data)
          });
          console.log("Apps state: ", self.state)
        } else {
          console.log('error', err)
        }

      }
    );
  };

  renderStatusButton = (appName,status,running) => {
    const STOPBUTTON=(<button className="StopButton" type="button" onClick={e => this.stopApp(appName)}>Stop</button>);
    const STARTBUTTON=(<button className="StartButton" type="button" onClick={e => this.startApp(appName)}>Start</button>);
    if(running){
      return (STOPBUTTON)
    }else if (!running){
      if(status==="installed"){
        return (STARTBUTTON)
      }
    }
  }
  renderRunningButton = (appName,status, running) => {
    const INSTALLBUTTON=(<button className="InstallButton" type="button" onClick={e => this.installApp(appName)}>Install</button>);
    const UNINSTALLBUTTON=(<button className="InstallButton" type="button" onClick={e => this.uninstallApp(appName)}>Uninstall</button>);
    if (!running){
        if (status === "installed") {
          return UNINSTALLBUTTON
        } else if (status === 'uninstalled') {
          return INSTALLBUTTON
        }
    }
  }
  installApp = (appName) => {
    console.log("Install");
    hcJoin(appName);
    // TODO: remove once we put a listener for the necessary files
    setTimeout(this.componentDidMount(),1000000);
  }
  uninstallApp = (appName) => {
    console.log("Uninstall: Not done yet");
    hcUninstall(appName);
    // TODO: remove once we put a listener for the necessary files
    setTimeout(this.componentDidMount(),1000000);
  }
  startApp = (appName) => {
    console.log("Start: Not done yet");
    // TODO: remove once we put a listener for the necessary files
    this.componentDidMount();
  }
  stopApp = (appName) => {
    console.log("Stop: Not done yet");
    // TODO: remove once we put a listener for the necessary files
    this.componentDidMount();
  }

  refresh = () => {
    this.componentDidMount();
  }
  render() {
    const { installed_apps,downloaded_apps,runningApps } = this.state;
    const table_data= filterApps(installed_apps,downloaded_apps,runningApps)
    console.log("Table Data: ",table_data);
    this.ren
    return (
      <div>
      <div  className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to HCAdmin-GUI</h2>
          <button className="InstallButton" type="button" onClick={e => this.refresh()}>Refresh</button>
        </div>
        <AdvancedExpandReactTable
          data={table_data}
          columns={columns}
          defaultPageSize={20}
          className="-striped -highlight"
          SubComponent={({ row, nestingPath, toggleRowSubComponent }) => {
            if(row._original.bridgedFrom!==undefined){
              return (
                <div style={{ padding: "20px" }}>
                    Bridged From | Token {row._original.bridgedFrom.token}
                    <br/>
                    {this.renderStatusButton(row._original.appName,row._original.status,row._original.running)}
                    {this.renderRunningButton(row._original.appName,row._original.status,row._original.running)}
                </div>
              );
            }else if (row._original.bridgedTo!==undefined) {
              return (
                <div style={{ padding: "20px" }}>
                    Bridged To | Apps Name:  {row._original.bridgedTo.name} | App DNA: {row._original.bridgedTo.dna}
                    <br/>
                    {this.renderStatusButton(row._original.appName,row._original.status,row._original.running)}
                    {this.renderRunningButton(row._original.appName,row._original.status,row._original.running)}
                </div>
              );
            }
            else{
              return (
                <div style={{ padding: "20px" }}>
                    No Bridges
                    <br/>
                    {this.renderStatusButton(row._original.appName,row._original.status,row._original.running)}
                    {this.renderRunningButton(row._original.appName,row._original.status,row._original.running)}
                </div>);
            }


          }}
        />
      </div>
      </div>
    );
  }
}


/*Data*/
const columns = [{
      Header: 'App',
      columns: [{
        Header: 'App Name',
        accessor: 'appName'
      }, {
        Header: 'DNA',
        id: 'dna',
        accessor: d => d.dna
      }]
    }, {
      Header: 'Stats',
      columns: [{
        Header: 'CPU %',
        accessor: 'progress',
        Cell: row => (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#dadada',
              borderRadius: '2px'
            }}
          >
            <div
              style={{
                width: `${row.value}%`,
                height: '100%',
                backgroundColor: row.value > 66 ? '#85cc00'
                  : row.value > 33 ? '#ffbf00'
                  : '#ff2e00',
                borderRadius: '2px',
                transition: 'all .2s ease-out'
              }}
            />
          </div>
        )
      }, {
        Header: 'Status',
        accessor: 'status',
        Cell: row => (
          <span>
            <span style={{
              color: row.value === 'installed' ? '#57d500'
                : row.value === 'uninstalled' ? '#ff2e00'
                : '#ffbf00',
              transition: 'all .3s ease'
            }}>
              &#x25cf;
            </span> {
              row.value === 'installed' ? `Installed`
              : row.value === 'uninstalled' ? `Uninstalled`
              : 'Bridging'
            }
          </span>
        )
      },{
        Header: 'Running',
        accessor: 'running',
        Cell: row => (
          <span>
            <span style={{
              color: row.value === true ? '#57d500'
                : row.value === false ? '#ff2e00'
                : '#ffbf00',
              transition: 'all .3s ease'
            }}>
              &#x25cf;
            </span> {
              row.value === true ? `Running`
              : row.value === false ? `Stopped`
              : 'Unknown'
            }
          </span>
        )
      }]
    }];
