import { Address } from "./Address";
import { AdvancedToggleProperties } from "./AdvancedToggleProperties";
import { DualActionProperties } from "./DualActionProperties";
import { ProgrammingModelType } from "./ProgrammingModelType";

/**
 * Defines a programming model.
 */
export type ProgrammingModel = Address & {
    /**
     * Assigned toggle properties.
     */
    AdvancedToggleProperties: AdvancedToggleProperties;

    /**
     * Assigned dual action properties.
     */
    DualActionProperties: DualActionProperties;

    /**
     * Model name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Preset address.
     */
    Preset: Address;

    /**
     * Programming model type.
     */
    ProgrammingModelType: ProgrammingModelType;
};
