import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import request from "request-promise";
import {sweetHome} from "../../looseend/home";
import PropTypes from 'prop-types';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import ArchiveIcon from '@material-ui/icons/Archive';
import DeleteIcon from '@material-ui/icons/Delete';
import Label from '@material-ui/icons/Label';
import {tableTheme} from "./TriageTableTheme";
import {Checkbox} from "@material-ui/core";
import {Menu, MenuItem} from "@material-ui/core";
import {Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@material-ui/core";
import {Button, TextField} from "@material-ui/core";


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
  const { labelText, labelIcon: LabelIcon, labelInfo, color, bgColor, selected, handleChange, value, ...other } = props;

  var checkbox;
  if (value) {
    checkbox = <Checkbox
      checked={selected}
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

StyledTreeItem.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  labelIcon: PropTypes.elementType.isRequired,
  labelInfo: PropTypes.string,
  labelText: PropTypes.string.isRequired,
};


function ImageFileItem(props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [origin, setOrigin] = React.useState({x:0, y:0});

  const imageFile = props.imageFile;
  const selChange = props.selectionChanged;
  const selected = props.selected;

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
    props.handleItemRename(imageFile);
  };

  const handleMenuDelete = () => {
    setIsOpen(false);
    props.handleItemDelete(imageFile);
  };

  return (
      <div onContextMenu={handleItemClick} style={{ cursor: 'context-menu' }}>
        <StyledTreeItem selected={selected} value={imageFile.label} handleChange={selChange} nodeId={imageFile.label} labelText={imageFile.label} labelIcon={ArchiveIcon} />
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


  const handleClose = () => {
    setOpen(false);
  };

  const handleRename = () => {
    setOpen(false);
    props.submitRename(value, targetImageFile);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title">
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" disabled={value==="" || value == filename} onClick={handleRename} >
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

  const handleClose = () => {
    setOpen(false);
  };

  const handleDelete = () => {
    setOpen(false);
    props.submitDelete(value, targetImageFile);
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button color="primary" disabled={value==="" || value[0] === "." || value[0] === "/"}  onClick={handleDelete}>
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

export default function DiskImageTreeView(props) {
  const classes = diskImageViewStyle();

  const [sources, setSources] = React.useState([]);
  const [sourcesLoading, setSourcesLoading] = React.useState(true);
  const [catalogTypesLoading, setCatalogTypesLoading] = React.useState(true);
  const [catalogTypes, setCatalogTypes] = React.useState([]);
  const [catalogIndex, setCatalogIndex] = React.useState([]);
  const [selection, setSelection] = React.useState({});
  const [expandedCategories, setExpandedCategories] = React.useState([]);
  const [renameDialogOpen, renameDialogSetOpen] = React.useState( false);
  const [deleteDialogOpen, deleteDialogSetOpen] = React.useState( false);
  const [targetImageFile, setTargetImageFile] = React.useState( undefined );

  const expandCatsRequest = props.expandCategories;
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
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/restore-types.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      var index = 0;
      const srcs = res.restoreTypes.map(src => ({ index: index++, ...src}));
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

  function handleRenameRequest(imageFile) {
    console.log(imageFile);
    setTargetImageFile(imageFile);
    renameDialogSetOpen(true);
  }

  function submitRename(filename, targetImageFile) {
    console.log(filename);
    console.log(targetImageFile);

    const url = encodeURI(sweetHome.backendUrl + "/dispatch/rename?to=" + filename + "&restoretype=" + targetImageFile.restoreType + "&from=" + targetImageFile.label);
    request({
      "method":"POST",
      "uri": url,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res);
      renameDialogSetOpen(false);
      fetchSources();
      }
    );
  }

  function handleDeleteRequest(imageFile) {
    console.log(imageFile);
    setTargetImageFile(imageFile);
    deleteDialogSetOpen(true);
  }

  function submitDelete(filename, targetImageFile) {
    if (targetImageFile.label !== filename)
      return;

    const url = encodeURI(sweetHome.backendUrl + "/dispatch/delete?name=" + filename + "&restoretype=" + targetImageFile.restoreType);
    request({
      "method":"POST",
      "uri": url,
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
        }}
    ).then(res => {
      console.log(res);
      deleteDialogSetOpen(false);
      fetchSources();
    });
  }

  function fileList (catType, catind, selChange, renameCB, deleteCB) {
    var files = [];
    if (catind[catType] && catind[catType].length)
      files = catind[catType];
    /*
     <StyledTreeItem selected={selection[imageFile.label]} value={imageFile.label} handleChange={selChange} nodeId={imageFile.label} labelText={imageFile.label} labelIcon={ArchiveIcon} /> )
     */
    return files.map(imageFile => {
      return <ImageFileItem imageFile={imageFile} selectionChanged={selChange} selected={selection[imageFile.label]} handleItemRename={renameCB} handleItemDelete={deleteCB}/>
    });
  }


  function catalogList(cats, catind, selChange, renameCB, deleteCB) {
    return cats.map(function(catalog) {
      return (<StyledTreeItem nodeId={catalog.id} labelText={catalog.name} labelIcon={Label}>
          {fileList(catalog.id, catind, selChange, renameCB, deleteCB)}
        </StyledTreeItem>
      )});
  }

  React.useEffect(() => {
    updateCatalogIndex();
  }, [sourcesLoading, catalogTypesLoading, sources, catalogTypes]);


  React.useEffect(() => {
    if (!catalogTypesLoading && catalogTypes) {
      if (props.expandCategories === true) {
        setExpandedCategories(catalogTypes.map( cat => cat.id ));
      }
      if (props.expandCategories === false) {
        setExpandedCategories([]);
      }
    }
  }, [expandCatsRequest]);

  function selectionChanged(event) {
    if (!sourcesLoading && !catalogTypesLoading) {
      console.log(event.target);
      selection[event.target.value] = event.target.checked;
      setSelection(selection);
      if (selectionChangedCB)
        selectionChangedCB(selection);
    }
  }

  return (
    <div>
      <TreeView
        className={classes.root}
        expanded={expandedCategories}
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
      >
        { catalogList(catalogTypes, catalogIndex, selectionChanged, handleRenameRequest, handleDeleteRequest) }
      </TreeView>
      <RenameDialog open={renameDialogOpen} setOpen={renameDialogSetOpen} submitRename={submitRename} filename={targetImageFile ? targetImageFile.label : ""} targetImageFile={targetImageFile}/>
      <DeleteDialog open={deleteDialogOpen} setOpen={deleteDialogSetOpen} submitDelete={submitDelete} filename={targetImageFile ? targetImageFile.label : ""} targetImageFile={targetImageFile}/>
    </div>
  );
}