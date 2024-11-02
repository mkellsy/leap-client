import { Address } from "./Address";
import { ButtonGroup } from "./ButtonGroup";
import { ZoneAddress } from "./ZoneAddress";

/**
 * List of zones assigned to a button group.
 */
export type AffectedZone = Address & {
    /**
     * Button group.
     */
    ButtonGroup: ButtonGroup;

    /**
     * Assigned zone.
     */
    Zone: ZoneAddress;
};
