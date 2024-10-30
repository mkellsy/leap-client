import { Address } from "./Address";

/**
 * Defines a processor client settings.
 */
export type ClientSetting = Address & {
    /**
     * Client major version.
     */
    ClientMajorVersion: number;

    /**
     * Client minor version.
     */
    ClientMinorVersion: number;

    /**
     * Client permission and role.
     */
    Permissions: { SessionRole: string };
};
