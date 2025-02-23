import Colors from "colors";

import { Button, DeviceType } from "@mkellsy/hap-device";

import { AreaAddress } from "../../Response/AreaAddress";
import { ButtonStatus } from "../../Response/ButtonStatus";
import { Common } from "../Common";
import { DeviceAddress } from "../../Response/DeviceAddress";
import { Keypad } from "./Keypad";
import { KeypadState } from "./KeypadState";
import { Processor } from "../Processor/Processor";

/**
 * Defines a keypad device.
 * @public
 */
export class KeypadController extends Common<KeypadState> implements Keypad {
    public readonly buttons: Button[] = [];

    /**
     * Creates a keypad device.
     *
     * ```js
     * const keypad = new Keypad(processor, area, device);
     * ```
     *
     * @param processor The processor this device belongs to.
     * @param area The area this device is in.
     * @param device A refrence to this device.
     */
    constructor(processor: Processor, area: AreaAddress, device: DeviceAddress) {
        super(DeviceType.Keypad, processor, area, device, {
            led: { href: "/unknown" },
            state: "Off",
        });

        if (device.DeviceType === "SunnataKeypad" || device.DeviceType === "SunnataHybridKeypad") {
            this.processor
                .buttons(this.address)
                .then((groups) => {
                    for (let i = 0; i < groups?.length; i++) {
                        for (let j = 0; j < groups[i].Buttons?.length; j++) {
                            const button = groups[i].Buttons[j];
                            const id = `LEAP-${this.processor.id}-BUTTON-${button.href.split("/")[2]}`;

                            const definition: Button = {
                                id,
                                index: button.ButtonNumber,
                                name: (button.Engraving || {}).Text || button.Name,
                                led: button.AssociatedLED,
                            };

                            this.buttons.push(definition);

                            this.processor
                                .subscribe<ButtonStatus>(
                                    { href: `${button.href}/status/event` },
                                    (status: ButtonStatus): void => {
                                        const action = status.ButtonEvent.EventType;

                                        if (action !== "Press") return;

                                        this.emit("Action", this, definition, "Press");

                                        setTimeout(() => this.emit("Action", this, definition, "Release"), 100);
                                    },
                                )
                                .catch((error: Error) => this.log.error(Colors.red(error.message)));
                        }
                    }
                })
                .catch((error: Error) => this.log.error(Colors.red(error.message)));
        }
    }

    /**
     * Recieves a state response from the processor (not supported).
     */
    public update(): void {
        this.initialized = true;
    }

    /**
     * Controls this LEDs on this device.
     *
     * ```js
     * keypad.set({ state: { href: "/led/123456" }, state: "On" });
     * ```
     *
     * @param status Desired device state.
     */
    public set(status: KeypadState): Promise<void> {
        return this.processor.update(status.led, "status", {
            LEDStatus: { State: status.state === "On" ? "On" : "Off" },
        });
    }
}
