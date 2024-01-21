import * as Logger from "js-logger";

import Colors from "colors";
import { EventEmitter } from "@mkellsy/event-emitter";

import {
    AreaDefinition,
    AreaStatus,
    ButtonGroupExpandedDefinition,
    Connection,
    ControlStationDefinition,
    DeviceDefinition,
    Href,
    MultipleAreaDefinition,
    MultipleButtonGroupExpandedDefinition,
    MultipleControlStationDefinition,
    MultipleDeviceDefinition,
    MultipleZoneDefinition,
    OneDeviceDefinition,
    OneProjectDefinition,
    OneZoneStatus,
    ProjectDefinition,
    Response,
    ZoneDefinition,
    ZoneStatus,
} from "@mkellsy/leap";

import { Heartbeat } from "../Heartbeat";

export class Processor extends EventEmitter<{
    Message: (response: Response) => void;
    Disconnected: () => void;
}> {
    private processorId: string;
    private connection: Connection;
    private heartbeat: Heartbeat;
    private logger: Logger.ILogger;

    constructor(id: string, connection: Connection) {
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

    public async reconfigure(connection: Connection) {
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

    public async ping(): Promise<Response> {
        const response = await this.connection.request("ReadRequest", "/server/1/status/ping");

        return response;
    }

    public async project(): Promise<ProjectDefinition> {
        const response = (await this.connection.request("ReadRequest", "/project")) || {};
        const body = (response.Body || {}) as OneProjectDefinition;

        if (body.Project) {
            return body.Project;
        }

        throw new Error("Project not found");
    }

    public async system(): Promise<DeviceDefinition> {
        const response = (await this.connection.request("ReadRequest", "/device?where=IsThisDevice:true")) || {};
        const body = (response.Body || {}) as MultipleDeviceDefinition;

        if (body.Devices && body.Devices.length === 1) {
            return body.Devices[0];
        }

        throw new Error("Processor not found");
    }

    public async areas(): Promise<AreaDefinition[]> {
        const response = (await this.connection.request("ReadRequest", "/area")) || {};
        const body = (response.Body || {}) as MultipleAreaDefinition;

        if (body.Areas) {
            return body.Areas;
        }

        throw new Error("No areas defined");
    }

    public async zones(address: Href): Promise<ZoneDefinition[]> {
        const response = (await this.connection.request("ReadRequest", `${address.href}/associatedzone`)) || {};
        const body = (response.Body || {}) as MultipleZoneDefinition;

        if (body.Zones) {
            return body.Zones;
        }

        throw new Error("No zones defined");
    }

    public async status(address: Href): Promise<ZoneStatus> {
        const response = (await this.connection.request("ReadRequest", `${address.href}/status`)) || {};
        const body = (response.Body || {}) as OneZoneStatus;

        if (body.ZoneStatus) {
            return body.ZoneStatus;
        }

        throw new Error("Status unavailable");
    }

    public async statuses(): Promise<(ZoneStatus | AreaStatus)[]> {
        const responses = await Promise.all([
            this.connection.request("ReadRequest", "/zone/status"),
            this.connection.request("ReadRequest", "/area/status"),
        ]);

        const statuses: (ZoneStatus | AreaStatus)[] = [];

        for (const response of responses) {
            const body = (response.Body || {}) as any;

            if (body.ZoneStatuses) {
                statuses.push(...body.ZoneStatuses);
            }

            if (body.AreaStatuses) {
                statuses.push(...body.AreaStatuses);
            }
        }

        return statuses;
    }

    public async controls(address: Href): Promise<ControlStationDefinition[]> {
        const response =
            (await this.connection.request("ReadRequest", `${address.href}/associatedcontrolstation`)) || {};
        const body = (response.Body || {}) as MultipleControlStationDefinition;

        if (body.ControlStations) {
            return body.ControlStations;
        }

        throw new Error("Unknown control station error");
    }

    public async device(address: Href): Promise<DeviceDefinition> {
        const response = (await this.connection.request("ReadRequest", address.href)) || {};
        const body = (response.Body || {}) as OneDeviceDefinition;

        if (body.Device) {
            return body.Device;
        }

        throw new Error("Unknown device error");
    }

    public async buttons(address: Href): Promise<ButtonGroupExpandedDefinition[]> {
        const response = (await this.connection.request("ReadRequest", `${address.href}/buttongroup/expanded`)) || {};
        const body = (response.Body || {}) as MultipleButtonGroupExpandedDefinition;

        if (body.ButtonGroupsExpanded) {
            return body.ButtonGroupsExpanded;
        }

        throw new Error("Unknown button group error");
    }

    public async command(address: Href, command: object): Promise<void> {
        this.connection.request("CreateRequest", `${address.href}/commandprocessor`, {
            Command: command,
        });
    }

    public subscribe(href: string, callback: (response: Response) => void) {
        this.connection.subscribe(href, callback);
    }

    private onMessage(): (response: Response) => void {
        return (response: Response): void => {
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
