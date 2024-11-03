import { Button, Remote as RemoteInterface } from "@mkellsy/hap-device";

/**
 * Defines a Pico remote device.
 * @public
 */
export interface Remote extends RemoteInterface {
    readonly buttons: Button[];
}
