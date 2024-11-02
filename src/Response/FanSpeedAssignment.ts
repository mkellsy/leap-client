import { Address } from "./Address";

/**
 * Fan speed assignement request.
 */
export type FanSpeedAssignment = Address & {
    /**
     * Device, arfea, or zone address.
     */
    AssignableResource: Address;

    /**
     * Delay time.
     */
    DelayTime: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Target speed.
     */
    Speed: string;
};
