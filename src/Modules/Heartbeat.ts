import * as Logger from "js-logger";

import { Connection } from "@mkellsy/leap";

const HEARTBEAT_INTERVAL_MS = 30_000;
const HEARTBEAT_TIMEOUT_MS = 5_000;

const log = Logger.get("Heartbeat");

export class Heartbeat {
    private interval?: NodeJS.Timeout;
    private connection: Connection;

    constructor(connection: Connection) {
        this.connection = connection;
    }

    public get started(): boolean {
        return this.interval != null;
    }

    public start() {
        this.stop();

        this.interval = setInterval(this.onPing(), HEARTBEAT_INTERVAL_MS);
    }

    public stop() {
        if (this.interval != null) {
            clearInterval(this.interval);
        }

        this.interval = undefined;
    }

    private onPing(): () => void {
        return (): void => {
            const request = this.connection.request("ReadRequest", "/server/1/status/ping");

            const timeout = new Promise((_resolve, reject): void => {
                setTimeout((): void => reject("ping timeout"), HEARTBEAT_TIMEOUT_MS);
            });

            Promise.race([request, timeout])
                .catch((error) => log.error("ping failed:", error));
        };
    }
}
