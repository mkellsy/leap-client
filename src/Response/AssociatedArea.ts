import { Address } from "./Address";

/**
 * Area association.
 * @private
 */
export type AssociatedArea = Address & {
    /**
     * Area address.
     */
    Area: Address;
};
