import { ILogger, get as getLogger } from "js-logger";

import { Device } from "@mkellsy/hap-device";

import Cache from "flat-cache";
import Colors from "colors";

import os from "os";
import path from "path";

import { EventEmitter } from "@mkellsy/event-emitter";

import { Address } from "../../Response/Address";
import { AreaAddress } from "../../Response/AreaAddress";
import { AreaStatus } from "../../Response/AreaStatus";
import { ButtonGroupExpanded } from "../../Response/ButtonGroupExpanded";
import { Connection } from "../../Connection/Connection";
import { ControlStation } from "../../Response/ControlStation";
import { DeviceAddress } from "../../Response/DeviceAddress";
import { PingResponse } from "../../Response/PingResponse";
import { Processor } from "./Processor";
import { Project } from "../../Response/Project";
import { Response } from "../../Response/Response";
import { TimeclockAddress } from "../../Response/TimeclockAddress";
import { TimeclockStatus } from "../../Response/TimeclockStatus";
import { ZoneAddress } from "../../Response/ZoneAddress";
import { ZoneStatus } from "../../Response/ZoneStatus";

/**
 * Defines a LEAP processor. This could be a Caseta Smart Bridge, RA2/RA3
 * Processor, or a Homeworks Processor.
 */
export class ProcessorController
    extends EventEmitter<{
        Message: (response: Response) => void;
        Connect: (connection: Connection) => void;
        Disconnect: () => void;
    }>
    implements Processor
{
    private uuid: string;
    private connection: Connection;
    private logger: ILogger;

    private cache: Cache.Cache;
    private discovered: Map<string, Device> = new Map();

    /**
     * Creates a LEAP processor.
     *
     * @param id The processor UUID.
     * @param connection A reference to the connection to the processor.
     */
    constructor(id: string, connection: Connection) {
        super();

        this.uuid = id;
        this.logger = getLogger(`Processor ${Colors.dim(this.id)}`);
        this.connection = connection;
        this.cache = Cache.load(id, path.join(os.homedir(), ".leap"));

        this.connection.on("Connect", this.onConnect);
        this.connection.on("Message", this.onMessage);
        this.connection.once("Disconnect", this.onDisconnect);
    }

    /**
     * The processor's unique identifier.
     *
     * @returns The processor id.
     */
    public get id(): string {
        return this.uuid;
    }

    /**
     * A logger for the processor. This will automatically print the
     * processor id.
     *
     * @returns A reference to the logger assigned to this processor.
     */
    public get log(): ILogger {
        return this.logger;
    }

    /**
     * A device map for all devices found on this processor.
     *
     * @returns A device map by device id.
     */
    public get devices(): Map<string, Device> {
        return this.discovered;
    }

    /**
     * Connects to a processor.
     */
    public connect(): Promise<void> {
        return this.connection.connect();
    }

    /**
     * Disconnects from a processor.
     */
    public disconnect(): void {
        this.connection.disconnect();
    }

    /**
     * Clears the processor's device cache.
     */
    public clear(): void {
        for (const key of this.cache.keys()) {
            this.cache.removeKey(key);
        }

        this.cache.removeCacheFile();
        this.cache.save();
    }

    /**
     * Pings the processor, useful for keeping the connection alive.
     *
     * @returns A ping response.
     */
    public ping(): Promise<PingResponse> {
        return this.read<PingResponse>("/server/1/status/ping");
    }

    /**
     * Sends a read command to the processor.
     *
     * @param url The url to read.
     * @returns A response object.
     */
    public read<PAYLOAD = any>(url: string): Promise<PAYLOAD> {
        return this.connection.read<PAYLOAD>(url);
    }

    /**
     * Fetches the project information assigned to this processor.
     *
     * @returns A project object.
     */
    public project(): Promise<Project> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/project");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Project>("/project")
                    .then((response) => {
                        this.cache.setKey("/project", response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches the processor's system information.
     *
     * @returns The processor as a device, or undefined if the processor
     *          doesn't support this.
     */
    public system(): Promise<DeviceAddress | undefined> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/device?where=IsThisDevice:true");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<DeviceAddress[]>("/device?where=IsThisDevice:true")
                    .then((response) => {
                        if (response[0] != null) {
                            this.cache.setKey("/device?where=IsThisDevice:true", response[0]);
                            this.cache.save(true);

                            resolve(response[0]);
                        } else {
                            reject(new Error("No system device found"));
                        }
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches available areas. This represents floors, rooms, and suites.
     *
     * @returns An array of area objects.
     */
    public areas(): Promise<AreaAddress[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/area");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<AreaAddress[]>("/area")
                    .then((response) => {
                        this.cache.setKey("/area", response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches available timeclocks.
     *
     * @returns An array of timeclock objects.
     */
    public timeclocks(): Promise<TimeclockAddress[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/timeclock");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<TimeclockAddress[]>("/timeclock")
                    .then((response) => {
                        this.cache.setKey("/timeclock", response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches available zones in an area. Zones represent a light and control.
     * In other systems this is the device.
     *
     * @param address The area to fetch zones.
     *
     * @returns An array of zone objects.
     */
    public zones(address: Address): Promise<ZoneAddress[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/associatedzone`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<ZoneAddress[]>(`${address.href}/associatedzone`)
                    .then((response) => {
                        this.cache.setKey(`${address.href}/associatedzone`, response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches multiple status objects from an area or zone. Typically used to
     * fetch sensor states from an area.
     *
     * @param address Address of an area or zone.
     *
     * @returns A zone status object.
     */
    public status(address: Address): Promise<ZoneStatus> {
        return this.read<ZoneStatus>(`${address.href}/status`);
    }

    public statuses(type?: string): Promise<(ZoneStatus | AreaStatus | TimeclockStatus)[]> {
        return new Promise((resolve, reject) => {
            const waits: Promise<(ZoneStatus | AreaStatus | TimeclockStatus)[]>[] = [];

            waits.push(this.read<ZoneStatus[]>("/zone/status"));
            waits.push(this.read<AreaStatus[]>("/area/status"));

            if (type === "RadioRa3Processor") {
                waits.push(this.read<TimeclockStatus[]>("/timeclock/status"));
            }

            Promise.all(waits)
                .then(([zones, areas, timeclocks]) => {
                    resolve([...zones, ...areas, ...timeclocks]);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Fetches available control stations of an area or zone. A control station
     * represents a group of keypads or remotes.
     *
     * @param address The address of an area or zone.
     *
     * @returns An array of control station objects.
     */
    public controls(address: Address): Promise<ControlStation[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/associatedcontrolstation`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<ControlStation[]>(`${address.href}/associatedcontrolstation`)
                    .then((response) => {
                        this.cache.setKey(`${address.href}/associatedcontrolstation`, response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches a single device in a group. This represents a single keypad or
     * Pico remote.
     *
     * @param address An address of a group position.
     *
     * @returns A device object.
     */
    public device(address: Address): Promise<DeviceAddress> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(address.href);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<DeviceAddress>(address.href)
                    .then((response) => {
                        this.cache.setKey(address.href, response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Fetches available buttons on a device.
     *
     * @param address An address or a device.
     *
     * @returns An array of button group objects.
     */
    public buttons(address: Address): Promise<ButtonGroupExpanded[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/buttongroup/expanded`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<ButtonGroupExpanded[]>(`${address.href}/buttongroup/expanded`)
                    .then((response) => {
                        this.cache.setKey(`${address.href}/buttongroup/expanded`, response);
                        this.cache.save(true);

                        resolve(response);
                    })
                    .catch((error) => reject(error));
            }
        });
    }

    /**
     * Sends an updatre command to the processor.
     *
     * @param address The address of the record.
     * @param field The field to update.
     * @param value The value to set.
     */
    public update(address: Address, field: string, value: object): Promise<void> {
        return this.connection.update(`${address.href}/${field}`, value as Record<string, unknown>);
    }

    /**
     * Sends a structured command to the processor.
     *
     * @param address The address of the zone or device.
     * @param command The structured command object.
     */
    public command(address: Address, command: object): Promise<void> {
        return this.connection.command(`${address.href}/commandprocessor`, { Command: command });
    }

    /**
     * Subscribes to record updates. This will call the listener every time the
     * record is updated.
     *
     * @param address The assress of the record.
     * @param listener The callback to call on updates.
     */
    public subscribe<T>(address: Address, listener: (response: T) => void): Promise<void> {
        return this.connection.subscribe<T>(address.href, listener);
    }

    /*
     * Listener for the processor's connection status.
     */
    private onConnect = (): void => {
        this.log.info("connected");
        this.emit("Connect", this.connection);
    };

    /*
     * Listener for when the processor sends a message.
     */
    private onMessage = (response: Response): void => {
        this.log.debug("message");
        this.emit("Message", response);
    };

    /*
     * Listener for then the connection is dropped.
     */
    private onDisconnect = (): void => {
        this.log.info("disconnected");
        this.emit("Disconnect");
    };
}
