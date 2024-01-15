import * as Logger from "js-logger";

import Colors from "colors";
import { createSecureContext } from "tls";

import { Connection } from "@mkellsy/leap";
import { EventEmitter } from "@mkellsy/event-emitter";

import { HostAddressFamily } from "../Interfaces/HostAddressFamily";
import { PlatformEvents } from "./PlatformEvents";
import { Processor } from "./Processor";
import { ProcessorAddress } from "../Interfaces/ProcessorAddress";
import { AuthContext } from "../Interfaces/AuthContext";

const log = Logger.get("Platform");

export class Platform extends EventEmitter<PlatformEvents> {
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

        log.info(`Processor ${Colors.dim(processor.id)} connecting`);

        await connection.connect();

        if (!initialized) {
            this.discoverDevices(processor.id);
        }
    }

    public async discoverDevices(id: string): Promise<void> {
        const processor = this.processors.get(id);

        if (processor == null) {
            return;
        }

        return Promise.all([processor.getProcessorInfo(), processor.getProject(), processor.getAreas()])
            .then(([processorInfo, project, areas]) => {
                const type = processorInfo.DeviceType;
                const version = processorInfo.FirmwareImage.Firmware.DisplayName;

                log.info(`${type} ${Colors.dim(id)} firmware ${version}`);
                log.info(project.ProductType);

                for (const area of areas) {
                    if (area.IsLeaf) {
                        continue;
                    }

                    log.info(area.Name);
                }
            })
            .catch(log.error);
    }
}
