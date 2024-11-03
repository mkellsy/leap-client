import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines an occupancy sensor's current status response.
 * @public
 */
export interface OccupancyState extends DeviceState {
    /**
     * Is the sensor detecting occupied or not.
     */
    state: "Occupied" | "Unoccupied";
}
