import { Timeclock as TimeclockInterface, TimeclockStatus } from "@mkellsy/hap-device";

import { TimeclockState } from "./TimeclockState";

/**
 * Defines a timeclock device.
 */
export interface Timeclock extends TimeclockInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * timeclock.update({ EnabledState: "Enabled" });
     * ```
     *
     * @param status The current device state.
     */
    update(status: TimeclockStatus): void;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: TimeclockState;
}
