import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Occupancy extends Common implements Interfaces.Occupancy {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Device) {
        super(Interfaces.DeviceType.Occupancy, processor, area, device);
    }

    public update(status: Interfaces.AreaStatus): void {
        const previous = { ...this.status };

        if (status.OccupancyStatus != null) {
            this.state.state = status.OccupancyStatus === "Occupied" ? "Occupied" : "Unoccupied";
        }

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set = (): Promise<void> => Promise.resolve();
}
