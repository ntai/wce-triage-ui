import React from 'react';
import CSS from 'csstype';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

export type Mui5TableColumn<RowType> = {
    title: string;
    getValue: (row: RowType, index: number) => string & JSX.Element & null;
    cellStyle?: CSS.Properties;
    headerStyle?: CSS.Properties;
    render?: (row: RowType, index: number) => JSX.Element;
}


export type Mui5TableOptions<RowType> = {
    draggable?: Boolean;
    paging?: Boolean;
    sorting?: Boolean;
    toolbar?: Boolean;
    search?: Boolean;
    showTitle?: Boolean;
    detailPanelColumnAlignment?: "left" | "center" | "right";
    padding?: "dense" ;
    rowStyle?: (rowData: RowType) => CSS.Properties;
    selection?: Boolean;
}

export type Mui5TableDetailPanel<RowType> = {
    icon: JSX.Element;
    openIcon?: JSX.Element;
    tooltip?: string;
    render: (row: RowType, index: number) => JSX.Element;
}

type MaybeRowData<RowType> = RowType & Promise<RowType>;

export type Mui5TableProps<RowType> = React.ElementType & {
    column: Mui5TableColumn<RowType>[];
    icons?: object;
    rows: MaybeRowData<RowType>[];
    options?: Mui5TableOptions<RowType>;
    detailPanel?: Mui5TableDetailPanel<RowType>[];
}


function Mui5HeaderCell<RowType>({cell, row, index} : {cell: Mui5TableColumn<RowType>, row: RowType, index: number})
{
    return (
        <TableCell >
            {cell.getValue(row, index)}
        </TableCell>);
}



/* detail panel column for the header part */
function Mui5DetailPanelHeader<RowType>( {} : {panel: Mui5TableDetailPanel<RowType>, index: number})
{
    // Just an empty cell as placeholder
    return (<TableCell></TableCell>);
}

function ComputeDetailHeaderCell<RowType>(props : Mui5TableProps<RowType>) {
    const {detailPanel} = props;

    if (detailPanel) {
        return detailPanel.map((panel, index) => Mui5DetailPanelHeader({panel, index} ));
    }
    return null;
}


function Mui5TableSelectionCell (selections: object, setSelections: (selection: object) => void, rowIndex: number) {
    function toggleOpen() {
        setSelections(Object.assign( selections, { [rowIndex]: !!!selections[rowIndex]});
    }

    return (
        <TableCell>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={toggleOpen}
            >
                {selection[rowIndex] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
        </TableCell>);
}


export default function Mui5Table<RowType>(props : Mui5TableProps<RowType>)
{
    const {rows, columns, options, detailPanel} = props;
    const selectionHeaderColumn = options?.selection ? ComputeDetailHeaderCell(props) : null;
    const detailHeaderColumn = detailPanel ? ComputeDetailHeaderCell(props) : null;
    const [selections, setSelections] = React.useState({});

    return (
        <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
                <TableHead>
                    <TableRow>
                        {detailHeaderColumn}
                        {selectionHeaderColumn}
                        {columns.map( column => (<Mui5HeaderCell cell={column}/>)}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <React.Fragment>
                            <TableRow>
                                { (options?.selection) ? Mui5TableSelectionCell(selections, setSelections, rowIndex) : null }
                                { (detailPanel) ? detailPanel.map((panel, index) =>
                                    Mui5TableSelectionCell(selections, setSelections, rowIndex)) : null }
                                {columns.map( column => (<Mui5Cell row=row cell={column}/>)}
                            </TableRow>
                            {
                                detailPanel.map( (panel, index) => {
                                    const rendered = panel.render(row, index);
                                    if (rendered) {
                                        return (
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                                    <Collapse in={open} timeout="auto" unmountOnExit>
                                                        <Box sx={{ margin: 1 }}>
                                                            {rendered}
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    }
                                    else {
                                        return null;
                                    }
                                })
                            }
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

