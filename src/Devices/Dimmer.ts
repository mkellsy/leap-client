import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceState } from "../Interfaces/DeviceState";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Dimmer extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(DeviceType.Dimmer, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
    }

    public update(status: Leap.ZoneStatus): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "On" : "Off";
            this.state.level = status.Level;
        }

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<DeviceState>): void {
        if (status.state === "Off") {
            this.processor.command(this.address, {
                CommandType: "GoToLevel",
                Parameter: [{ Type: "Level", Value: 0 }],
            });
        } else {
            this.processor.command(this.address, {
                CommandType: "GoToLevel",
                Parameter: [{ Type: "Level", Value: status.level }],
            });
        }
    }
}
