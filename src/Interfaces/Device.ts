import * as Leap from "@mkellsy/leap";

import { Device, DeviceType } from "@mkellsy/hap-device";

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

import { parseDeviceType } from "./DeviceType";

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