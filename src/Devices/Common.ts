import * as Logger from "js-logger";

import Colors from "colors";

import { Address, Area } from "@mkellsy/leap";
import { EventEmitter } from "@mkellsy/event-emitter";

import { Action } from "../Interfaces/Action";
import { Button } from "../Interfaces/Button";
import { Device } from "../Interfaces/Device";
import { DeviceState } from "../Interfaces/DeviceState";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export abstract class Common extends EventEmitter<{
    Action: (device: Device, button: Button, action: Action) => void;
    Update: (device: Device, state: DeviceState) => void;
}> {
    protected processor: Processor;
    protected state: DeviceState;
    private logger: Logger.ILogger;

    private deviceName: string;
    private deviceAddress: string;
    private deviceArea: Area;
    private deviceType: DeviceType;

    constructor(
        type: DeviceType,
        processor: Processor,
        area: Area,
        definition: { href: string; Name: string }
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

    public get id(): string {
        return `LEAP-${this.processor.id}-${DeviceType[this.deviceType].toUpperCase()}-${this.deviceAddress.split("/")[2]}`;
    }

    public get name(): string {
        return this.deviceName;
    }

    public get room(): string {
        return this.area.Name;
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public get address(): Address {
        return { href: this.deviceAddress };
    }

    public get type(): DeviceType {
        return this.deviceType;
    }

    public get area(): Area {
        return this.deviceArea;
    }

    public get status(): DeviceState {
        return this.state;
    }
}
