import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Unknown extends Common implements Interfaces.Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Zone) {
        super(Interfaces.DeviceType.Unknown, processor, area, device);
    }

    public update(_status: unknown): void {}
    public set(_state: unknown): void {}
}
