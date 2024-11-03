import { Address } from "./Address";

/**
 * Defines a device.
 * @private
 */
export type DeviceAddress = Address & {
    /**
     * The device name.
     */
    Name: string;

    /**
     * Parent node address.
     */
    Parent: Address;

    /**
     * Device serial number.
     */
    SerialNumber: string;

    /**
     * Device model number.
     */
    ModelNumber: string;

    /**
     * DEvice type.
     */
    DeviceType: string;

    /**
     * List of button groups.
     */
    ButtonGroups: Address[];

    /**
     * List of local zones.
     */
    LocalZones: Address[];

    /**
     * Area this device belongs to.
     */
    AssociatedArea: Address;

    /**
     * List of sensors.
     */
    OccupancySensors: Address[];

    /**
     * List of linked node addresses.
     */
    LinkNodes: Address[];

    /**
     * List of device rules.
     */
    DeviceRules: Address[];

    /**
     * Device's repeater properties (if supported).
     */
    RepeaterProperties: {
        /**
         * Is this device a repeater.
         */
        IsRepeater: boolean;
    };

    /**
     * Devices firmware information.
     */
    FirmwareImage: {
        /**
         * Devices firmware.
         */
        Firmware: {
            /**
             * Firmware name.
             */
            DisplayName: string;
        };

        /**
         * Currently installed firmware.
         */
        Installed: {
            /**
             * Year installed.
             */
            Year: number;

            /**
             * Month installed.
             */
            Month: number;

            /**
             * Day installed.
             */
            Day: number;

            /**
             * Hour installed.
             */
            Hour: number;

            /**
             * Minute installed.
             */
            Minute: number;

            /**
             * Second installed.
             */
            Second: number;

            /**
             * UTC date and time installed.
             */
            Utc: string;
        };
    };

    /**
     * Is this device addressed.
     */
    AddressedState?: "Addressed" | "Unaddressed" | "Unknown";

    /**
     * Is the device an actual device.
     */
    IsThisDevice?: boolean;
};
