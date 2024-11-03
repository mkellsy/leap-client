import { Address } from "./Address";

/**
 * Defines a scene for an area.
 * @private
 */
export type AreaScene = Address & {
    /**
     * Scene name.
     */
    Name: string;

    /**
     * The parent node this scene belongs to.
     */
    Parent: Address;

    /**
     * Scene primary preset.
     */
    Preset: Address;

    /**
     * Scene order amongst others.
     */
    SortOrder: number;
};
