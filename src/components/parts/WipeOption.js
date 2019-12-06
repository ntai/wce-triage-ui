import React from "react";
import request from 'request-promise';
import {sweetHome} from '../../looseend/home';
import "../commands/commands.css";
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(0),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(0),
    },
  }),
);


//  title={"Wipe"} wipeOption={wipeOption} wipeOptionChanged={this.selectWipe.bind(this)} wipeOptionsChanged={this.setWipeOptions.bind(this)}
export default function WipeOption(props) {
  const classes = useStyles();
  const [wipeOptionsLoading, setWipeOptionsLoading] = React.useState(true);
  const [wipeOptions, setWipeOptions] = React.useState([]);
  const [wipeOption, setWipeOption] = React.useState(undefined);

  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);
  const wipeOptionChanged = props.wipeOptionChanged;
  const wipeOptionsChanged = props.wipeOptionsChanged;

  function fetchWipeOptions() {
    setWipeOptionsLoading(true);

    request({
      "method":"GET",
      "uri": sweetHome.backendUrl + "/dispatch/wipe-types.json",
      "json": true,
      "headers": {
        "User-Agent": "WCE Triage"
      }}
    ).then(res => {
      console.log(res.wipeTypes);
      const wipeOptions = res.wipeTypes.map(rt => ({label: rt.name, value: rt.id}))
      setWipeOptions(wipeOptions);
      setWipeOption(undefined);
      setWipeOptionsLoading(false);
      wipeOptionChanged(undefined);
      wipeOptionsChanged(wipeOptions);
    });
  }

  React.useEffect(() => {
    // setLabelWidth(inputLabel.current.offsetWidth);
    setLabelWidth(0);
    fetchWipeOptions();
  }, []);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (!event) return;
    if (!event.target) return;
    setWipeOption(event.target.value);
    if (wipeOptionChanged) wipeOptionChanged(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="wipe-option-select-label">{props.title}</InputLabel>
        <Select
          labelId="wipe-option-select-label"
          // handing down undefined doesn't change the selection. Dummy value '' sets it.
          value={props.wipeOption || ''}
          style={{fontSize: 12, textAlign: "left"}}
          children={wipeOptions.map( item => <MenuItem value={item}>{item.label}</MenuItem>)}
          onChange={handleChange}
        />
      </FormControl>

    </div>
  );
}
