import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";
import * as Interfaces from "@mkellsy/hap-device";

import Cache from "flat-cache";
import Colors from "colors";

import os from "os";
import path from "path";

import { EventEmitter } from "@mkellsy/event-emitter";

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

    public get id(): string {
        return this.uuid;
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public get devices(): Map<string, Interfaces.Device> {
        return this.discovered;
    }

    public connect(): Promise<void> {
        return this.connection.connect();
    }

    public disconnect(): void {
        this.connection.disconnect();
    }

    public clear(): void {
        for (const key of this.cache.keys()) {
            this.cache.removeKey(key);
        }

        this.cache.removeCacheFile();
        this.cache.save();
    }

    public ping(): Promise<Leap.PingResponse> {
        return this.connection.read<Leap.PingResponse>("/server/1/status/ping");
    }

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

    public status(address: Leap.Address): Promise<Leap.ZoneStatus> {
        return this.connection.read<Leap.ZoneStatus>(`${address.href}/status`);
    }

    public statuses(): Promise<(Leap.ZoneStatus | Leap.AreaStatus)[]> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.connection.read<Leap.ZoneStatus[]>("/zone/status"),
                this.connection.read<Leap.AreaStatus[]>("/area/status"),
            ])
                .then(([zones, areas]) => resolve([...zones, ...areas]))
                .catch((error) => reject(error));
        });
    }

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

    public update(address: Leap.Address, field: string, value: object): Promise<void> {
        return this.connection.update(`${address.href}/${field}`, value as Record<string, unknown>);
    }

    public command(address: Leap.Address, command: object): Promise<void> {
        return this.connection.command(`${address.href}/commandprocessor`, { Command: command });
    }

    public subscribe<T>(address: Leap.Address, listener: (response: T) => void) {
        this.connection.subscribe<T>(address.href, listener);
    }

    private onConnect = (): void => {
        this.log.info("connected");
        this.emit("Connect", this.connection);
    };

    private onMessage = (response: Leap.Response): void => {
        this.log.debug("message");
        this.emit("Message", response);
    };

    private onDisconnect = (): void => {
        this.log.info("disconnected");
        this.emit("Disconnect");
    };
}
