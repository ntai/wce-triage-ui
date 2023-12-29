import React from "react";
import {sweetHome} from '../../looseend/home';
import "../commands/commands.css";
import Mui5Table from "./Mui5Table";
import OperationProgressBar from './OperationProgressBar';
import DiskDetails from "./DiskDetails";
import {DeviceSelectionType, DiskType, ItemType, RunReportType, WipeType} from "../common/types";
import UsbIcon from '@mui/icons-material/Usb';
import Box from "@mui/material/Box";
import {Socket, io} from "socket.io-client";

type DisksPropsType = {
    diskSelectionChanged: (selected: DeviceSelectionType<DiskType>, clicked?: DiskType) => void;
    running: boolean;
    resetting: boolean;
    did_reset: () => void;
    maxSelected: number;
    selected: DeviceSelectionType<DiskType>;
    runningStatus?: RunReportType;
};

type DisksStateType = {
    /* Raw disks */
    disks: DiskType[];
    /* Disk table - page 1 always */
    diskPages: number;
    /* Fetching list of disks */
    diskStatusLoading: boolean;

    /* disk loading update sequence number */
    sequenceNumber?: number;

    /* Mounted disks */
    mounted: DeviceSelectionType<boolean>;

    /* Wipe options */
    wipeOptions: ItemType[];
    wipeOptionsLoading: boolean;
};


export default class Disks extends React.Component<DisksPropsType, DisksStateType> {
    constructor(props: any) {
        super(props);
        this.state = {
            /* Raw disks */
            disks: [],
            /* Disk table - page 1 always */
            diskPages: 1,

            /* Fetching list of disks */
            diskStatusLoading: true,

            /* disk loading update sequence number */
            sequenceNumber: undefined,

            /* Mounted disks */
            mounted: {},

            /* Wipe options */
            wipeOptions: [],
            wipeOptionsLoading: true,
        };

        this.fetchDisks = this.fetchDisks.bind(this);
    }


    fetchDisks() {
        // Whenever the table model changes, or the user sorts or changes pages, this method gets called and passed the current table model.
        // You can set the `loading` prop of the table to true to use the built-in one or show you're own loading bar if you want.
        this.setState({diskStatusLoading: true});
        // Request the data however you want.  Here, we'll use our mocked service we created earlier

        fetch(sweetHome.backendUrl + "/dispatch/disks")
            .then(reply => reply.json())
            .then(res => {
                // Now just get the rows of disks to your React Table (and update anything else like total pages or loading)
                let mounted: DeviceSelectionType<boolean> = {};
                let selected: DeviceSelectionType<DiskType> = {};
                let disk: DiskType;
                for (disk of res.disks) {
                    mounted[disk.deviceName] = disk.mounted;
                }
                this.setState({
                    disks: res.disks,
                    mounted: mounted
                });
                this.props.diskSelectionChanged(selected);
            })
            .finally(() => {
                this.setState({diskStatusLoading: false})
            });
    }

    fetchWipeOptions() {
        this.setState({wipeOptionsLoading: true});
        // Request the data however you want.  Here, we'll use our mocked service we created earlier

        fetch(sweetHome.backendUrl + "/dispatch/wipe-types")
            .then(reply => reply.json())
            .then(res => {
                const wipeOptions = res.wipeTypes.map((rt: WipeType) => ({label: rt.name, value: rt.id}));
                this.setState({wipeOptions: wipeOptions, wipeOptionsLoading: false});
            });
    }


    componentDidMount() {
        this.fetchWipeOptions();
        this.fetchDisks();
        const wock:Socket = io(sweetHome.websocketUrl);
        wock.on("disks", this.onDiskUpdate.bind(this));
    }

    onReset() {
        this.setState({
            /* Raw disks */
            disks: [],
            /* Fetching list of disks */
            diskStatusLoading: true,

            /* Mounted disks */
            mounted: {},

            /* available wipeOptions */
            wipeOptions: [],

        });
        this.fetchDisks();
        this.props.did_reset();
    }

    onDiskUpdate() {
        console.log("disk event!")
        this.onReset();
    }

    componentDidUpdate() {
        let disk: DiskType;
        let disks: DiskType[] = JSON.parse(JSON.stringify(this.state.disks));
        let target_update = false;

        if (this.props.resetting)
            this.onReset();

        for (disk of disks) {
            const is_target = this.props.selected[disk.deviceName] ? 1 : 0;
            if (disk['target'] !== is_target) {
                target_update = true;
                break;
            }
        }

        if (target_update) {
            for (disk of disks) {
                disk['target'] = this.props.selected[disk.deviceName] ? 1 : 0;
            }
            this.setState({disks: disks});
        } else {
            if (this.props.runningStatus === undefined) {
                return;
            }

            if (this.state.sequenceNumber === this.props.runningStatus._sequence_)
                return;

            this.setState({sequenceNumber: this.props.runningStatus._sequence_});

            if (this.props.runningStatus.device && this.props.runningStatus.runEstimate && this.props.runningStatus.runTime) {
                const devname = this.props.runningStatus.device;
                const runTime = this.props.runningStatus.runTime;
                const runEstimate = this.props.runningStatus.runEstimate;
                const runMessage = this.props.runningStatus.runMessage;
                for (disk of disks) {
                    if (disk.deviceName === devname) {
                        // Little trick to show "some" progress if run time is smol and run estimate is big.
                        // cuz, after rounded, it can be zero and no visible bar on the screen and that's annoying.
                        if (this.props.runningStatus.runStatus === "Preflight")
                            disk.progress = 0;
                        if (this.props.runningStatus.runStatus === "Running")
                            disk.progress = Math.max(runTime > 0 ? 1 : 0, Math.min(99, Math.round(runTime / runEstimate * 100)));
                        if (this.props.runningStatus.runStatus === "Success")
                            disk.progress = 100;
                        if (this.props.runningStatus.runStatus === "Failed")
                            disk.progress = 999;

                        disk.runEstimate = runEstimate;
                        disk.runTime = runTime;
                        disk.runMessage = runMessage;
                        break;
                    }
                }
            }
            this.setState({disks: disks});
        }
    }

