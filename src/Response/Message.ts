import { RequestType } from "./RequestType";

/**
 * Defines a raw message from the processor.
 */
export interface Message {
    /**
     * The request type.
     */
    CommuniqueType?: RequestType;

    /**
     * Request header list.
     */
    Header: {
        /**
         * Request type.
         */
        RequestType?: string;

        /**
         * Tag from the client.
         */
        ClientTag: string;

        /**
         * Request URL.
         */
        Url: string;
    };

    /**
     * Request body for commands.
     */
    Body?: Record<string, unknown>;
}
