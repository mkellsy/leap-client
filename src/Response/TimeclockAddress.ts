import { Address } from "./Address";

/**
 * Defines a timeclock.
 * @private
 */
export type TimeclockAddress = Address & {
    /**
     * Timeclock name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;
};
