import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Shade extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(DeviceType.Shade, processor, area, device);
    }

    public update(status: Leap.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            state: status.Level != null ? (status.Level > 0 ? "Open" : "Closed") : "Unknown",
            level: status.Level,
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }
}
