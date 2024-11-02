import { Address } from "@mkellsy/hap-device";
import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a keypad's LED current status response.
 */
export interface KeypadState extends DeviceState {
    /**
     * Is the LED on or off.
     */
    state: "On" | "Off";

    /**
     * The address of the LED on the keypad.
     */
    led: Address;
}
