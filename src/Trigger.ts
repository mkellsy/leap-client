import * as Leap from "@mkellsy/leap";

import { Button, TriggerOptions, TriggerState } from "@mkellsy/hap-device";

import { EventEmitter } from "@mkellsy/event-emitter";
import { Processor } from "./Devices/Processor";

/**
 * Defines a button tracker. This enables single, double and long presses on
 * remotes.
 */
export class Trigger extends EventEmitter<{
    Press: (button: Button) => void;
    DoublePress: (button: Button) => void;
    LongPress: (button: Button) => void;
}> {
    private processor: Processor;
    private action: Leap.Button;
    private options: TriggerOptions;

    private timer?: NodeJS.Timeout;
    private state: TriggerState = TriggerState.Idle;
    private button: Button;
    private index: number;

    /**
     * Creates a button tracker.
     *
     * @param processor A refrence to the processor.
     * @param button A reference to the individual button.
     * @param index An index of the button on the device.
     * @param options Button options like click speed, raise or lower.
     */
    constructor(processor: Processor, button: Leap.Button, index: number, options?: Partial<TriggerOptions>) {
        super();

        this.index = index;
        this.processor = processor;
        this.action = button;

        this.options = {
            doubleClickSpeed: 300,
            clickSpeed: 450,
            raiseLower: false,
            ...options,
        };

        this.button = {
            id: this.id,
            index: this.index,
            name: (this.action.Engraving || {}).Text || this.action.Name,
        };

        if (this.options.raiseLower === true) {
            this.button.raiseLower = true;
        }
    }

    /**
     * The button id.
     *
     * @returns A string of the button id.
     */
    public get id(): string {
        return `LEAP-${this.processor.id}-BUTTON-${this.action.href.split("/")[2]}`;
    }

    /**
     * The definition of the button.
     *
     * @returns A button object.
     */
    public get definition(): Button {
        return this.button;
    }

    /**
     * Resets the button state to idle.
     */
    public reset() {
        this.state = TriggerState.Idle;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = undefined;
    }

    /**
     * Updates the button state and tracks single, double or long presses.
     *
     * @param status The current button status.
     */
    public update(status: Leap.ButtonStatus): void {
        const longPressTimeoutHandler = () => {
            this.reset();

            if (this.options.clickSpeed === 0) {
                return;
            }

            this.emit("LongPress", this.button);
        };

        const doublePressTimeoutHandler = () => {
            this.reset();
            this.emit("Press", this.button);
        };

        switch (this.state) {
            case TriggerState.Idle: {
                if (status.ButtonEvent.EventType === "Press") {
                    this.state = TriggerState.Down;

                    if (this.options.clickSpeed > 0) {
                        this.timer = setTimeout(longPressTimeoutHandler, this.options.clickSpeed);
                    } else {
                        doublePressTimeoutHandler();
                    }
                }

                break;
            }

            case TriggerState.Down: {
                if (status.ButtonEvent.EventType === "Release") {
                    this.state = TriggerState.Up;

                    if (this.timer) {
                        clearTimeout(this.timer);
                    }

                    if (this.options.doubleClickSpeed > 0) {
                        this.timer = setTimeout(
                            doublePressTimeoutHandler,
                            this.options.doubleClickSpeed + (this.options.raiseLower ? 250 : 0),
                        );
                    }
                } else {
                    this.reset();
                }

                break;
            }

            case TriggerState.Up: {
                if (status.ButtonEvent.EventType === "Press" && this.timer) {
                    this.reset();

                    if (this.options.doubleClickSpeed === 0) {
                        return;
                    }

                    this.emit("DoublePress", this.button);
                } else {
                    this.reset();
                }

                break;
            }
        }
    }
}
