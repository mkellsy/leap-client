import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { Processor } from "./Processor";
import { SwitchState } from "./SwitchState";

/**
 * Defines a on/off switch device.
 */
export class Switch extends Common<SwitchState> implements Interfaces.Switch {
    /**
     * Creates a on/off switch device.
     *
     * ```js
     * const switch = new Switch(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: Leap.Area, zone: Leap.Zone) {
        super(Interfaces.DeviceType.Switch, processor, area, zone, { state: "Off" });

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * switch.update({ SwitchedLevel: "On" });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        this.state = {
            ...previous,
            state: status.SwitchedLevel || "Unknown",
        };

        if (this.initialized && !equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }

        this.initialized = true;
    }

    /**
     * Controls this device.
     *
     * ```js
     * switch.set({ state: "On" });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: SwitchState): Promise<void> {
        return this.processor.command(this.address, {
            CommandType: "GoToLevel",
            Parameter: [{ Type: "Level", Value: status.state === "On" ? 100 : 0 }],
        });
    }
}
