import { HostAddress } from "./HostAddress";

export interface ProcessorAddress {
    id: string;
    addresses: HostAddress[];
    type: string;
};
