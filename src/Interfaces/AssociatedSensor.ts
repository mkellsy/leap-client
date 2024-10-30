import { Address } from "./Address";

/**
 * Sensor association.
 */
export type AssociatedSensor = Address & {
    /**
     * Sensor address.
     */
    OccupancySensor: Address;
};
