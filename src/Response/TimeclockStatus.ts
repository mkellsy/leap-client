import { Address } from "./Address";

/**
 * Defines a timeclock status.
 */
export type TimeclockStatus = Address & {
    /**
     * Associated timeclock address.
     */
    Timeclock: Address;

    /**
     * Is the timeclock enabled.
     */
    EnabledState: string;
};
