import fs from "fs";
import path from "path";
import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Connection } from "../src/Connection/Connection";
import { ExceptionDetail } from "../src/Response/ExceptionDetail";

chai.use(sinonChai);

const sandbox = sinon.createSandbox();

const emit = (stub: any, event: string, ...payload: any[]) => {
    for (const callback of stub.callbacks[event] || []) {
        callback(...payload);
    }
};

describe("Connection", () => {
    let pki: any;
    let uuid: any;
    let parser: any;
    let exists: any;
    let socket: any;
    let events: any;
    let options: any;
    let authority: any;
    let reachable: any;

    let connection: Connection;
    let connectionType: typeof Connection;

    before(() => {
        connectionType = proxyquire("../src/Connection/Connection", {
            fs: {
                existsSync() {
                    return exists;
                },
                readFileSync() {
                    return authority;
                },
            },
            net: {
                Socket: class {
                    setTimeout = (timeout: number): void => {
                        reachable.timeout = timeout;
                    };

                    once = (event: string, callback: Function): void => {
                        reachable.callbacks[event] = callback;
                    };

                    connect = (port: number, host: string, callback: Function): void => {
                        reachable.port = port;
                        reachable.host = host;
                        reachable.callbacks.connect = callback;
                    };

                    destroy = reachable.destroy;
                },
            },
            uuid: {
                v4() {
                    return uuid;
                },
            },
            "node-forge": {
                pki: {
                    privateKeyToPem: () => pki,
                },
            },
            "../Response/Parser": {
                Parser: class {
                    emit(event: string, ...payload: any[]) {
                        events(event, ...payload);
                    }

                    on(event: string, callback: Function) {
                        if (parser.callbacks[event] == null) {
                            parser.callbacks[event] = [];
                        }

                        parser.callbacks[event].push(callback);

                        return this;
                    }

                    once(event: string, callback: Function) {
                        if (parser.callbacks[event] == null) {
                            parser.callbacks[event] = [];
                        }

                        parser.callbacks[event].push(callback);

                        return this;
                    }

                    parse(data: any, callback: Function): void {
                        callback(data);
                    }
                },
            },
            "./Socket": {
                Socket: class {
                    constructor(host: string, port: number, certificate: any) {
                        options = { host, port, certificate };
                    }

                    connect() {
                        return socket.connect;
                    }

                    disconnect() {
                        return socket.disconnect();
                    }

                    write() {
                        return socket.write;
                    }

                    on(event: string, callback: Function) {
                        if (socket.callbacks[event] == null) {
                            socket.callbacks[event] = [];
                        }

                        socket.callbacks[event].push(callback);

                        return this;
                    }

                    off(...args: any[]) {
                        socket.off(...args);

                        return this;
                    }

                    once(event: string, callback: Function) {
                        if (socket.callbacks[event] == null) {
                            socket.callbacks[event] = [];
                        }

                        socket.callbacks[event].push(callback);

                        return this;
                    }

                    emit(event: string, ...payload: any[]): void {
                        socket.emit(event, ...payload);
                    }
                },
            },
        }).Connection;
    });

    beforeEach(() => {
        uuid = "UNKNOWN";

        reachable = {
            callbacks: {},
            timeout: 0,

            port: 0,
            host: undefined,

            destroy: sandbox.stub(),
        };

        parser = { callbacks: {} };

        socket = {
            callbacks: {},
            connect: sinon.promise(),
            disconnect: sandbox.stub(),
            write: sinon.promise(),
            off: sandbox.stub(),
        };

        authority = fs.readFileSync(path.resolve(__dirname, "../authority"));
        exists = true;
        events = sandbox.stub();

        connection = new connectionType("HOST", {
            ca: "ROOT",
            cert: "CERTIFICATE",
            key: "PUBLIC_KEY",
        });
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("reachable()", () => {
        it("should return true if a host can be connected to", (done) => {
            connectionType.reachable("HOST").then((results) => {
                expect(results).to.be.true;

                expect(reachable.timeout).to.equal(1000);
                expect(reachable.port).to.equal(8083);
                expect(reachable.host).to.equal("HOST");

                expect(reachable.destroy).to.be.called;

                done();
            });

            reachable.callbacks.connect();
        });

        it("should return false if a host connection attempt timesout", (done) => {
            connectionType.reachable("HOST").then((results) => {
                expect(results).to.be.false;

                expect(reachable.timeout).to.equal(1000);
                expect(reachable.port).to.equal(8083);
                expect(reachable.host).to.equal("HOST");

                expect(reachable.destroy).to.be.called;

                done();
            });

            reachable.callbacks.timeout();
        });

        it("should return false if a host connection emits an error", (done) => {
            connectionType.reachable("HOST").then((results) => {
                expect(results).to.be.false;

                expect(reachable.timeout).to.equal(1000);
                expect(reachable.port).to.equal(8083);
                expect(reachable.host).to.equal("HOST");

                expect(reachable.destroy).to.be.called;

                done();
            });

            reachable.callbacks.error();
        });
    });

    describe("connect()", () => {
        it("should define listeners and emit a Connect event", (done) => {
            connection
                .connect()
                .then(() => {
                    expect(options.host).to.equal("HOST");
                    expect(options.port).to.equal(8081);
                    expect(options.certificate.ca).to.equal("ROOT");
                    expect(options.certificate.cert).to.equal("CERTIFICATE");
                    expect(options.certificate.key).to.equal("PUBLIC_KEY");

                    expect(socket.callbacks["Data"].length).to.be.greaterThan(0);
                    expect(socket.callbacks["Error"].length).to.be.greaterThan(0);
                    expect(socket.callbacks["Disconnect"].length).to.be.greaterThan(0);

                    expect(events).to.be.calledWith("Connect", sandbox.match.any);

                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });

        it("should define listeners and emit a Connect event for non-secure connections", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    expect(options.host).to.equal("HOST");
                    expect(options.port).to.equal(8083);

                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should default the certificate to default if the authority file doesn't exist", (done) => {
            exists = false;
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    expect(options.certificate.ca).to.equal("");
                    expect(options.certificate.cert).to.equal("");
                    expect(options.certificate.key).to.equal("");

                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should default the certificate to default if the authority file is corrupt", (done) => {
            authority = null;
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    expect(options.certificate.ca).to.equal("");
                    expect(options.certificate.cert).to.equal("");
                    expect(options.certificate.key).to.equal("");

                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject the connection if the socket connection fails", (done) => {
            connection.connect().catch((error) => {
                expect(error).to.equal("CONNECT_ERROR");

                done();
            });

            socket.connect.reject("CONNECT_ERROR");
        });
    });

    describe("read()", () => {
        let successStub: any;

        beforeEach(() => {
            successStub = sandbox.stub();
        });

        it("should properly send read requests to the socket", (done) => {
            uuid = "READ";

            connection
                .connect()
                .then(() => {
                    connection
                        .read("/TEST_URL")
                        .then((result) => {
                            expect(result).to.equal("TEST_RESULT");

                            done();
                        })
                        .catch((error) => console.log(error));

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "READ", StatusCode: { isSuccessful: successStub } },
                            Body: "TEST_RESULT",
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if read is called on a non-secure connection", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    connection.read("/TEST_URL").catch((error) => {
                        expect(error.message).to.equal("Only available for secure connections");

                        done();
                    });
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject if a read response has no body", (done) => {
            uuid = "READ";

            connection
                .connect()
                .then(() => {
                    connection.read("/TEST_URL").catch((error) => {
                        expect(error.message).to.equal("/TEST_URL no body");

                        done();
                    });

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "READ", StatusCode: { isSuccessful: successStub } },
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if a read response is an exception", (done) => {
            const exception = new ExceptionDetail();

            uuid = "READ";

            connection
                .connect()
                .then(() => {
                    connection.read("/TEST_URL").catch((error) => {
                        expect(error.message).to.equal("TEST_EXCEPTION");

                        done();
                    });

                    socket.write.resolve();
                    exception.Message = "TEST_EXCEPTION";

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "READ", StatusCode: { isSuccessful: successStub } },
                            Body: exception,
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if the socket write fails", (done) => {
            successStub.returns(true);
            uuid = "SUB";

            connection
                .connect()
                .then(() => {
                    connection.read("/TEST_URL").catch((error) => {
                        expect(error).to.equal("WRITE_ERROR");

                        done();
                    });

                    socket.write.reject("WRITE_ERROR");
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });
    });

    describe("update()", () => {
        let successStub: any;

        beforeEach(() => {
            successStub = sandbox.stub();
        });

        it("should properly send update requests to the socket", (done) => {
            uuid = "UPDATE";

            connection
                .connect()
                .then(() => {
                    connection
                        .update("/TEST_URL", { TEST: "UPDATE" })
                        .then((result) => {
                            expect(result).to.equal("TEST_RESULT");

                            done();
                        })
                        .catch((error) => console.log(error));

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "UPDATE", StatusCode: { isSuccessful: successStub } },
                            Body: "TEST_RESULT",
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if read is called on a non-secure connection", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    connection.update("/TEST_URL", { TEST: "UPDATE" }).catch((error) => {
                        expect(error.message).to.equal("Only available for secure connections");

                        done();
                    });
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject if a update response is an exception", (done) => {
            const exception = new ExceptionDetail();

            uuid = "UPDATE";

            connection
                .connect()
                .then(() => {
                    connection.update("/TEST_URL", { TEST: "UPDATE" }).catch((error) => {
                        expect(error.message).to.equal("TEST_EXCEPTION");

                        done();
                    });

                    socket.write.resolve();
                    exception.Message = "TEST_EXCEPTION";

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "UPDATE", StatusCode: { isSuccessful: successStub } },
                            Body: exception,
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if the socket write fails", (done) => {
            successStub.returns(true);
            uuid = "UPDATE";

            connection
                .connect()
                .then(() => {
                    connection.update("/TEST_URL", { TEST: "UPDATE" }).catch((error) => {
                        expect(error).to.equal("WRITE_ERROR");

                        done();
                    });

                    socket.write.reject("WRITE_ERROR");
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });
    });

    describe("command()", () => {
        let successStub: any;

        beforeEach(() => {
            successStub = sandbox.stub();
        });

        it("should properly send command requests to the socket", (done) => {
            uuid = "COMMAND";

            connection
                .connect()
                .then(() => {
                    connection
                        .command("/TEST_URL", { TEST: "COMMAND" })
                        .then(() => {
                            done();
                        })
                        .catch((error) => console.log(error));

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "COMMAND", StatusCode: { isSuccessful: successStub } },
                            Body: "TEST_RESULT",
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if command is called on a non-secure connection", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    connection.command("/TEST_URL", { TEST: "COMMAND" }).catch((error) => {
                        expect(error.message).to.equal("Only available for secure connections");

                        done();
                    });
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject if the socket write fails", (done) => {
            successStub.returns(true);
            uuid = "COMMAND";

            connection
                .connect()
                .then(() => {
                    connection.command("/TEST_URL", { TEST: "COMMAND" }).catch((error) => {
                        expect(error).to.equal("WRITE_ERROR");

                        done();
                    });

                    socket.write.reject("WRITE_ERROR");
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });
    });

    describe("subscribe()", () => {
        let listenerStub: any;
        let successStub: any;

        beforeEach(() => {
            successStub = sandbox.stub();
            listenerStub = sandbox.stub();
        });

        it("should properly send subscribe requests to the socket", (done) => {
            successStub.returns(true);
            uuid = "SUB";

            connection
                .connect()
                .then(() => {
                    connection.subscribe("/TEST_URL", listenerStub).then(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "SUB" },
                        });

                        expect(listenerStub).to.be.called;

                        done();
                    });

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "SUB", StatusCode: { isSuccessful: successStub } },
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should not attach listener if the subscribe request is not successful", (done) => {
            successStub.returns(false);
            uuid = "SUB";

            connection
                .connect()
                .then(() => {
                    connection.subscribe("/TEST_URL", listenerStub).then(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "SUB" },
                        });

                        expect(listenerStub).to.not.be.called;

                        done();
                    });

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "SUB", StatusCode: { isSuccessful: successStub } },
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should reject if subscribe is called on a non-secure connection", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    connection.subscribe("/TEST_URL", listenerStub).catch((error) => {
                        expect(error.message).to.equal("Only available for secure connections");

                        done();
                    });
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject if the socket write fails", (done) => {
            successStub.returns(true);
            uuid = "SUB";

            connection
                .connect()
                .then(() => {
                    connection.subscribe("/TEST_URL", listenerStub).catch((error) => {
                        expect(error).to.equal("WRITE_ERROR");

                        done();
                    });

                    socket.write.reject("WRITE_ERROR");
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });

        it("should maintain subscriptions when reconnecting", (done) => {
            successStub.returns(true);
            uuid = "SUB";

            connection
                .connect()
                .then(() => {
                    connection.subscribe("/TEST_URL", listenerStub).then(() => {
                        socket.connect = sinon.promise();

                        emit(socket, "Disconnect");

                        setTimeout(() => {
                            socket.connect.resolve("PROTOCOL");

                            emit(socket, "Data", {
                                Header: { ClientTag: "SUB" },
                            });

                            expect(listenerStub).to.be.called;

                            done();
                        }, 1);
                    });

                    socket.write.resolve();

                    setTimeout(() => {
                        emit(socket, "Data", {
                            Header: { ClientTag: "SUB", StatusCode: { isSuccessful: successStub } },
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });
    });

    describe("authenticate()", () => {
        it("should return a valid certificate on authenticate", (done) => {
            connection = new connectionType("HOST");
            pki = "TEST_KEY";

            connection
                .connect()
                .then(() => {
                    delete parser.callbacks["Message"];

                    connection
                        .authenticate({ key: "TEST_KEY" as any, cert: "TEST_CERT" })
                        .then((certificate) => {
                            expect(certificate.ca).to.equal("TEST_ROOT");
                            expect(certificate.cert).to.equal("TEST_CERT");
                            expect(certificate.key).to.equal("TEST_KEY");

                            done();
                        })
                        .catch((error) => console.log(error));

                    setTimeout(() => {
                        emit(parser, "Message", {
                            Body: {
                                SigningResult: {
                                    RootCertificate: "TEST_ROOT",
                                    Certificate: "TEST_CERT",
                                },
                            },
                        });
                    }, 1);
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });

        it("should reject for secure connections", (done) => {
            connection
                .connect()
                .then(() => {
                    connection.authenticate({ key: "TEST_KEY" as any, cert: "TEST_CERT" }).catch((error) => {
                        expect(error.message).to.equal("Only available for physical connections");

                        done();
                    });
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
        });
    });

    describe("disconnect()", () => {
        it("should not call destroy if connection is not established", () => {
            connection.disconnect();
            expect(socket.disconnect).to.not.be.called;
        });

        it("should call destroy if connection is established", (done) => {
            connection
                .connect()
                .then(() => {
                    connection.disconnect();

                    expect(socket.disconnect).to.be.called;
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });

        it("should call destroy for non-secure connections", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    connection.disconnect();

                    expect(socket.disconnect).to.be.called;
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });
    });

    describe("onSocketData()", () => {
        it("should emit message event on untagged responses", (done) => {
            connection
                .connect()
                .then(() => {
                    emit(socket, "Data", { Header: { ClientTag: null } });

                    expect(events).to.be.calledWith("Message", sandbox.match.any);
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });

        it("should not emit message event on tagged responses", (done) => {
            connection
                .connect()
                .then(() => {
                    emit(socket, "Data", { Header: { ClientTag: "UNKNOWN" } });

                    expect(events).to.not.be.calledWith("Message", sandbox.match.any);
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });

        it("should emit message event for non-secure responses", (done) => {
            connection = new connectionType("HOST");

            connection
                .connect()
                .then(() => {
                    emit(socket, "Data", Buffer.from(JSON.stringify({ message: "MESSAGE" })));

                    expect(events).to.be.calledWith("Message", sandbox.match.any);
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");

            setTimeout(() => {
                emit(parser, "Message", { Body: { Status: { Permissions: ["PhysicalAccess"] } } });
            }, 1);
        });
    });

    describe("onSocketTimeout()", () => {
        it("should emit a timeout event when the socket timesout", (done) => {
            connection
                .connect()
                .then(() => {
                    emit(socket, "Timeout");

                    expect(events).to.be.calledWith("Timeout");
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });
    });

    describe("onSocketDisconnect()", () => {
        it("should emit a disconenct event when the socket ends", (done) => {
            connection
                .connect()
                .then(() => {
                    emit(socket, "Disconnect");

                    expect(events).to.be.calledWith("Disconnect");
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });

        it("should not emit a disconenct event when disconnect is implicitly called", (done) => {
            connection
                .connect()
                .then(() => {
                    connection.disconnect();
                    emit(socket, "Disconnect");

                    expect(events).to.not.be.calledWith("Disconnect");
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });
    });

    describe("onSocketError()", () => {
        it("should emit an error event when the socket has an error", (done) => {
            connection
                .connect()
                .then(() => {
                    emit(socket, "Error", "TEST ERROR");

                    expect(events).to.be.calledWith("Error", "TEST ERROR");
                    done();
                })
                .catch((error) => console.log(error));

            socket.connect.resolve("PROTOCOL");
            emit(parser, "Message");
        });
    });
});
