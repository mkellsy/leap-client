import * as Logger from "js-logger";
import Colors from "colors";

import { AreaDefinition, DeviceDefinition, ZoneDefinition, ZoneStatus } from "@mkellsy/leap";

import { DeviceInterface } from "./Interfaces/DeviceInterface";
import { DeviceState } from "./Interfaces/DeviceState";
import { DeviceType } from "./Interfaces/DeviceType";
import { Processor } from "./Devices/Processor";

export class Device implements DeviceInterface {
    protected processor: Processor;
    protected deviceState: DeviceState;

    private logger: Logger.ILogger;
    private isControl: boolean;

    private deviceId: string;
    private deviceHref: string;

    private deviceName: string;
    private deviceType: DeviceType;
    private areaDefinition: AreaDefinition;

    constructor(type: DeviceType, processor: Processor, area: AreaDefinition, definition: DeviceDefinition | ZoneDefinition) {
        this.deviceType = type;
        this.processor = processor;

        this.areaDefinition = area;
        this.isControl = definition.href.indexOf("zone") === -1;
        this.deviceId = `${this.isControl ? "D" : "Z"}${definition.href.split("/").pop()}`;

        this.logger = Logger.get(`Device ${Colors.dim(this.id)}`);

        this.deviceHref = definition.href;
        this.deviceName = definition.Name;

        this.deviceState = {
            state: "Unknown",
            availability: "Available",
        }
    }

    public get id(): string {
        return this.deviceId;
    }

    public get name(): string {
        return this.deviceName;
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public get href(): string {
        return this.deviceHref;
    }

    public get type(): DeviceType {
        return this.deviceType;
    }

    public get area(): AreaDefinition {
        return this.areaDefinition;
    }

    public get status(): DeviceState {
        return this.deviceState;
    }

    public updateStatus(status: ZoneStatus): void {
        this.deviceState = {
            state: "Unknown",
            availability: status?.Availability || "Unknown",
        }
    }
}
