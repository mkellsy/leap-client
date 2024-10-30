import { Address } from "./Address";
import { Category } from "./Category";
import { PhaseSetting } from "./PhaseSetting";
import { TuningSetting } from "./TuningSetting";

/**
 * Defines a zone.
 */
export type ZoneAddress = Address & {
    /**
     * Zone name.
     */
    Name: string;

    /**
     * Zone control type.
     */
    ControlType: string;

    /**
     * (optional) Zone category if exists.
     */
    Category?: Category;

    /**
     * (optional) Associated device if exists.
     */
    Device?: Address;

    /**
     * (optional) Associated facade.
     */
    AssociatedFacade?: Address;

    /**
     * (optional) Associated area.
     */
    AssociatedArea?: Address;

    /**
     * (optional) Phase settings.
     */
    PhaseSettings?: PhaseSetting;

    /**
     * Sort order amongst others.
     */
    SortOrder?: number;

    /**
     * (optional) Associated trim tuning.
     */
    TuningSettings?: TuningSetting;
};
