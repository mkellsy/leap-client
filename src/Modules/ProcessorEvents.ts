import { Response } from "@mkellsy/leap";

export type ProcessorEvents = {
    Message: (processorID: string, response: Response) => void;
    Disconnected: () => void;
};
