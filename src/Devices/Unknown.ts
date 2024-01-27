import * as Leap from "@mkellsy/leap";

import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Unknown extends Common implements Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(DeviceType.Unknown, processor, area, device);
    }

    public update(_status: unknown): void {}
    public set(_state: unknown): void {}
}
