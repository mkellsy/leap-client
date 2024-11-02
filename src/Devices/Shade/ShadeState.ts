import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a shade's current status response.
 */
export interface ShadeState extends DeviceState {
    /**
     * Is the shade open or closed.
     */
    state: "Open" | "Closed";

    /**
     * The shade's open level.
     */
    level: number;

    /**
     * The shade's tilt level.
     */
    tilt?: number;
}
