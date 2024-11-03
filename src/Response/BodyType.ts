import { AreaAddress } from "./AreaAddress";
import { AreaScene } from "./AreaScene";
import { AreaStatus } from "./AreaStatus";
import { Authentication } from "./Authentication";
import { ButtonAddress } from "./ButtonAddress";
import { ButtonGroup } from "./ButtonGroup";
import { ButtonGroupExpanded } from "./ButtonGroupExpanded";
import { ButtonStatus } from "./ButtonStatus";
import { ClientSetting } from "./ClientSetting";
import { ControlStation } from "./ControlStation";
import { DeviceAddress } from "./DeviceAddress";
import { DeviceStatus } from "./DeviceStatus";
import { DimmedLevelAssignment } from "./DimmedLevelAssignment";
import { ExceptionDetail } from "./ExceptionDetail";
import { FanSpeedAssignment } from "./FanSpeedAssignment";
import { LinkNode } from "./LinkNode";
import { OccupancyGroup } from "./OccupancyGroup";
import { OccupancyGroupStatus } from "./OccupancyGroupStatus";
import { PhysicalAccess } from "./PhysicalAccess";
import { PingResponse } from "./PingResponse";
import { Preset } from "./Preset";
import { PresetAssignment } from "./PresetAssignment";
import { ProgrammingModel } from "./ProgrammingModel";
import { Project } from "./Project";
import { TiltAssignment } from "./TiltAssignment";
import { TimeclockAddress } from "./TimeclockAddress";
import { TimeclockStatus } from "./TimeclockStatus";
import { VirtualButton } from "./VirtualButton";
import { ZoneAddress } from "./ZoneAddress";
import { ZoneStatus } from "./ZoneStatus";

/**
 * Response body types
 * @private
 */
export type BodyType =
    | AreaAddress
    | AreaAddress[]
    | AreaScene
    | AreaScene[]
    | AreaStatus
    | AreaStatus[]
    | Authentication
    | ButtonAddress
    | ButtonAddress[]
    | ButtonGroup
    | ButtonGroup[]
    | ButtonGroupExpanded
    | ButtonGroupExpanded[]
    | ButtonStatus
    | ButtonStatus[]
    | ClientSetting
    | ClientSetting[]
    | ControlStation
    | ControlStation[]
    | DeviceAddress
    | DeviceAddress[]
    | DeviceStatus
    | DeviceStatus[]
    | DimmedLevelAssignment
    | DimmedLevelAssignment[]
    | ExceptionDetail
    | ExceptionDetail[]
    | FanSpeedAssignment
    | FanSpeedAssignment[]
    | LinkNode
    | LinkNode[]
    | OccupancyGroup
    | OccupancyGroup[]
    | OccupancyGroupStatus
    | OccupancyGroupStatus[]
    | PhysicalAccess
    | PingResponse
    | PingResponse[]
    | Preset
    | Preset[]
    | PresetAssignment
    | PresetAssignment[]
    | ProgrammingModel
    | ProgrammingModel[]
    | Project
    | Project[]
    | TiltAssignment
    | TiltAssignment[]
    | TimeclockAddress
    | TimeclockAddress[]
    | TimeclockStatus
    | TimeclockStatus[]
    | VirtualButton
    | VirtualButton[]
    | ZoneAddress
    | ZoneAddress[]
    | ZoneStatus
    | ZoneStatus[];
