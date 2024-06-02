import { HostAddress } from "@mkellsy/hap-device";

export interface ProcessorAddress {
    id: string;
    addresses: HostAddress[];
    type: string;
}
