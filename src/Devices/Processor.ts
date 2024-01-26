import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { Device } from "../Interfaces/Device";
import { EventEmitter } from "@mkellsy/event-emitter";

export class Processor extends EventEmitter<{
    Message: (response: Leap.Response) => void;
    Connect: (protocol: string) => void;
    Disconnect: () => void;
}> {
    private uuid: string;
    private connection: Leap.Connection;
    private logger: Logger.ILogger;

    private discovered: Map<string, Device> = new Map();

    constructor(id: string, connection: Leap.Connection) {
        super();

        this.uuid = id;
        this.logger = Logger.get(`Processor ${Colors.dim(this.id)}`);
        this.connection = connection;

        this.connection.on("Message", this.onMessage);
        this.connection.once("Disconnect", this.onDisconnect);
    }

    public get id(): string {
        return this.uuid;
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public get devices(): Map<string, Device> {
        return this.discovered;
    }

    public connect(): Promise<void> {
        return this.connection.connect();
    }

    public disconnect(): void {
        this.connection.disconnect();
    }

    public ping(): Promise<Leap.PingResponse> {
        return this.connection.read<Leap.PingResponse>("/server/1/status/ping");
    }

    public project(): Promise<Leap.Project> {
        return this.connection.read<Leap.Project>("/project");
    }

    public system(): Promise<Leap.Device | undefined> {
        return new Promise((resolve, reject) => {
            this.connection.read<Leap.Device[]>("/device?where=IsThisDevice:true").then((response) => {
                if (response[0] != null) {
                    resolve(response[0]);
                } else {
                    reject(new Error("No system device found"));
                }
            }).catch((error) => reject(error));
        });
    }

    public areas(): Promise<Leap.Area[]> {
        return this.connection.read<Leap.Area[]>("/area");
    }

    public zones(address: Leap.Address): Promise<Leap.Zone[]> {
        return this.connection.read<Leap.Zone[]>(`${address.href}/associatedzone`);
    }

    public status(address: Leap.Address): Promise<Leap.ZoneStatus> {
        return this.connection.read<Leap.ZoneStatus>(`${address.href}/status`);
    }

    public statuses(): Promise<(Leap.ZoneStatus | Leap.AreaStatus)[]> {
        return new Promise((resolve, reject) => {
            Promise.all([
                this.connection.read<Leap.ZoneStatus[]>("/zone/status"),
                this.connection.read<Leap.AreaStatus[]>("/area/status"),
            ]).then((responses) => {
                const statuses: (Leap.ZoneStatus | Leap.AreaStatus)[] = [];

                for (const response of responses) {
                    statuses.push(...response);
                }

                resolve(statuses);
            }).catch((error) => reject(error));
        });
    }

    public controls(address: Leap.Address): Promise<Leap.ControlStation[]> {
        return this.connection.read<Leap.ControlStation[]>(`${address.href}/associatedcontrolstation`);
    }

    public device(address: Leap.Address): Promise<Leap.Device> {
        return this.connection.read<Leap.Device>(address.href);
    }

    public buttons(address: Leap.Address): Promise<Leap.ButtonGroupExpanded[]> {
        return this.connection.read<Leap.ButtonGroupExpanded[]>(`${address.href}/buttongroup/expanded`);
    }

    public command(address: Leap.Address, command: object): Promise<void> {
        return this.connection.command(`${address.href}/commandprocessor`, { Command: command });
    }

    public subscribe<T>(address: Leap.Address, listener: (response: T) => void) {
        this.connection.subscribe<T>(address.href, listener);
    }

    private onMessage = (response: Leap.Response): void => {
        this.log.debug("message");
        this.emit("Message", response);
    };

    private onDisconnect = (): void => {
        this.log.info("disconnected");
        this.emit("Disconnect");
    };
}
