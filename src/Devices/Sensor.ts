import Colors from "colors";

import { AreaDefinition, DeviceDefinition, ZoneStatus } from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Sensor extends Device implements DeviceInterface {
    private deviceDefinition: DeviceDefinition;

    constructor (processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Sensor, processor, area, definition);

        this.deviceDefinition = definition;
        this.log.debug(`${this.area.Name} ${Colors.green("Sensor")} ${this.name}`);
    }

    public get definition(): DeviceDefinition {
        return this.deviceDefinition;
    }
}
