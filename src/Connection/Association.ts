import { pki } from "node-forge";
import { HostAddressFamily } from "@mkellsy/hap-device";

import { Certificate } from "../Response/Certificate";
import { CertificateRequest } from "../Response/CertificateRequest";
import { Connection } from "./Connection";
import { ProcessorAddress } from "../Response/ProcessorAddress";

/**
 * Defines the logic for pairing a processor to this device.
 * @private
 */
export class Association {
    private connection: Connection;

    /**
     * Creates an association to a processor (pairing).
     *
     * @param processor The processor to pair.
     */
    constructor(processor: ProcessorAddress) {
        const ip =
            processor.addresses.find((address) => {
                return address.family === HostAddressFamily.IPv4;
            }) || processor.addresses[0];

        this.connection = new Connection(ip.address);
    }

    /**
     * Authenticate with the processor. This listens for when the pairing
     * button is pressed on the physical processor.
     *
     * @returns An authentication certificate.
     */
    public async authenticate(): Promise<Certificate> {
        return new Promise((resolve, reject) => {
            this.connection
                .connect()
                .then(() => {
                    this.createCertificateRequest("mkellsy-mqtt-lutron")
                        .then((request) => {
                            this.connection
                                .authenticate(request)
                                .then((certificate) => resolve(certificate))
                                .catch((error) => reject(error));
                        })
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        });
    }

    /*
     * Creates a certificate reqquest.
     */
    private createCertificateRequest(name: string): Promise<CertificateRequest> {
        return new Promise((resolve, reject) => {
            pki.rsa.generateKeyPair({ bits: 2048 }, (error, keys) => {
                if (error == null) {
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
