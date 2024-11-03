import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Discovery } from "../../src/Connection/Discovery";

chai.use(sinonChai);
registerNode();

describe("Discovery", () => {
    let service: Map<string, any>;

    let available: any;
    let cleanup: any;
    let cache: any;
    let events: any;

    let discovery: Discovery;
    let discoveryType: typeof Discovery;

    before(() => {
        discoveryType = proxy(() => require("../../src/Connection/Discovery").Discovery, {
            "flat-cache": {
                load: () => cache,
            },
            "tinkerhub-mdns": {
                MDNSServiceDiscovery: class {
                    serviceData = service;

                    onAvailable(callback: Function) {
                        available = callback;
                    }

                    destroy() {
                        cleanup();
                    }
                },
                Protocol: {
                    TCP: "tcp",
                    UDP: "udp",
                },
            },
            "@mkellsy/event-emitter": {
                EventEmitter: class {
                    emit(event: string, ...payload: any[]) {
                        events(event, ...payload);
                    }
                },
            },
        });
    });

    beforeEach(() => {
        cache = {
            getKey: sinon.stub(),
            setKey: sinon.stub(),
            save: sinon.stub(),
        };

        events = sinon.stub();
        cleanup = sinon.stub();
        service = new Map<string, any>();

        discovery = new discoveryType();
    });

    describe("search()", () => {
        it("should emit discovered events for cached hosts", (done) => {
            cache.getKey.returns([
                { id: "ID_1", addresses: ["0.0.0.0"], name: "NAME_1", model: "MODEL_1" },
                { id: "ID_2", addresses: ["1.1.1.1"], name: "NAME_2", model: "MODEL_2" },
            ]);

            discovery = new discoveryType();
            discovery.search();

            setTimeout(() => {
                expect(events).to.be.calledWith("Discovered", {
                    id: "ID_1",
                    addresses: ["0.0.0.0"],
                    name: "NAME_1",
                    model: "MODEL_1",
                });

                expect(events).to.be.calledWith("Discovered", {
                    id: "ID_2",
                    addresses: ["1.1.1.1"],
                    name: "NAME_2",
                    model: "MODEL_2",
                });

                done();
            }, 1);
        });

        it("should not emit any discovered events if there are no cached hosts", () => {
            discovery.search();

            expect(events).to.not.be.calledWith("Discovered", sinon.match.any);
        });
    });

    describe("stop()", () => {
        it("should call destroy on the mdns subscriber", () => {
            discovery = new discoveryType();
            discovery.search();
            discovery.stop();

            expect(cleanup).to.be.called;
        });
    });

    describe("onAvailable()", () => {
        beforeEach(() => {
            service.set("ID", { SRV: { _record: { target: "Lutron-TEST_ID.local" } } });
            discovery.search();
        });

        it("should set the onAvailable function", () => {
            expect(available).to.not.be.undefined;
        });

        it("should emit a discovered event when a service is found", () => {
            const data = new Map<string, boolean | string | undefined>();

            data.set("systype", "TEST_TYPE");

            available({
                data,
                id: "ID",
                addresses: [{ host: "127.0.0.1" }, { host: "0:0:0:0:0:0:0:1" }],
            });

            expect(events).to.be.calledWith("Discovered", {
                id: "TEST_ID",
                addresses: [
                    {
                        address: "127.0.0.1",
                        family: 4,
                    },
                    {
                        address: "0:0:0:0:0:0:0:1",
                        family: 6,
                    },
                ],
                type: "TEST_TYPE",
            });
        });

        it("should emit a discovered event when a service is found even if no addresses are reported", () => {
            const data = new Map<string, boolean | string | undefined>();

            data.set("systype", "TEST_TYPE");

            available({
                data,
                id: "ID",
            });

            expect(events).to.be.calledWith("Discovered", {
                id: "TEST_ID",
                addresses: [],
                type: "TEST_TYPE",
            });
        });

        it("should not emit a discovered event when a service is found but already cached", (done) => {
            const data = new Map<string, boolean | string | undefined>();

            data.set("systype", "TEST_TYPE");

            cache.getKey.returns([
                {
                    id: "TEST_ID",
                    addresses: [
                        {
                            address: "127.0.0.1",
                            family: 4,
                        },
                        {
                            address: "0:0:0:0:0:0:0:1",
                            family: 6,
                        },
                    ],
                    type: "TEST_TYPE",
                },
            ]);

            discovery = new discoveryType();
            discovery.search();

            setTimeout(() => {
                available({
                    data,
                    id: "ID",
                    addresses: [{ host: "127.0.0.1" }, { host: "0:0:0:0:0:0:0:1" }],
                });

                expect(events).to.be.calledOnceWith("Discovered", {
                    id: "TEST_ID",
                    addresses: [
                        {
                            address: "127.0.0.1",
                            family: 4,
                        },
                        {
                            address: "0:0:0:0:0:0:0:1",
                            family: 6,
                        },
                    ],
                    type: "TEST_TYPE",
                });

                done();
            }, 1);
        });

        it("should emit a discovered event when a cached service reports a different address", () => {
            const data = new Map<string, boolean | string | undefined>();

            data.set("systype", "TEST_TYPE");

            cache.getKey.returns([
                {
                    id: "TEST_ID",
                    addresses: [
                        {
                            address: "127.0.0.1",
                            family: 4,
                        },
                        {
                            address: "0:0:0:0:0:0:0:1",
                            family: 6,
                        },
                    ],
                    type: "TEST_TYPE",
                },
            ]);

            discovery = new discoveryType();
            discovery.search();

            available({
                data,
                id: "ID",
                addresses: [{ host: "127.0.0.2" }, { host: "0:0:0:0:0:0:0:2" }],
            });

            expect(events).to.be.calledWith("Discovered", {
                id: "TEST_ID",
                addresses: [
                    {
                        address: "127.0.0.2",
                        family: 4,
                    },
                    {
                        address: "0:0:0:0:0:0:0:2",
                        family: 6,
                    },
                ],
                type: "TEST_TYPE",
            });
        });

        it("should emit a discovered event when a service is found", () => {
            const data = new Map<string, boolean | string | undefined>();

            data.set("systype", false);

            available({
                data,
                id: "ID",
                addresses: [{ host: "127.0.0.1" }, { host: "0:0:0:0:0:0:0:1" }],
            });

            expect(events).to.not.be.calledWith("Discovered", sinon.match.any);
        });
    });
});
