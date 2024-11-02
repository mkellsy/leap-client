import { Shade as ShadeInterface, ZoneStatus } from "@mkellsy/hap-device";

import { ShadeState } from "./ShadeState";

/**
 * Defines a window shade device.
 */
export interface Shade extends ShadeInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * shade.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * shade.set({ state: "Open", level: 50, tilt: 50 });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: ShadeState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: ShadeState;
}
