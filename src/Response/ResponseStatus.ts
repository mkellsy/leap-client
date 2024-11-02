/**
 * Creates a response status object.
 */
export class ResponseStatus {
    /**
     * Status message
     */
    public message?: string;

    /**
     * Status code
     */
    public code?: number;

    /**
     * Creates a response status object.
     *
     * @param message Complete response.
     * @param code Response code from the message.
     */
    constructor(message?: string, code?: number) {
        this.message = message;
        this.code = code;
    }

    /**
     * Creates a response status object from a string.
     *
     * @param value Status string.
     *
     * @returns A response status object.
     */
    static fromString(value?: string): ResponseStatus {
        const parts = value?.split(" ", 2);

        if (parts == null || parts.length === 1) {
            return new ResponseStatus(value);
        }

        const code = parseInt(parts[0], 10);

        if (Number.isNaN(code)) {
            return new ResponseStatus(value);
        }

        return new ResponseStatus(parts[1], code);
    }

    /**
     * Is the status successful.
     *
     * @returns True if successful, false if not.
     */
    public isSuccessful(): boolean {
        return this.code !== undefined && this.code >= 200 && this.code < 300;
    }
}
