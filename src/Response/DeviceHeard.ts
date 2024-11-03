/**
 * Device discovered response.
 * @private
 */
export type DeviceHeard = {
    /**
     * How was this device discovered.
     */
    DiscoveryMechanism: "UserInteraction" | "UnassociatedDeviceDiscovery" | "Unknown";

    /**
     * Device serial number.
     */
    SerialNumber: string;

    /**
     * Device type.
     */
    DeviceType: string;

    /**
     * Device model number.
     */
    ModelNumber: string;
};
