import { Response } from "./Response";

/**
 * Defines a subscription object.
 * @private
 */
export interface Subscription {
    /**
     * The url subscribed to.
     */
    url: string;

    /**
     * The listener to call on updatres.
     *
     * @param response Any response from the connection.
     */
    listener: (response: any) => void;

    /**
     * The callback sent to the request.
     *
     * @param response The raw response.
     */
    callback: (response: Response) => void;
}
