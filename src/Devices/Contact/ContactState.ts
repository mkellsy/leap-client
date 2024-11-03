import { DeviceState } from "@mkellsy/hap-device";

/**
 * Defines a CCO's current status response.
 * @public
 */
export interface ContactState extends DeviceState {
    /**
     * Is the contact closed or open.
     */
    state: "Closed" | "Open";
}
