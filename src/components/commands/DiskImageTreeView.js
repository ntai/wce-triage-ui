import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import request from "request-promise";
import {sweetHome} from "../../looseend/home";
import PropTypes from 'prop-types';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import Label from '@material-ui/icons/Label';
import {Checkbox} from "@material-ui/core";
import {Menu, MenuItem} from "@material-ui/core";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {Button, TextField} from "@material-ui/core";
import cloneDeep from "lodash/cloneDeep";

import CancelIcon from "@material-ui/icons/Cancel";
import KeyboardIcon from "@material-ui/icons/Keyboard";
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/Delete';

const useTreeItemStyles = makeStyles(theme => ({
  root: {
    color: theme.palette.text.secondary,
    '&:focus > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: 'var(--tree-view-color)',
    },
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  group: {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2),
    },
  },
  expanded: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit',
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
  },
}));

function StyledTreeItem(props) {
  const classes = useTreeItemStyles();
  const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, selected, handleChange, value, nodeId, ...other } = props;

  var checkbox = null;
  if (value) {
    checkbox = <Checkbox
      checked={selected === undefined ? false : selected}
      onChange={handleChange}
      value={value}
      id={value}
      inputProps={{
        'aria-label': 'primary checkbox',
      }}
    />
  }

  return (
    <TreeItem
      nodeId={nodeId}
      key={nodeId}
      label={
        <div className={classes.labelRoot}>
          <LabelIcon color="inherit" className={classes.labelIcon} />
          {checkbox}
          <Typography variant="body2" className={classes.labelText} align={"left"}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </div>
      }
      style={{
        '--tree-view-color': color,
        '--tree-view-bg-color': bgColor,
      }}
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        group: classes.group,
        label: classes.label,
      }}
      {...other}
    />
  );
}

function AlertDialog(props) {
  const [open, setOpen] = React.useState( false);
  const title = props.title;
  const message = props.message;
  const closelabel = props.closelabel;

  React.useEffect(() => {
    if (message !== undefined)
      setOpen(true);
  }, [message]);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            {closelabel}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  ) }



StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
  nodeId: PropTypes.string.isRequired
};


