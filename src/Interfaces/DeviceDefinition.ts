import { AreaDefinition } from "@mkellsy/leap";
import { DeviceType } from "./DeviceType";

export interface DeviceDefinition {
    href: string;
    name: string;
    area: AreaDefinition;
    type: DeviceType;
}
