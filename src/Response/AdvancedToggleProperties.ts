import { Address } from "./Address";

/**
 * A device's tooggle properties (extended)
 * @private
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
