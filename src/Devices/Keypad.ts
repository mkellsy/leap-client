import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Keypad extends Device implements DeviceInterface {
    constructor(processor: Processor, area: Leap.Area, definition: Leap.Device) {
        super(DeviceType.Keypad, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Keypad")} ${this.name}`);

        switch (definition.DeviceType) {
            case "SunnataKeypad":
            case "SunnataHybridKeypad":
                this.processor.buttons(this.address).then((groups) => {
                    for (let i = 0; i < groups.length; i++) {
                        for (let j = 0; j < groups[i].Buttons.length; j++) {
                            const button = groups[i].Buttons[j];

                            this.processor.subscribe<Leap.ButtonStatus>(
                                { href: `${button.href}/status/event` },
                                (status: Leap.ButtonStatus): void => {
                                    const id = `LEAP-${this.processor.id}-KEYPAD-${button.href.split("/")[2]}`;
                                    const action = status.ButtonEvent.EventType;

                                    const definition = {
                                        id,
                                        name: this.name,
                                        area: this.area.Name,
                                        type: DeviceType[this.type],
                                    };

                                    if (action !== "Press") {
                                        return;
                                    }

                                    this.emit("Update", { ...definition, status: action, statusType: "Button" });

                                    setTimeout(
                                        () =>
                                            this.emit("Update", {
                                                ...definition,
                                                status: "Release",
                                                statusType: "Button",
                                            }),
                                        100
                                    );
                                }
                            );
                        }
                    }
                });
        }
    }
}
