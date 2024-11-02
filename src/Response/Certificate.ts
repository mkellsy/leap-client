/**
 * Defines an auth certificate.
 */
export interface Certificate {
    /**
     * Certificate authority.
     */
    ca: string;

    /**
     * Certificate public key.
     */
    key: string;

    /**
     * Certificate contents.
     */
    cert: string;
}
