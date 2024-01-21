import Colors from "colors";

import {
    AreaDefinition,
    ButtonDefinition,
    DeviceDefinition,
    Response,
    OneButtonStatusEvent,
    ZoneStatus,
} from "@mkellsy/leap";

import { Device } from "../Device";
import { DeviceInterface } from "../Interfaces/DeviceInterface";
import { DeviceType } from "../Interfaces/DeviceType";
import { Processor } from "./Processor";

export class Keypad extends Device implements DeviceInterface {
    private deviceDefinition: DeviceDefinition;

    constructor (processor: Processor, area: AreaDefinition, definition: DeviceDefinition) {
        super(DeviceType.Keypad, processor, area, definition);

        this.deviceDefinition = definition;
        this.log.debug(`${this.area.Name} ${Colors.green("Keypad")} ${this.name}`);

        this.mapButtons();
    }

    public get definition(): DeviceDefinition {
        return this.deviceDefinition;
    }

    private async mapButtons(): Promise<void> {
        switch (this.definition.DeviceType) {
            case "SunnataKeypad":
            case "SunnataHybridKeypad":
                const groups = await this.processor.buttons(this.definition);

                for (let i = 0; i < groups.length; i++) {
                    for (let j = 0; j < groups[i].Buttons.length; j++) {
                        const button = groups[i].Buttons[j];

                        this.processor.subscribe(`${button.href}/status/event`, this.onPress(button));
                    }
                }

                return;
        }
    }

    public override updateStatus(status: ZoneStatus): void {
        this.deviceState = {
            state: status?.SwitchedLevel || "Unknown",
            availability: status?.Availability || "Unknown",
        }

        this.log.debug(`${this.area.Name} ${this.name} ${Colors.green(this.status.state)}`);
    }

    private onPress(button: ButtonDefinition): (response: Response) => void {
        return (response: Response): void => {
            if (response.Header.MessageBodyType === "OneButtonStatusEvent") {
                const status = (response.Body! as OneButtonStatusEvent).ButtonStatus;
                const action = status.ButtonEvent.EventType;

                if (action !== "Press") {
                    return;
                }

                this.log.debug(`${this.area.Name} ${this.name} ${Colors.dim(button.Engraving.Text || button.Name)} ${Colors.green(action)}`);
            }
        };
    }
}
