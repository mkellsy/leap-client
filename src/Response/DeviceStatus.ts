import { Address } from "./Address";
import { DeviceHeard } from "./DeviceHeard";

/**
 * Device discovery status.
 * @private
 */
export type DeviceStatus = Address & {
    /**
     * Device discovery response.
     */
    DeviceHeard: DeviceHeard;
};
