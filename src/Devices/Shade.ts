import * as Leap from "@mkellsy/leap";

import equals from "deep-equal";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceState } from "../Interfaces/DeviceState";
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
            tilt: status.Tilt,
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: DeviceState): void {
        if (!equals(status, this.state)) {
            if (status.state === "Closed") {
                this.processor.command(this.address, {
                    CommandType: "GoToLevel",
                    Parameter: [{ Type: "Level", Value: 0 }],
                });

                this.processor.command(this.address, {
                    CommandType: "TiltParameters",
                    TiltParameters: { Tilt: 0 },
                });
            } else {
                if (status.level != null) {
                    this.processor.command(this.address, {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: status.level }],
                    });
                }

                if (status.tilt != null) {
                    this.processor.command(this.address, {
                        CommandType: "TiltParameters",
                        TiltParameters: { Tilt: status.tilt },
                    });
                }
            }
        }
    }
}
