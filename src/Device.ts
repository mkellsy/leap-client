import * as Logger from "js-logger";
import Colors from "colors";

import { AreaDefinition, DeviceDefinition, ZoneDefinition } from "@mkellsy/leap";

import { DeviceState } from "./Interfaces/DeviceState";
import { DeviceType, parseDeviceType } from "./Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Device {
    private logger: Logger.ILogger;
    private processor: Processor;
    private isControl: boolean;

    private deviceId: string;
    private deviceHref: string;
    private deviceState: DeviceState;

    private deviceName: string;
    private deviceType: DeviceType;
    private deviceDefinition: DeviceDefinition | ZoneDefinition;
    private areaDefinition: AreaDefinition;

    constructor(processor: Processor, area: AreaDefinition, definition: DeviceDefinition | ZoneDefinition) {
        this.processor = processor;

        this.areaDefinition = area;
        this.deviceDefinition = definition;
        this.isControl = definition.href.indexOf("zone") === -1;
        this.deviceId = `${this.isControl ? "D" : "Z"}${definition.href.split("/").pop()}`;

        this.logger = Logger.get(`Device ${Colors.dim(this.id)}`);

        this.deviceHref = definition.href;
        this.deviceName = definition.Name;
        this.deviceType = parseDeviceType((definition as ZoneDefinition).ControlType || (definition as DeviceDefinition).DeviceType);

        this.deviceState = {
            state: "Unknown",
            availability: "Available",
        }

        this.getState();
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

    public get definition(): DeviceDefinition | ZoneDefinition {
        return this.deviceDefinition;
    }

    public get status(): DeviceState {
        return this.deviceState;
    }

    private async getState(): Promise<void> {
        if (!this.isControl) {
            const state  = await this.processor.status(this.definition as ZoneDefinition).catch((error) => this.log.debug(error.message));

            this.deviceState = {
                state: state?.SwitchedLevel || state?.CCOLevel || state?.Level != null ? state.Level > 0 ? "On" : "Off" : "Unknown",
                availability: state?.Availability || "Unknown",
                speed: state?.FanSpeed,
                level: state?.Level,
                tilt: state?.Tilt,
            }

            this.log.debug(`${this.area.Name} ${Colors.green(DeviceType[this.type])} ${Colors.dim(this.status.state)} ${this.name}`);
        } else {
            this.log.debug(`${this.area.Name} ${Colors.green(DeviceType[this.type])} ${this.name}`);
        }
    }
}
