import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a LED strip's current status response.
 * @public
 */
export interface StripState extends DeviceState {
    /**
     * Is the LED strip on or off.
     */
    state: "On" | "Off";

    /**
     * The LED strip's brightness level.
     */
    level: number;

    /**
     * The LED's color temperature luminance.
     */
    luminance: number;
}