function ImageFileItem(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState({x:0, y:0});

  const imageFile = props.imageFile;
  const selChange = props.selectionChanged;
  const selected = props.selected;
  const catalog = props.catalog;
  const handleItemRename = props.handleItemRename;
  const handleItemDelete = props.handleItemDelete;

  const handleItemClick = event => {
    event.preventDefault();
    setOrigin({x: event.clientX - 2, y: event.clientY - 4});
    setIsOpen(true);
  };

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  const handleMenuRaname = () => {
    setIsOpen(false);
    handleItemRename(imageFile);
  };

  const handleMenuDelete = () => {
    setIsOpen(false);
    handleItemDelete(imageFile);
  };

  return (
    <div onContextMenu={handleItemClick} style={{ cursor: 'context-menu' }}>
      <StyledTreeItem selected={selected} nodeId={catalog + "/" + imageFile.label} value={imageFile.label} handleChange={selChange} labelText={imageFile.label} labelIcon={ArchiveIcon} />
      <Menu
        keepMounted
        open={isOpen}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={{top: origin.y, left: origin.x}}
      >
        <MenuItem onClick={handleMenuRaname}>Rename</MenuItem>
        <MenuItem onClick={handleMenuDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
}

function RenameDialog(props) {

  const filename = props.filename;
  const targetImageFile = props.targetImageFile;
  const [value, setValue] = React.useState(filename);
  const setOpen = props.setOpen;
  const submitRename = props.submitRename;
  const is_open = props.open;


  const handleClose = () => {
    setOpen(false);
  };

  const handleRename = () => {
    setOpen(false);
    submitRename(value, targetImageFile);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <Dialog open={is_open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Rename File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Current filename: {filename}
          </DialogContentText>
          <TextField
            defaultValue={filename}
            autoFocus
            margin="dense"
            id="filename"
            label="New file name"
            type="text"
            fullWidth
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CancelIcon />} onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button startIcon={<KeyboardIcon />} color="primary" disabled={value==="" || value === filename || value[0] === "." || value[0] === "/"} onClick={handleRename} >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


function DeleteDialog(props) {

  const filename = props.filename;
  const targetImageFile = props.targetImageFile;
  const [value, setValue] = React.useState(filename);
  const setOpen = props.setOpen;
  const submitDelete = props.submitDelete;

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    setOpen(false);
    submitDelete(targetImageFile);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Delete Image File</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Filename: {filename}
          </DialogContentText>
          <TextField
            value={filename}
            autoFocus
            margin="dense"
            id="filename"
            label="Deleting filename"
            type="text"
            fullWidth
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button startIcon={<CancelIcon />} onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button startIcon={<DeleteIcon />} color="primary" disabled={value==="" || value[0] === "." || value[0] === "/"}  onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



const diskImageViewStyle = makeStyles({
  root: {
    minHeight: 264,
    flexGrow: 1,
    maxWidth: 800,
  },
});


function CatalogList(props) {

  const { catalogTypes, catalogIndex, selectionChanged, handleRenameCommand, handleDeleteCommand, onCatalogClick, selection} = props;

  function fileList(id) {
    var files = [];
    if (catalogIndex[id] && catalogIndex[id].length)
      files = catalogIndex[id];
    else
      return null;
    return files.map(imageFile => {
      return <ImageFileItem catalog={id} imageFile={imageFile} selectionChanged={selectionChanged}
                            selected={selection[imageFile.label]}
                            handleItemRename={handleRenameCommand}
                            handleItemDelete={handleDeleteCommand}/>
    });
  }

  return (<div>
    {
      catalogTypes.map(function (catalog) {
        if (!catalog.id) return null;
        const catalog_id = catalog.id;
        function clicked() { onCatalogClick(catalog_id); }
        return (
          <StyledTreeItem nodeId={catalog.id} labelText={catalog.name} labelIcon={Label} onClick={clicked}>
            {fileList(catalog.id)}
           </StyledTreeItem>
        )
    } ) }
    </div>);
}

export default function DiskImageTreeView(props) {
  const classes = diskImageViewStyle();

  const [sources, setSources] = React.useState([]);
  const [sourcesLoading, setSourcesLoading] = React.useState(true);
  const [catalogTypesLoading, setCatalogTypesLoading] = React.useState(true);
  const [catalogTypes, setCatalogTypes] = React.useState([]);
  const [catalogIndex, setCatalogIndex] = React.useState([]);
  const [selection, setSelection] = React.useState({});
  const [expandedCategories, setExpandedCategories] = React.useState([]);
  const [renameDialogOpen, renameDialogSetOpen] = React.useState(false);
  const [deleteDialogOpen, deleteDialogSetOpen] = React.useState(false);
  const [targetImageFile, setTargetImageFile] = React.useState(undefined);
  const [alertTitle, setAlertTitle] = React.useState(undefined);
  const [alertMessage, setAlertMessage] = React.useState(undefined);
  const [alertClose, setAlertClose] = React.useState(undefined);

  const command = props.command;
  const clearCommand = props.clearCommand;
  const selectionChangedCB = props.selectionChanged;

  React.useEffect(() => {
    fetchCatalogTypes();
    fetchSources();
  }, []);

  function fetchSources() {
    setSourcesLoading(true);

    request({
        "method": "GET",
        "uri": sweetHome.backendUrl + "/dispatch/disk-images.json",
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      var index = 10000;
      const srcs = res.sources.map(src => ({
        value: src.fullpath,
        label: src.name,
        filesize: src.size,
        mtime: src.mtime,
        restoreType: src.restoreType,
        id: src.restoreType,
        index: index++
      }));
      setSources(srcs);
      setSourcesLoading(false);
    });
  };

  function fetchCatalogTypes() {
    setCatalogTypesLoading(true);

    request({
        "method": "GET",
        "uri": sweetHome.backendUrl + "/dispatch/restore-types.json",
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      var index = 0;
      const srcs = res.restoreTypes.map(src => ({index: index++, ...src}));
      setCatalogTypes(srcs);
      setCatalogTypesLoading(false);
    });
  }


  function updateCatalogIndex() {
    if (!sourcesLoading && !catalogTypesLoading) {
      var catind = {};
      var src = undefined;
      var cat = undefined;

      if (catalogTypes) {
        for (cat of catalogTypes)
          catind[cat.id] = [];
      }
      for (src of sources) {
        if (catind[src.id])
          catind[src.id].push(src);
        else
          catind[src.id] = [src];
      }
      setCatalogIndex(catind);
      setExpandedCategories([]);
    }
  }

  function handleRenameCommand(imageFile) {
    console.log(imageFile);
    setAlertMessage(undefined);
    setTargetImageFile(imageFile);
    renameDialogSetOpen(true);
  }

  function submitRename(filename, targetImageFile) {
    console.log(filename);
    console.log(targetImageFile);

    const url = encodeURI(sweetHome.backendUrl + "/dispatch/rename?to=" + filename + "&restoretype=" + targetImageFile.restoreType + "&from=" + targetImageFile.label);
    request({
        "method": "POST",
        "uri": url,
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
        console.log(res);
        setAlertMessage(undefined);
        renameDialogSetOpen(false);
        fetchSources();
      }
    ).catch(err => {
      setAlertClose("Bummer");
      setAlertTitle("Rename Failure");
      setAlertMessage("Renaming " + filename + " failed.");
    });
  }

  function handleDeleteCommand(imageFile) {
    console.log(imageFile);
    setAlertMessage(undefined);
    setTargetImageFile(imageFile);
    deleteDialogSetOpen(true);
  }

  function submitDelete(targetImageFile) {
    const filename = targetImageFile.label;
    console.log( "Deleting " + filename);

    const url = encodeURI(sweetHome.backendUrl + "/dispatch/delete?name=" + filename + "&restoretype=" + targetImageFile.restoreType);
    request({
        "method": "POST",
        "uri": url,
        "json": true,
        "headers": {
          "User-Agent": "WCE Triage"
        }
      }
    ).then(res => {
      console.log(res);
      setAlertMessage(undefined);
      deleteDialogSetOpen(false);
      fetchSources();
    }
    ).catch(err  => {
      console.log(err);
      setAlertClose("Bummer");
      setAlertTitle("File Deletion Failure");
      setAlertMessage("Deleting " + filename + " failed.");
    });
  }


  React.useEffect(() => {
    updateCatalogIndex();
  }, [sourcesLoading, catalogTypesLoading]);


  React.useEffect(() => {
    if (!catalogTypesLoading && !sourcesLoading && command !== undefined) {

      if (command === "expand") {
        setExpandedCategories(catalogTypes.map(cat => cat.id));
      }

      if (command === "collapse") {
        setExpandedCategories([]);
      }

      if (command === "selectall") {
        var src;
        var newSelection = {};
        for (src of sources)
          newSelection[src.label] = true;
        setSelection(newSelection);
        if (selectionChangedCB)
          selectionChangedCB(newSelection);
      }

      if (command === "deselectall") {
        setSelection({});
        if (selectionChangedCB)
          selectionChangedCB({});
      }
      clearCommand();
    }
  }, [command]);

  function selectionChanged(event) {
    if (!sourcesLoading && !catalogTypesLoading) {
      var newSelection = cloneDeep(selection);
      newSelection[event.target.value] = event.target.checked;
      setSelection(newSelection);
      if (selectionChangedCB)
        selectionChangedCB(newSelection);
    }
  }

  function onCatalogClick(catalog_id) {
    if (catalogTypes) {
      const expanded = expandedCategories.filter(id => catalog_id === id).length === 1;

      if (expanded) {
        setExpandedCategories(expandedCategories.filter(id => catalog_id !== id));
      }
      else {
        var newExpandedCategories = expandedCategories.map(id => id);
        newExpandedCategories.push(catalog_id);
        setExpandedCategories(newExpandedCategories);
      }
    }
  }

  if (!sourcesLoading && !catalogTypesLoading) {
    return (
      <div>
        <TreeView
          className={classes.root}
          expanded={expandedCategories}
          defaultCollapseIcon={<ArrowDropDownIcon/>}
          defaultExpandIcon={<ArrowRightIcon/>}
          defaultEndIcon={<div style={{width: 24}}/>}
        >
          <CatalogList catalogTypes={catalogTypes}
                       catalogIndex={catalogIndex}
                       selectionChanged={selectionChanged}
                       handleRenameCommand={handleRenameCommand}
                       handleDeleteCommmand={handleDeleteCommand}
                       onCatalogClick={onCatalogClick}
                       selection={selection} />
        </TreeView>
        <RenameDialog open={renameDialogOpen} setOpen={renameDialogSetOpen} submitRename={submitRename}
                      filename={targetImageFile ? targetImageFile.label : ""} targetImageFile={targetImageFile}/>
        <DeleteDialog open={deleteDialogOpen} setOpen={deleteDialogSetOpen} submitDelete={submitDelete}
                      filename={targetImageFile ? targetImageFile.label : ""} targetImageFile={targetImageFile}/>
        <AlertDialog title={alertTitle} message={alertMessage} closelabel={alertClose} />
      </div>
    );
  } else {
    return null;
  }
}