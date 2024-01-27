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
    }

    public update(status: Leap.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            state: status.SwitchedLevel || status.Level != null ? (status.Level > 0 ? "On" : "Off") : "Unknown",
            level: status.Level,
            luminance: (((status as any).ColorTuningStatus || {}).WhiteTuningLevel || {}).Kelvin,
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: DeviceState): void {
        if (!equals(status, this.state)) {
            this.log.debug(status);
            if (status.state === "Off") {
                this.processor.command(this.address, {
                    CommandType: "GoToLevel",
                    Parameter: [{ Type: "Level", Value: 0 }],
                });
            } else {
                if (status.level != null) {
                    this.processor.command(this.address, {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: status.level }],
                    });
                }

                if (status.luminance != null) {
                    // TODO
                }
            }
        }
    }
}
