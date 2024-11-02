import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a dimmer's current status response.
 */
export interface DimmerState extends DeviceState {
    /**
     * Is the dimmer on or off.
     */
    state: "On" | "Off";

    /**
     * The dimmer's brightness level.
     */
    level: number;
}
