import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Shade extends Common implements Interfaces.Shade {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(Interfaces.DeviceType.Shade, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
        this.fields.set("tilt", { type: "Integer", min: 0, max: 100 });
    }

    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "Open" : "Closed";
            this.state.level = status.Level;
        }

        if (status.Tilt != null) {
            this.state.tilt = status.Tilt;
        }

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    public set(status: Partial<Interfaces.DeviceState>): Promise<void> {
        const waits: Promise<void>[] = [];

        if (status.state === "Closed") {
            waits.push(
                this.processor.command(this.address, {
                    CommandType: "GoToLevel",
                    Parameter: [{ Type: "Level", Value: 0 }],
                }),
            );

            waits.push(
                this.processor.command(this.address, {
                    CommandType: "TiltParameters",
                    TiltParameters: { Tilt: 0 },
                }),
            );
        } else {
            if (status.level != null) {
                waits.push(
                    this.processor.command(this.address, {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: status.level }],
                    }),
                );
            }

            if (status.tilt != null) {
                waits.push(
                    this.processor.command(this.address, {
                        CommandType: "TiltParameters",
                        TiltParameters: { Tilt: status.tilt },
                    }),
                );
            }
        }

        return new Promise((resolve, reject) => {
            Promise.all(waits)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }
}
