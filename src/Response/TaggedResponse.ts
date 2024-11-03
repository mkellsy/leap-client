import { Response } from "./Response";

/**
 * Defines a tagged response.
 * @private
 */
export type TaggedResponse = {
    /**
     * Assigned response object.
     */
    response: Response;

    /**
     * Assigned tag.
     */
    tag: string;
};
