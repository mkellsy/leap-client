import { Address } from "./Address";

/**
 * LED phase setting.
 * @private
 */
export type PhaseSetting = Address & {
    /**
     * Phase direction.
     */
    Direction: string;
};
