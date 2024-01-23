import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { createSecureContext } from "tls";
import { EventEmitter } from "@mkellsy/event-emitter";

import { AuthContext } from "./Interfaces/AuthContext";
import { Contact } from "./Devices/Contact";
import { Device } from "./Device";
import { DeviceResponse } from "./Interfaces/DeviceResponse";
import { DeviceType, parseDeviceType } from "./Interfaces/DeviceType";
import { Dimmer } from "./Devices/Dimmer";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";
import { Keypad } from "./Devices/Keypad";
import { Processor } from "./Devices/Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { Remote } from "./Devices/Remote";
import { Occupancy } from "./Devices/Occupancy";
import { Shade } from "./Devices/Shade";
import { Strip } from "./Devices/Strip";
import { Switch } from "./Devices/Switch";

const log = Logger.get("Location");

export class Location extends EventEmitter<{
    Update: (topic: string, status: string | number | boolean) => void;
    Message: (response: Response) => void;
}> {
    private devices: Map<string, Device> = new Map();
    private processors: Map<string, Processor> = new Map();

    constructor() {
        super(Infinity);
    }

    public processor(id: string): Processor | undefined {
        return this.processors.get(id);
    }

    public close(): void {
        for (const processor of this.processors.values()) {
            processor.close();
        }

        this.processors.clear();
    }

    public async connect(processor: ProcessorAddress, credentials: AuthContext) {
        const host = processor.addresses.find((address) => address.family === HostAddressFamily.IPv4);
        const initialized = this.processors.has(processor.id);

        const connection = new Leap.Connection(
            host != null ? host.address : processor.addresses[0].address,
            8081,
            createSecureContext({
                ca: credentials.ca,
                key: credentials.key,
                cert: credentials.cert,
            })
        );

        if (initialized) {
            this.processors.get(processor.id)?.reconfigure(connection);
        } else {
            this.processors.set(processor.id, new Processor(processor.id, connection));
        }

        log.info(`Processor ${Colors.dim(processor.id)} connecting ${Colors.green(host != null ? host.address : processor.addresses[0].address)}`);

        if (!initialized) {
            this.discover(processor.id);
        }
    }

    public async discover(id: string): Promise<void> {
        const processor = this.processors.get(id);

        if (processor == null) {
            return;
        }

        return Promise.all([processor.system(), processor.project(), processor.areas()])
            .then(([system, project, areas]) => {
                const version = system.FirmwareImage.Firmware.DisplayName;

                const devices: Leap.Device[] = [];
                const waits: Promise<void>[] = [];

                processor.log.info(`firmware ${version}`);
                processor.log.info(project.ProductType);

                processor.subscribe<Leap.ZoneStatus[]>({ href: "/zone/status" }, this.onZoneUpdate());
                processor.subscribe<Leap.AreaStatus[]>({ href: "/area/status" }, this.onAreaUpdate());

                for (const area of areas) {
                    waits.push(
                        new Promise((resolve) => {
                            this.discoverZones(processor, area)
                                .then((results) => {
                                    devices.push(...results);
                                })
                                .finally(() => resolve());
                        })
                    );

                    waits.push(
                        new Promise((resolve) => {
                            this.discoverControls(processor, area)
                                .then((results) => {
                                    devices.push(...results);
                                })
                                .finally(() => resolve());
                        })
                    );
                }

                Promise.all(waits).then(() => {
                    processor.statuses().then((statuses) => {
                        for (const status of statuses) {
                            const zone = this.devices.get(((status as Leap.ZoneStatus).Zone || {}).href || "");
                            const occupancy = this.devices.get(`/occupancy/${(status.href || "").split("/")[2]}`);

                            if (zone != null) {
                                zone.update(status as Leap.ZoneStatus);
                            }

                            if (occupancy != null && (status as Leap.AreaStatus).OccupancyStatus != null) {
                                occupancy.update(status as Leap.AreaStatus);
                            }
                        }
                    });

                    processor.log.info(`discovered ${Colors.green([...this.devices.keys()].length.toString())} devices`);
                });
            })
            .catch(log.error);
    }

    private onZoneUpdate(): (response: Leap.ZoneStatus[]) => void {
        return (statuses: Leap.ZoneStatus[]): void => {
            for (const status of statuses) {
                const device = this.devices.get(status.Zone.href);

                if (device != null) {
                    device.update(status);
                }
            }
        };
    }

    private onAreaUpdate(): (response: Leap.AreaStatus[]) => void {
        return (statuses: Leap.AreaStatus[]): void => {
            for (const status of statuses) {
                const occupancy = this.devices.get(`/occupancy/${status.href.split("/")[2]}`);

                if (occupancy != null && status.OccupancyStatus != null) {
                    occupancy.update(status);
                }
            }
        };
    }

    private onDeviceUpdate(): (response: DeviceResponse) => void {
        return (response: DeviceResponse): void => {
            const topic = `${response.area.toLowerCase().replace(/ /gi, "-")}/get/${response.id}/${response.statusType.toUpperCase()}`;
            const status = response.status;

            log.debug(`Publish ${Colors.dim(topic)} ${Colors.green(String(status))}`);

            this.emit("Update", topic, status);
        };
    }

    private async discoverZones(processor: Processor, area: Leap.Area): Promise<Leap.Device[]> {
        if (!area.IsLeaf) {
            return [];
        }

        const devices: Leap.Device[] = [];
        const zones = await processor.zones(area);

        for (const zone of zones) {
            this.devices.set(zone.href, this.createDevice(processor, area, zone).on("Update", this.onDeviceUpdate()));
        }

        return devices;
    }

    private async discoverControls(processor: Processor, area: Leap.Area): Promise<Leap.Device[]> {
        if (!area.IsLeaf) {
            return [];
        }

        const devices: Leap.Device[] = [];
        const controls = await processor.controls(area);

        for (const control of controls) {
            if (control.AssociatedGangedDevices == null) {
                continue;
            }

            for (const gangedDevice of control.AssociatedGangedDevices) {
                const position = await processor.device(gangedDevice.Device);

                if (position.AddressedState !== "Addressed") {
                    continue;
                }

                const type = parseDeviceType(position.DeviceType);

                this.devices.set(
                    type === DeviceType.Occupancy ? `/occupancy/${area.href.split("/")[2]}` : position.href,
                    this.createDevice(processor, area, position).on("Update", this.onDeviceUpdate())
                );
            }
        }

        return devices;
    }

    private createDevice(processor: Processor, area: Leap.Area, definition: any): Device {
        const type = parseDeviceType(definition.ControlType || definition.DeviceType);

        switch (type) {
            case DeviceType.Dimmer:
                return new Dimmer(processor, area, definition);

            case DeviceType.Switch:
                return new Switch(processor, area, definition);

            case DeviceType.Contact:
                return new Contact(processor, area, definition);

            case DeviceType.Strip:
                return new Strip(processor, area, definition);

            case DeviceType.Remote:
                return new Remote(processor, area, definition);

            case DeviceType.Keypad:
                return new Keypad(processor, area, definition);

            case DeviceType.Shade:
                return new Shade(processor, area, definition);

            case DeviceType.Occupancy:
                return new Occupancy(processor, area, { href: `/occupancy/${area.href.split("/")[2]}`, Name: definition.Name } as Leap.Device);

            default:
                return new Device(DeviceType.Unknown, processor, area, definition);
        }
    }
}