import * as Leap from "@mkellsy/leap";

import { Button, TriggerOptions, TriggerState } from "@mkellsy/hap-device";

import { EventEmitter } from "@mkellsy/event-emitter";
import { Processor } from "./Devices/Processor";

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

    public get id(): string {
        return `LEAP-${this.processor.id}-BUTTON-${this.action.href.split("/")[2]}`;
    }

    public get definition(): Button {
        return this.button;
    }

    public reset() {
        this.state = TriggerState.Idle;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = undefined;
    }

    public update(status: Leap.ButtonStatus) {
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
