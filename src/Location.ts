import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { EventEmitter } from "@mkellsy/event-emitter";

import { Action } from "./Interfaces/Action";
import { Button } from "./Interfaces/Button";
import { Contact } from "./Devices/Contact";
import { Context } from "./Context";
import { Device } from "./Interfaces/Device";
import { DeviceState } from "./Interfaces/DeviceState";
import { DeviceType, parseDeviceType } from "./Interfaces/DeviceType";
import { Dimmer } from "./Devices/Dimmer";
import { Discovery } from "./Discovery";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";
import { Keypad } from "./Devices/Keypad";
import { Processor } from "./Devices/Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { Remote } from "./Devices/Remote";
import { Occupancy } from "./Devices/Occupancy";
import { Shade } from "./Devices/Shade";
import { Strip } from "./Devices/Strip";
import { Switch } from "./Devices/Switch";
import { Unknown } from "./Devices/Unknown";

const log = Logger.get("Location");

export class Location extends EventEmitter<{
    Identify: (device: Device) => void;
    Action: (device: Device, button: Button, action: Action) => void;
    Update: (device: Device, state: DeviceState) => void;
    Message: (response: Response) => void;
}> {
    private context: Context;

    private discovery: Discovery;
    private discovered: Map<string, Processor> = new Map();

    constructor() {
        super(Infinity);

        this.context = new Context();
        this.discovery = new Discovery();

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

    public discover(id: string): void {
        const processor = this.discovered.get(id);

        if (processor == null) {
            return;
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
                            const zone = processor.devices.get(((status as Leap.ZoneStatus).Zone || {}).href || "");
                            const occupancy = processor.devices.get(`/occupancy/${(status.href || "").split("/")[2]}`);

                            if (zone != null) {
                                zone.update(status as Leap.ZoneStatus);
                            }

                            if (occupancy != null && (status as Leap.AreaStatus).OccupancyStatus != null) {
                                occupancy.update(status as Leap.AreaStatus);
                            }
                        }
                    });

                    processor.log.info(
                        `discovered ${Colors.green([...processor.devices.keys()].length.toString())} devices`
                    );
                });
            })
            .catch(log.error);
    }

    public onDiscovered = (host: ProcessorAddress): void => {
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
            .then(() => this.discover(host.id))
            .catch((error) => log.error(Colors.red(error.message)));
    };

    private onDeviceUpdate = (device: Device, state: DeviceState): void => {
        this.emit("Update", device, state);
    };

    private onDeviceAction = (device: Device, button: Button, action: Action): void => {
        this.emit("Action", device, button, action);
    };

    private async discoverZones(processor: Processor, area: Leap.Area): Promise<void> {
        if (!area.IsLeaf) {
            return;
        }

        const zones = await processor.zones(area);

        for (const zone of zones) {
            const device = this.createDevice(processor, area, zone)
                .on("Update", this.onDeviceUpdate)
                .on("Action", this.onDeviceAction);

            processor.devices.set(zone.href, device);

            this.emit("Identify", device);
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

                if (!this.isAddressable(position)) {
                    continue;
                }

                const type = parseDeviceType(position.DeviceType);
                const address = type === DeviceType.Occupancy ? `/occupancy/${area.href.split("/")[2]}` : position.href;

                const device = this.createDevice(processor, area, {
                    ...position,
                    Name: `${area.Name} ${control.Name} ${position.Name}`,
                })
                    .on("Update", this.onDeviceUpdate)
                    .on("Action", this.onDeviceAction);

                processor.devices.set(address, device);

                this.emit("Identify", device);
            }
        }

        return;
    }

    private isAddressable(device: Leap.Device): boolean {
        if (device.AddressedState !== "Addressed") {
            return false;
        }

        switch (device.DeviceType) {
            case "Pico2Button":
            case "Pico3Button":
            case "Pico4Button":
            case "Pico3ButtonRaiseLower":
                return true;

            case "SunnataKeypad":
            case "SunnataHybridKeypad":
                return true;

            case "RPSCeilingMountedOccupancySensor":
                return true;

            default:
                return false;
        }
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
                return new Occupancy(processor, area, {
                    href: `/occupancy/${area.href.split("/")[2]}`,
                    Name: definition.Name,
                } as Leap.Device);

            default:
                return new Unknown(processor, area, definition);
        }
    }
}
