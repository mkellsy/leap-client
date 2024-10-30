import { Address } from "./Address";

/**
 * A device's tooggle properties (extended)
 */
export type AdvancedToggleProperties = {
    /**
     * Primary preset.
     */
    PrimaryPreset: Address;

    /**
     * Secondary preset.
     */
    SecondaryPreset: Address;
};
