import { Address } from "./Address";

/**
 * Defines trim tuning setting.
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
