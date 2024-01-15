import * as Logger from "js-logger";

import Colors from "colors";
import { EventEmitter } from "@mkellsy/event-emitter";

import {
    AreaDefinition,
    ButtonDefinition,
    ButtonGroupExpandedDefinition,
    BodyType,
    Connection,
    ControlStationDefinition,
    DeviceDefinition,
    Href,
    MultipleAreaDefinition,
    MultipleButtonGroupExpandedDefinition,
    MultipleControlStationDefinition,
    MultipleDeviceDefinition,
    OneAreaDefinition,
    OneDeviceDefinition,
    OneProjectDefinition,
    OneZoneDefinition,
    ProjectDefinition,
    Response,
    ZoneDefinition,
} from "@mkellsy/leap";

import { Heartbeat } from "./Heartbeat";
import { ProcessorEvents } from "./ProcessorEvents";

export class Processor extends EventEmitter<ProcessorEvents> {
    private id: string;
    private connection: Connection;
    private heartbeat: Heartbeat;
    private logger: Logger.ILogger;

    constructor(id: string, connection: Connection) {
        super();

        this.id = id;
        this.logger = Logger.get(`Processor ${Colors.dim(this.id)}`);
        this.connection = connection;
        this.heartbeat = new Heartbeat(this.connection);

        this.connection.on("Message", this.onMessage());
        this.connection.on("Disconnected", this.onDisconnected());

        this.heartbeat.start();
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
        return await this.connection.request("ReadRequest", "/server/1/status/ping");
    }

    public async getHref(href: Href): Promise<BodyType> {
        const response = await this.connection.request("ReadRequest", href.href);

        return response.Body!;
    }

    public async project(): Promise<ProjectDefinition> {
        const response = await this.connection.request("ReadRequest", "/project");
        const body = response.Body as OneProjectDefinition;

        if (body.Project) {
            return body.Project;
        }

        throw new Error("Project not found");
    }

    public async system(): Promise<DeviceDefinition> {
        const response = await this.connection.request("ReadRequest", "/device?where=IsThisDevice:true");
        const body = response.Body as MultipleDeviceDefinition;

        if (body.Devices && body.Devices.length === 1) {
            return body.Devices[0];
        }

        throw new Error("Processor not found");
    }

    public async areas(): Promise<AreaDefinition[]> {
        const response = await this.connection.request("ReadRequest", "/area");
        const body = response.Body as MultipleAreaDefinition;

        if (body.Areas) {
            return body.Areas;
        }

        throw [];
    }

    public async zones(area: AreaDefinition): Promise<Href[]> {
        const response = await this.connection.request("ReadRequest", area.href);
        const body = response.Body as OneAreaDefinition;

        if (body.Area && body.Area.AssociatedZones) {
            return body.Area.AssociatedZones;
        }

        return [];
    }

    public async zone(zone: Href): Promise<ZoneDefinition> {
        const response = await this.connection.request("ReadRequest", zone.href);
        const body = response.Body as OneZoneDefinition;

        if (body.Zone) {
            return body.Zone;
        }

        throw new Error("Zone not found");
    }

    public async controls(area: AreaDefinition): Promise<ControlStationDefinition[]> {
        const response = await this.connection.request("ReadRequest", `${area.href}/associatedcontrolstation`);
        const body = response.Body as MultipleControlStationDefinition;

        if (body.ControlStations) {
            return body.ControlStations;
        }

        throw new Error("Unknown control station error");
    }

    public async device(device: Href): Promise<DeviceDefinition> {
        const response = await this.connection.request("ReadRequest", device.href);
        const body = response.Body as OneDeviceDefinition;

        if (body.Device) {
            return body.Device;
        }

        throw new Error("Unknown device error");
    }

    public async buttons(device: DeviceDefinition): Promise<ButtonGroupExpandedDefinition[]> {
        const response = await this.connection.request("ReadRequest", `${device.href}/buttongroup/expanded`);
        const body = response.Body as MultipleButtonGroupExpandedDefinition;

        if (body.ButtonGroupsExpanded) {
            return body.ButtonGroupsExpanded;
        }

        throw new Error("Unknown button group error");
    }

    public async command(device: DeviceDefinition, command: object): Promise<void> {
        this.connection.request("CreateRequest", `${device.LocalZones[0].href}/commandprocessor`, {
            Command: command,
        });
    }

    public subscribe(button: ButtonDefinition, callback: (response: Response) => void) {
        this.connection.subscribe(`${button.href}/status/event`, callback);
    }

    private onMessage(): (response: Response) => void {
        return (response: Response): void => {
            this.log.info("message");

            this.emit("Message", this.id, response);
        };
    }

    private onDisconnected(): () => void {
        return (): void => {
            this.log.info("disconnected");

            this.emit("Disconnected");
        };
    }
}
