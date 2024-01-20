import * as Logger from "js-logger";

import Colors from "colors";
import { createSecureContext } from "tls";

import { AreaDefinition, Connection, DeviceDefinition, Response } from "@mkellsy/leap";
import { EventEmitter } from "@mkellsy/event-emitter";

import { Device } from "./Device";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";
import { Processor } from "./Processor";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { AuthContext } from "./Interfaces/AuthContext";

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
            this.processors.get(processor.id)?.on("Message", this.onMessage());
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
                    processor.log.info(`discovered ${Colors.green([...this.devices.keys()].length.toString())} devices`);
                });
            })
            .catch(log.error);
    }

    private onMessage(): (id: string, response: Response) => void {
        return (id: string, response: Response): void => {
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
            const device = new Device(processor, area, zone);

            this.devices.set(device.id, device);
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

                const device = new Device(processor, area, position);

                this.devices.set(device.id, device);
            }
        }

        return devices;
    }
}
