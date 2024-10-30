import * as Interfaces from "@mkellsy/hap-device";

import Colors from "colors";

import { AreaAddress } from "../Interfaces/AreaAddress";
import { ButtonStatus } from "../Interfaces/ButtonStatus";
import { Common } from "./Common";
import { DeviceAddress } from "../Interfaces/DeviceAddress";
import { KeypadState } from "./KeypadState";
import { Processor } from "./Processor";

/**
 * Defines a keypad device.
 */
export class Keypad extends Common<KeypadState> implements Interfaces.Keypad {
    public readonly buttons: Interfaces.Button[] = [];

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
        super(Interfaces.DeviceType.Keypad, processor, area, device, {
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
                            const id = `LEAP-${this.processor.id}-BUTTON-${button.href?.split("/")[2]}`;

                            const definition: Interfaces.Button = {
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

                                        if (action !== "Press") {
                                            return;
                                        }

                                        this.emit("Action", this, definition, "Press");

                                        setTimeout(() => this.emit("Action", this, definition, "Release"), 100);
                                    },
                                )
                                .catch((error) => this.log.error(Colors.red(error.message)));
                        }
                    }
                })
                .catch((error) => this.log.error(Colors.red(error.message)));
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
