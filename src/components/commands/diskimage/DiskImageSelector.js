import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 350,
    },
    selectEmpty: {
      marginTop: theme.spacing(0),
    },
  }),
);

export default function DiskImageSelector(props) {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    props.setSource(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="source-select-label">Disk Image Source</InputLabel>
        <Select
          labelId="source-select-label"
          value={props.source || ''}
          style={{fontSize: 13, textAlign: "left"}}
          children={props.sources.map( item => <MenuItem value={item}>{item.label}</MenuItem>)}
          onChange={handleChange}
        />
      </FormControl>

    </div>
  );
}