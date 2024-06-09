import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import Cache from "flat-cache";
import Colors from "colors";

import os from "os";
import path from "path";

import { EventEmitter } from "@mkellsy/event-emitter";

/**
 * Defines a LEAP processor. This could be a Caseta Smart Bridge, RA2/RA3
 * Processor, or a Homeworks Processor.
 */
export class Processor extends EventEmitter<{
    Message: (response: Leap.Response) => void;
    Connect: (connection: Leap.Connection) => void;
    Disconnect: () => void;
}> {
    private uuid: string;
    private connection: Leap.Connection;
    private logger: Logger.ILogger;

    private cache: Cache.Cache;
    private discovered: Map<string, Interfaces.Device> = new Map();

    /**
     * Creates a LEAP processor.
     *
     * @param id The processor UUID.
     * @param connection A reference to the connection to the processor.
     */
    constructor(id: string, connection: Leap.Connection) {
        super();

        this.uuid = id;
        this.logger = Logger.get(`Processor ${Colors.dim(this.id)}`);
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
    public get log(): Logger.ILogger {
        return this.logger;
    }

    /**
     * A device map for all devices found on this processor.
     *
     * @returns A device map by device id.
     */
    public get devices(): Map<string, Interfaces.Device> {
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
    public ping(): Promise<Leap.PingResponse> {
        return this.connection.read<Leap.PingResponse>("/server/1/status/ping");
    }

    /**
     * Fetches the project information assigned to this processor.
     *
     * @returns A project object.
     */
    public project(): Promise<Leap.Project> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/project");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Project>("/project")
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
    public system(): Promise<Leap.Device | undefined> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/device?where=IsThisDevice:true");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Device[]>("/device?where=IsThisDevice:true")
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
    public areas(): Promise<Leap.Area[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/area");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Area[]>("/area")
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
    public timeclocks(): Promise<Leap.Timeclock[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey("/timeclock");

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Timeclock[]>("/timeclock")
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
    public zones(address: Leap.Address): Promise<Leap.Zone[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/associatedzone`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Zone[]>(`${address.href}/associatedzone`)
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
    public status(address: Leap.Address): Promise<Leap.ZoneStatus> {
        return this.connection.read<Leap.ZoneStatus>(`${address.href}/status`);
    }

    public statuses(type?: string): Promise<(Leap.ZoneStatus | Leap.AreaStatus | Leap.TimeclockStatus)[]> {
        return new Promise((resolve, reject) => {
            const waits: Promise<(Leap.ZoneStatus | Leap.AreaStatus | Leap.TimeclockStatus)[]>[] = [];

            waits.push(this.connection.read<Leap.ZoneStatus[]>("/zone/status"));
            waits.push(this.connection.read<Leap.AreaStatus[]>("/area/status"));

            if (type === "RadioRa3Processor") {
                waits.push(this.connection.read<Leap.TimeclockStatus[]>("/timeclock/status"));
            }

            Promise.all(waits)
                .then(([zones, areas, timeclocks]) => resolve([...zones, ...areas, ...timeclocks]))
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
    public controls(address: Leap.Address): Promise<Leap.ControlStation[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/associatedcontrolstation`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.ControlStation[]>(`${address.href}/associatedcontrolstation`)
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
    public device(address: Leap.Address): Promise<Leap.Device> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(address.href);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.Device>(address.href)
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
    public buttons(address: Leap.Address): Promise<Leap.ButtonGroupExpanded[]> {
        return new Promise((resolve, reject) => {
            const cached = this.cache.getKey(`${address.href}/buttongroup/expanded`);

            if (cached != null) {
                resolve(cached);
            } else {
                this.connection
                    .read<Leap.ButtonGroupExpanded[]>(`${address.href}/buttongroup/expanded`)
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
    public update(address: Leap.Address, field: string, value: object): Promise<void> {
        return this.connection.update(`${address.href}/${field}`, value as Record<string, unknown>);
    }

    /**
     * Sends a structured command to the processor.
     *
     * @param address The address of the zone or device.
     * @param command The structured command object.
     */
    public command(address: Leap.Address, command: object): Promise<void> {
        return this.connection.command(`${address.href}/commandprocessor`, { Command: command });
    }

    /**
     * Subscribes to record updates. This will call the listener every time the
     * record is updated.
     *
     * @param address The assress of the record.
     * @param listener The callback to call on updates.
     */
    public subscribe<T>(address: Leap.Address, listener: (response: T) => void) {
        this.connection.subscribe<T>(address.href, listener);
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
    private onMessage = (response: Leap.Response): void => {
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
