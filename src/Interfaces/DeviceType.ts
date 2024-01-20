export enum DeviceType {
    Dimmer = "Dimmer",
    Switch = "Switch",
    Contact = "Contact",
    Strip = "Strip",
    Remote = "Remote",
    Keypad = "Keypad",
    Shade = "Shade",
    OccupancySensor = "OccupancySensor",
    Unknown = "Unknown",
}

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
            return DeviceType.OccupancySensor;

        case "CCO":
            return DeviceType.Contact;

        default:
            return DeviceType.Unknown;
    }
}