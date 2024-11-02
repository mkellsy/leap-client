import { Address } from "./Address";

/**
 * Defines a blind tilt update object.
 */
export type TiltAssignment = Address & {
    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Assigned resource address.
     */
    AssignableResource: Address;

    /**
     * Delay time.
     */
    DelayTime: string;

    /**
     * Target tilt assignment.
     */
    Tilt: number;
};
