import * as Logger from "js-logger";

import Colors from "colors";
import { createSecureContext } from "tls";

import { AreaDefinition, Connection, DeviceDefinition, MultipleZoneStatus, Response, ZoneDefinition } from "@mkellsy/leap";
import { EventEmitter } from "@mkellsy/event-emitter";

import { AuthContext } from "./Interfaces/AuthContext";
import { Contact } from "./Devices/Contact";
import { Device } from "./Device";
import { DeviceType, parseDeviceType } from "./Interfaces/DeviceType";
import { Dimmer } from "./Devices/Dimmer";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";
import { Keypad } from "./Devices/Keypad";
import { Processor } from "./Devices/Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { Remote } from "./Devices/Remote";
import { Sensor } from "./Devices/Sensor";
import { Shade } from "./Devices/Shade";
import { Strip } from "./Devices/Strip";
import { Switch } from "./Devices/Switch";

const log = Logger.get("Platform");

export class Platform extends EventEmitter<{
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

    public async connectProcessor(processor: ProcessorAddress, credentials: AuthContext) {
        const host = processor.addresses.find((address) => address.family === HostAddressFamily.IPv4);
        const initialized = this.processors.has(processor.id);

        const connection = new Connection(
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

        log.info(
            `Processor ${Colors.dim(processor.id)} connecting ${Colors.green(
                host != null ? host.address : processor.addresses[0].address
            )}`
        );

        await connection.connect();

        if (!initialized) {
            this.discoverDevices(processor.id);
            this.processors.get(processor.id)?.on("Message", this.onMessage(processor.id));
        }
    }

    public async discoverDevices(id: string): Promise<void> {
        const processor = this.processors.get(id);

        if (processor == null) {
            return;
        }

        return Promise.all([processor.system(), processor.project(), processor.areas()])
            .then(([system, project, areas]) => {
                const version = system.FirmwareImage.Firmware.DisplayName;

                const devices: DeviceDefinition[] = [];
                const waits: Promise<void>[] = [];

                processor.log.info(`firmware ${version}`);
                processor.log.info(project.ProductType);

                processor.subscribe("/zone/status", this.onZoneUpdate());

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
                            const device = this.devices.get(status.Zone.href);

                            if (device != null) {
                                device.updateStatus(status);
                            }
                        }
                    });

                    processor.log.info(`discovered ${Colors.green([...this.devices.keys()].length.toString())} devices`);
                });
            })
            .catch(log.error);
    }

    private onZoneUpdate(): (response: Response) => void {
        return (response: Response): void => {
            if (response.Header.MessageBodyType === "MultipleZoneStatus") {
                const statuses = (response.Body! as MultipleZoneStatus).ZoneStatuses;

                for (const status of statuses) {
                    const device = this.devices.get(status.Zone.href);

                    if (device != null) {
                        device.updateStatus(status);
                    }
                }
            }
        };
    }

    private onMessage(id: string): (response: Response) => void {
        return (response: Response): void => {
            if (response.CommuniqueType === "UpdateResponse" && response.Header.Url === "/device/status/deviceheard") {
                setTimeout(() => this.discoverDevices(id), 30_000);

                return;
            }

            this.emit("Message", response);
        };
    }

    private async discoverZones(processor: Processor, area: AreaDefinition): Promise<DeviceDefinition[]> {
        if (!area.IsLeaf) {
            return [];
        }

        const devices: DeviceDefinition[] = [];
        const zones = await processor.zones(area);

        for (const zone of zones) {
            const device = this.createDevice(processor, area, zone);

            this.devices.set(device.href, device);
        }
        return devices;
    }

    private async discoverControls(processor: Processor, area: AreaDefinition): Promise<DeviceDefinition[]> {
        if (!area.IsLeaf) {
            return [];
        }

        const devices: DeviceDefinition[] = [];
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

                const device = this.createDevice(processor, area, position);

                this.devices.set(device.href, device);
            }
        }

        return devices;
    }

    private createDevice(processor: Processor, area: AreaDefinition, definition: any): Device {
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

            case DeviceType.Sensor:
                return new Sensor(processor, area, definition);

            default:
                return new Device(DeviceType.Unknown, processor, area, definition);
        }
    }
}
