import { EventEmitter } from "@mkellsy/event-emitter";

import { Response } from "./Response";

/**
 * Enables response buffering.
 */
export class BufferedResponse<MAP extends { [key: string]: (...args: any[]) => void }> extends EventEmitter<MAP> {
    private buffer: string = "";

    /**
     * Parses a raw response, and returns via a callback.
     *
     * @param data Raw socket buffer.
     * @param callback Listener for complete response.
     */
    public parse(data: Buffer, callback: (response: Response) => void): void {
        const response = this.buffer + data.toString();
        const lines: string[] = response.split(/\r?\n/);

        if (lines.length - 1 === 0) {
            this.buffer = response;

            return;
        }

        this.buffer = lines[lines.length - 1] || "";

        for (const line of lines.slice(0, lines.length - 1)) {
            callback(Response.parse(line));
        }
    }
}
