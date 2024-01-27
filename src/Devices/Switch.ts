import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceState } from "../Interfaces/DeviceState";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Switch extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(DeviceType.Switch, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
    }

    public update(status: Leap.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.SwitchedLevel || "Unknown",
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<DeviceState>): void {
        this.processor.command(this.address, {
            CommandType: "GoToLevel",
            Parameter: [{ Type: "Level", Value: status.state === "On" ? 100 : 0 }],
        });
    }
}
