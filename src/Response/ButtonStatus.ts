import { Address } from "./Address";

/**
 * Defines a button action status.
 */
export type ButtonStatus = Address & {
    /**
     * Button address.
     */
    Button: Address;

    /**
     * Button event, press, release, and long hold.
     */
    ButtonEvent: { EventType: "Press" | "Release" | "LongHold" };
};
