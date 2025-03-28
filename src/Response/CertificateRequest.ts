import { pki } from "node-forge";

/**
 * Defines a certificate request.
 * @private
 */
export interface CertificateRequest {
    /**
     * Certificate private key.
     */
    key: pki.rsa.PrivateKey;

    /**
     * Certificate contents.
     */
    cert: string;
}