    setNewSelection(rowIndex: number | "all", selected: boolean) {
        const disks: DiskType[] = JSON.parse(JSON.stringify(this.state.disks));
        let selectedDisk = undefined;

        if (rowIndex === "all") {
            for (let disk of disks) {
                if (!disk.mounted)
                    disk.target = selected ? 1 : 0;
                else
                    disk.target = 0;
            }
        } else {
            selectedDisk = disks[rowIndex];
            if (!selectedDisk.mounted)
                selectedDisk.target = selected ? 1 : 0;
        }
        const selections: DeviceSelectionType<DiskType> = {};
        for (let disk of disks) {
            if (disk.target)
                selections[disk.deviceName] = disk;
        }
        this.props.diskSelectionChanged(selections, selectedDisk);
    }

    isRowSelected(rowIndex: number): boolean {
        return this.state.disks[rowIndex].target === 1;
    }

    totalSelected(): number {
        return this.state.disks.reduce((count, disk) => disk.target ? count + 1 : count, 0);
    }

    totalSelectables(): number {
        return Math.min(this.props.maxSelected, this.state.disks.reduce((count, disk) => disk.mounted ? count: count+1, 0));
    }

    requestUnmountDisk(deviceName: string, mountState: boolean) {
        // Request the data however you want.  Here, we'll use our mocked service we created earlier
        fetch(sweetHome.backendUrl + "/dispatch/unmount?deviceName=" + deviceName + "&mount=" + mountState,
            {method: "POST"})
            .then(reply => {
                this.onReset();
            });
    }

    render() {
        const {disks, diskStatusLoading} = this.state;

        return (
            <React.Fragment>
                <Mui5Table<DiskType>
                    style={{marginTop: 0, marginBottom: 1, marginLeft: 0, marginRight: 0}}
                    onSelectionChange={this.setNewSelection.bind(this)}
                    isSelected={this.isRowSelected.bind(this)}
                    totalSelections={this.totalSelected.bind(this)}
                    nSelectables={this.totalSelectables.bind(this)}
                    columns={[
                        {
                            title: "Disk",
                            render: (row, index) => row.deviceName,
                            cellStyle: {backgroundColor: '#eeeeee'},
                            headerStyle: {backgroundColor: '#eeeeee', width: 200}
                        },
                        {
                            title: "Mounted",
                            render: (row, index) => (<input
                                type="checkbox"
                                className="checkbox"
                                checked={this.state.mounted[row.deviceName] === true ? true : false}
                                onChange={() => this.requestUnmountDisk(row.deviceName, this.state.mounted[row.deviceName])}
                            />),
                            cellStyle: {width: 120, alignSelf: "center", verticalAlign: "middle"},
                            headerStyle: {},
                        },
                        {
                            title: "Bus",
                            render: (row, index) => row.bus === "usb" ? (<UsbIcon>USB</UsbIcon>) : "ATA",
                            cellStyle: {width: 70, textAlign: "center"},
                            headerStyle: {textAlign: "center"},
                        },
                        {
                            title: "Model",
                            render: (row, index) => row.model,
                            cellStyle: {width: 300},
                            headerStyle: {},
                        },
                        {
                            title: "Estimate",
                            render: (row, index) => `${row.runEstimate}`,
                            cellStyle: {width: 130, textAlign: 'right'},
                            headerStyle: {textAlign: 'right'},
                        },
                        {
                            title: "Elapsed",
                            render: (row, index) => `${row.runTime}`,
                            cellStyle: {width: 130, textAlign: 'right'},
                            headerStyle: {textAlign: 'right'},

                        },
                        {
                            title: "Status",
                            render: (row, index) => row.runMessage,
                            cellStyle: {width: 440},
                        },
                        {
                            title: 'Progress',
                            cellStyle: {
                                minWidth: 160,
                                paddingTop: 2, paddingBottom: 2,
                            },
                            render: (row, index) => (<OperationProgressBar value={row.progress}/>)
                        }
                    ]}
                    rows={disks}
                    isLoading={diskStatusLoading} // Display the loading overlay when we need it
                    options={{
                        selection: true,
                        selectionProps: (rowData, index) => ({
                            disabled: rowData.mounted,
                            checked: rowData.target ? true : false
                        }),
                        rowStyle: (rowData, index) => ({
                            backgroundColor: rowData.target ? '#37b15933' : '',
                            paddingTop: 2,
                            paddingBottom: 2,
                        }),
                        paging: false,
                        draggable: false,
                        toolbar: false,
                        search: false,
                        showTitle: false,
                        detailPanelColumnAlignment: "left"
                    }}
                    detailPanel={[
                        {
                            render: (row, index) => (<DiskDetails disk={row}

                            />),
                        }
                    ]}
                />
            </React.Fragment>
        );
    }
}

