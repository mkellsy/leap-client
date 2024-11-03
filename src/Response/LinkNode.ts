import { Address } from "./Address";

/**
 * Defines a device's linked nodes.
 * @private
 */
export type LinkNode = Address & {
    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Link type.
     */
    LinkType: string;

    /**
     * Order amongst others.
     */
    SortOrder: number;

    /**
     * Associated link node.
     */
    AssociatedLink: Address;

    /**
     * X-Link properties.
     */
    ClearConnectTypeXLinkProperties: {
        /**
         * Pan ID.
         */
        PANID: number;

        /**
         * Pan ID (extended).
         */
        ExtendedPANID: string;

        /**
         * Channel number of the device.
         */
        Channel: number;

        /**
         * Network name.
         */
        NetworkName: string;

        /**
         * Network security key.
         */
        NetworkMasterKey: string;
    };
};
