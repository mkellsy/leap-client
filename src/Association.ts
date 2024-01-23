import { pki } from "node-forge";
import { createSecureContext } from "tls";
import { Pairing } from "@mkellsy/leap";

import { AuthContext } from "./Interfaces/AuthContext";
import { CertificationRequest } from "./Interfaces/CertificationRequest";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";

export class Association {
    private processor: ProcessorAddress;
    private pairing: Pairing;

    constructor(processor: ProcessorAddress, context: AuthContext) {
        this.processor = processor;

        const host = this.processor.addresses.find((address) => address.family === HostAddressFamily.IPv4);

        this.pairing = new Pairing(
            host != null ? host.address : this.processor.addresses[0].address,
            8083,
            createSecureContext({
                ca: context.ca,
                key: context.key,
                cert: context.cert,
            })
        );
    }

    public async connect(): Promise<void> {
        await this.pairing.connect();
        await this.physicalAccess();
    }

    public close(): void {
        this.pairing.close();
    }

    public async authContext(): Promise<AuthContext> {
        await this.connect();

        const csr = await this.createCsr("mkellsy-mqtt-lutron");
        const cert = await this.pair(csr);

        return cert;
    }

    private pair(csr: CertificationRequest): Promise<AuthContext> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Authentication timeout exceeded")), 5_000);

            this.pairing.once("Message", (response: Record<string, any>) => {
                clearTimeout(timeout);

                resolve({
                    ca: response.Body.SigningResult.RootCertificate,
                    cert: response.Body.SigningResult.Certificate,
                    key: pki.privateKeyToPem(csr.key),
                });
            });

            this.pairing.pair(csr.cert);
        });
    }

    private physicalAccess(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Physical timeout exceeded")), 60_000);

            this.pairing.once("Message", (response: Record<string, any>) => {
                if (response.Body.Status.Permissions.includes("PhysicalAccess")) {
                    clearTimeout(timeout);

                    return resolve();
                }

                return reject(new Error("Unknown pairing error"));
            });
        });
    }

    private createCsr(name: string): Promise<CertificationRequest> {
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
