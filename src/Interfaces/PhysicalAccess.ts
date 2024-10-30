/**
 * Defines a physical address properties.
 */
export interface PhysicalAccess {
    /**
     * Address status.
     */
    Status: {
        /**
         * Permission list.
         */
        Permissions: unknown[];
    };
}
