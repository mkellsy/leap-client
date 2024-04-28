import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import {
    Action,
    Button,
    Device,
    DeviceType,
    DeviceState,
    HostAddressFamily
} from "@mkellsy/hap-device";

import { EventEmitter } from "@mkellsy/event-emitter";

import { Context } from "./Context";
import { createDevice } from "./Interfaces/Device";
import { isAddressable, parseDeviceType } from "./Interfaces/DeviceType";
import { Discovery } from "./Discovery";
import { Processor } from "./Devices/Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";

const log = Logger.get("Location");

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

    constructor(refresh?: boolean) {
        super(Infinity);

        this.context = new Context();
        this.discovery = new Discovery();
        this.refresh = refresh === true;

        this.discovery.on("Discovered", this.onDiscovered).search();
    }

    public get processors(): string[] {
        return [...this.discovered.keys()];
    }

    public processor(id: string): Processor | undefined {
        return this.discovered.get(id);
    }

    public close(): void {
        this.discovery.stop();

        for (const processor of this.discovered.values()) {
            processor.disconnect();
        }

        this.discovered.clear();
    }

    private async discoverZones(processor: Processor, area: Leap.Area): Promise<void> {
        if (!area.IsLeaf) {
            return;
        }

        const zones = await processor.zones(area);

        for (const zone of zones) {
            const device = createDevice(processor, area, zone)
                .on("Update", this.onDeviceUpdate)
                .on("Action", this.onDeviceAction);

            processor.devices.set(zone.href, device);
        }

        return;
    }

    private async discoverControls(processor: Processor, area: Leap.Area): Promise<void> {
        if (!area.IsLeaf) {
            return;
        }

        const controls = await processor.controls(area);

        for (const control of controls) {
            if (control.AssociatedGangedDevices == null) {
                continue;
            }

            for (const gangedDevice of control.AssociatedGangedDevices) {
                const position = await processor.device(gangedDevice.Device);

                if (!isAddressable(position)) {
                    continue;
                }

                const type = parseDeviceType(position.DeviceType);
                const address = type === DeviceType.Occupancy ? `/occupancy/${area.href.split("/")[2]}` : position.href;

                const device = createDevice(processor, area, {
                    ...position,
                    Name: `${area.Name} ${control.Name} ${position.Name}`,
                })
                    .on("Update", this.onDeviceUpdate)
                    .on("Action", this.onDeviceAction);

                processor.devices.set(address, device);
            }
        }

        return;
    }

    private onDiscovered = (host: ProcessorAddress): void => {
        this.discovered.delete(host.id);

        if (!this.context.has(host.id)) {
            return;
        }

        const ip = host.addresses.find((address) => address.family === HostAddressFamily.IPv4) || host.addresses[0];
        const processor = new Processor(host.id, new Leap.Connection(ip.address, this.context.get(host.id)));

        this.discovered.set(host.id, processor);

        processor.log.info(`Host ${Colors.green(ip.address)}`);

        processor
            .connect()
            .then(() => {
                if (this.refresh) {
                    processor.clear();
                }

                Promise.all([processor.system(), processor.project(), processor.areas()])
                    .then(([system, project, areas]) => {
                        const version = system?.FirmwareImage.Firmware.DisplayName;

                        const waits: Promise<void>[] = [];

                        processor.log.info(`Firmware ${Colors.green(version || "Unknown")}`);
                        processor.log.info(project.ProductType);

                        processor.subscribe<Leap.ZoneStatus[]>(
                            { href: "/zone/status" },
                            (statuses: Leap.ZoneStatus[]): void => {
                                for (const status of statuses) {
                                    const device = processor.devices.get(status.Zone.href);

                                    if (device != null) {
                                        device.update(status);
                                    }
                                }
                            }
                        );

                        processor.subscribe<Leap.AreaStatus[]>(
                            { href: "/area/status" },
                            (statuses: Leap.AreaStatus[]): void => {
                                for (const status of statuses) {
                                    const occupancy = processor.devices.get(`/occupancy/${status.href.split("/")[2]}`);

                                    if (occupancy != null && status.OccupancyStatus != null) {
                                        occupancy.update(status);
                                    }
                                }
                            }
                        );

                        for (const area of areas) {
                            waits.push(
                                new Promise((resolve) => {
                                    this.discoverZones(processor, area)
                                        .catch((error) => log.error(Colors.red(error.message)))
                                        .finally(() => resolve());
                                })
                            );

                            waits.push(
                                new Promise((resolve) => {
                                    this.discoverControls(processor, area)
                                        .catch((error) => log.error(Colors.red(error.message)))
                                        .finally(() => resolve());
                                })
                            );
                        }

                        Promise.all(waits).then(() => {
                            processor.statuses().then((statuses) => {
                                for (const status of statuses) {
                                    const zone = processor.devices.get(
                                        ((status as Leap.ZoneStatus).Zone || {}).href || ""
                                    );
                                    const occupancy = processor.devices.get(
                                        `/occupancy/${(status.href || "").split("/")[2]}`
                                    );

                                    if (zone != null) {
                                        zone.update(status as Leap.ZoneStatus);
                                    }

                                    if (occupancy != null && (status as Leap.AreaStatus).OccupancyStatus != null) {
                                        occupancy.update(status as Leap.AreaStatus);
                                    }
                                }
                            });

                            processor.log.info(`discovered ${Colors.green([...processor.devices.keys()].length.toString())} devices`);

                            this.emit("Available", [...processor.devices.values()]);
                        });
                    })
                    .catch((error) => log.error(Colors.red(error.message)));
            })
            .catch((error) => log.error(Colors.red(error.message)));
    };

    private onDeviceUpdate = (device: Device, state: DeviceState): void => {
        this.emit("Update", device, state);
    };

    private onDeviceAction = (device: Device, button: Button, action: Action): void => {
        this.emit("Action", device, button, action);
    };
}
