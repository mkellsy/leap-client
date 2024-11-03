import { Fan as FanInterface, ZoneStatus } from "@mkellsy/hap-device";

import { FanState } from "./FanState";

/**
 * Defines a fan device.
 * @public
 */
export interface Fan extends FanInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * fan.update({ SwitchedLevel: "On", FanSpeed: 7 });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * fan.set({ state: "On", speed: 3 });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: FanState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: FanState;
}
