import Colors from "colors";

import { AreaDefinition, ZoneDefinition, ZoneStatus } from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Contact extends Device implements DeviceInterface {
    constructor(processor: Processor, area: AreaDefinition, definition: ZoneDefinition) {
        super(DeviceType.Contact, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Contact")} ${this.name}`);
    }

    public override updateStatus(status: ZoneStatus): void {
        const previous = { ...this.status };

        this.state = { state: status.CCOLevel || "Unknown" };

        if (this.state.state !== previous.state) {
            this.emit("Update", {
                id: this.id,
                name: this.name,
                area: this.area.Name,
                type: DeviceType[this.type],
                status: this.status.state === "Closed",
                statusType: "Contact",
            });
        }
    }
}
