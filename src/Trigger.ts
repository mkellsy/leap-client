import * as Leap from "@mkellsy/leap";

import { Button } from "./Interfaces/Button";
import { EventEmitter } from "@mkellsy/event-emitter";
import { Processor } from "./Devices/Processor";
import { TriggerOptions } from "./Interfaces/TriggerOptions";
import { TriggerState } from "./Interfaces/TriggerState";

export class Trigger extends EventEmitter<{
    Press: (button: Button) => void;
    DoublePress: (button: Button) => void;
    LongPress: (button: Button) => void;
}> {
    private processor: Processor;
    private button: Leap.Button;
    private options: TriggerOptions;

    private timer?: NodeJS.Timeout;
    private state: TriggerState = TriggerState.Idle;
    private definition: Button;

    constructor(processor: Processor, button: Leap.Button, options?: Partial<TriggerOptions>) {
        super();

        this.processor = processor;
        this.button = button;

        this.options = {
            doubleClickSpeed: 300,
            clickSpeed: 450,
            raiseLower: false,
            ...options,
        };

        this.definition = {
            id: this.id,
            index: this.button.ButtonNumber,
            name: (this.button.Engraving || {}).Text || this.button.Name,
        };

        if (this.options.raiseLower === true) {
            this.definition.raiseLower = true;
        }
    }

    public get id(): string {
        return `LEAP-${this.processor.id}-BUTTON-${this.button.href.split("/")[2]}`;
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

            this.emit("LongPress", this.definition);
        };

        const doublePressTimeoutHandler = () => {
            this.reset();
            this.emit("Press", this.definition);
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
                        this.timer = setTimeout(doublePressTimeoutHandler, this.options.doubleClickSpeed + (this.options.raiseLower ? 250 : 0));
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

                    this.emit("DoublePress", this.definition);
                } else {
                    this.reset();
                }

                break;
            }
        }
    }
}
