import { Address, Area, AreaStatus, ZoneStatus } from "@mkellsy/leap";

import { DeviceState } from "./DeviceState";
import { DeviceType } from "./DeviceType";
import { Log } from "../Logger";

export interface DeviceInterface {
    id: string;
    name: string;
    log: Log;
    address: Address;
    type: DeviceType;
    area: Area;
    status: DeviceState;

    update(status: ZoneStatus | AreaStatus): void;
}
