import equals from "deep-equal";

import { DeviceType, TimeclockStatus } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { Common } from "../Common";
import { Processor } from "../Processor/Processor";
import { Timeclock } from "./Timeclock";
import { TimeclockAddress } from "../../Response/TimeclockAddress";
import { TimeclockState } from "./TimeclockState";

/**
 * Defines a timeclock device.
 */
export class TimeclockController extends Common<TimeclockState> implements Timeclock {
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
        super(DeviceType.Timeclock, processor, area, device, { state: "Off" });

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
    public update(status: TimeclockStatus): void {
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
