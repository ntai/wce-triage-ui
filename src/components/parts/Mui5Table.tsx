import React, {CSSProperties} from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
// import Typography from '@mui/material/Typography';
import Immutable from 'immutable';

type SelMap = Immutable.Map<number, boolean>;

// type MaybeRowData<RowType> = RowType | Promise<RowType>;
type MaybeRowData<RowType> = RowType;

export type Mui5TableColumn<RowType> = {
    title: string;
    render: (row: MaybeRowData<RowType>, index: number) => string | JSX.Element | null | undefined;
    cellStyle?: CSSProperties;
    headerStyle?: CSSProperties;
}

export interface Mui5TableOptions<RowType> {
    draggable?: Boolean,
    paging?: Boolean,
    sorting?: Boolean,
    toolbar?: Boolean,
    search?: Boolean,
    showTitle?: Boolean,
    detailPanelColumnAlignment?: "left" | "center" | "right",
    rowStyle?: CSSProperties | ((rowData: RowType, index: number) => CSSProperties),
    selection?: Boolean,
    headerStyle?: CSSProperties,
    size?: "small" | "medium" | string;
    selectionProps?: ((rowData: RowType, index: number) => object),
}

export type Mui5TableDetailPanel<RowType> = {
    icon?: JSX.Element;
    openIcon?: JSX.Element;
    tooltip?: string;
    render: (row: MaybeRowData<RowType>, index: number) => JSX.Element;
}


export interface Mui5TableProps<RowType> {
    columns: Mui5TableColumn<RowType>[],
    icons?: object,
    rows: MaybeRowData<RowType>[],
    options?: Mui5TableOptions<RowType>,
    detailPanel?: Mui5TableDetailPanel<RowType>[],
    isLoading?: boolean,
    style?: CSSProperties,
    onSelectionChange?: ( someSelectedRows: RowType[], row?: RowType) => void,
}


function Mui5HeaderCell<RowType>({column, index} : {column: Mui5TableColumn<RowType>, index: number})
{
    return (
        <TableCell >
            {column.title}
        </TableCell>);
}


