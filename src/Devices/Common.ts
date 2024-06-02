import * as Logger from "js-logger";
import * as Interfaces from "@mkellsy/hap-device";

import Colors from "colors";

import { EventEmitter } from "@mkellsy/event-emitter";
import { Processor } from "./Processor";

export abstract class Common extends EventEmitter<{
    Action: (device: Interfaces.Device, button: Interfaces.Button, action: Interfaces.Action) => void;
    Update: (device: Interfaces.Device, state: Interfaces.DeviceState) => void;
}> {
    protected processor: Processor;
    protected state: Interfaces.DeviceState;
    protected fields: Map<string, Interfaces.Capability> = new Map();

    private logger: Logger.ILogger;

    private deviceName: string;
    private deviceAddress: string;
    private deviceArea: Interfaces.Area;
    private deviceType: Interfaces.DeviceType;

    constructor(
        type: Interfaces.DeviceType,
        processor: Processor,
        area: Interfaces.Area,
        definition: { href: string; Name: string },
    ) {
        super();

        this.processor = processor;
        this.deviceAddress = definition.href;
        this.deviceName = definition.Name;
        this.deviceArea = area;
        this.deviceType = type;

        this.logger = Logger.get(`Device ${Colors.dim(this.id)}`);
        this.state = { state: "Unknown" };
    }

    public get manufacturer(): string {
        return "Lutron Electronics Co., Inc";
    }

    public get id(): string {
        return `LEAP-${this.processor.id}-${Interfaces.DeviceType[this.deviceType].toUpperCase()}-${this.deviceAddress.split("/")[2]}`;
    }

    public get name(): string {
        return this.deviceName;
    }

    public get room(): string {
        return this.area.Name;
    }

    public get capabilities(): { [key: string]: Interfaces.Capability } {
        return Object.fromEntries(this.fields);
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public get address(): Interfaces.Address {
        return { href: this.deviceAddress };
    }

    public get type(): Interfaces.DeviceType {
        return this.deviceType;
    }

    public get area(): Interfaces.Area {
        return this.deviceArea;
    }

    public get status(): Interfaces.DeviceState {
        return this.state;
    }
}
