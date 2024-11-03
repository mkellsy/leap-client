import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import timers, { InstalledClock } from "@sinonjs/fake-timers";

import { Association } from "../../src/Connection/Association";

chai.use(sinonChai);
registerNode();

describe("Association", () => {
    let clock: InstalledClock;

    let association: Association;
    let associationType: typeof Association;

    let certificate: any;
    let connection: any;
    let generate: any;
    let request: any;
    let options: any;

    before(() => {
        clock = timers.install();

        associationType = proxy(() => require("../../src/Connection/Association").Association, {
            "node-forge": {
                pki: {
                    rsa: {
                        generateKeyPair: (settings: any, callback: Function) => {
                            options = settings;
                            generate = callback;
                        },
                    },
                    createCertificationRequest: () => request,
                    certificationRequestToPem: () => certificate,
                },
            },
            "./Connection": {
                Connection: class {
                    connect(): any {
                        return connection.connect;
                    }

                    authenticate(): any {
                        return connection.authenticate;
                    }
                },
            },
        });
    });

    after(() => {
        clock.uninstall();
    });

    beforeEach(() => {
        certificate = "TEST_CERTIFICATE";

        request = {
            publicKey: "TEST_PUBLIC_KEY",
            setSubject: sinon.stub(),
            sign: sinon.stub(),
        };

        connection = {
            connect: sinon.promise(),
            authenticate: sinon.promise(),
        };

        association = new associationType({ id: "ID", type: "TYPE", addresses: [{ address: "aa:bb:cc", family: 6 }] });
        association = new associationType({ id: "ID", type: "TYPE", addresses: [{ address: "0.0.0.0", family: 4 }] });
    });

    it("should return a valid certificate", (done) => {
        association
            .authenticate()
            .then((results) => {
                expect(results).to.equal(certificate);

                done();
            })
            .catch((error) => console.log(error));

        connection.connect.resolve();

        clock.runToLastAsync().then(() => {
            generate(null, { publicKey: "TEST_PUBLIC_KEY" });

            connection.authenticate.resolve(certificate);
        });
    });

    it("should reject if the csr fails", (done) => {
        association.authenticate().catch((error) => {
            expect(error.message).to.equal("Error generating RSA keys");

            done();
        });

        connection.connect.resolve();

        clock.runToLastAsync().then(() => {
            generate("TEST_ERROR");
        });
    });

    it("should reject if authentication fails", (done) => {
        association.authenticate().catch((error) => {
            expect(error).to.equal("TEST_ERROR");

            done();
        });

        connection.connect.resolve();

        clock.runToLastAsync().then(() => {
            generate(null, { publicKey: "TEST_PUBLIC_KEY" });

            connection.authenticate.reject("TEST_ERROR");
        });
    });

    it("should reject if the connection fails", (done) => {
        association.authenticate().catch((error) => {
            expect(error).to.equal("TEST_ERROR");

            done();
        });

        connection.connect.reject("TEST_ERROR");
    });
});
