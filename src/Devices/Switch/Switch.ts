import { Switch as SwitchInterface, ZoneStatus } from "@mkellsy/hap-device";

import { SwitchState } from "./SwitchState";

/**
 * Defines a on/off switch device.
 * @public
 */
export interface Switch extends SwitchInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * switch.update({ SwitchedLevel: "On" });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * switch.set({ state: "On" });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: SwitchState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: SwitchState;
}