function Mui5Cell<RowType>({column, row, index} : {column: Mui5TableColumn<RowType>, row: MaybeRowData<RowType>, index: number})
{
    return (
        <TableCell >
            {column.render(row, index)}
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


function Mui5TableSelectionCell({ selections, onSelectionChange, rowIndex, selectionProps } : {
    selections: SelMap,
    rowIndex: number,
    onSelectionChange: (rowIndex: number, selected: boolean) => void,
    selectionProps?: object,
})
{
    function toggleSelection() {
        const currentSelection = !selections.get(rowIndex, false);
        onSelectionChange(rowIndex, currentSelection);
    }

    return (
        <TableCell>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={toggleSelection}
                {...selectionProps}
            >
                {selections.get(rowIndex, false) ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
            </IconButton>
        </TableCell>);
}


function getPanelToggle (panelToggles: Immutable.Map<number, Immutable.List<boolean> >, rowIndex: number, panelIndex: number) : boolean
{
    const currentSelection: Immutable.List<boolean> | undefined = panelToggles.get(rowIndex);
    if (currentSelection) {
        return currentSelection.get(panelIndex) ? true : false;
    }
    return false;
}

function setPanelToggle (value: boolean, panelToggles: Immutable.Map<number, Immutable.List<boolean> >, rowIndex: number, panelIndex: number) : Immutable.Map<number, Immutable.List<boolean> > | undefined
{
    const currentSelection: Immutable.List<boolean> | undefined = panelToggles.get(rowIndex);
    if (currentSelection) {
        const currentValue = currentSelection.get(panelIndex);
        if (currentValue !== value)
            return panelToggles.set( rowIndex, currentSelection.set(panelIndex, value) );
    }
    else {
        if (value) {
            const zero = Immutable.List.of<boolean>();
            return panelToggles.set(rowIndex, zero.set(panelIndex, true));
        }
    }
    return undefined;
}

function Mui5DetailPanelToggle ({ panelToggles, setPanelToggles, rowIndex, panelIndex } : {
    panelToggles: Immutable.Map<number, Immutable.List<boolean> >,
    setPanelToggles: (_: Immutable.Map<number, Immutable.List<boolean> >) => void,
    rowIndex: number,
    panelIndex: number})
{
    function toggleOpen() {
        const toggled = !getPanelToggle(panelToggles, rowIndex, panelIndex);
        const changed = setPanelToggle(toggled, panelToggles, rowIndex, panelIndex);
        if (changed)
            setPanelToggles(changed);
    }

    return (
        <TableCell>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={toggleOpen}
            >
                {getPanelToggle(panelToggles, rowIndex, panelIndex) ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
            </IconButton>
        </TableCell>);
}


export default function Mui5Table<RowType>(props : Mui5TableProps<RowType>)
{
    const {rows, columns, options, detailPanel, style, onSelectionChange} = props;
    const selectionHeaderColumn = options?.selection ? ComputeDetailHeaderCell(props) : null;
    const detailHeaderColumn = detailPanel ? ComputeDetailHeaderCell(props) : null;
    const [selections, setSelections] = React.useState(Immutable.Map<number, boolean>());
    const [panelToggles, setPanelToggles] = React.useState(Immutable.Map<number, Immutable.List<boolean> >());
    const { headerStyle } = Object.assign( {}, {}, options);
    if (rows === undefined) {
        console.log("table - no rows")
        return null;
    }
    const tableSize = options?.size ? (options.size === "small" ? "small" : "medium") : "small";

    function onRowSelectionChange(rowIndex: number, selected: boolean) {
        const newSelections:Immutable.Map<number, boolean> = selections.set(rowIndex, selected);
        setSelections(newSelections);

        if (onSelectionChange) {
            const selectedRows = newSelections.filter( (selected, rowIndex) => selected).keySeq().map( (_, rowIndex) => rows[rowIndex]).toArray();
            onSelectionChange(selectedRows, selected ? rows[rowIndex] : undefined);
        }
    }


    return (
        <React.Fragment>

        <TableContainer component={Paper} >
            <Table size={tableSize} aria-label="collapsible table" style={style} >
                <TableHead style={headerStyle}>
                    <TableRow key={"table-header"}>
                        {detailHeaderColumn}
                        {selectionHeaderColumn}
                        {
                            columns.map( (column, index) =>
                                Mui5HeaderCell({column, index}))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, rowIndex) => {
                        const selectionProps = options?.selectionProps ? ( options.selectionProps instanceof Function ? options.selectionProps(row, rowIndex) : options.selectionProps) : undefined;
                        return (
                            <React.Fragment>
                                <TableRow key={`table-row-${rowIndex}`}>
                                    {(options?.selection) ? Mui5TableSelectionCell({
                                        selections,
                                        onSelectionChange: onRowSelectionChange,
                                        rowIndex,
                                        selectionProps,
                                    }) : null}
                                    {
                                        (detailPanel) ? detailPanel.map((panel, panelIndex) =>
                                            Mui5DetailPanelToggle({panelToggles, setPanelToggles, rowIndex, panelIndex})) : null
                                    }
                                    {
                                        columns.map((column, index) => Mui5Cell({column, row, index}))
                                    }
                                </TableRow>
                                {
                                    detailPanel ? detailPanel.map((panel, panelIndex) => {
                                        const rendered = panel.render(row, panelIndex);
                                        if (rendered) {
                                            const maybeRowStyle = options?.rowStyle;
                                            const rowStyle = (maybeRowStyle instanceof Function) ? maybeRowStyle(row, rowIndex) : maybeRowStyle;

                                            return (
                                                <TableRow sx={rowStyle} key={`table-row-detail-${rowIndex}`}>
                                                    <TableCell style={{paddingBottom: 0, paddingTop: 0}} colSpan={6}>
                                                        <Collapse in={getPanelToggle(panelToggles, rowIndex, panelIndex) } timeout="auto" unmountOnExit>
                                                            <Box sx={{margin: 1}}>
                                                                {rendered}
                                                            </Box>
                                                        </Collapse>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        } else {
                                            return null;
                                        }
                                    }) : null
                                }
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
        </React.Fragment>
    );
}