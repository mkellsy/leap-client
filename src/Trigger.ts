import * as Logger from "js-logger";

import { EventEmitter } from "@mkellsy/event-emitter";

import { TriggerOptions } from "./Interfaces/TriggerOptions";
import { TriggerState } from "./Interfaces/TriggerState";

const DOUBLE_PRESS_DWELL_MS = new Map<string, number>([
    ["quick", 300],
    ["default", 300],
    ["relaxed", 450],
    ["disabled", 0],
]);

const LONG_PRESS_TIMEOUT_MS = new Map<string, number>([
    ["quick", 300],
    ["default", 350],
    ["relaxed", 750],
    ["disabled", 0],
]);

const UP_DOWN_BTN_DELAY_MS = 250;

const log = Logger.get("Trigger");

export class Trigger extends EventEmitter<{
    ShortPress: () => void;
    DoublePress: () => void;
    LongPress: () => void;
}> {
    private href: string;

    private timer?: NodeJS.Timeout;
    private state: TriggerState = TriggerState.IDLE;

    private longPressTimeout?: number;
    private longPressDisabled = false;

    private doublePressTimeout?: number;
    private doublePressDisabled = false;

    constructor(href: string, options?: TriggerOptions) {
        super();

        this.href = href;

        options = options || {
            clickSpeedDouble: "default",
            clickSpeedLong: "default",
            isUpDownButton: false,
        };

        if (options.clickSpeedLong == null || options.clickSpeedLong === "disabled") {
            this.longPressDisabled = true;
        }

        if (options.clickSpeedDouble === "disabled") {
            this.doublePressDisabled = true;
        }

        if (options.clickSpeedDouble != null && DOUBLE_PRESS_DWELL_MS.has(options.clickSpeedDouble)) {
            this.doublePressTimeout = DOUBLE_PRESS_DWELL_MS.get(options.clickSpeedDouble);
        } else {
            this.doublePressTimeout = DOUBLE_PRESS_DWELL_MS.get("default");
        }

        if (options.clickSpeedLong != null && LONG_PRESS_TIMEOUT_MS.has(options.clickSpeedLong)) {
            this.longPressTimeout = LONG_PRESS_TIMEOUT_MS.get(options.clickSpeedLong);
        } else {
            this.longPressTimeout = LONG_PRESS_TIMEOUT_MS.get("default");
        }

        if (options.isUpDownButton && !this.doublePressDisabled) {
            this.doublePressTimeout = (this.doublePressTimeout || 0) + UP_DOWN_BTN_DELAY_MS;
        }
    }

    public reset() {
        this.state = TriggerState.IDLE;

        if (this.timer) {
            clearTimeout(this.timer);
        }

        this.timer = undefined;
    }

    public update(action: string) {
        const longPressTimeoutHandler = () => {
            this.reset();

            if (this.longPressDisabled) {
                return;
            }

            log.info(`Button "${this.href}" long press`);

            this.emit("LongPress");
        };

        const doublePressTimeoutHandler = () => {
            this.reset();

            log.info(`Button "${this.href}" short press`);

            this.emit("ShortPress");
        };

        switch (this.state) {
            case TriggerState.IDLE: {
                if (action === "Press") {
                    this.state = TriggerState.DOWN;

                    if (!this.longPressDisabled) {
                        this.timer = setTimeout(longPressTimeoutHandler, this.longPressTimeout);
                    }
                }

                break;
            }

            case TriggerState.DOWN: {
                if (action === "Release") {
                    this.state = TriggerState.UP;

                    if (this.timer) {
                        clearTimeout(this.timer);
                    }

                    this.timer = setTimeout(doublePressTimeoutHandler, this.doublePressTimeout);
                } else {
                    this.reset();
                }

                break;
            }

            case TriggerState.UP: {
                if (action === "Press" && this.timer) {
                    this.reset();

                    if (this.doublePressDisabled) {
                        return;
                    }

                    log.info(`Button "${this.href}" double press`);

                    this.emit("DoublePress");
                } else {
                    this.reset();
                }

                break;
            }
        }
    }
}
