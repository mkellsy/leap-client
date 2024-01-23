import * as Logger from "js-logger";

import { Address, Area, AreaStatus, ZoneStatus } from "@mkellsy/leap";

import { DeviceState } from "./DeviceState";
import { DeviceType } from "./DeviceType";

export interface DeviceInterface {
    id: string;
    name: string;
    log: Logger.ILogger;
    address: Address;
    type: DeviceType;
    area: Area;
    status: DeviceState;

    update(status: ZoneStatus | AreaStatus): void;
}
