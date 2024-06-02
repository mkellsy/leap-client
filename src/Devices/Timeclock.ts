import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Timeclock extends Common implements Interfaces.Timeclock {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Timeclock) {
        super(Interfaces.DeviceType.Timeclock, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
    }

    public update(status: Interfaces.TimeclockStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.EnabledState === "Enabled" ? "On" : "Off",
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<Interfaces.DeviceState>): Promise<void> {
        return this.processor.update(this.address, "status", {
            EnabledState: { State: status.state === "On" ? "Enabled" : "Disabled" },
        });
    }
}
