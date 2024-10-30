import { Address } from "./Address";

/**
 * Represents an area and contains a list of zones, control stations, and
 * sensors.
 */
export type AreaAddress = Address & {
    /**
     * Area name.
     */
    Name: string;

    /**
     * Area's control type.
     */
    ControlType: string;

    /**
     * Area's parent node.
     */
    Parent: Address;

    /**
     * Is this area a leaf, meaning there are no child areas.
     */
    IsLeaf: boolean;

    /**
     * List of zones in this area.
     */
    AssociatedZones: Address[];

    /**
     * List of control stations in this area.
     */
    AssociatedControlStations: Address[];

    /**
     * List of sensors in this area.
     */
    AssociatedOccupancyGroups: Address[];
};
