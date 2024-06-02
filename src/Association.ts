import { pki } from "node-forge";
import { Certificate, CertificateRequest, Connection } from "@mkellsy/leap";
import { HostAddressFamily } from "@mkellsy/hap-device";

import { ProcessorAddress } from "./Interfaces/ProcessorAddress";

export class Association {
    private connection: Connection;

    constructor(processor: ProcessorAddress) {
        const ip =
            processor.addresses.find((address) => address.family === HostAddressFamily.IPv4) || processor.addresses[0];

        this.connection = new Connection(ip.address);
    }

    public async authenticate(): Promise<Certificate> {
        await this.connection.connect();

        const request = await this.createCertificateRequest("mkellsy-mqtt-lutron");
        const certificate = await this.connection.authenticate(request);

        return certificate;
    }

    private createCertificateRequest(name: string): Promise<CertificateRequest> {
        return new Promise((resolve, reject) => {
            pki.rsa.generateKeyPair({ bits: 2048 }, (error, keys) => {
                if (error !== undefined) {
                    const request = pki.createCertificationRequest();

                    request.publicKey = keys.publicKey;
                    request.setSubject([{ name: "commonName", value: name }]);
                    request.sign(keys.privateKey);

                    return resolve({
                        key: keys.privateKey,
                        cert: pki.certificationRequestToPem(request),
                    });
                }

                return reject(new Error("Error generating RSA keys"));
            });
        });
    }
}
