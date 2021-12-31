import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {ItemType} from "../../common/types";

const useStyles = makeStyles((theme) =>
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

// This is internally used.
export type SourceType = ItemType & {
    // label: string;
    // value: string; // url - "http://horus:8312/wce/wce-disk-images/wce-20/wce-20-2021-10-10.ext4.partclone.gz"
    filesize: number;
    mtime: string; // timestamp
    restoreType: string; // "wce-20", etc.
}

// <DiskImageSelector setSource={this.setSource.bind(this)} sources={subsetSources} source={source} />

export default function DiskImageSelector( { setSource, sources, source } : {
    setSource: (source?: SourceType) => void,
    sources: SourceType[],
    source?: SourceType
} ) {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<{value: any}>) => {
      const value = event.target.value;
      setSource(sources.find( (src) => {return src.value === value;}));
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="source-select-label">Disk Image Source</InputLabel>
        <Select
          labelId="source-select-label"
          value={source?.value || ''}
          style={{fontSize: 13, textAlign: "left"}}
          children={sources.map( item => <MenuItem value={item.value}>{item.label}</MenuItem>)}
          onChange={handleChange}
        />
      </FormControl>

    </div>
  );
}