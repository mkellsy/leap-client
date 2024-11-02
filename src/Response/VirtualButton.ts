import { Address } from "./Address";
import { Category } from "./Category";

/**
 * Defines a virtual button.
 */
export type VirtualButton = Address & {
    /**
     * Button number.
     */
    ButtonNumber: number;

    /**
     * Button category.
     */
    Category: Category;

    /**
     * Is the button programmed.
     */
    IsProgrammed: boolean;

    /**
     * Button name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Button's programming model.
     */
    ProgrammingModel: Address;
};
