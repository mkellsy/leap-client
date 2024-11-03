/**
 * Defines a physical address properties.
 * @private
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
