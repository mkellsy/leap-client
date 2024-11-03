import { Contact as ContactInterface, ZoneStatus } from "@mkellsy/hap-device";

import { ContactState } from "./ContactState";

/**
 * Defines a CCO device.
 * @public
 */
export interface Contact extends ContactInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * cco.update({ CCOLevel: "Closed" });
     * ```
     *
     * @param status The current device state.
     */
    update(status: ZoneStatus): void;

    /**
     * Controls this device.
     *
     * ```js
     * cco.set({ state: "Closed" });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: ContactState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: ContactState;
}
