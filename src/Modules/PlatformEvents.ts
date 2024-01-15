import { Response } from "@mkellsy/leap";

export type PlatformEvents = {
    Message: (response: Response) => void;
};
