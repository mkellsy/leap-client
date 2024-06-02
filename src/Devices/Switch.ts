import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Switch extends Common implements Interfaces.Switch {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(Interfaces.DeviceType.Switch, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
    }

    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.SwitchedLevel || "Unknown",
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<Interfaces.DeviceState>): Promise<void> {
        return this.processor.command(this.address, {
            CommandType: "GoToLevel",
            Parameter: [{ Type: "Level", Value: status.state === "On" ? 100 : 0 }],
        });
    }
}
