import { ProcessorAddress } from "../Interfaces/ProcessorAddress";

export type DiscoveryEvents = {
    Discovered: (processor: ProcessorAddress) => void;
    Failed: (error: Error) => void;
};
