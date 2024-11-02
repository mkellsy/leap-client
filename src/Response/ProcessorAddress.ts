import { HostAddress } from "@mkellsy/hap-device";

/**
 * Defines a processor address as discovered from mDNS.
 */
export interface ProcessorAddress {
    /**
     * The processor id.
     */
    id: string;

    /**
     * A list of network interfaces, both IPv4 and IPv6.
     */
    addresses: HostAddress[];

    /**
     * The processor type, RA2/RA3, Caseta or Homeworks.
     */
    type: string;
}
