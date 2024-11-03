import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a switch's current status response.
 * @public
 */
export interface SwitchState extends DeviceState {
    /**
     * Is the switch on or off.
     */
    state: "On" | "Off";
}
