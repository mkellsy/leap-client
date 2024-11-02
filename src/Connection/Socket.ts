import { EventEmitter } from "@mkellsy/event-emitter";
import { connect, createSecureContext, TLSSocket } from "tls";

import { Certificate } from "../Response/Certificate";
import { Message } from "../Response/Message";

/**
 * Creates a connections underlying socket.
 */
export class Socket extends EventEmitter<{
    Error: (error: Error) => void;
    Data: (data: Buffer) => void;
    Disconnect: () => void;
}> {
    private connection?: TLSSocket;

    private readonly host: string;
    private readonly port: number;
    private readonly certificate: Certificate;

    /**
     * Creates a socket.
     *
     * @param host The IP address of the device.
     * @param port The port the device listenes on.
     * @param certificate An authentication certificate.
     */
    constructor(host: string, port: number, certificate: Certificate) {
        super();

        this.host = host;
        this.port = port;
        this.certificate = certificate;
    }

    /**
     * Establishes a connection to the device.
     *
     * @returns A connection protocol.
     */
    public connect(): Promise<string> {
        return new Promise((resolve, reject) => {
            const connection = connect(this.port, this.host, {
                secureContext: createSecureContext(this.certificate),
                secureProtocol: "TLS_method",
                rejectUnauthorized: false,
            });

            connection.once("secureConnect", (): void => {
                this.connection = connection;

                this.connection.off("error", reject);

                this.connection.on("error", this.onSocketError);
                this.connection.on("data", this.onSocketData);
                this.connection.on("end", this.onSocketEnd);

                this.connection.setKeepAlive(true);

                resolve(this.connection.getProtocol() || "Unknown");
            });

            connection.once("error", reject);
        });
    }

    /**
     * Disconnects from a device.
     */
    public disconnect(): void {
        this.connection?.end();
        this.connection?.destroy();
    }

    /**
     * Writes a message to the connection.
     *
     * @param message A message to write.
     */
    public write(message: Message): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.connection == null) {
                return reject(new Error("connection not established"));
            }

            this.connection.write(`${JSON.stringify(message)}\n`, (error) => {
                if (error != null) {
                    return reject(error);
                }

                return resolve();
            });
        });
    }

    /*
     * Listens for data from the socket.
     */
    private onSocketData = (data: Buffer): void => {
        this.emit("Data", data);
    };

    /*
     * Listenes for discrete disconects from the socket.
     */
    private onSocketEnd = (): void => {
        this.emit("Disconnect");
    };

    /*
     * Listenes for any errors from the socket.
     */
    private onSocketError = (error: Error): void => {
        this.emit("Error", error);
    };
}
