import { Address } from "./Address";

/**
 * Defines trim tuning setting.
 * @private
 */
export type TuningSetting = Address & {
    /**
     * Level max.
     */
    HighEndTrim: number;

    /**
     * Level min.
     */
    LowEndTrim: number;
};
