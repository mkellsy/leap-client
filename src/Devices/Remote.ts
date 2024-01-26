import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { ButtonMap } from "../Interfaces/ButtonMap";
import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";
import { Trigger } from "../Trigger";

export class Remote extends Device implements DeviceInterface {
    private triggers: Map<string, Trigger> = new Map();

    constructor(processor: Processor, area: Leap.Area, definition: Leap.Device) {
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

                    trigger.on("Press", (): void => {
                        const definition = {
                            id: trigger.id,
                            name: this.name,
                            area: this.area.Name,
                            type: DeviceType[this.type],
                        };

                        this.emit("Update", { ...definition, status: "Press", statusType: "Button" });

                        setTimeout(
                            () => this.emit("Update", { ...definition, status: "Release", statusType: "Button" }),
                            100
                        );
                    });

                    trigger.on("DoublePress", (): void => {
                        const definition = {
                            id: trigger.id,
                            name: this.name,
                            area: this.area.Name,
                            type: DeviceType[this.type],
                        };

                        this.emit("Update", { ...definition, status: "DoublePress", statusType: "Button" });

                        setTimeout(
                            () => this.emit("Update", { ...definition, status: "Release", statusType: "Button" }),
                            100
                        );
                    });

                    trigger.on("LongPress", (): void => {
                        const definition = {
                            id: trigger.id,
                            name: this.name,
                            area: this.area.Name,
                            type: DeviceType[this.type],
                        };

                        this.emit("Update", { ...definition, status: "LongPress", statusType: "Button" });

                        setTimeout(
                            () => this.emit("Update", { ...definition, status: "Release", statusType: "Button" }),
                            100
                        );
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
}
