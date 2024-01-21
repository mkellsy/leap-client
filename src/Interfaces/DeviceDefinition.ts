import { AreaDefinition } from "@mkellsy/leap";
import { DeviceType } from "./DeviceType";

export interface DeviceDefinition {
    id: string;
    href: string;
    name: string;
    area: AreaDefinition;
    type: DeviceType;
}
