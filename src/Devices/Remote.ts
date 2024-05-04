import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import Colors from "colors";

import { ButtonMap } from "../Interfaces/ButtonMap";

import { Common } from "./Common";
import { Processor } from "./Processor";
import { Trigger } from "../Trigger";

export class Remote extends Common implements Interfaces.Remote {
    public readonly buttons: Interfaces.Button[] = [];

    private triggers: Map<string, Trigger> = new Map();

    constructor(processor: Processor, area: Leap.Area, device: Leap.Device) {
        super(Interfaces.DeviceType.Remote, processor, area, device);

        this.processor.buttons(this.address).then((groups) => {
            for (let i = 0; i < groups.length; i++) {
                for (let j = 0; j < groups[i].Buttons.length; j++) {
                    const button = groups[i].Buttons[j];
                    const map = ButtonMap.get(device.DeviceType);
                    const index = map?.get(button.ButtonNumber)![0] as number;
                    const raiseLower = map?.get(button.ButtonNumber)![1] as boolean;

                    const trigger = new Trigger(this.processor, button, index, { raiseLower });

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
                    this.buttons.push(trigger.definition);

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
