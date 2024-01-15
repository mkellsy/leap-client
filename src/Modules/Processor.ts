import * as Logger from "js-logger";

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
    OneDeviceDefinition,
    OneProjectDefinition,
    ProjectDefinition,
    Response,
} from "@mkellsy/leap";

import { Heartbeat } from "./Heartbeat";
import { ProcessorEvents } from "./ProcessorEvents";

const log = Logger.get("Processor");

export class Processor extends EventEmitter<ProcessorEvents> {
    private id: string;
    private connection: Connection;
    private heartbeat: Heartbeat;

    constructor(id: string, connection: Connection) {
        super();

        this.id = id;
        this.connection = connection;
        this.heartbeat = new Heartbeat(this.connection);

        this.connection.on("Message", this.onMessage());
        this.connection.on("Disconnected", this.onDisconnected());

        this.heartbeat.start();
    }

    public open(): void {
        if (!this.heartbeat.started) {
            log.info(`processor "${this.id}" connecting`);

            this.heartbeat.start();
        }
    }

    public close(): void {
        log.info(`processor "${this.id}" disconnecting`);

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

    public async getProject(): Promise<ProjectDefinition> {
        const response = await this.connection.request("ReadRequest", "/project");
        const body = response.Body as OneProjectDefinition;

        if (body.Project) {
            return body.Project;
        }

        throw new Error("Unknown processor error");
    }

    public async getProcessorInfo(): Promise<DeviceDefinition> {
        const response = await this.connection.request("ReadRequest", "/device?where=IsThisDevice:true");
        const body = response.Body as MultipleDeviceDefinition;

        if (body.Devices && body.Devices.length === 1) {
            return body.Devices[0];
        }

        throw new Error("Unknown processor error");
    }

    public async getAreas(): Promise<AreaDefinition[]> {
        const response = await this.connection.request("ReadRequest", "/area");
        const body = response.Body as MultipleAreaDefinition;

        if (body.Areas) {
            return body.Areas;
        }

        throw new Error("Unknown area errort");
    }

    public async getAreaControlStations(area: AreaDefinition): Promise<ControlStationDefinition[]> {
        log.info(`Control station "${area.href}" discovered`);

        const response = await this.connection.request("ReadRequest", area.href + "/associatedcontrolstation");
        const body = response.Body as MultipleControlStationDefinition;

        if (body.ControlStations) {
            return body.ControlStations;
        }

        throw new Error("Unknown control station error");
    }

    public async getDevice(device: DeviceDefinition): Promise<DeviceDefinition> {
        log.info(`Device "${device.href}" discoverred`);

        const response = await this.connection.request("ReadRequest", device.href);
        log.info("Device() complete");
        const body = response.Body as OneDeviceDefinition;

        if (body.Device) {
            return body.Device;
        }

        throw new Error("Unknown device error");
    }

    public async getDeviceButtonGroupsExpanded(device: DeviceDefinition): Promise<ButtonGroupExpandedDefinition[]> {
        const response = await this.connection.request("ReadRequest", device.href + "/buttongroup/expanded");
        const body = response.Body as MultipleButtonGroupExpandedDefinition;

        if (body.ButtonGroupsExpanded) {
            return body.ButtonGroupsExpanded;
        }

        throw new Error("Unknown button group error");
    }

    public async processCommand(device: DeviceDefinition, command: object): Promise<void> {
        this.connection.request("CreateRequest", `${device.LocalZones[0].href}/commandprocessor`, {
            Command: command,
        });
    }

    public subscribeToButton(button: ButtonDefinition, callback: (response: Response) => void) {
        this.connection.subscribe(`${button.href}/status/event`, callback);
    }

    private onMessage(): (response: Response) => void {
        return (response: Response): void => {
            log.info(`Processor "${this.id}" message`);
            log.info(response);

            this.emit("Message", this.id, response);
        };
    }

    private onDisconnected(): () => void {
        return (): void => {
            log.info(`Processor "${this.id}" disconnected`);

            this.emit("Disconnected");
        };
    }
}
