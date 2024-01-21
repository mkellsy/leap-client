import Colors from "colors";

import { ButtonDefinition, ButtonStatus } from "@mkellsy/leap";
import { EventEmitter } from "@mkellsy/event-emitter";

import { Device } from "./Device";
import { Processor } from "./Devices/Processor";
import { TriggerOptions } from "./Interfaces/TriggerOptions";
import { TriggerState } from "./Interfaces/TriggerState";

export class Trigger extends EventEmitter<{
    Press: (status: ButtonStatus) => void;
    DoublePress: (status: ButtonStatus) => void;
    LongPress: (status: ButtonStatus) => void;
}> {
    private processor: Processor;
    private device: Device;
    private button: ButtonDefinition;
    private options: TriggerOptions;

    private timer?: NodeJS.Timeout;
    private state: TriggerState = TriggerState.Idle;

    constructor(processor: Processor, device: Device, button: ButtonDefinition, options?: Partial<TriggerOptions>) {
        super();

        this.processor = processor;
        this.device = device;
        this.button = button;

        this.options = {
            doubleClickSpeed: 300,
            clickSpeed: 350,
            raiseLower: false,
            ...options,
        };
    }

    public get id(): string {
        return `LEAP-${this.processor.id}-REMOTE-${this.button.href.split("/")[2]}`;
    }

    public reset() {
        this.state = TriggerState.Idle;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = undefined;
    }

    public update(status: ButtonStatus) {
        const longPressTimeoutHandler = () => {
            this.reset();

            if (this.options.clickSpeed === 0) {
                return;
            }

            this.device.log.debug(`${this.device.area.Name} ${this.device.name} ${Colors.dim(this.button.Engraving.Text || this.button.Name)} ${Colors.green("Long Press")}`);

            this.emit("LongPress", status);
        };

        const doublePressTimeoutHandler = () => {
            this.reset();

            this.device.log.debug(`${this.device.area.Name} ${this.device.name} ${Colors.dim(this.button.Engraving.Text || this.button.Name)} ${Colors.green("Press")}`);

            this.emit("Press", status);
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

                    this.device.log.debug(`${this.device.area.Name} ${this.device.name} ${Colors.dim(this.button.Engraving.Text || this.button.Name)} ${Colors.green("Double Press")}`);

                    this.emit("DoublePress", status);
                } else {
                    this.reset();
                }

                break;
            }
        }
    }
}
