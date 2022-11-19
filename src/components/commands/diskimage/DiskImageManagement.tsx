import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DiskImageTreeView, {DiskImageOperationType} from "./DiskImageTreeView";
import Grid from "@mui/material/Grid";
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Disks from "../../parts/Disks";
import {io} from "socket.io-client";
import {sweetHome} from "../../../looseend/home";
import Button from "@mui/material/Button";
import BuildIcon from '@mui/icons-material/Build';
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import Menu, {MenuProps} from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import RunnerProgress from "../../parts/RunnerProgress";
import Tooltip from '@mui/material/Tooltip';
import {DeviceSelectionType, DiskType, RunReportType} from "../../common/types";
import {makeStyles, styled} from "@mui/styles";
import {Theme, alpha} from "@mui/material/styles";

const appbarStyles = makeStyles( (theme:Theme) => ({
  root: {
    height: 46,
    minHeight: 46,
  },
  colorSecondary: {
    backgroundColor: '#208040'
  },
  commandButton: {
    marginRight: theme.spacing(2),
  },
  popupMenu: {
    '&:focus': {
      backgroundColor: theme.palette.common.white,
      '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
        color: theme.palette.common.black,
      },
    },
  },
}));


const StyledMenu = styled((props: MenuProps) => (
    <Menu
        elevation={0}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        {...props}
    />
))(({ theme}: {theme: Theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color:
        theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

interface OpMenuProps {
  expandAllCatsCB: (sel: boolean) => void;
  selectAllFilesCB: (all: boolean) => void;
}

function OpMenu({ expandAllCatsCB, selectAllFilesCB} : OpMenuProps) {
  const myAppbar = appbarStyles();
  const [anchorEl, setAnchorEl] = React.useState<EventTarget & HTMLButtonElement|null>(null);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (event?.currentTarget)
      setAnchorEl(event.currentTarget);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };

  const allCategories = (select: boolean) => {
    setAnchorEl(null);
    expandAllCatsCB(select);
  };

  const handleCollapseCategories = () => {
    allCategories(false);
  };

  const handleExpandCategories = () => {
    allCategories(true);
  };

  const selectAllFiles = (select: boolean) => {
    setAnchorEl(null);
    selectAllFilesCB(select);
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
        edge="start" className={myAppbar.commandButton} color="inherit"
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
        <MenuItem onClick={handleExpandCategories}>
          <ListItemText primary="Expand all categories" />
        </MenuItem>
        <MenuItem onClick={handleCollapseCategories}>
          <ListItemText primary="Collapse all categories" />
        </MenuItem>
        <MenuItem onClick={selectAll}>
          <ListItemText primary="Select all" />
        </MenuItem>
        <MenuItem onClick={deselectAll}>
          <ListItemText primary="Deselect all" />
        </MenuItem>
      </StyledMenu>
    </div>
  );
}

interface DiskImageMenubarProps {
  syncImages: () => void;
  deleteImages: () => void;
  syncImageEnabled: boolean;
  deleteImageEnabled: boolean;
}


function DiskImageMenubar(props : DiskImageMenubarProps & OpMenuProps) {
  const myAppbar = appbarStyles();
  const {syncImages, deleteImages, syncImageEnabled, deleteImageEnabled} = props;

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

type DiskImageManagementStateType = {
  /* Disk Image file selection - key is the image file */
  imageFileSelection: DeviceSelectionType<boolean>;

  /* target disks */
  targetDisks: DeviceSelectionType<DiskType>;

  isRunning: boolean;
  runningStatus?: RunReportType;

  resetting: boolean;

  menuCommand?: DiskImageOperationType;
};


export default class DiskImageManagement extends React.Component<any, DiskImageManagementStateType> {
  constructor(props: any) {
    super(props);
    this.state = {
      /* Disk Image file selection */
      imageFileSelection: {},

      /* target disks */
      targetDisks: {},

      isRunning: false,
      runningStatus: undefined,

      resetting: false,
    };

    this.did_reset = this.did_reset.bind(this);
  }

  imageFileSelection(selectedImages: DeviceSelectionType<boolean>) {
    this.setState( { imageFileSelection: selectedImages });
  }

  diskSelectionChanged(selectedDisks: DeviceSelectionType<DiskType>, clicked?: DiskType) {
    if (!clicked) return;
    let targetDisks = Object.assign({}, this.state.targetDisks);

    if (targetDisks[clicked.deviceName]) {
      delete targetDisks[clicked.deviceName];
    } else {
      if (!clicked.mounted)
        targetDisks[clicked.deviceName] = clicked;
    }
    this.setState({targetDisks});
  }

  expandCats(expand: boolean) { this.setState( {menuCommand: expand ? "expand" : "collapse"}) }
  selectAll(select: boolean) {this.setState( {menuCommand: select ? "selectall" : "deselectall"})}

  clearCommand() {
    this.setState( {menuCommand: undefined} );
  }

  did_reset() {this.setState({resetting: false});}

  componentDidMount() {
    const loadWock = io(sweetHome.websocketUrl);
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

    let url = sweetHome.backendUrl + "/dispatch/sync?deviceNames=";
    let sep = "";
    let targetDisk;
    for (targetDisk of targetDiskList) {
      url = url + sep + targetDisk;
      sep = ",";
    }
    url = url + "&sources=";
    let imageFile;
    // let imageFileList = "";
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

    let url = sweetHome.backendUrl + "/dispatch/clean?deviceNames=";
    let sep = "";
    let targetDisk;
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
      fetch(url, {"method":"POST"}).then(_ => {
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
      fetch(url, {"method":"POST"}).then(_ => {
        this.setState({
          isRunning: true
        });
      });
    }
  }

  onRunnerUpdate(update: RunReportType) {this.setState({runningStatus: update, isRunning: update.device !== ''});}

  onReset() {
    this.setState({
      resetting: true,
      targetDisks: {}
    });
    // this.fetchSources();
    // this.setState( {wipeOption: undefined})
  }

  render() {
    const {isRunning, resetting, runningStatus, targetDisks} = this.state;
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
                              expandAllCatsCB={this.expandCats.bind(this)}
                              selectAllFilesCB={this.selectAll.bind(this)} />
          </Grid>
          <Grid item xs={4}>
            <Box border={2} borderColor="grey.500"  borderRadius={4}>
              <Typography>Disk Images</Typography>
              <DiskImageTreeView selectionChangedCB={this.imageFileSelection.bind(this)}
                                 command={this.state.menuCommand}
                                 clearCommand={this.clearCommand.bind(this)}/>
            </Box>
          </Grid>
          <Grid item xs={8}>
            <Box border={2} borderColor="grey.500" borderRadius={4}>
              <Typography>Destination Disks</Typography>
              <Disks running={isRunning} selected={targetDisks} runningStatus={runningStatus} resetting={resetting}
                     did_reset={this.did_reset.bind(this)} diskSelectionChanged={this.diskSelectionChanged.bind(this)}/>
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
