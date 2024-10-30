import { Address } from "./Address";

/**
 * Area association.
 */
export type AssociatedArea = Address & {
    /**
     * Area address.
     */
    Area: Address;
};
