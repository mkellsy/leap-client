import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { AreaAddress } from "../Interfaces/AreaAddress";
import { Common } from "./Common";
import { Processor } from "./Processor";
import { TimeclockAddress } from "../Interfaces/TimeclockAddress";
import { TimeclockState } from "./TimeclockState";

/**
 * Defines a timeclock device.
 */
export class Timeclock extends Common<TimeclockState> implements Interfaces.Timeclock {
    /**
     * Creates a timeclock device.
     *
     * ```js
     * const timeclock = new Timeclock(processor, area, device);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param device The reference to the device.
     */
    constructor(processor: Processor, area: AreaAddress, device: TimeclockAddress) {
        super(Interfaces.DeviceType.Timeclock, processor, area, device, { state: "Off" });

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * timeclock.update({ EnabledState: "Enabled" });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.TimeclockStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.EnabledState === "Enabled" ? "On" : "Off",
        };

        if (this.initialized && !equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }

        this.initialized = true;
    }

    /**
     * Controls this device (not supported).
     */
    public set = (): Promise<void> => Promise.resolve();
}
