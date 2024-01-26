import { ILogger } from "js-logger";
import { Address, Area, AreaStatus, ZoneStatus } from "@mkellsy/leap";

import { DeviceState } from "./DeviceState";
import { DeviceType } from "./DeviceType";

export interface Device {
    id: string;
    name: string;
    room: string;
    log: ILogger;
    address: Address;
    type: DeviceType;
    area: Area;
    status: DeviceState;

    on(event: string, listener: Function): this;
    once(event: string, listener: Function): this;
    off(event?: string, listener?: Function): this;
    emit(...payload: any[]): boolean;
    update(status: ZoneStatus | AreaStatus): void;
    set(state: DeviceState): void;
}
