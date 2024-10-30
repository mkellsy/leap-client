import fs from "fs";
import path from "path";
import net from "net";

import { BSON } from "bson";
import { pki } from "node-forge";
import { v4 } from "uuid";

import { Authentication } from "./Interfaces/Authentication";
import { BufferedResponse } from "./Interfaces/BufferedResponse";
import { Certificate } from "./Interfaces/Certificate";
import { CertificateRequest } from "./Interfaces/CertificateRequest";
import { ExceptionDetail } from "./Interfaces/ExceptionDetail";
import { InflightMessage } from "./Interfaces/InflightMessage";
import { Message } from "./Interfaces/Message";
import { PhysicalAccess } from "./Interfaces/PhysicalAccess";
import { Response } from "./Interfaces/Response";
import { RequestType } from "./Interfaces/RequestType";
import { Socket } from "./Socket";
import { Subscription } from "./Interfaces/Subscription";

const SOCKET_PORT = 8083;
const SECURE_SOCKET_PORT = 8081;
const REACHABLE_TIMEOUT = 1_000;

/**
 * Connects to a device with the provided secure host.
 */
export class Connection extends BufferedResponse<{
    Connect: (protocol: string) => void;
    Disconnect: () => void;
    Response: (response: Response) => void;
    Message: (response: Response) => void;
    Error: (error: Error) => void;
}> {
    private socket?: Socket;
    private secure: boolean = false;
    private teardown: boolean = false;

    private host: string;
    private certificate: Certificate;

    private requests: Map<string, InflightMessage> = new Map();
    private subscriptions: Map<string, Subscription> = new Map();

    /**
     * Creates a new connection to a device.
     *
     * ```js
     * const connection = new Connection("192.168.1.1", { ca, key, cert });
     * ```
     *
     * @param host The ip address of the device.
     * @param certificate Authentication certificate.
     */
    constructor(host: string, certificate?: Certificate) {
        super();

        this.host = host;
        this.secure = certificate != null;

        this.certificate = {
            ca: "",
            cert: "",
            key: "",
            ...(certificate != null ? certificate : this.authorityCertificate()),
        };
    }

    /**
     * Detects if a host is reachable.
     *
     * @param host Address of the device.
     *
     * @returns True if the device is rechable, false if not.
     */
    public static reachable(host: string): Promise<boolean> {
        return new Promise((resolve) => {
            const socket = new net.Socket();

            const response = (success: boolean) => {
                socket.destroy();

                resolve(success);
            };

            socket.setTimeout(REACHABLE_TIMEOUT);

            socket.once("error", () => response(false));
            socket.once("timeout", () => response(false));

            socket.connect(SOCKET_PORT, host, () => response(true));
        });
    }

    /**
     * Asyncronously connects to a device.
     *
     * ```js
     * await connection.connect();
     * ```
     */
    public connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.teardown = false;
            this.socket = undefined;

            const subscriptions = [...this.subscriptions.values()];
            const socket = new Socket(this.host, this.secure ? SECURE_SOCKET_PORT : SOCKET_PORT, this.certificate);

            socket.on("Data", this.onSocketData);
            socket.on("Error", this.onSocketError);
            socket.on("Disconnect", this.onSocketDisconnect);

            socket
                .connect()
                .then((protocol) => {
                    this.physicalAccess(this.secure).then(() => {
                        const waits: Promise<void>[] = [];

                        this.subscriptions.clear();
                        this.socket = socket;

                        if (this.secure) {
                            for (const subscription of subscriptions) {
                                waits.push(this.subscribe(subscription.url, subscription.listener));
                            }
                        }

                        Promise.all(waits).then(() => {
                            this.emit("Connect", protocol);

                            resolve();
                        });
                    });
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Disconnects from a device.
     *
     * ```js
     * connection.disconnect();
     * ```
     */
    public disconnect() {
        this.teardown = true;

        if (this.secure) {
            this.drainRequests();
        }

        this.subscriptions.clear();
        this.socket?.disconnect();
    }

    /**
     * Fetches a record from the device. Not this only works for a secure
     * connections.
     *
     * ```js
     * const record = await connection.read<Zone>("/zone/123456");
     * ```
     *
     * @param url The url of the record, this is typically a device address.
     *
     * @returns A payload or rejects. The payload is typed per call.
     */
    public read<T>(url: string): Promise<T> {
        return new Promise((resolve, reject) => {
            const tag = v4();

            if (!this.secure) {
                return reject(new Error("Only available for secure connections"));
            }

            this.sendRequest(tag, "ReadRequest", url)
                .then((response) => {
                    const body = response.Body as T;

                    if (body == null) {
                        return reject(new Error(`${url} no body`));
                    }

                    if (response.Body instanceof ExceptionDetail) {
                        return reject(new Error(response.Body.Message));
                    }

                    return resolve(response.Body as T);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * This sends an authentication request. This only works for non-secure
     * connections.
     *
     * ```js
     * const certificate = await connection.authenticate(csr);
     * ```
     *
     * @param csr Sends a certificate request, typically created with open ssl.
     *
     * @returns An authentication certificate or rejects if failed.
     */
    public authenticate(csr: CertificateRequest): Promise<Certificate> {
        return new Promise((resolve, reject) => {
            if (this.secure) {
                return reject(new Error("Only available for physical connections"));
            }

            const message = {
                Header: {
                    RequestType: "Execute",
                    Url: "/pair",
                    ClientTag: "get-cert",
                },
                Body: {
                    CommandType: "CSR",
                    Parameters: {
                        CSR: csr.cert,
                        DisplayName: "get_lutron_cert.py",
                        DeviceUID: "000000000000",
                        Role: "Admin",
                    },
                },
            };

            /*
             * Real clocks are required for proper socket testing, this
             * requires a fake clock or unit test timeout extention. Excluding
             * this to speedup build times.
             */

            /* istanbul ignore next */
            const timeout = setTimeout(() => reject(new Error("Authentication timeout exceeded")), 5_000);

            this.once("Message", (response: Response) => {
                clearTimeout(timeout);

                resolve({
                    ca: (response.Body as Authentication).SigningResult.RootCertificate,
                    cert: (response.Body as Authentication).SigningResult.Certificate,
                    key: pki.privateKeyToPem(csr.key),
                });
            });

            /* istanbul ignore next */
            this.socket?.write(message);
        });
    }

    /**
     * Sends a commend to update a device. This only works for secure
     * connections.
     *
     * ```js
     * await connection.update("/zone/123456", state);
     * ```
     *
     * @param url A command url typically the href of a device.
     * @param body An object of values to update.
     *
     * @returns Returns a status paylod. The type is set per call.
     */
    public update<T>(url: string, body: Record<string, unknown>): Promise<T> {
        return new Promise((resolve, reject) => {
            const tag = v4();

            if (!this.secure) {
                return reject(new Error("Only available for secure connections"));
            }

            this.sendRequest(tag, "UpdateRequest", url, body)
                .then((response) => {
                    if (response.Body instanceof ExceptionDetail) {
                        return reject(new Error(response.Body.Message));
                    }

                    return resolve(response.Body as T);
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Sends a known command to the device. This only works for secure
     * connections.
     *
     * ```js
     * await connection.command("/zone/123456", command);
     * ```
     *
     * @param url A command url typically the href of a device.
     * @param command A known command object.
     */
    public command(url: string, command: Record<string, unknown>): Promise<void> {
        return new Promise((resolve, reject) => {
            const tag = v4();

            if (!this.secure) {
                return reject(new Error("Only available for secure connections"));
            }

            this.sendRequest(tag, "CreateRequest", url, command)
                .then(() => resolve())
                .catch((error) => reject(error));
        });
    }

    /**
     * Subscribes to a record on the device. This will bind a listener to that
     * record that will get called every time the record changes. This is
     * helpful for keeping track of the status of an area, zone, or device.
     * This only works for secure connections.
     *
     * ```js
     * connection.subscribe("/zone/123456/status", (response) => { });
     * ```
     *
     * @param url Url to subscribe to.
     * @param listener Callback to run when the record updates.
     */
    public subscribe<T>(url: string, listener: (response: T) => void): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.secure) {
                return reject(new Error("Only available for secure connections"));
            }

            const tag = v4();

            this.sendRequest(tag, "SubscribeRequest", url)
                .then((response: Response) => {
                    if (response.Header.StatusCode != null && response.Header.StatusCode.isSuccessful()) {
                        this.subscriptions.set(tag, {
                            url,
                            listener,
                            callback: (response: Response) => listener(response.Body as T),
                        });
                    }

                    resolve();
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Clears any ongoing commands. This will cancel all incomplete and failed
     * connections.
     */
    private drainRequests(): void {
        /*
         * Draining requests is incredibly difficult to test. This requires
         * very randon chunks that depend on network conditions. Testing this
         * functionallity is best suited for the buffered responce object.
         */
        for (const tag of this.requests.keys()) {
            /* istanbul ignore next */
            const request = this.requests.get(tag)!;

            /* istanbul ignore next */
            clearTimeout(request.timeout);
        }

        this.requests.clear();
    }

    /*
     * Internally sends read, update, and command requests.
     */
    private sendRequest(
        tag: string,
        requestType: RequestType,
        url: string,
        body?: Record<string, unknown>,
    ): Promise<Response> {
        return new Promise((resolve, reject) => {
            /*
             * Testing tag reuse is difficult when mocking payloads. Tagged
             * payloads are transparent past this stage, and unit tests are
             * unable to pause the fulfillment.
             */

            /* istanbul ignore next */
            if (this.requests.has(tag)) {
                const request = this.requests.get(tag)!;

                request.reject(new Error(`tag "${tag}" reused`));

                clearTimeout(request.timeout);

                this.requests.delete(tag);
            }

            const message: Message = {
                CommuniqueType: requestType,
                Header: {
                    ClientTag: tag!,
                    Url: url,
                },
                Body: body,
            };

            /* istanbul ignore next */
            if (this.socket == null) {
                return reject(new Error("Connection not established"));
            }

            this.socket
                .write(message)
                .then(() => {
                    this.requests.set(tag!, {
                        message,
                        resolve,
                        reject,
                        timeout: setTimeout(
                            () =>
                                resolve(
                                    Response.parse(
                                        JSON.stringify({
                                            Header: { MessageBodyType: "ExceptionDetail" },
                                            Body: { Message: "Request timeout" },
                                        }),
                                    ),
                                ),
                            5_000,
                        ),
                    });
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Listener for taged responses from the device.
     */
    private onResponse = (response: Response): void => {
        const tag = response.Header.ClientTag;

        if (tag == null) {
            this.emit("Message", response);

            return;
        }

        const request = this.requests.get(tag)!;

        if (request != null) {
            clearTimeout(request.timeout);

            this.requests.delete(tag);
            request.resolve(response);
        }

        const subscription = this.subscriptions.get(tag);

        if (subscription == null) {
            return;
        }

        subscription.callback(response);
    };

    /*
     * Handles all data recieved from a device.
     */
    private onSocketData = (data: Buffer): void => {
        if (this.secure) {
            this.parse(data, this.onResponse);
        } else {
            this.emit("Message", JSON.parse(data.toString()));
        }
    };

    /*
     * Listener for any socket disconnects. This will teardown the failed
     * connection and will attempt to reconnect, unless a discrete disconnect
     * is invoked.
     */
    private onSocketDisconnect = (): void => {
        if (this.socket == null) {
            return;
        }

        if (!this.teardown) {
            this.drainRequests();
            this.connect();
        } else {
            this.emit("Disconnect");
        }
    };

    /*
     * Listener for any error from the socket.
     */
    private onSocketError = (error: Error): void => {
        this.emit("Error", error);
    };

    /*
     * Loads a saved device certificate. Certificates are created when a
     * processor is paired with this device.
     */
    private authorityCertificate(): Certificate | null {
        const filename = path.resolve(__dirname, "../authority");

        if (fs.existsSync(filename)) {
            const bytes = fs.readFileSync(filename);

            if (bytes == null) {
                return null;
            }

            const certificate = BSON.deserialize(bytes) as Certificate;

            certificate.ca = Buffer.from(certificate.ca, "base64").toString("utf8");
            certificate.key = Buffer.from(certificate.key, "base64").toString("utf8");
            certificate.cert = Buffer.from(certificate.cert, "base64").toString("utf8");

            return certificate;
        }

        return null;
    }

    /*
     * For non-secure connections, this will wait for a processor to enter
     * pairing mode. This requires a button press on the physical processor.
     */
    private physicalAccess(secure: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            if (secure) {
                return resolve();
            }

            /*
             * Testing processor errors and physical button press timeout is
             * not feasible for unit tests. This functionallity is best tested
             * manually with access to the processor.
             */

            /* istanbul ignore next */
            const timeout = setTimeout(() => reject(new Error("Physical timeout exceeded")), 60_000);

            this.once("Message", (response: Response) => {
                /* istanbul ignore else */
                if ((response.Body as PhysicalAccess).Status.Permissions.includes("PhysicalAccess")) {
                    clearTimeout(timeout);

                    return resolve();
                }

                /* istanbul ignore next */
                return reject(new Error("Unknown pairing error"));
            });
        });
    }
}
