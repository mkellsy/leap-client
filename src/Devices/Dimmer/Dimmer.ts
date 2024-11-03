import { Dimmer as DimmerInterface, ZoneStatus } from "@mkellsy/hap-device";

import { DimmerState } from "./DimmerState";

/**
 * Defines a dimmable light device.
 * @public
 */
export interface Dimmer extends DimmerInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * dimmer.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * dimmer.set({ state: "On", level: 50 });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: DimmerState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: DimmerState;
}
