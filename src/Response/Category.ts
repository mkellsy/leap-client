/**
 * Defines a catagory of devices.
 */
export type Category = {
    /**
     * Device type.
     */
    Type: string;

    /**
     * Device sub-type.
     */
    SubType: string;

    /**
     * Is this device a light.
     */
    IsLight: boolean;
};
