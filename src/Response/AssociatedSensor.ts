import { Address } from "./Address";

/**
 * Sensor association.
 * @private
 */
export type AssociatedSensor = Address & {
    /**
     * Sensor address.
     */
    OccupancySensor: Address;
};
