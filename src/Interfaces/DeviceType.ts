import { Device } from "@mkellsy/leap";
import { DeviceType } from "@mkellsy/hap-device";

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
export function isAddressable(device: Device): boolean {
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
