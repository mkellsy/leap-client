import Colors from "colors";

import {
    AreaDefinition,
    ButtonDefinition,
    DeviceDefinition,
    Response,
    OneButtonStatusEvent,
    ZoneStatus,
} from "@mkellsy/leap";

import { ButtonMap } from "../Interfaces/ButtonMap";
import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";
import { Trigger } from "../Trigger";

export class Remote extends Device implements DeviceInterface {
    private deviceDefinition: DeviceDefinition;
    private triggers: Map<string, Trigger> = new Map();

    constructor(processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Remote, processor, area, definition);

        this.deviceDefinition = definition;
        this.log.debug(`${this.area.Name} ${Colors.green("Remote")} ${this.name}`);

        this.mapButtons();
    }

    public get definition(): DeviceDefinition {
        return this.deviceDefinition;
    }

    private async mapButtons(): Promise<void> {
        const groups = await this.processor.buttons(this.definition);

        for (let i = 0; i < groups.length; i++) {
            for (let j = 0; j < groups[i].Buttons.length; j++) {
                const button = groups[i].Buttons[j];
                const map = ButtonMap.get(this.definition.DeviceType);
                const definition = map?.get(button.ButtonNumber);

                this.triggers.set(
                    button.href,
                    new Trigger(this, button, {
                        raiseLower: definition?.RaiseLower,
                    }),
                );

                this.processor.subscribe(`${button.href}/status/event`, this.onUpdate(button));
            }
        }
    }

    private onUpdate(button: ButtonDefinition): (response: Response) => void {
        return (response: Response): void => {
            if (response.Header.MessageBodyType === "OneButtonStatusEvent") {
                const status = (response.Body! as OneButtonStatusEvent).ButtonStatus;
                const trigger = this.triggers.get(button.href);

                if (trigger != null) {
                    this.log.debug(`${this.area.Name} ${this.name} ${Colors.dim(button.Engraving.Text || button.Name)} ${Colors.green(status.ButtonEvent.EventType)}`);
                    trigger.update(status);
                }
            }
        };
    }
}
