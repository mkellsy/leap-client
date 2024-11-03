import equals from "deep-equal";

import { DeviceType, ZoneStatus } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { Common } from "../Common";
import { Fan } from "./Fan";
import { FanState } from "./FanState";
import { Processor } from "../Processor/Processor";
import { ZoneAddress } from "../../Response/ZoneAddress";

/**
 * Defines a fan device.
 * @public
 */
export class FanController extends Common<FanState> implements Fan {
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
    constructor(processor: Processor, area: AreaAddress, zone: ZoneAddress) {
        super(DeviceType.Fan, processor, area, zone, { state: "Off", speed: 0 });

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
    public update(status: ZoneStatus): void {
        const previous = { ...this.status };
        const speed = this.parseFanSpeed(status.FanSpeed as unknown as string);

        this.state = {
            ...previous,
            state: speed > 0 ? "On" : "Off",
            speed,
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
     * fan.set({ state: "On", speed: 3 });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: FanState): Promise<void> {
        const speed = status.state === "Off" ? "Off" : this.lookupFanSpeed(status.speed);

        return this.processor.command(this.address, {
            CommandType: "GoToFanSpeed",
            FanSpeedParameters: [{ FanSpeed: speed }],
        });
    }

    /*
     * Converts a 7 speed setting to a 4 speed string value.
     */
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

    /*
     * Converts a 4 speed string speed to a numeric 7 speed value.
     */
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
