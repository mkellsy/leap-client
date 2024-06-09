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
        this.fields.set("speed", { type: "Integer", min: 0, max: 7 });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * fan.update({ SwitchedLevel: "On", FanSpeed: 7 });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };
        const speed = this.parseFanSpeed(status.FanSpeed as unknown as string);

        this.state = {
            ...previous,
            state: speed > 0 ? "On" : "Off",
            speed,
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
        const speed = status.state === "Off" ? 0 : this.lookupFanSpeed(status.speed);

        return this.processor.command(this.address, {
            CommandType: "GoToFanSpeed",
            FanSpeedParameters: [{ FanSpeed: speed }],
        });
    }

    private lookupFanSpeed(value: number): string {
        switch (value) {
            case 1:
                return "Low";

            case 2:
            case 3:
                return "Medium";

            case 4:
            case 5:
                return "MediumHigh";

            case 6:
            case 7:
                return "High";

            default:
                return "Off";
        }
    }

    private parseFanSpeed(value: string): number {
        switch (value) {
            case "Low":
                return 1;

            case "Medium":
                return 3;

            case "MediumHigh":
                return 5;

            case "High":
                return 7;

            default:
                return 0;
        }
    }
}
