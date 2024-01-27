import * as Leap from "@mkellsy/leap";
import * as Logger from "js-logger";

import { Contact } from "../Devices/Contact";
import { Dimmer } from "../Devices/Dimmer";
import { Keypad } from "../Devices/Keypad";
import { Processor } from "../Devices/Processor";
import { Remote } from "../Devices/Remote";
import { Occupancy } from "../Devices/Occupancy";
import { Shade } from "../Devices/Shade";
import { Strip } from "../Devices/Strip";
import { Switch } from "../Devices/Switch";
import { Unknown } from "../Devices/Unknown";

import { DeviceState } from "./DeviceState";
import { DeviceType, parseDeviceType } from "./DeviceType";

export interface Device {
    id: string;
    name: string;
    room: string;
    log: Logger.ILogger;
    address: Leap.Address;
    type: DeviceType;
    area: Leap.Area;
    status: DeviceState;

    on(event: string, listener: Function): this;
    once(event: string, listener: Function): this;
    off(event?: string, listener?: Function): this;
    emit(...payload: any[]): boolean;
    update(status: Leap.ZoneStatus | Leap.AreaStatus): void;
    set(state: Partial<DeviceState>): void;
}

export function createDevice(processor: Processor, area: Leap.Area, definition: any): Device {
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