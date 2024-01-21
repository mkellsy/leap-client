import Colors from "colors";

import { AreaDefinition, ZoneDefinition, ZoneStatus } from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Dimmer extends Device implements DeviceInterface {
    constructor(processor: Processor, area: AreaDefinition, definition: ZoneDefinition) {
        super(DeviceType.Dimmer, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Dimmer")} ${this.name}`);
    }

    public override update(status: ZoneStatus): void {
        const previous = { ...this.status };

        const definition = {
            id: this.id,
            name: this.name,
            area: this.area.Name,
            type: DeviceType[this.type],
        };

        this.state = {
            state: status.Level != null ? (status.Level > 0 ? "On" : "Off") : "Unknown",
            level: status.Level,
        };

        if (this.state.state !== previous.state) {
            this.emit("Update", { ...definition, status: this.status.state === "On", statusType: "Switch" });
        }

        if (this.state.level !== previous.level) {
            this.emit("Update", { ...definition, status: this.status.level || 0, statusType: "Level" });
        }
    }
}
