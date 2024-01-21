import Colors from "colors";

import { AreaDefinition, ButtonDefinition, DeviceDefinition, Response, OneButtonStatusEvent } from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Keypad extends Device implements DeviceInterface {
    constructor(processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Keypad, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Keypad")} ${this.name}`);

        switch (definition.DeviceType) {
            case "SunnataKeypad":
            case "SunnataHybridKeypad":
                this.processor.buttons(this.address).then((groups) => {
                    for (let i = 0; i < groups.length; i++) {
                        for (let j = 0; j < groups[i].Buttons.length; j++) {
                            const button = groups[i].Buttons[j];

                            this.processor.subscribe(`${button.href}/status/event`, this.onPress(button));
                        }
                    }
                });
        }
    }

    private onPress(button: ButtonDefinition): (response: Response) => void {
        return (response: Response): void => {
            if (response.Header.MessageBodyType === "OneButtonStatusEvent") {
                const id = `LEAP-${this.processor.id}-KEYPAD-${button.href.split("/")[2]}`;
                const status = (response.Body! as OneButtonStatusEvent).ButtonStatus;
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

                setTimeout(() => this.emit("Update", { ...definition, status: "Release", statusType: "Button" }), 100);
            }
        };
    }
}
