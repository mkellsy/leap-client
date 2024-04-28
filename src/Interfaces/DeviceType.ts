import { Device } from "@mkellsy/leap";
import { DeviceType } from "@mkellsy/hap-device";

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

        case "WhiteTune":
            return DeviceType.Strip;

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
