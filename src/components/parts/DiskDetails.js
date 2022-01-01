import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import NumberFormat from 'react-number-format';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    padding: 6,
  },
  paper: {
    margin: `${theme.spacing(1)}px auto`,
    padding: 6,
  },
  table: {
    minWidth: 650,
  },
}));


export default function DiskDetails(props) {
  const classes = useStyles();
  const disk = props.disk;
  var details = [
    {name: 'Vendor', value: disk.vendor },
    {name: 'Model', value: disk.model },
    {name: 'Size', value: disk.size, format: 'disksize'},
    {name: 'Bus', value: disk.bus },
    {name: 'Serial Number', value: disk.serial_no },
    {name: 'SMART capable', value: disk.smart ? "Yes" : "No" },
  ];

  if (disk.smart) {
    details.push({name: 'SMART enabled', value: disk.smart_enabled ? "Yes": "No"})
  }

  return (
    <div className={classes.root}>
      <Paper className={classes.paper}>
        <Grid container spacing={1}>
          <Card className={classes.card}>
            <CardContent>
              <Typography className={classes.title} color="textSecondary" gutterBottom>
                Disk Details
              </Typography>
              <Typography variant="h5" component="h2">
                Device node: {disk.deviceName}
              </Typography>
              <Table className={classes.table} size="small" aria-label="a dense table">
                <TableBody>
                  {details.map(row => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row" >
                        {row.name}
                      </TableCell>
                      <TableCell >
                        { (row.format === 'disksize') ?
                          <NumberFormat displayType={'text'}  value={row.value >= 10000 ? Math.round(row.value / 1000) : row.value} suffix={row.value >= 10000 ? "GB" : "MB"} />
                          :
                          row.value
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Paper>
    </div>
  );
}