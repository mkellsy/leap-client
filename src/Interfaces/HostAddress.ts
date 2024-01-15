import { HostAddressFamily } from "./HostAddressFamily";

export interface HostAddress {
    address: string;
    family: HostAddressFamily;
}
