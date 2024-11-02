import { Response } from "./Response";

/**
 * Defines a tagged response.
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
