import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceState } from "../Interfaces/DeviceState";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Strip extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(DeviceType.Strip, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
        this.fields.set("luminance", { type: "Integer", min: 1800, max: 3000 });
    }

    public update(status: Leap.ZoneStatus & any): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "On" : "Off";
            this.state.level = status.Level;
        }

        if (
            status.ColorTuningStatus != null &&
            status.ColorTuningStatus.WhiteTuningLevel != null &&
            status.ColorTuningStatus.WhiteTuningLevel.Kelvin != null
        ) {
            this.state.luminance = status.ColorTuningStatus.WhiteTuningLevel.Kelvin;
        }

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<DeviceState>): void {
        // TODO
    }
}
