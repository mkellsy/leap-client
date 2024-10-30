import { Address } from "./Address";
import { FanSpeedType } from "./FanSpeedType";

/**
 * Defines a zone status object.
 */
export type ZoneStatus = Address & {
    /**
     * Contact closure state.
     */
    CCOLevel: "Open" | "Closed";

    /**
     * Brightness level.
     */
    Level: number;

    /**
     * Binary switch state.
     */
    SwitchedLevel: "On" | "Off";

    /**
     * Fan speed state.
     */
    FanSpeed: FanSpeedType;

    /**
     * Associated zone address.
     */
    Zone: Address;

    /**
     * Accuracy status (always good)
     */
    StatusAccuracy: "Good";

    /**
     * Associated area address.
     */
    AssociatedArea: Address;

    /**
     * Zone avaibility status.
     */
    Availability: "Available" | "Unavailable" | "Mixed" | "Unknown";

    /**
     * Blind tilt state.
     */
    Tilt: number;
};
