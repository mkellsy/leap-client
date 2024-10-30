import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { AreaAddress } from "../Interfaces/AreaAddress";
import { Common } from "./Common";
import { DeviceAddress } from "../Interfaces/DeviceAddress";
import { OccupancyState } from "./OccupancyState";
import { Processor } from "./Processor";

/**
 * Defines a occupancy sensor device.
 */
export class Occupancy extends Common<OccupancyState> implements Interfaces.Occupancy {
    /**
     * Creates a occupancy sensor device.
     *
     * ```js
     * const sensor = new Occupancy(processor, area, device);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param device The refrence to this device.
     */
    constructor(processor: Processor, area: AreaAddress, device: DeviceAddress) {
        super(Interfaces.DeviceType.Occupancy, processor, area, device, { state: "Unoccupied" });
    }

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
    public update(status: Interfaces.AreaStatus): void {
        const previous = { ...this.status };

        if (status.OccupancyStatus != null) {
            this.state.state = status.OccupancyStatus === "Occupied" ? "Occupied" : "Unoccupied";
        }

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }

        this.initialized = true;
    }

    /**
     * Controls this device (not supported).
     */
    public set = (): Promise<void> => Promise.resolve();
}
