import { Address } from "./Address";

/**
 * Dimmed level assignment.
 */
export type DimmedLevelAssignment = Address & {
    /**
     * Device, area, or zone address.
     */
    AssignableResource: Address;

    /**
     * Delay time.
     */
    DelayTime: string;

    /**
     * Fade duration from previous assignment.
     */
    FadeTime: string;

    /**
     * Target brightness level.
     */
    Level: number;

    /**
     * Parent node address.
     */
    Parent: Address;
};
