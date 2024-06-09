import * as Leap from "@mkellsy/leap";

import { Device, DeviceType } from "@mkellsy/hap-device";

import { Contact } from "../Devices/Contact";
import { Dimmer } from "../Devices/Dimmer";
import { Fan } from "../Devices/Fan";
import { Keypad } from "../Devices/Keypad";
import { Processor } from "../Devices/Processor";
import { Remote } from "../Devices/Remote";
import { Occupancy } from "../Devices/Occupancy";
import { Shade } from "../Devices/Shade";
import { Strip } from "../Devices/Strip";
import { Switch } from "../Devices/Switch";
import { Timeclock } from "../Devices/Timeclock";
import { Unknown } from "../Devices/Unknown";

import { parseDeviceType } from "./DeviceType";

/**
 * Creates a device by type. This is a device factory.
 *
 * @param processor A reference to the processor.
 * @param area A reference to the area.
 * @param definition Device definition, this is either an area, zone or device.
 *
 * @returns A common device object. Casting will be needed to access extended
 *          capibilities.
 */
export function createDevice(processor: Processor, area: Leap.Area, definition: unknown): Device {
    const type = parseDeviceType((definition as Leap.Zone).ControlType || (definition as Leap.Device).DeviceType);

    switch (type) {
        case DeviceType.Contact:
            return new Contact(processor, area, definition as Leap.Zone);

        case DeviceType.Dimmer:
            return new Dimmer(processor, area, definition as Leap.Zone);

        case DeviceType.Fan:
            return new Fan(processor, area, definition as Leap.Zone);

        case DeviceType.Keypad:
            return new Keypad(processor, area, definition as Leap.Device);

        case DeviceType.Occupancy:
            return new Occupancy(processor, area, {
                href: `/occupancy/${area.href.split("/")[2]}`,
                Name: (definition as Leap.Zone).Name,
            } as Leap.Device);

        case DeviceType.Remote:
            return new Remote(processor, area, definition as Leap.Device);

        case DeviceType.Shade:
            return new Shade(processor, area, definition as Leap.Zone);

        case DeviceType.Strip:
            return new Strip(processor, area, definition as Leap.Zone);

        case DeviceType.Switch:
            return new Switch(processor, area, definition as Leap.Zone);

        case DeviceType.Timeclock:
            return new Timeclock(processor, area, definition as Leap.Timeclock);

        default:
            return new Unknown(processor, area, definition as Leap.Zone);
    }
}
