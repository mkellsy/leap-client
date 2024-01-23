import * as Logger from "js-logger";

import { Connection, PingResponse } from "@mkellsy/leap";

const log = Logger.get("Heartbeat");

export class Heartbeat {
    private interval?: NodeJS.Timeout;
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public start() {
        this.stop();

        this.interval = setInterval(() => {
            this.connection.read<PingResponse>("/server/1/status/ping").catch((error: Error) => {
                log.error(error.message);
            });
        }, 30_000);
    }

    public stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
        }

        this.interval = undefined;
    }
}
