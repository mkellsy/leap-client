import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import {
    Action,
    Address,
    AreaStatus,
    Button,
    Device,
    DeviceType,
    DeviceState,
    HostAddressFamily,
    TimeclockStatus,
    ZoneStatus,
} from "@mkellsy/hap-device";

import { EventEmitter } from "@mkellsy/event-emitter";

import { Context } from "./Context";
import { createDevice } from "./Interfaces/Device";
import { isAddressable, parseDeviceType } from "./Interfaces/DeviceType";
import { Discovery } from "./Discovery";
import { Processor } from "./Devices/Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";

const log = Logger.get("Location");

/**
 * Creates an object that represents a single location, with a single network.
 */
export class Location extends EventEmitter<{
    Action: (device: Device, button: Button, action: Action) => void;
    Available: (devices: Device[]) => void;
    Message: (response: Response) => void;
    Update: (device: Device, state: DeviceState) => void;
}> {
    private context: Context;
    private refresh: boolean;

    private discovery: Discovery;
    private discovered: Map<string, Processor> = new Map();

    /**
     * Creates a location object and starts mDNS discovery.
     *
     * ```js
     * const location = new Location();
     *
     * location.on("Avaliable", (devices: Device[]) => {  });
     * ```
     *
     * @param refresh If true, this will ignore any cache and reload.
     */
    constructor(refresh?: boolean) {
        super(Infinity);

        this.context = new Context();
        this.discovery = new Discovery();
        this.refresh = refresh === true;

        this.discovery.on("Discovered", this.onDiscovered).search();
    }

    /**
     * A list of processors in this location.
     *
     * @returns A string array of processor ids.
     */
    public get processors(): string[] {
        return [...this.discovered.keys()];
    }

    /**
     * Fetch a processor from this location.
     *
     * @param id The processor id to fetch.
     *
     * @returns A processor object or undefined if it doesn't exist.
     */
    public processor(id: string): Processor | undefined {
        return this.discovered.get(id);
    }

    /**
     * Closes all connections for a location and stops searching.
     */
    public close(): void {
        this.discovery.stop();

        for (const processor of this.discovered.values()) {
            processor.disconnect();
        }

        this.discovered.clear();
    }

    /*
     * Discovers all available zones on this processor. In other systems this
     * is the device.
     */
    private discoverZones(processor: Processor, area: Leap.Area): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!area.IsLeaf) {
                return resolve();
            }

            processor
                .zones(area)
                .then((zones) => {
                    for (const zone of zones) {
                        const device = createDevice(processor, area, zone)
                            .on("Update", this.onDeviceUpdate)
                            .on("Action", this.onDeviceAction);

                        processor.devices.set(zone.href, device);
                    }

                    resolve();
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Discovers all available timeclocks. Timeclocks are schedules, and
     * sometimes are used as vurtual switches.
     */
    private discoverTimeclocks(processor: Processor): Promise<void> {
        return new Promise((resolve, reject) => {
            processor
                .timeclocks()
                .then((timeclocks) => {
                    for (const timeclock of timeclocks) {
                        const device = createDevice(
                            processor,
                            {
                                href: timeclock.href,
                                Name: timeclock.Name,
                                ControlType: "Timeclock",
                                Parent: timeclock.Parent,
                                IsLeaf: true,
                                AssociatedZones: [],
                                AssociatedControlStations: [],
                                AssociatedOccupancyGroups: [],
                            },
                            { ...timeclock, ControlType: "Timeclock" },
                        ).on("Update", this.onDeviceUpdate);

                        processor.devices.set(timeclock.href, device);
                    }

                    resolve();
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Discovers all keypads and remotes. These are ganged devices.
     */
    private discoverControls(processor: Processor, area: Leap.Area): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!area.IsLeaf) {
                return resolve();
            }

            processor
                .controls(area)
                .then((controls) => {
                    for (const control of controls) {
                        this.discoverPositions(processor, control)
                            .then((positions) => {
                                for (const position of positions) {
                                    const type = parseDeviceType(position.DeviceType);

                                    const address =
                                        type === DeviceType.Occupancy
                                            ? `/occupancy/${area.href.split("/")[2]}`
                                            : position.href;

                                    const device = createDevice(processor, area, {
                                        ...position,
                                        Name: `${area.Name} ${control.Name} ${position.Name}`,
                                    })
                                        .on("Update", this.onDeviceUpdate)
                                        .on("Action", this.onDeviceAction);

                                    processor.devices.set(address, device);
                                }

                                resolve();
                            })
                            .catch((error) => reject(error));
                    }
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Discovers individual positions in a control station. Represents a single
     * keypad or remote in a gang.
     */
    private discoverPositions(processor: Processor, control: Leap.ControlStation): Promise<Leap.Device[]> {
        return new Promise((resolve, reject) => {
            if (control.AssociatedGangedDevices == null) {
                return resolve([]);
            }

            const waits: Promise<Leap.Device>[] = [];

            for (const gangedDevice of control.AssociatedGangedDevices) {
                waits.push(processor.device(gangedDevice.Device));
            }

            Promise.all(waits)
                .then((positions) => {
                    resolve(positions.filter((position) => isAddressable(position)));
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Creates a connection when mDNS finds a processor.
     */
    private onDiscovered = (host: ProcessorAddress): void => {
        this.discovered.delete(host.id);

        if (!this.context.has(host.id)) {
            return;
        }

        const ip = host.addresses.find((address) => address.family === HostAddressFamily.IPv4) || host.addresses[0];
        const processor = new Processor(host.id, new Leap.Connection(ip.address, this.context.get(host.id)));

        this.discovered.set(host.id, processor);

        processor.log.info(`Host ${Colors.green(ip.address)}`);

        processor.on("Connect", () => {
            if (this.refresh) {
                processor.clear();
            }

            Promise.all([processor.system(), processor.project(), processor.areas()])
                .then(([system, project, areas]) => {
                    const version = system?.FirmwareImage.Firmware.DisplayName;
                    const type = system?.DeviceType;
                    const waits: Promise<void>[] = [];

                    processor.log.info(`Firmware ${Colors.green(version || "Unknown")}`);
                    processor.log.info(project.ProductType);

                    processor
                        .subscribe<ZoneStatus[]>({ href: "/zone/status" }, (statuses: ZoneStatus[]): void => {
                            for (const status of statuses) {
                                const device = processor.devices.get(status.Zone.href);

                                if (device != null) {
                                    device.update(status);
                                }
                            }
                        })
                        .catch((error) => log.error(Colors.red(error.message)));

                    processor
                        .subscribe<AreaStatus[]>({ href: "/area/status" }, (statuses: AreaStatus[]): void => {
                            for (const status of statuses) {
                                const occupancy = processor.devices.get(`/occupancy/${status.href.split("/")[2]}`);

                                if (occupancy != null && status.OccupancyStatus != null) {
                                    occupancy.update(status);
                                }
                            }
                        })
                        .catch((error) => log.error(Colors.red(error.message)));

                    if (type === "RadioRa3Processor") {
                        processor
                            .subscribe<TimeclockStatus[]>(
                                { href: "/timeclock/status" },
                                (statuses: TimeclockStatus[]): void => {
                                    for (const status of statuses) {
                                        const device = processor.devices.get(
                                            (status as TimeclockStatus & { Timeclock: Address }).Timeclock.href,
                                        );

                                        if (device != null) {
                                            device.update(status);
                                        }
                                    }
                                },
                            )
                            .catch((error) => log.error(Colors.red(error.message)));
                    }

                    for (const area of areas) {
                        waits.push(
                            new Promise((resolve) => {
                                this.discoverZones(processor, area)
                                    .catch((error) => log.error(Colors.red(error.message)))
                                    .finally(() => resolve());
                            }),
                        );

                        waits.push(
                            new Promise((resolve) => {
                                this.discoverControls(processor, area)
                                    .catch((error) => log.error(Colors.red(error.message)))
                                    .finally(() => resolve());
                            }),
                        );
                    }

                    if (type === "RadioRa3Processor") {
                        waits.push(
                            new Promise((resolve) => {
                                this.discoverTimeclocks(processor)
                                    .catch((error) => log.error(Colors.red(error.message)))
                                    .finally(() => resolve());
                            }),
                        );
                    }

                    Promise.all(waits).then(() => {
                        processor.statuses(type).then((statuses) => {
                            for (const status of statuses) {
                                const zone = processor.devices.get(((status as ZoneStatus).Zone || {}).href || "");

                                const occupancy = processor.devices.get(
                                    `/occupancy/${(status.href || "").split("/")[2]}`,
                                );

                                if (zone != null) {
                                    zone.update(status as ZoneStatus);
                                }

                                if (occupancy != null && (status as AreaStatus).OccupancyStatus != null) {
                                    occupancy.update(status as AreaStatus);
                                }
                            }
                        });

                        processor.log.info(
                            `discovered ${Colors.green([...processor.devices.keys()].length.toString())} devices`,
                        );

                        this.emit("Available", [...processor.devices.values()]);
                    });
                })
                .catch((error) => log.error(Colors.red(error.message)));
        });

        processor.connect().catch((error) => log.error(Colors.red(error.message)));
    };

    /*
     * When a device updates, this will emit an update event.
     */
    private onDeviceUpdate = (device: Device, state: DeviceState): void => {
        this.emit("Update", device, state);
    };

    /*
     * When a control station emits an action, this will emit an action event.
     * This is when a button is pressed on a keypad or remote.
     */
    private onDeviceAction = (device: Device, button: Button, action: Action): void => {
        this.emit("Action", device, button, action);
    };
}
