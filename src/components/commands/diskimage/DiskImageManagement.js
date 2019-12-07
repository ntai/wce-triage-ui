import React from 'react';
import {makeStyles, Theme, withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import DiskImageTreeView from "./DiskImageTreeView";
import Grid from "@material-ui/core/Grid";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Disks from "../../parts/Disks";
import cloneDeep from "lodash/cloneDeep";
import socketio from "socket.io-client";
import {sweetHome} from "../../../looseend/home";
import Button from "@material-ui/core/Button";
import BuildIcon from '@material-ui/icons/Build';
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import request from "request-promise";
import RunnerProgress from "../../parts/RunnerProgress";
import Tooltip from '@material-ui/core/Tooltip';


const appbarStyles = makeStyles( theme => ({
  root: {
    height: 32,
    minHeight: 32,
  },
  colorSecondary: {
    backgroundColor: '#208040'
  },
  commandButton: {
    marginRight: theme.spacing(2),
  },
}));


const StyledMenu = withStyles({
  paper: {
    border: '1px solid #d3d4d5',
  },
})(props => (
  <Menu
    elevation={0}
    getContentAnchorEl={null}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    {...props}
  />
));

const StyledMenuItem = withStyles(theme => ({
  root: {
    '&:focus': {
      backgroundColor: theme.palette.common.white,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.black,
      },
    },
  },
}))(MenuItem);

function OpMenu(props) {
  const myAppbar = appbarStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const propsExpandAllCatsCB = props.expandAllCatsCB;
  const propsSelectAllFilesCB = props.selectAllFilesCB;

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const allCagetories = (select) => {
    setAnchorEl(null);
    propsExpandAllCatsCB(select);
  };

  const handleCollapseCategories = () => {
    allCagetories(false);
  };

  const handleExpandCategories = () => {
    allCagetories(true);
  };

  const selectAllFiles = (select) => {
    setAnchorEl(null);
    propsSelectAllFilesCB(select);
  };

  const deselectAll = () => {
    selectAllFiles(false);
  };

  const selectAll = () => {
    selectAllFiles(true);
  };

  return (
    <div>
      <IconButton
        edge="start" className={myAppbar.menuButton} color="inherit"
        aria-label="menu"
        aria-controls="customized-menu"
        aria-haspopup="true"
        onClick={handleClick}>
        <MenuIcon/>
      </IconButton>

      <StyledMenu
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <StyledMenuItem onClick={handleExpandCategories}>
          <ListItemText primary="Expand all categories" />
        </StyledMenuItem>
        <StyledMenuItem onClick={handleCollapseCategories}>
          <ListItemText primary="Collapse all categories" />
        </StyledMenuItem>
        <StyledMenuItem onClick={selectAll}>
          <ListItemText primary="Select all" />
        </StyledMenuItem>
        <StyledMenuItem onClick={deselectAll}>
          <ListItemText primary="Deselect all" />
        </StyledMenuItem>
      </StyledMenu>
    </div>
  );
}


function DiskImageMenubar(props) {
  const myAppbar = appbarStyles();
  const syncImages = props.syncImages;
  const deleteImages = props.deleteImages;
  const syncImageEnabled = props.syncImageEnabled;
  const deleteImageEnabled = props.deleteImageEnabled;

  return (
    <AppBar classes={{root: myAppbar.root, colorSecondary: myAppbar.colorSecondary}} position="static"
            color={"secondary"}>
      <Toolbar variant="dense">
        <OpMenu {...props} />
        <Tooltip title="Sync disk images to disk">
          <Button aria-label="sync" disabled={!syncImageEnabled} startIcon={<BuildIcon />} className={myAppbar.commandButton} color="inherit" onClick={() => syncImages()} >Sync Images</Button>
        </Tooltip>
        <Tooltip title="Delete disk images from disk">
          <Button aria-label="delete" startIcon={<DeleteForeverIcon />} className={myAppbar.commandButton} color="inherit" onClick={() => deleteImages()} disabled={!deleteImageEnabled}>Delete Images</Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  )
}

export default class DiskImageManagement extends React.Component {
  constructor() {
    super();
    this.state = {
      /* Disk Image file selection */
      imageFileSelection: [],

      /* target disks */
      targetDisks: {},

      isRunning: false,
      runningStatus: undefined,

      resetting: false,
      did_reset: false,

      menuCommand: undefined,
    };

    this.did_reset = this.did_reset.bind(this);
  }

  imageFileSelection(selectedImages) {
    this.setState( { imageFileSelection: selectedImages });
  }

