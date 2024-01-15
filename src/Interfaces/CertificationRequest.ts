import { pki } from "node-forge";

export interface CertificationRequest {
    key: pki.rsa.PrivateKey;
    cert: string;
}
