import { Message } from "./Message";
import { Response } from "./Response";

/**
 * Defines a partial chunked response from device.
 */
export interface InflightMessage {
    /**
     * Current message.
     */
    message: Message;

    /**
     * Callback for when the message is complete.
     *
     * @param message Complete message.
     */
    resolve: (message: Response) => void;

    /**
     * Callback when the message fails.
     * @param error The current exception.
     */
    reject: (error: Error) => void;

    /**
     * Request timeout.
     */
    timeout: NodeJS.Timeout;
}
