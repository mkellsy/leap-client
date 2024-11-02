import { Button, Keypad as KeypadInterface } from "@mkellsy/hap-device";

import { KeypadState } from "./KeypadState";

/**
 * Defines a keypad device.
 */
export interface Keypad extends KeypadInterface {
    readonly buttons: Button[];

    /**
     * Controls this LEDs on this device.
     *
     * ```js
     * keypad.set({ state: { href: "/led/123456" }, state: "On" });
     * ```
     *
     * @param status Desired device state.
     */
    set(status: KeypadState): Promise<void>;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: KeypadState;
}
