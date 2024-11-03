import { Address } from "./Address";

/**
 * Defines a timeclock status.
 * @private
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
