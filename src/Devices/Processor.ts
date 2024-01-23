import * as Logger from "js-logger";
import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { EventEmitter } from "@mkellsy/event-emitter";
import { Heartbeat } from "../Heartbeat";

export class Processor extends EventEmitter<{
    Message: (response: Leap.Response) => void;
    Disconnected: () => void;
}> {
    private processorId: string;
    private connection: Leap.Connection;
    private heartbeat: Heartbeat;
    private logger: Logger.ILogger;

    constructor(id: string, connection: Leap.Connection) {
        super();

        this.processorId = id;
        this.logger = Logger.get(`Processor ${Colors.dim(this.id)}`);
        this.connection = connection;
        this.heartbeat = new Heartbeat(this.connection);

        this.connection.on("Message", this.onMessage());
        this.connection.on("Disconnected", this.onDisconnected());

        this.heartbeat.start();
    }

    public get id(): string {
        return this.processorId;
    }

    public get log(): Logger.ILogger {
        return this.logger;
    }

    public open(): void {
        if (!this.heartbeat.started) {
            this.heartbeat.start();
        }
    }

    public close(): void {
        if (this.heartbeat.started) {
            this.heartbeat.stop();
        }

        this.connection.close();
    }

    public async reconfigure(connection: Leap.Connection) {
        if (this.heartbeat.started) {
            this.heartbeat.stop();
        }

        this.connection.drain();
        this.connection.off("Message");
        this.connection.off("Disconnected");

        this.emit("Disconnected");

        this.connection = connection;
        this.heartbeat = new Heartbeat(this.connection);

        this.connection.on("Message", this.onMessage());
        this.connection.on("Disconnected", this.onDisconnected());

        this.heartbeat.start();
    }

    public ping(): Promise<Leap.PingResponse> {
        return this.connection.read<Leap.PingResponse>("/server/1/status/ping");
    }

    public project(): Promise<Leap.Project> {
        return this.connection.read<Leap.Project>("/project");
    }

    public async system(): Promise<Leap.Device> {
        const response = await this.connection.read<Leap.Device[]>("/device?where=IsThisDevice:true");

        return response[0];
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

    public async statuses(): Promise<(Leap.ZoneStatus | Leap.AreaStatus)[]> {
        const responses = await Promise.all([
            this.connection.read<Leap.ZoneStatus[]>("/zone/status"),
            this.connection.read<Leap.AreaStatus[]>("/area/status"),
        ]);

        const statuses: (Leap.ZoneStatus | Leap.AreaStatus)[] = [];

        for (const response of responses) {
            statuses.push(...response);
        }

        return statuses;
    }

    public controls(address: Leap.Address): Promise<Leap.ControlStation[]> {
        return this.connection.read<Leap.ControlStation[]>(`${address.href}/associatedcontrolstation`);
    }

    public async device(address: Leap.Address): Promise<Leap.Device> {
        return this.connection.read<Leap.Device>(address.href);
    }

    public async buttons(address: Leap.Address): Promise<Leap.ButtonGroupExpanded[]> {
        return this.connection.read<Leap.ButtonGroupExpanded[]>(`${address.href}/buttongroup/expanded`);
    }

    public async command(address: Leap.Address, command: object): Promise<void> {
        this.connection.command(`${address.href}/commandprocessor`, { Command: command });
    }

    public subscribe<T>(address: Leap.Address, listener: (response: T) => void) {
        this.connection.subscribe<T>(address.href, listener);
    }

    private onMessage(): (response: Leap.Response) => void {
        return (response: Leap.Response): void => {
            this.log.info("message");

            this.emit("Message", response);
        };
    }

    private onDisconnected(): () => void {
        return (): void => {
            this.log.info("disconnected");

            this.emit("Disconnected");
        };
    }
}