  diskSelectionChanged(selectedDisks, clicked) {
    if (!clicked) return;
    var newSelection = cloneDeep(this.state.targetDisks);

    if (this.state.targetDisks[clicked.deviceName]) {
      newSelection[clicked.deviceName] = false;
    } else {
      if (!clicked.mounted)
        newSelection[clicked.deviceName] = clicked;
    }
    this.setState({targetDisks: newSelection});
  }

  expandCats(expand) { this.setState( {menuCommand: expand ? "expand" : "collapse"}) }
  selectAll(select) {this.setState( {menuCommand: select ? "selectall" : "deselectall"})}

  clearCommand() {
    this.setState( {menuCommand: undefined} );
  }

  did_reset() {this.setState({resetting: false});}

  componentDidMount() {
    const loadWock = socketio.connect(sweetHome.websocketUrl);
    loadWock.on("diskimage", this.onRunnerUpdate.bind(this));
  }

  getSyncImageUrl() {
    // Make array rather than json object.
    const targetDiskList = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);
    const imageFiles = Object.keys(this.state.imageFileSelection).filter( filename => this.state.imageFileSelection[filename]);

    if (targetDiskList.length === 0 || imageFiles.length === 0) {
      return undefined;
    }

    // time to make donuts
    console.log(targetDiskList);

    var url = sweetHome.backendUrl + "/dispatch/sync?deviceNames=";
    var sep = "";
    var targetDisk;
    for (targetDisk of targetDiskList) {
      url = url + sep + targetDisk;
      sep = ",";
    }
    url = url + "&sources=";
    var imageFile;
    var imageFileList = "";
    sep = "";
    for (imageFile of imageFiles) {
      url = url + sep + imageFile;
      sep = ",";
    }
    return url;
  }

  getDeleteImageUrl() {
    // Make array rather than json object.
    const targetDiskList = Object.keys(this.state.targetDisks).filter( devName => this.state.targetDisks[devName]);

    if (targetDiskList.length === 0) {
      return undefined;
    }

    var url = sweetHome.backendUrl + "/dispatch/clean?deviceNames=";
    var sep = "";
    var targetDisk;
    for (targetDisk of targetDiskList) {
      url = url + sep + targetDisk;
      sep = ",";
    }
    return url;
  }


  syncImages() {
    const url = this.getSyncImageUrl();
    console.log(url);
    if (url) {
      console.log(url);
      request({
        "method":"POST",
        "uri": url,
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }}
      ).then(res => {
        this.setState({
          isRunning: true
        });
      });
    }
  }

  deleteImages() {
    const url = this.getDeleteImageUrl();
    console.log(url);
    if (url) {
      console.log(url);
      request({
        "method":"POST",
        "uri": url,
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }}
      ).then(res => {
        this.setState({
          isRunning: true
        });
      });
    }
  }

  onRunnerUpdate(update) {this.setState({runningStatus: update, isRunning: update.device !== ''});}

  onReset() {
    this.setState({
      resetting: true,
      source: undefined,
      sources: [],
      subsetSources: [],
      targetDisks: {}
    });
    this.fetchSources();
    // this.setState( {wipeOption: undefined})
  }

  render() {
    const {isRunning, resetting, did_reset, runningStatus, targetDisks} = this.state;
    const syncImageEnabled = this.getSyncImageUrl() !== undefined;
    const deleteImageEnabled = this.getDeleteImageUrl() !== undefined;

    return (
      <div style={{ padding: 0 }}>
        <Grid container spacing={1}>
          <Grid container item xs={12}>
            <DiskImageMenubar syncImageEnabled={syncImageEnabled}
                              deleteImageEnabled={deleteImageEnabled}
                              syncImages={this.syncImages.bind(this)}
                              deleteImages={this.deleteImages.bind(this)}
                              targetDisks={targetDisks}
                              expandAllCatsCB={this.expandCats.bind(this)}
                              selectAllFilesCB={this.selectAll.bind(this)} />
          </Grid>
          <Grid item xs={4}>
            <Box border={2} borderColor="grey.500"  borderRadius={4} fixed={"true"} >
              <Typography>Disk Images</Typography>
              <DiskImageTreeView selectionChanged={this.imageFileSelection.bind(this)}
                                 command={this.state.menuCommand}
                                 clearCommand={this.clearCommand.bind(this)}/>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box border={2} borderColor="grey.500" borderRadius={4} fixed={"true"} >
              <Typography>Destination Disks</Typography>
              <Disks running={isRunning} selected={targetDisks} runningStatus={runningStatus} resetting={resetting}
                   did_reset={did_reset} diskSelectionChanged={this.diskSelectionChanged.bind(this)}/>
            </Box>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <RunnerProgress runningStatus={runningStatus} statuspath={"/dispatch/sync-status.json"}  />
        </Grid>
      </div>
    );
  };
}
