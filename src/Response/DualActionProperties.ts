import { Address } from "./Address";

/**
 * Dual action scene properties.
 * @private
 */
export type DualActionProperties = {
    /**
     * Preset address.
     */
    PressPreset: Address;

    /**
     * Preset address for the button release.
     */
    ReleasePreset: Address;
};
