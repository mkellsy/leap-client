import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a timeclock's current status response.
 * @public
 */
export interface TimeclockState extends DeviceState {
    /**
     * Is the timeclock enabled or disabled.
     */
    state: "On" | "Off";
}
