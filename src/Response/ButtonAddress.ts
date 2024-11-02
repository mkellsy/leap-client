import { Address } from "./Address";
import { ProgrammingModel } from "./ProgrammingModel";

/**
 * Defines a keypad button.
 */
export type ButtonAddress = Address & {
    /**
     * Associated led address.
     */
    AssociatedLED: Address;

    /**
     * Button number on the keypad.
     */
    ButtonNumber: number;

    /**
     * Custom engraving, configured name.
     */
    Engraving: { Text: string };

    /**
     * Configured name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Button's programming model.
     */
    ProgrammingModel: ProgrammingModel;
};
