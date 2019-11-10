import React from "react";

import request from 'request-promise';
import {sweetHome} from './../../looseend/home';
import "./commands.css";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 180,
    },
    selectEmpty: {
      marginTop: theme.spacing(0),
    },
  }),
);


// <Catalog title={"Restore type"} catalogType={restoreType} catalogTypeChanged={this.setRestoreType} catalogTypesChanged={this.setRestoreTypes} />
export default function Catalog(props) {
  const classes = useStyles();
  const [catalogTypesLoading, setCatalogTypesLoading] = React.useState(true);
  const [catalogTypes, setCatalogTypes] = React.useState([]);

  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);

  const title = props.title;
  const catalogType = props.catalogType;
  const catalogTypeChanged = props.catalogTypeChanged;
  const catalogTypesChanged = props.catalogTypesChanged;

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
      const cats = res.restoreTypes.map(rt => ({label: rt.name, value: rt.id}));
      setCatalogTypesLoading(false);
      setCatalogTypes(cats);
      catalogTypesChanged(cats);
      console.log("Setting catalog types");
      console.log(cats);
    });
  }

  React.useEffect(() => {
    // setLabelWidth(inputLabel.current.offsetWidth);
    setLabelWidth(0);
    fetchCatalogTypes();
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    catalogTypeChanged(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="wipe-option-select-label">{title}</InputLabel>
        <Select
          labelId="wipe-option-select-label"
          // handing down undefined doesn't change the selection. Dummy value '' sets it.
          value={catalogType || ''}
          style={{fontSize: 14, textAlign: "left"}}
          children={catalogTypes.map( item => <MenuItem value={item}>{item.label}</MenuItem>)}
          onChange={handleChange}
        />
      </FormControl>

    </div>
  );
}
