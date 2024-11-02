import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { AreaAddress } from "../../Interfaces/AreaAddress";
import { Common } from "../Common";
import { Processor } from "../Processor/Processor";
import { ShadeState } from "./ShadeState";
import { ZoneAddress } from "../../Interfaces/ZoneAddress";

/**
 * Defines a window shade device.
 */
export class Shade extends Common<ShadeState> implements Interfaces.Shade {
    /**
     * Creates a window shade device.
     *
     * ```js
     * const shade = new Shade(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: AreaAddress, zone: ZoneAddress) {
        super(Interfaces.DeviceType.Shade, processor, area, zone, {
            state: "Closed",
            level: 0,
            tilt: 0,
        });

        this.fields.set("state", { type: "String", values: ["On", "Off"] });
        this.fields.set("level", { type: "Integer", min: 0, max: 100 });
        this.fields.set("tilt", { type: "Integer", min: 0, max: 100 });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * shade.update({ Level: 100 });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        if (status.Level != null) {
            this.state.state = status.Level > 0 ? "Open" : "Closed";
            this.state.level = status.Level;
        }

        if (status.Tilt != null) {
            this.state.tilt = status.Tilt;
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
     * shade.set({ state: "Open", level: 50, tilt: 50 });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: ShadeState): Promise<void> {
        const waits: Promise<void>[] = [];

        waits.push(
            this.processor.command(this.address, {
                CommandType: "GoToLevel",
                Parameter: [{ Type: "Level", Value: status.state === "Closed" ? 0 : status.level }],
            }),
        );

        if (status.tilt != null) {
            waits.push(
                this.processor.command(this.address, {
                    CommandType: "TiltParameters",
                    TiltParameters: { Tilt: status.state === "Closed" ? 0 : status.tilt },
                }),
            );
        }

        return new Promise((resolve, reject) => {
            Promise.all(waits)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }
}
