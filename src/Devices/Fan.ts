import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { FanState } from "./FanState";
import { Processor } from "./Processor";

/**
 * Defines a fan device.
 */
export class Fan extends Common<FanState> implements Interfaces.Fan {
    /**
     * Creates a fan device.
     *
     * ```js
     * const fan = new Fan(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: Leap.Area, zone: Leap.Zone) {
        super(Interfaces.DeviceType.Fan, processor, area, zone, { state: "Off", speed: 0 });

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("speed", { type: "Integer", min: 0, max: 4 });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * fan.update({ SwitchedLevel: "On", FanSpeed: 4 });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.SwitchedLevel || "Unknown",
            speed: status.FanSpeed || 0,
        };

        if (!equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }
    }

    /**
     * Controls this device.
     *
     * ```js
     * fan.set({ state: "On", speed: 3 });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: FanState): Promise<void> {
        return this.processor.command(this.address, {
            CommandType: "GoToFanSpeed",
            FanSpeedParameters: [{ FanSpeed: status.state === "Off" ? 0 : status.speed }],
        });
    }
}
