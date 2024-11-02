import { ILogger } from "js-logger";

import { Device } from "@mkellsy/hap-device";
import { EventEmitter } from "@mkellsy/event-emitter";

import { Address } from "../../Response/Address";
import { AreaAddress } from "../../Response/AreaAddress";
import { ButtonGroupExpanded } from "../../Response/ButtonGroupExpanded";
import { Connection } from "../../Connection";
import { ControlStation } from "../../Response/ControlStation";
import { DeviceAddress } from "../../Response/DeviceAddress";
import { PingResponse } from "../../Response/PingResponse";
import { Project } from "../../Response/Project";
import { Response } from "../../Response/Response";
import { TimeclockAddress } from "../../Response/TimeclockAddress";
import { ZoneAddress } from "../../Response/ZoneAddress";
import { ZoneStatus } from "../../Response/ZoneStatus";

/**
 * Defines a LEAP processor. This could be a Caseta Smart Bridge, RA2/RA3
 * Processor, or a Homeworks Processor.
 */
export interface Processor
    extends EventEmitter<{
        Message: (response: Response) => void;
        Connect: (connection: Connection) => void;
        Disconnect: () => void;
    }> {
    /**
     * The processor's unique identifier.
     *
     * @returns The processor id.
     */
    readonly id: string;

    /**
     * A logger for the processor. This will automatically print the
     * processor id.
     *
     * @returns A reference to the logger assigned to this processor.
     */
    readonly log: ILogger;

    /**
     * A device map for all devices found on this processor.
     *
     * @returns A device map by device id.
     */
    readonly devices: Map<string, Device>;

    /**
     * Connects to a processor.
     */
    connect(): Promise<void>;

    /**
     * Disconnects from a processor.
     */
    disconnect(): void;

    /**
     * Clears the processor's device cache.
     */
    clear(): void;

    /**
     * Pings the processor, useful for keeping the connection alive.
     *
     * @returns A ping response.
     */
    ping(): Promise<PingResponse>;

    /**
     * Sends a read command to the processor.
     *
     * @param url The url to read.
     * @returns A response object.
     */
    read<PAYLOAD = any>(url: string): Promise<PAYLOAD>;

    /**
     * Fetches the project information assigned to this processor.
     *
     * @returns A project object.
     */
    project(): Promise<Project>;

    /**
     * Fetches the processor's system information.
     *
     * @returns The processor as a device, or undefined if the processor
     *          doesn't support this.
     */
    system(): Promise<DeviceAddress | undefined>;

    /**
     * Fetches available areas. This represents floors, rooms, and suites.
     *
     * @returns An array of area objects.
     */
    areas(): Promise<AreaAddress[]>;

    /**
     * Fetches available timeclocks.
     *
     * @returns An array of timeclock objects.
     */
    timeclocks(): Promise<TimeclockAddress[]>;

    /**
     * Fetches available zones in an area. Zones represent a light and control.
     * In other systems this is the device.
     *
     * @param address The area to fetch zones.
     *
     * @returns An array of zone objects.
     */
    zones(address: Address): Promise<ZoneAddress[]>;

    /**
     * Fetches multiple status objects from an area or zone. Typically used to
     * fetch sensor states from an area.
     *
     * @param address Address of an area or zone.
     *
     * @returns A zone status object.
     */
    status(address: Address): Promise<ZoneStatus>;

    /**
     * Fetches available control stations of an area or zone. A control station
     * represents a group of keypads or remotes.
     *
     * @param address The address of an area or zone.
     *
     * @returns An array of control station objects.
     */
    controls(address: Address): Promise<ControlStation[]>;

    /**
     * Fetches a single device in a group. This represents a single keypad or
     * Pico remote.
     *
     * @param address An address of a group position.
     *
     * @returns A device object.
     */
    device(address: Address): Promise<DeviceAddress>;

    /**
     * Fetches available buttons on a device.
     *
     * @param address An address or a device.
     *
     * @returns An array of button group objects.
     */
    buttons(address: Address): Promise<ButtonGroupExpanded[]>;

    /**
     * Sends an updatre command to the processor.
     *
     * @param address The address of the record.
     * @param field The field to update.
     * @param value The value to set.
     */
    update(address: Address, field: string, value: object): Promise<void>;

    /**
     * Sends a structured command to the processor.
     *
     * @param address The address of the zone or device.
     * @param command The structured command object.
     */
    command(address: Address, command: object): Promise<void>;

    /**
     * Subscribes to record updates. This will call the listener every time the
     * record is updated.
     *
     * @param address The assress of the record.
     * @param listener The callback to call on updates.
     */
    subscribe<T>(address: Address, listener: (response: T) => void): Promise<void>;
}
