import Colors from "colors";

import { AreaDefinition, DeviceDefinition } from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Sensor extends Device implements DeviceInterface {
    constructor(processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Sensor, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Sensor")} ${this.name}`);
    }
}
