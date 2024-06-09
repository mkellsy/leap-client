import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import { Common } from "./Common";
import { Processor } from "./Processor";

/**
 * Defines an unknown device.
 */
export class Unknown extends Common<Interfaces.DeviceState> implements Interfaces.Unknown {
    /**
     * Creates a placeholder for an unknown device.
     *
     * ```js
     * const unknown = new Unknown(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: Leap.Area, zone: Leap.Zone) {
        super(Interfaces.DeviceType.Unknown, processor, area, zone, { state: "Unknown" });
    }

    /**
     * Recieves a state response from the processor (not supported).
     */
    public update(): void {}

    /**
     * Controls this device (not supported).
     */
    public set = (): Promise<void> => Promise.resolve();
}
