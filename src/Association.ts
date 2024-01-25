import { pki } from "node-forge";
import { AuthContext, CertificateRequest, Connection } from "@mkellsy/leap";

import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";

export class Association {
    private connection: Connection;

    constructor(processor: ProcessorAddress, context: AuthContext) {
        const ip = processor.addresses.find((address) => address.family === HostAddressFamily.IPv4) || processor.addresses[0];

        this.connection = new Connection(ip.address, "Authentication", context);
    }

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.connection.connect().then(() => {
                const timeout = setTimeout(() => reject(new Error("Physical timeout exceeded")), 60_000);

                this.connection.once("Message", (response: Record<string, any>) => {
                    if (response.Body.Status.Permissions.includes("PhysicalAccess")) {
                        clearTimeout(timeout);

                        return resolve();
                    }

                    return reject(new Error("Unknown pairing error"));
                });
            }).catch((error) => reject(error));
        });
    }

    public disconnect(): void {
        this.connection.disconnect();
    }

    public async authenticate(): Promise<AuthContext> {
        await this.connect();

        const csr = await this.createCertificateRequest("mkellsy-mqtt-lutron");
        const cert = await this.connection.authenticate(csr);

        return cert;
    }

    private createCertificateRequest(name: string): Promise<CertificateRequest> {
        return new Promise((resolve, reject) => {
            pki.rsa.generateKeyPair({ bits: 2048 }, (error, keys) => {
                if (error !== undefined) {
                    const csr = pki.createCertificationRequest();

                    csr.publicKey = keys.publicKey;
                    csr.setSubject([{ name: "commonName", value: name }]);
                    csr.sign(keys.privateKey);

                    return resolve({
                        key: keys.privateKey,
                        cert: pki.certificationRequestToPem(csr),
                    });
                }

                return reject(new Error("Error generating RSA keys"));
            });
        });
    }
}
