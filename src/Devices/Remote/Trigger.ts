import { Button } from "@mkellsy/hap-device";
import { EventEmitter } from "@mkellsy/event-emitter";

import { ButtonStatus } from "../../Interfaces/ButtonStatus";

/**
 * Defines a button tracker. This enables single, double and long presses on
 * remotes.
 */
export interface Trigger
    extends EventEmitter<{
        Press: (button: Button) => void;
        DoublePress: (button: Button) => void;
        LongPress: (button: Button) => void;
    }> {
    /**
     * The button id.
     *
     * @returns A string of the button id.
     */
    readonly id: string;

    /**
     * The definition of the button.
     *
     * @returns A button object.
     */
    readonly definition: Button;

    /**
     * Resets the button state to idle.
     */
    reset(): void;

    /**
     * Updates the button state and tracks single, double or long presses.
     *
     * @param status The current button status.
     */
    update(status: ButtonStatus): void;
}
