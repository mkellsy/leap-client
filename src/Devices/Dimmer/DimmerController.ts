import equals from "deep-equal";

import { DeviceType, ZoneStatus } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { Common } from "../Common";
import { Dimmer } from "./Dimmer";
import { DimmerState } from "./DimmerState";
import { Processor } from "../Processor/Processor";
import { ZoneAddress } from "../../Response/ZoneAddress";

/**
 * Defines a dimmable light device.
 */
export class DimmerController extends Common<DimmerState> implements Dimmer {
    /**
     * Creates a dimmable light device.
     *
     * ```js
     * const dimmer = new Dimmer(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: AreaAddress, zone: ZoneAddress) {
        super(DeviceType.Dimmer, processor, area, zone, { state: "Off", level: 0 });

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * dimmer.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: ZoneStatus): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "On" : "Off";
            this.state.level = status.Level;
        }

        if (this.initialized && !equals(this.state, previous)) {
            this.emit("Update", this, this.state);
        }

        this.initialized = true;
    }

    /**
     * Controls this device.
     *
     * ```js
     * dimmer.set({ state: "On", level: 50 });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: DimmerState): Promise<void> {
        return this.processor.command(this.address, {
            CommandType: "GoToLevel",
            Parameter: [{ Type: "Level", Value: status.state === "Off" ? 0 : status.level }],
        });
    }
}
