import { Address } from "./Address";
import { AffectedZone } from "./AffectedZone";
import { ButtonAddress } from "./ButtonAddress";
import { DeviceAddress } from "./DeviceAddress";

/**
 * Defines a group of buttons (extended)
 */
export type ButtonGroupExpanded = Address & {
    /**
     * Zones assigned to the buttons.
     */
    AffectedZones: AffectedZone[];

    /**
     * List of buttons.
     */
    Buttons: ButtonAddress[];

    /**
     * Parent node address.
     */
    Parent: DeviceAddress;

    /**
     * Button group programming type.
     */
    ProgrammingType: string;

    /**
     * Order of group amongst others.
     */
    SortOrder: number;

    /**
     * Special property to stop listening to the button if assicoated zone is
     * in motion.
     */
    StopIfMoving: string;
};
