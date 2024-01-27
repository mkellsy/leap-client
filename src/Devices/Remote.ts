import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { ButtonMap } from "../Interfaces/ButtonMap";
import { Common } from "./Common";
import { Device } from "../Interfaces/Device";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";
import { Trigger } from "../Trigger";

export class Remote extends Common implements Device {
    private triggers: Map<string, Trigger> = new Map();

    constructor(processor: Processor, area: Leap.Area, device: Leap.Device) {
        super(DeviceType.Remote, processor, area, device);

        this.processor.buttons(this.address).then((groups) => {
            for (let i = 0; i < groups.length; i++) {
                for (let j = 0; j < groups[i].Buttons.length; j++) {
                    const button = groups[i].Buttons[j];
                    const map = ButtonMap.get(device.DeviceType);
                    const raiseLower = map?.get(button.ButtonNumber);

                    const trigger = new Trigger(this.processor, button, { raiseLower });

                    trigger.on("Press", (button): void => {
                        this.emit("Action", this, button, "Press");

                        setTimeout(() => this.emit("Action", this, button, "Release"), 100);
                    });

                    trigger.on("DoublePress", (button): void => {
                        this.emit("Action", this, button, "DoublePress");

                        setTimeout(() => this.emit("Action", this, button, "Release"), 100);
                    });

                    trigger.on("LongPress", (button): void => {
                        this.emit("Action", this, button, "LongPress");

                        setTimeout(() => this.emit("Action", this, button, "Release"), 100);
                    });

                    this.triggers.set(button.href, trigger);

                    this.processor.subscribe<Leap.ButtonStatus>(
                        { href: `${button.href}/status/event` },
                        (status: Leap.ButtonStatus): void => {
                            const trigger = this.triggers.get(button.href);

                            if (trigger != null) {
                                trigger.update(status);
                            }
                        }
                    );
                }
            }
        }).catch((error) => this.log.error(Colors.red(error.message)));
    }

    public update(_status: unknown): void {}
    public set(_state: unknown): void {}
}
