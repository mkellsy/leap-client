import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import Colors from "colors";

import { Common } from "./Common";
import { Processor } from "./Processor";

export class Keypad extends Common implements Interfaces.Device {
    constructor(processor: Processor, area: Leap.Area, device: Leap.Device) {
        super(Interfaces.DeviceType.Keypad, processor, area, device);

        switch (device.DeviceType) {
            case "SunnataKeypad":
            case "SunnataHybridKeypad":
                this.processor
                    .buttons(this.address)
                    .then((groups) => {
                        for (let i = 0; i < groups.length; i++) {
                            for (let j = 0; j < groups[i].Buttons.length; j++) {
                                const button = groups[i].Buttons[j];
                                const id = `LEAP-${this.processor.id}-BUTTON-${button.href.split("/")[2]}`;

                                const definition: Interfaces.Button = {
                                    id,
                                    index: button.ButtonNumber,
                                    name: (button.Engraving || {}).Text || button.Name,
                                };

                                this.processor.subscribe<Leap.ButtonStatus>(
                                    { href: `${button.href}/status/event` },
                                    (status: Leap.ButtonStatus): void => {
                                        const action = status.ButtonEvent.EventType;

                                        if (action !== "Press") {
                                            return;
                                        }

                                        this.emit("Action", this, definition, "Press");

                                        setTimeout(() => this.emit("Action", this, definition, "Release"), 100);
                                    }
                                );
                            }
                        }
                    })
                    .catch((error) => this.log.error(Colors.red(error.message)));
        }
    }

    public update(_status: unknown): void {}
    public set(_state: unknown): void {}
}
