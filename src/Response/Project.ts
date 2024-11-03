import { Address } from "./Address";

/**
 * Defines a project on a processor.
 * @private
 */
export type Project = Address & {
    /**
     * Project name.
     */
    Name: string;

    /**
     * Control type.
     */
    ControlType: string;

    /**
     * Product type.
     */
    ProductType: string;

    /**
     * Project contact list.
     */
    Contacts: Address[];

    /**
     * Timeclock event rules.
     */
    TimeclockEventRules: Address;

    /**
     * Last modification date.
     */
    ProjectModifiedTimestamp: {
        /**
         * Year modified.
         */
        Year: number;

        /**
         * Month modified.
         */
        Month: number;

        /**
         * Day modified.
         */
        Day: number;

        /**
         * Hour modified.
         */
        Hour: number;

        /**
         * Minute modified.
         */
        Minute: number;

        /**
         * Second modified.
         */
        Second: number;

        /**
         * UTC date and time modified.
         */
        Utc: "string";
    };
};
