import Colors from "colors";

import { AreaDefinition, ButtonDefinition, DeviceDefinition, Response, OneButtonStatusEvent } from "@mkellsy/leap";

import { ButtonMap } from "../Interfaces/ButtonMap";
import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";
import { Trigger } from "../Trigger";

export class Remote extends Device implements DeviceInterface {
    private triggers: Map<string, Trigger> = new Map();

    constructor(processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Remote, processor, area, definition);

        this.log.debug(`${this.area.Name} ${Colors.green("Remote")} ${this.name}`);

        this.processor.buttons(this.address).then((groups) => {
            for (let i = 0; i < groups.length; i++) {
                for (let j = 0; j < groups[i].Buttons.length; j++) {
                    const button = groups[i].Buttons[j];
                    const map = ButtonMap.get(definition.DeviceType);
                    const layout = map?.get(button.ButtonNumber);

                    const trigger = new Trigger(this.processor, this, button, {
                        raiseLower: layout?.RaiseLower,
                    });

                    trigger.on("Press", this.onPress(trigger, "Press"));
                    trigger.on("DoublePress", this.onPress(trigger, "DoublePress"));
                    trigger.on("LongPress", this.onPress(trigger, "LongPress"));

                    this.triggers.set(button.href, trigger);
                    this.processor.subscribe(`${button.href}/status/event`, this.onUpdate(button));
                }
            }
        });
    }

    private onPress(trigger: Trigger, action: string): () => void {
        return (): void => {
            const definition = {
                id: trigger.id,
                name: this.name,
                area: this.area.Name,
                type: DeviceType[this.type],
            };

            this.emit("Update", { ...definition, status: action, statusType: "Button" });

            setTimeout(() => this.emit("Update", { ...definition, status: "Release", statusType: "Button" }), 100);
        };
    }

    private onUpdate(button: ButtonDefinition): (response: Response) => void {
        return (response: Response): void => {
            if (response.Header.MessageBodyType === "OneButtonStatusEvent") {
                const status = (response.Body! as OneButtonStatusEvent).ButtonStatus;
                const trigger = this.triggers.get(button.href);

                if (trigger != null) {
                    trigger.update(status);
                }
            }
        };
    }
}
