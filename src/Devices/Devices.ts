import { Device, DeviceType } from "@mkellsy/hap-device";

import { AreaAddress } from "../Response/AreaAddress";
import { ContactController } from "./Contact/ContactController";
import { DeviceAddress } from "../Response/DeviceAddress";
import { DimmerController } from "./Dimmer/DimmerController";
import { FanController } from "./Fan/FanController";
import { KeypadController } from "./Keypad/KeypadController";
import { Processor } from "./Processor/Processor";
import { RemoteController } from "./Remote/RemoteController";
import { OccupancyController } from "./Occupancy/OccupancyController";
import { ShadeController } from "./Shade/ShadeController";
import { StripController } from "./Strip/StripController";
import { SwitchController } from "./Switch/SwitchController";
import { TimeclockController } from "./Timeclock/TimeclockController";
import { TimeclockAddress } from "../Response/TimeclockAddress";
import { UnknownController } from "./Unknown/UnknownController";
import { ZoneAddress } from "../Response/ZoneAddress";

/**
 * Creates a device by type. This is a device factory.
 *
 * @param processor A reference to the processor.
 * @param area A reference to the area.
 * @param definition Device definition, this is either an area, zone or device.
 *
 * @returns A common device object. Casting will be needed to access extended
 *          capibilities.
 * @private
 */
export function createDevice(processor: Processor, area: AreaAddress, definition: unknown): Device {
    const type = parseDeviceType((definition as ZoneAddress).ControlType || (definition as DeviceAddress).DeviceType);

    switch (type) {
        case DeviceType.Contact:
            return new ContactController(processor, area, definition as ZoneAddress);

        case DeviceType.Dimmer:
            return new DimmerController(processor, area, definition as ZoneAddress);

        case DeviceType.Fan:
            return new FanController(processor, area, definition as ZoneAddress);

        case DeviceType.Keypad:
            return new KeypadController(processor, area, definition as DeviceAddress);

        case DeviceType.Occupancy:
            return new OccupancyController(processor, area, {
                href: `/occupancy/${area.href?.split("/")[2]}`,
                Name: (definition as ZoneAddress).Name,
            } as DeviceAddress);

        case DeviceType.Remote:
            return new RemoteController(processor, area, definition as DeviceAddress);

        case DeviceType.Shade:
            return new ShadeController(processor, area, definition as ZoneAddress);

        case DeviceType.Strip:
            return new StripController(processor, area, definition as ZoneAddress);

        case DeviceType.Switch:
            return new SwitchController(processor, area, definition as ZoneAddress);

        case DeviceType.Timeclock:
            return new TimeclockController(processor, area, definition as TimeclockAddress);

        default:
            return new UnknownController(processor, area, definition as ZoneAddress);
    }
}

/**
 * Parses a string to a standard device type enum value.
 *
 * @param value A string device type from the processor.
 *
 * @returns A standard device type from the device type enum.
 * @private
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
 * @private
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
