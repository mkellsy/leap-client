import { Strip as StripInterface, ZoneStatus } from "@mkellsy/hap-device";

import { StripState } from "./StripState";

/**
 * Defines a LED strip device.
 * @public
 */
export interface Strip extends StripInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * strip.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * strip.set({ state: "On", level: 50, luminance: 3000 });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: StripState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: StripState;
}
