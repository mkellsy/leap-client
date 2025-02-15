import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { ProcessorController } from "../../src/Devices/Processor/ProcessorController";

chai.use(sinonChai);

describe("Processor", () => {
    let processor: ProcessorController;
    let processorType: typeof ProcessorController;

    let connection: any;
    let callbacks: any;
    let subscribe: any;
    let connect: any;
    let command: any;
    let reader: any;
    let update: any;
    let cache: any;

    before(() => {
        processorType = proxyquire("../../src/Devices/Processor/ProcessorController", {
            "flat-cache": { load: () => cache },
        }).ProcessorController;
    });

    beforeEach(() => {
        callbacks = {};

        cache = {
            keys: sinon.stub(),
            save: sinon.stub(),
            setKey: sinon.stub(),
            getKey: sinon.stub(),
            removeKey: sinon.stub(),
            removeCacheFile: sinon.stub(),
        };

        subscribe = sinon.promise();
        command = sinon.promise();
        connect = sinon.promise();
        reader = sinon.promise();
        update = sinon.promise();

        connection = {
            on(event: string, callback: Function): void {
                if (callbacks[event] == null) {
                    callbacks[event] = [];
                }

                callbacks[event].push({ persist: true, callback });
            },

            once(event: string, callback: Function): void {
                if (callbacks[event] == null) {
                    callbacks[event] = [];
                }

                callbacks[event].push({ persist: false, callback });
            },

            emit(event: string, ...payload: any[]): void {
                if (callbacks[event] == null) {
                    return;
                }

                for (let i = 0; i < callbacks[event].length; i++) {
                    callbacks[event][i].callback(...payload);
                }

                callbacks[event] = callbacks[event].filter((callback: any) => callback.persist);
            },

            off: sinon.stub(),
            read: sinon.stub().returns(reader),
            update: sinon.stub().returns(update),
            connect: sinon.stub().returns(connect),
            command: sinon.stub().returns(command),
            subscribe: sinon.stub().returns(subscribe),
            disconnect: sinon.stub(),
        };

        processor = new processorType("ID", connection);

        connection.emit("Connect");
        connection.emit("Message", "TEST_MESSAGE");
    });

    afterEach(() => {
        connection.emit("Disconnect");
    });

    it("should define common properties", () => {
        expect(processor.id).to.equal("ID");
        expect(processor.log).to.not.be.undefined;
        expect(processor.devices).to.not.be.undefined;
    });

    it("should call connect on the underlying connection", (done) => {
        processor
            .connect()
            .then(() => {
                expect(connection.connect).to.be.called;

                done();
            })
            .catch((error) => console.log(error));

        connect.resolve();
    });

    it("should call disconnect on the underlying connection", () => {
        processor.disconnect();

        expect(connection.disconnect).to.be.called;
    });

    it("should call read on the underlying connection", (done) => {
        processor
            .read("TEST_URL")
            .then(() => {
                expect(connection.read).to.be.calledWith("TEST_URL");

                done();
            })
            .catch((error) => console.log(error));

        reader.resolve();
    });

    it("should call read on the underlying connection when ping is called", (done) => {
        processor
            .ping()
            .then(() => {
                expect(connection.read).to.be.calledWith("/server/1/status/ping");

                done();
            })
            .catch((error) => console.log(error));

        reader.resolve();
    });

    it("should remove all keys from the cache and save when clear is called", () => {
        cache.keys.returns(["TEST_ONE", "TEST_TWO", "TEST_THREE"]);

        processor.clear();

        expect(cache.removeKey).to.be.calledWith("TEST_ONE");
        expect(cache.removeKey).to.be.calledWith("TEST_TWO");
        expect(cache.removeKey).to.be.calledWith("TEST_THREE");

        expect(cache.removeCacheFile).to.be.called;
        expect(cache.save).to.be.called;
    });

    it("should call update on the underlying connection", (done) => {
        processor
            .update({ href: "/ADDRESS" }, "TEST_FIELD", { value: "TEST_VALUE" })
            .then(() => {
                expect(connection.update).to.be.calledWith("/ADDRESS/TEST_FIELD", { value: "TEST_VALUE" });

                done();
            })
            .catch((error) => console.log(error));

        update.resolve();
    });

    it("should call command on the underlying connection", (done) => {
        processor
            .command({ href: "/ADDRESS" }, { command: "TEST_COMMAND" })
            .then(() => {
                expect(connection.command).to.be.calledWith("/ADDRESS/commandprocessor", {
                    Command: { command: "TEST_COMMAND" },
                });

                done();
            })
            .catch((error) => console.log(error));

        command.resolve();
    });

    it("should call subscribe on the underlying connection", (done) => {
        const callback = sinon.stub();

        processor
            .subscribe({ href: "/ADDRESS" }, callback)
            .then(() => {
                expect(connection.subscribe).to.be.calledWith("/ADDRESS", callback);

                done();
            })
            .catch((error) => console.log(error));

        subscribe.resolve();
    });

    describe("statuses()", () => {
        it("should call read on the underlying connection when a single status is requested", (done) => {
            processor
                .status({ href: "/ADDRESS" })
                .then(() => {
                    expect(connection.read).to.be.calledWith("/ADDRESS/status");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve();
        });

        it("should return zones and areas for caseta processors", (done) => {
            processor
                .statuses()
                .then((results) => {
                    expect(results.length).to.equal(2);

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve(["TEST_STATUS"]);
        });

        it("should return zones, areas and timeclocks for RA3 processors", (done) => {
            processor
                .statuses("RadioRa3Processor")
                .then((results) => {
                    expect(results.length).to.equal(3);

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve(["TEST_STATUS"]);
        });

        it("should reject if any of the reads fails", (done) => {
            processor.statuses().catch((error) => {
                expect(error).to.equal("TEST_ERROR");

                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("project()", () => {
        it("should return a project response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .project()
                .then((results) => {
                    expect(results).to.equal("TEST_PROJECT");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_PROJECT");
        });

        it("should return a project from cache if exists", (done) => {
            cache.getKey.returns("TEST_PROJECT");

            processor
                .project()
                .then((results) => {
                    expect(results).to.equal("TEST_PROJECT");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.project().catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("system()", () => {
        it("should return a system response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .system()
                .then((results) => {
                    expect(results).to.equal("TEST_SYSTEM");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve(["TEST_SYSTEM"]);
        });

        it("should return a system from cache if exists", (done) => {
            cache.getKey.returns("TEST_SYSTEM");

            processor
                .system()
                .then((results) => {
                    expect(results).to.equal("TEST_SYSTEM");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if there is no system to return", (done) => {
            cache.getKey.returns(undefined);

            processor.system().catch(() => {
                done();
            });

            reader.resolve({});
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.system().catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("areas()", () => {
        it("should return an areas response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .areas()
                .then((results) => {
                    expect(results).to.equal("TEST_AREAS");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_AREAS");
        });

        it("should return areas from cache if exists", (done) => {
            cache.getKey.returns("TEST_AREAS");

            processor
                .areas()
                .then((results) => {
                    expect(results).to.equal("TEST_AREAS");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.areas().catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("timeclocks()", () => {
        it("should return a timeclocks response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .timeclocks()
                .then((results) => {
                    expect(results).to.equal("TEST_TIMECLOCKS");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_TIMECLOCKS");
        });

        it("should return timeclocks from cache if exists", (done) => {
            cache.getKey.returns("TEST_TIMECLOCKS");

            processor
                .timeclocks()
                .then((results) => {
                    expect(results).to.equal("TEST_TIMECLOCKS");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.timeclocks().catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("zones()", () => {
        it("should return a zones response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .zones({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_ZONES");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_ZONES");
        });

        it("should return zones from cache if exists", (done) => {
            cache.getKey.returns("TEST_ZONES");

            processor
                .zones({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_ZONES");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.zones({ href: "/AREA" }).catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("controls()", () => {
        it("should return a controls response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .controls({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_CONTROLS");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_CONTROLS");
        });

        it("should return controls from cache if exists", (done) => {
            cache.getKey.returns("TEST_CONTROLS");

            processor
                .controls({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_CONTROLS");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.controls({ href: "/AREA" }).catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("device()", () => {
        it("should return a device response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .device({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_DEVICE");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_DEVICE");
        });

        it("should return device from cache if exists", (done) => {
            cache.getKey.returns("TEST_DEVICE");

            processor
                .device({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_DEVICE");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.device({ href: "/AREA" }).catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });

    describe("buttons()", () => {
        it("should return a buttons response from the underlying connection", (done) => {
            cache.getKey.returns(undefined);

            processor
                .buttons({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_BUTTONS");

                    done();
                })
                .catch((error) => console.log(error));

            reader.resolve("TEST_BUTTONS");
        });

        it("should return buttons from cache if exists", (done) => {
            cache.getKey.returns("TEST_BUTTONS");

            processor
                .buttons({ href: "/AREA" })
                .then((results) => {
                    expect(results).to.equal("TEST_BUTTONS");

                    done();
                })
                .catch((error) => console.log(error));
        });

        it("should log an error if the read request fails", (done) => {
            cache.getKey.returns(undefined);

            processor.buttons({ href: "/AREA" }).catch(() => {
                done();
            });

            reader.reject("TEST_ERROR");
        });
    });
});
