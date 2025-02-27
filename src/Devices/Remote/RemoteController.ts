import Colors from "colors";

import { Button, DeviceState, DeviceType } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { ButtonMap } from "./ButtonMap";
import { ButtonStatus } from "../../Response/ButtonStatus";
import { Common } from "../Common";
import { DeviceAddress } from "../../Response/DeviceAddress";
import { Processor } from "../Processor/Processor";
import { Remote } from "./Remote";
import { Trigger } from "./Trigger";
import { TriggerController } from "./TriggerController";

/**
 * Defines a Pico remote device.
 * @public
 */
export class RemoteController extends Common<DeviceState> implements Remote {
    public readonly buttons: Button[] = [];

    private triggers: Map<string, Trigger> = new Map();

    /**
     * Creates a Pico remote device.
     *
     * ```js
     * const remote = new Remote(processor, area, device);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param device A refrence to this device.
     */
    constructor(processor: Processor, area: AreaAddress, device: DeviceAddress) {
        super(DeviceType.Remote, processor, area, device, { state: "Unknown" });

        this.processor
            .buttons(this.address)
            .then((groups) => {
                for (let i = 0; i < groups?.length; i++) {
                    for (let j = 0; j < groups[i].Buttons?.length; j++) {
                        const button = groups[i].Buttons[j];
                        const map = ButtonMap.get(device.DeviceType);
                        const index = map!.get(button.ButtonNumber)![0] as number;
                        const raiseLower = map!.get(button.ButtonNumber)![1] as boolean;

                        const trigger = new TriggerController(this.processor, button, index, { raiseLower });

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

                        this.processor
                            .subscribe<ButtonStatus>(
                                { href: `${button.href}/status/event` },
                                (status: ButtonStatus): void => this.triggers.get(button.href)!.update(status),
                            )
                            .catch((error) => this.log.error(Colors.red(error.message)));
                    }
                }
            })
            .catch((error: Error) => this.log.error(Colors.red(error.message)));
    }

    /**
     * Recieves a state response from the processor (not supported).
     */
    public update(): void {
        this.initialized = true;
    }

    /**
     * Controls this device (not supported).
     */
    public set = (): Promise<void> => Promise.resolve();
}
