import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a fan's current status response.
 * @public
 */
export interface FanState extends DeviceState {
    /**
     * Is the fan on, off, or set to auto.
     */
    state: "On" | "Off";

    /**
     * The fan's speed setting.
     */
    speed: number;
}
