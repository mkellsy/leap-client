import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Occupancy extends Device implements DeviceInterface {
    constructor(processor: Processor, area: Leap.Area, definition: Leap.Device) {
        super(DeviceType.Occupancy, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Occupancy")} ${this.name}`);
    }

    public override update(status: Leap.AreaStatus): void {
        const previous = { ...this.status };

        const definition = {
            id: this.id,
            name: this.name,
            area: this.area.Name,
            type: DeviceType[this.type],
        };

        this.state = {
            state: status.OccupancyStatus != null ? status.OccupancyStatus === "Occupied" ? "Occupied" : "Unoccupied" : "Unknown",
            level: status.Level,
        };

        if (this.state.state !== previous.state) {
            this.emit("Update", { ...definition, status: this.status.state === "Occupied", statusType: "Occupancy" });
        }
    }
}
