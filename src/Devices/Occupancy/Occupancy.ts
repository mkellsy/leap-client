import { AreaStatus, Occupancy as OccupancyInterface } from "@mkellsy/hap-device";

import { OccupancyState } from "./OccupancyState";

/**
 * Defines a occupancy sensor device.
 * @public
 */
export interface Occupancy extends OccupancyInterface {
    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * sensor.update({ OccupancyStatus: "Occupied" });
     * ```
     *
     * @param status The current device state.
     */
    update(status: AreaStatus): void;

    /**
     * The current state of the device.
     *
     * @returns The device's state.
     */
    readonly status: OccupancyState;
}
