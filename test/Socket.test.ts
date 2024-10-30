import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Socket } from "../src/Socket";

chai.use(sinonChai);
registerNode();

const emit = (stub: any, event: string, ...payload: any[]) => {
    for (const callback of stub.callbacks[event] || []) {
        callback(...payload);
    }
};

describe("Socket", () => {
    let certificateStub: any;
    let connectionStub: any;
    let emitStub: any;
    let optionsStub: any;
    let writeStub: any;

    let socket: Socket;
    let socketType: typeof Socket;

    before(() => {
        socketType = proxy(() => require("../src/Socket").Socket, {
            tls: {
                connect: (port: number, host: string, options: any) => {
                    optionsStub = { host, port, ...options };

                    return connectionStub;
                },
                createSecureContext: () => {
                    return {};
                },
            },
            "@mkellsy/event-emitter": {
                EventEmitter: class {
                    emit(event: string, ...payload: any[]) {
                        emitStub(event, ...payload);
                    }
                },
            },
        });
    });

    beforeEach(() => {
        certificateStub = {
            ca: "ROOT",
            cert: "CERTIFICATE",
            key: "PUBLIC_KEY",
        };

        connectionStub = {
            callbacks: {},
            off: sinon.stub(),
            end: sinon.stub(),
            destroy: sinon.stub(),
            setKeepAlive: sinon.stub(),
            getProtocol: sinon.stub().returns("TEST"),

            write(buffer: any, callback: Function) {
                writeStub.buffer = buffer;
                writeStub.callback = callback;
            },
        };

        connectionStub.on = (event: string, callback: Function) => {
            if (connectionStub.callbacks[event] == null) {
                connectionStub.callbacks[event] = [];
            }

            connectionStub.callbacks[event].push(callback);

            return connectionStub;
        };

        connectionStub.once = (event: string, callback: Function) => {
            if (connectionStub.callbacks[event] == null) {
                connectionStub.callbacks[event] = [];
            }

            connectionStub.callbacks[event].push(callback);

            return connectionStub;
        };

        writeStub = { buffer: undefined, callback: undefined };
        emitStub = sinon.stub();

        socket = new socketType("host", 8080, certificateStub);
    });

    describe("connect()", () => {
        it("should define listeners on connect", (done) => {
            socket
                .connect()
                .then((protocol) => {
                    expect(protocol).to.equal("TEST");
                    expect(connectionStub.off).to.be.calledWith("error", sinon.match.any);

                    expect(optionsStub.host).to.equal("host");
                    expect(optionsStub.port).to.equal(8080);

                    expect(connectionStub.callbacks["data"].length).to.be.greaterThan(0);
                    expect(connectionStub.callbacks["error"].length).to.be.greaterThan(0);
                    expect(connectionStub.callbacks["end"].length).to.be.greaterThan(0);

                    done();
                })
                .catch((error) => console.log(error));

            emit(connectionStub, "secureConnect");
        });

        it("should return an unknown protocol if null", () => {
            connectionStub.getProtocol.returns(undefined);

            socket
                .connect()
                .then((protocol) => {
                    expect(protocol).to.equal("Unknown");
                })
                .catch((error) => console.log(error));

            emit(connectionStub, "secureConnect");
        });
    });

    describe("disconnect()", () => {
        it("should not call end or destroy if connection is not established", () => {
            socket.disconnect();

            expect(connectionStub.end).to.not.be.called;
            expect(connectionStub.destroy).to.not.be.called;
        });

        it("should call rnd and destroy if connection is established", (done) => {
            socket
                .connect()
                .then(() => {
                    socket.disconnect();

                    expect(connectionStub.end).to.be.called;
                    expect(connectionStub.destroy).to.be.called;

                    done();
                })
                .catch((error) => console.log(error));

            emit(connectionStub, "secureConnect");
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
                        expect(writeStub.buffer).to.equal('{"command":"TEST"}\n');
                        done();
                    })
                    .catch((error) => console.log(error));

                writeStub.callback();
            });

            emit(connectionStub, "secureConnect");
        });

        it("should reject the write promise when the connection returns an error", (done) => {
            socket.connect().then(() => {
                socket.write({ command: "TEST" } as any).catch((error) => {
                    expect(error).to.equal("TEST ERROR");
                    done();
                });

                writeStub.callback("TEST ERROR");
            });

            emit(connectionStub, "secureConnect");
        });
    });

    describe("onSocketData()", () => {
        it("should emit a data event when the socket recieves data", (done) => {
            socket.connect().then(() => {
                emit(connectionStub, "data", "TEST DATA");
                expect(emitStub).to.be.calledWith("Data", "TEST DATA");

                done();
            });

            emit(connectionStub, "secureConnect");
        });
    });

    describe("onSocketEnd()", () => {
        it("should emit a disconenct event when the socket ends", (done) => {
            socket.connect().then(() => {
                emit(connectionStub, "end");
                expect(emitStub).to.be.calledWith("Disconnect");

                done();
            });

            emit(connectionStub, "secureConnect");
        });
    });

    describe("onSocketError()", () => {
        it("should emit an error event when the socket has an error", (done) => {
            socket.connect().then(() => {
                emit(connectionStub, "error", "TEST ERROR");
                expect(emitStub).to.be.calledWith("Error", "TEST ERROR");

                done();
            });

            emit(connectionStub, "secureConnect");
        });
    });
});
