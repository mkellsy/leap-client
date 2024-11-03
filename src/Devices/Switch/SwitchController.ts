import equals from "deep-equal";

import { DeviceType, ZoneStatus } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { Common } from "../Common";
import { Processor } from "../Processor/Processor";
import { Switch } from "./Switch";
import { SwitchState } from "./SwitchState";
import { ZoneAddress } from "../../Response/ZoneAddress";

/**
 * Defines a on/off switch device.
 * @public
 */
export class SwitchController extends Common<SwitchState> implements Switch {
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
    constructor(processor: Processor, area: AreaAddress, zone: ZoneAddress) {
        super(DeviceType.Switch, processor, area, zone, { state: "Off" });

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
    public update(status: ZoneStatus): void {
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
