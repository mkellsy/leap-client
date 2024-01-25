import * as Leap from "@mkellsy/leap";

import Colors from "colors";

import { EventEmitter } from "@mkellsy/event-emitter";
import { Log, Logger } from "../Logger";

export class Processor extends EventEmitter<{
    Message: (response: Leap.Response) => void;
    Connect: (protocol: string) => void;
    Disconnect: () => void;
}> {
    private processorId: string;
    private connection: Leap.Connection;
    private logger: Log;

    constructor(id: string, connection: Leap.Connection) {
        super();

        this.processorId = id;
        this.logger = Logger.get(`Processor ${Colors.dim(this.id)}`);
        this.connection = connection;

        this.connection.on("Message", this.onMessage);
        this.connection.once("Disconnect", this.onDisconnect);
    }

    public get id(): string {
        return this.processorId;
    }

    public get topic(): string {
        return `equipment/get/${this.id}-PROCESSOR`;
    }

    public get log(): Log {
        return this.logger;
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

    public async system(): Promise<Leap.Device | undefined> {
        try {
            const response = await this.connection.read<Leap.Device[]>("/device?where=IsThisDevice:true");

            return response[0];
        } catch (error) {
            this.log.error(error.message);

            return undefined;
        }
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
        try {
            const responses = await Promise.all([
                this.connection.read<Leap.ZoneStatus[]>("/zone/status"),
                this.connection.read<Leap.AreaStatus[]>("/area/status"),
            ]);

            const statuses: (Leap.ZoneStatus | Leap.AreaStatus)[] = [];

            for (const response of responses) {
                statuses.push(...response);
            }

            return statuses;
        } catch (error) {
            this.log.error(error.message);

            return [];
        }
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

    public async command(address: Leap.Address, command: object): Promise<void> {
        this.connection.command(`${address.href}/commandprocessor`, { Command: command });
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
