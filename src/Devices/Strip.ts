import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Strip extends Common implements Interfaces.Strip {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(Interfaces.DeviceType.Strip, processor, area, device);

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
        this.fields.set("luminance", { type: "Integer", min: 1800, max: 3000 });
    }

    public update(status: Interfaces.ZoneStatus): void {
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

    public set(status: Partial<Interfaces.DeviceState>): void {
        this.log.info(status);
        if (status.state === "Off") {
            this.processor.command(this.address, {
                CommandType: "GoToWhiteTuningLevel",
                WhiteTuningLevelParameters: { Level: 0 },
            });
        } else {
            const parameters: { [key: string]: any} = {}

            if (status.level != null) {
                parameters.Level = status.level;
            }

            if (status.luminance != null) {
                parameters.WhiteTuningLevel = { Kelvin: status.luminance };
            }

            this.processor.command(this.address, {
                CommandType: "GoToWhiteTuningLevel",
                WhiteTuningLevelParameters: parameters,
            });
        }
    }
}
