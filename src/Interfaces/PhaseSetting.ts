import { Address } from "./Address";

/**
 * LED phase setting.
 */
export type PhaseSetting = Address & {
    /**
     * Phase direction.
     */
    Direction: string;
};
