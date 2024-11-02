import { Address } from "./Address";
import { DeviceAddress } from "./DeviceAddress";

/**
 * Defines a control station.
 */
export type ControlStation = Address & {
    /**
     * Control station name.
     */
    Name: string;

    /**
     * Control station control type.
     */
    ControlType: string;

    /**
     * PArent node address.
     */
    Parent: Address;

    /**
     * Area this control station is assigned to.
     */
    AssociatedArea: Address;

    /**
     * Sort order amongst others.
     */
    SortOrder: number;

    /**
     * List of assigned devices (keypads, pico remotes).
     */
    AssociatedGangedDevices: { Device: DeviceAddress }[];
};
