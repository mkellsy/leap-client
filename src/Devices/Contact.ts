import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import equals from "deep-equal";

import { Common } from "./Common";
import { ContactState } from "./ContactState";
import { Processor } from "./Processor";

/**
 * Defines a CCO device.
 */
export class Contact extends Common<ContactState> implements Interfaces.Contact {
    /**
     * Creates a CCO device.
     *
     * ```js
     * const cco = new Contact(processor, area, zone);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param zone The zone assigned to this device.
     */
    constructor(processor: Processor, area: Leap.Area, zone: Leap.Zone) {
        super(Interfaces.DeviceType.Contact, processor, area, zone, { state: "Open" });

        this.fields.set("state", { type: "String", values: ["Open", "Closed"] });
    }

    /**
     * Recieves a state response from the connection and updates the device
     * state.
     *
     * ```js
     * cco.update({ CCOLevel: "Closed" });
     * ```
     *
     * @param status The current device state.
     */
    public update(status: Interfaces.ZoneStatus): void {
        const previous = { ...this.status };

        if (status.CCOLevel != null) {
            this.state.state = status.CCOLevel;
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
     * cco.set({ state: "Closed" });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: ContactState): Promise<void> {
        return this.processor.command(this.address, {
            CommandType: "GoToCCOLevel",
            CCOLevelParameters: { CCOLevel: status.state },
        });
    }
}
