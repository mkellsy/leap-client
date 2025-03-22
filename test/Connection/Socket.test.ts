import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import timers, { InstalledClock } from "@sinonjs/fake-timers";

import { Socket } from "../../src/Connection/Socket";

chai.use(sinonChai);

const emit = (stub: any, event: string, ...payload: any[]) => {
    for (const callback of stub.callbacks[event] || []) {
        callback(...payload);
    }
};

describe("Socket", () => {
    let clock: InstalledClock;

    let connection: any;
    let options: any;
    let events: any;
    let writer: any;

    let socket: Socket;
    let socketType: typeof Socket;

    before(() => {
        clock = timers.install();

        socketType = proxyquire("../../src/Connection/Socket", {
            tls: {
                connect: (port: number, host: string, settings: any) => {
                    options = { host, port, ...settings };

                    return connection;
                },
                createSecureContext: () => {
                    return {};
                },
            },
            "@mkellsy/event-emitter": {
                EventEmitter: class {
                    emit(event: string, ...payload: any[]) {
                        events(event, ...payload);
                    }
                },
            },
        }).Socket;
    });

    after(() => {
        clock.uninstall();
    });

    beforeEach(() => {
        connection = {
            callbacks: {},
            off: sinon.stub(),
            end: sinon.stub(),
            destroy: sinon.stub(),
            setKeepAlive: sinon.stub(),
            setTimeout: sinon.stub(),
            getProtocol: sinon.stub().returns("TEST"),

            write(buffer: any, callback: Function) {
                writer.buffer = buffer;
                writer.callback = callback;
            },
        };

        connection.on = (event: string, callback: Function) => {
            if (connection.callbacks[event] == null) {
                connection.callbacks[event] = [];
            }

            connection.callbacks[event].push(callback);

            return connection;
        };

        connection.once = (event: string, callback: Function) => {
            if (connection.callbacks[event] == null) {
                connection.callbacks[event] = [];
            }

            connection.callbacks[event].push(callback);

            return connection;
        };

        writer = { buffer: undefined, callback: undefined };
        events = sinon.stub();

        socket = new socketType("host", 8080, {
            ca: "ROOT",
            cert: "CERTIFICATE",
            key: "PUBLIC_KEY",
        });
    });

    describe("connect()", () => {
        it("should define listeners on connect", (done) => {
            socket
                .connect()
                .then((protocol) => {
                    expect(protocol).to.equal("TEST");
                    expect(connection.off).to.be.calledWith("error", sinon.match.any);

                    expect(options.host).to.equal("host");
                    expect(options.port).to.equal(8080);

                    expect(connection.callbacks["data"].length).to.be.greaterThan(0);
                    expect(connection.callbacks["error"].length).to.be.greaterThan(0);
                    expect(connection.callbacks["close"].length).to.be.greaterThan(0);

                    done();
                })
                .catch((error) => console.log(error));

            emit(connection, "secureConnect");
        });

        it("should return an unknown protocol if null", () => {
            connection.getProtocol.returns(undefined);

            socket
                .connect()
                .then((protocol) => {
                    expect(protocol).to.equal("Unknown");
                })
                .catch((error) => console.log(error));

            emit(connection, "secureConnect");
        });
    });

    describe("disconnect()", () => {
        it("should not call end or destroy if connection is not established", () => {
            socket.disconnect();

            expect(connection.end).to.not.be.called;
            expect(connection.destroy).to.not.be.called;
        });

        it("should call rnd and destroy if connection is established", (done) => {
            socket
                .connect()
                .then(() => {
                    socket.disconnect();

                    expect(connection.end).to.be.called;
                    expect(connection.destroy).to.be.called;

                    done();
                })
                .catch((error) => console.log(error));

            emit(connection, "secureConnect");
        });
    });

    describe("write()", () => {
        it("should not write to the socket if connection is not established", () => {
            socket.write({ command: "TEST" } as any).catch((error) => {
                expect(error.message).to.equal("connection not established");
            });
        });

        it("should write a stuffed and marked buffer to the socket", (done) => {
            socket.connect().then(() => {
                socket
                    .write({ command: "TEST" } as any)
                    .then(() => {
                        expect(writer.buffer).to.equal('{"command":"TEST"}\n');
                        done();
                    })
                    .catch((error) => console.log(error));

                writer.callback();
            });

            emit(connection, "secureConnect");
        });

        it("should reject the write promise when the connection returns an error", (done) => {
            socket.connect().then(() => {
                socket.write({ command: "TEST" } as any).catch((error) => {
                    expect(error).to.equal("TEST ERROR");
                    done();
                });

                writer.callback("TEST ERROR");
            });

            emit(connection, "secureConnect");
        });
    });

    describe("onSocketData()", () => {
        it("should emit a data event when the socket recieves data", (done) => {
            socket.connect().then(() => {
                emit(connection, "data", "TEST DATA");
                expect(events).to.be.calledWith("Data", "TEST DATA");

                done();
            });

            emit(connection, "secureConnect");
        });
    });

    describe("onSocketTimeout()", () => {
        it("should emit a timeout event when the socket timesout", (done) => {
            socket.connect().then(() => {
                emit(connection, "timeout");
                expect(events).to.be.calledWith("Timeout");

                done();
            });

            emit(connection, "secureConnect");
        });
    });

    describe("onSocketClose()", () => {
        it("should emit a disconenct event when the socket closes", (done) => {
            socket.connect().then(() => {
                emit(connection, "close");
                clock.tick(1_000);
                expect(events).to.be.calledWith("Disconnect");

                done();
            });

            emit(connection, "secureConnect");
        });
    });

    describe("onSocketError()", () => {
        it("should emit an error event when the socket has an error", (done) => {
            socket.connect().then(() => {
                emit(connection, "error", "TEST ERROR");
                expect(events).to.be.calledWith("Error", "TEST ERROR");

                done();
            });

            emit(connection, "secureConnect");
        });

        it("should emit an error event when the socket has an error with a message", (done) => {
            const error = new Error("TEST_ERROR");

            socket.connect().then(() => {
                emit(connection, "error", error);
                expect(events).to.be.calledWith("Error", error);

                done();
            });

            emit(connection, "secureConnect");
        });

        const TEST_DISCONNECT_ERRORS = ["ENOTFOUND", "ENETUNREACH", "EHOSTUNREACH", "ECONNRESET", "EPIPE"];

        TEST_DISCONNECT_ERRORS.forEach((TEST_CASE) => {
            it(`should emit a disconnect event when the socket emits a ${TEST_CASE} error`, (done) => {
                const error = new Error(`${TEST_CASE}: TEST_ERROR`);

                socket.connect().then(() => {
                    emit(connection, "error", error);
                    clock.tick(1_100);
                    expect(events).to.be.calledWith("Disconnect");

                    done();
                });

                emit(connection, "secureConnect");
            });
        });

        const TEST_TIMEOUT_ERRORS = ["ETIMEDOUT"];

        TEST_TIMEOUT_ERRORS.forEach((TEST_CASE) => {
            it(`should emit a timeout event when the socket emits a ${TEST_CASE} error`, (done) => {
                const error = new Error(`${TEST_CASE}: TEST_ERROR`);

                socket.connect().then(() => {
                    emit(connection, "error", error);
                    expect(events).to.be.calledWith("Timeout");

                    done();
                });

                emit(connection, "secureConnect");
            });
        });
    });
});
