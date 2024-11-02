import { Device, DeviceType } from "@mkellsy/hap-device";

import { AreaAddress } from "../Interfaces/AreaAddress";
import { Contact } from "../Devices/Contact/Contact";
import { DeviceAddress } from "../Interfaces/DeviceAddress";
import { Dimmer } from "./Dimmer/Dimmer";
import { Fan } from "./Fan/Fan";
import { Keypad } from "./Keypad/Keypad";
import { Processor } from "./Processor/Processor";
import { Remote } from "./Remote/Remote";
import { Occupancy } from "./Occupancy/Occupancy";
import { Shade } from "./Shade/Shade";
import { Strip } from "./Strip/Strip";
import { Switch } from "./Switch/Switch";
import { Timeclock } from "./Timeclock/Timeclock";
import { TimeclockAddress } from "../Interfaces/TimeclockAddress";
import { Unknown } from "../Devices/Unknown/Unknown";
import { ZoneAddress } from "../Interfaces/ZoneAddress";

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
export function createDevice(processor: Processor, area: AreaAddress, definition: unknown): Device {
    const type = parseDeviceType((definition as ZoneAddress).ControlType || (definition as DeviceAddress).DeviceType);

    switch (type) {
        case DeviceType.Contact:
            return new Contact(processor, area, definition as ZoneAddress);

        case DeviceType.Dimmer:
            return new Dimmer(processor, area, definition as ZoneAddress);

        case DeviceType.Fan:
            return new Fan(processor, area, definition as ZoneAddress);

        case DeviceType.Keypad:
            return new Keypad(processor, area, definition as DeviceAddress);

        case DeviceType.Occupancy:
            return new Occupancy(processor, area, {
                href: `/occupancy/${area.href?.split("/")[2]}`,
                Name: (definition as ZoneAddress).Name,
            } as DeviceAddress);

        case DeviceType.Remote:
            return new Remote(processor, area, definition as DeviceAddress);

        case DeviceType.Shade:
            return new Shade(processor, area, definition as ZoneAddress);

        case DeviceType.Strip:
            return new Strip(processor, area, definition as ZoneAddress);

        case DeviceType.Switch:
            return new Switch(processor, area, definition as ZoneAddress);

        case DeviceType.Timeclock:
            return new Timeclock(processor, area, definition as TimeclockAddress);

        default:
            return new Unknown(processor, area, definition as ZoneAddress);
    }
}

/**
 * Parses a string to a standard device type enum value.
 *
 * @param value A string device type from the processor.
 *
 * @returns A standard device type from the device type enum.
 */
export function parseDeviceType(value: string): DeviceType {
    switch (value) {
        case "Switched":
        case "PowPakSwitch":
        case "OutdoorPlugInSwitch":
            return DeviceType.Switch;

        case "Dimmed":
        case "PlugInDimmer":
            return DeviceType.Dimmer;

        case "Shade":
            return DeviceType.Shade;

        case "Timeclock":
            return DeviceType.Timeclock;

        case "WhiteTune":
            return DeviceType.Strip;

        case "FanSpeed":
            return DeviceType.Fan;

        case "Pico2Button":
        case "Pico3Button":
        case "Pico4Button":
        case "Pico3ButtonRaiseLower":
            return DeviceType.Remote;

        case "SunnataDimmer":
        case "SunnataSwitch":
        case "SunnataKeypad":
        case "SunnataHybridKeypad":
            return DeviceType.Keypad;

        case "RPSCeilingMountedOccupancySensor":
            return DeviceType.Occupancy;

        case "CCO":
            return DeviceType.Contact;

        default:
            return DeviceType.Unknown;
    }
}

/**
 * Determines if the device is addressable. Basically can we program actions
 * for it.
 *
 * @param device A reference to the device.
 *
 * @returns True is addressable, false if not.
 */
export function isAddressable(device: DeviceAddress): boolean {
    if (device.AddressedState !== "Addressed") {
        return false;
    }

    switch (device.DeviceType) {
        case "Pico2Button":
        case "Pico3Button":
        case "Pico4Button":
        case "Pico3ButtonRaiseLower":
            return true;

        case "SunnataKeypad":
        case "SunnataHybridKeypad":
            return true;

        case "RPSCeilingMountedOccupancySensor":
            return true;

        default:
            return false;
    }
}
