import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import timers, { InstalledClock } from "@sinonjs/fake-timers";

import { Client } from "../src/Client";

chai.use(sinonChai);

describe("Client", () => {
    let clock: InstalledClock;

    let client: Client;
    let clientType: typeof Client;

    let search: any;
    let clear: any;
    let stop: any;
    let has: any;
    let get: any;
    let set: any;

    let discovery: any;
    let processor: any;
    let disconnect: any;
    let connect: any;
    let logger: any;

    let timeclocks: any;
    let subscribe: any;
    let controls: any;
    let statuses: any;
    let project: any;
    let device: any;
    let system: any;
    let areas: any;
    let zones: any;

    let addressable: any;
    let create: any;
    let parse: any;

    let addresses: any;

    before(() => {
        clock = timers.install();

        clientType = proxyquire("../src/Client", {
            "./Connection/Connection": {
                Connection: class {},
            },
            "./Connection/Context": {
                Context: class {
                    has() {
                        return has();
                    }

                    get() {
                        return get();
                    }
                },
            },
            "./Connection/Discovery": {
                Discovery: class {
                    on(event: string, callback: Function) {
                        discovery[event] = callback;

                        return this;
                    }

                    stop() {
                        return stop();
                    }

                    search() {
                        return search();
                    }
                },
            },
            "./Devices/Devices": {
                createDevice: () => {
                    return create;
                },

                isAddressable: () => {
                    return addressable();
                },

                parseDeviceType: () => {
                    return parse();
                },
            },
            "./Devices/Processor/ProcessorController": {
                ProcessorController: class {
                    on(event: string, callback: Function) {
                        processor[event] = callback;

                        return this;
                    }

                    connect() {
                        return connect;
                    }

                    disconnect() {
                        return disconnect();
                    }

                    clear() {
                        return clear();
                    }

                    system() {
                        return system;
                    }

                    project() {
                        return project;
                    }

                    statuses() {
                        return statuses;
                    }

                    areas() {
                        return areas;
                    }

                    zones() {
                        return zones;
                    }

                    timeclocks() {
                        return timeclocks;
                    }

                    controls() {
                        return controls;
                    }

                    device() {
                        return device;
                    }

                    subscribe(address: any, callback: Function) {
                        addresses[address.href] = callback;

                        return subscribe;
                    }

                    devices = {
                        get() {
                            return get();
                        },

                        set(...args: any[]) {
                            set(...args);
                        },

                        keys() {
                            return ["ONE", "TWO", "THREE"];
                        },

                        values() {
                            return [];
                        },
                    };

                    log = {
                        info(...args: any): void {
                            logger.info(...args);
                        },

                        debug(...args: any): void {
                            logger.debug(...args);
                        },

                        warn(...args: any): void {
                            logger.warn(...args);
                        },

                        error(...args: any): void {
                            logger.error(...args);
                        },
                    };
                },
            },
        }).Client;
    });

    after(() => {
        clock.uninstall();
    });

    beforeEach(() => {
        addresses = {};
        discovery = {};
        processor = {};

        disconnect = sinon.stub();
        search = sinon.stub();
        clear = sinon.stub();
        stop = sinon.stub();
        has = sinon.stub();
        get = sinon.stub();
        set = sinon.stub();

        addressable = sinon.stub();
        parse = sinon.stub();

        create = {
            callbacks: {},

            on(event: string, callback: Function) {
                if (create.callbacks[event] == null) {
                    create.callbacks[event] = [];
                }

                create.callbacks[event].push(callback);

                return create;
            },

            emit(event: string, ...payload: any[]) {
                if (create.callbacks[event] == null) {
                    return;
                }

                for (let i = 0; i < create.callbacks[event].length; i++) {
                    create.callbacks[event][i](...payload);
                }
            },
        };

        timeclocks = sinon.promise();
        subscribe = sinon.promise();
        controls = sinon.promise();
        statuses = sinon.promise();
        connect = sinon.promise();
        project = sinon.promise();
        device = sinon.promise();
        system = sinon.promise();
        areas = sinon.promise();
        zones = sinon.promise();

        logger = {
            info: sinon.stub(),
            debug: sinon.stub(),
            warn: sinon.stub(),
            error: sinon.stub(),
        };
    });

    it("should initially create a blank client", () => {
        client = new clientType();

        client.close();

        expect(client.processors.length).to.equal(0);
        expect(client.processor("TEST_ID")).to.be.undefined;

        expect(search).to.be.called;
        expect(stop).to.be.called;
    });

    describe("onDiscovered()", () => {
        it("should create a ra3 processor when discovered", async () => {
            const update = sinon.stub();

            has.returns(true);
            get.returns({ update });
            parse.returns("Occupancy");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.be.called;

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");

            addresses["/zone/status"]([{ Zone: { href: "/AREA/ZONE" } }]);
            addresses["/area/status"]([{ href: "/AREA", OccupancyStatus: true }, {}]);
            addresses["/timeclock/status"]([{ Timeclock: { href: "/AREA/TIMECLOCK" } }]);

            await clock.runToLastAsync();

            subscribe.resolve();
            zones.resolve([{ href: "/AREA/ZONE" }]);
            timeclocks.resolve([{ href: "/AREA/TIMECLOCK" }]);
            controls.resolve([{ AssociatedGangedDevices: [{ Device: { Name: "DEVICE" } }] }, {}]);
            statuses.resolve([{ Zone: "/AREA/ZONE", OccupancyStatus: true }, {}]);

            await clock.runToLastAsync();

            device.resolve([{ DeviceType: "RPSCeilingMountedOccupancySensor" }]);

            await clock.runToLastAsync();

            create.emit("Update", { id: "DEVICE" }, { state: "ON" });
            create.emit("Action", { id: "DEVICE" }, { id: "BUTTON" }, "Press");

            client.close();
        });

        it("should create a caseta processor when discovered", async () => {
            const update = sinon.stub();

            has.returns(true);
            get.returns({ update });
            parse.returns("Switch");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "Caseta",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.be.called;

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");

            addresses["/zone/status"]([{ Zone: { href: "/AREA/ZONE" } }]);
            addresses["/area/status"]([{ href: "/AREA", OccupancyStatus: true }, {}]);

            await clock.runToLastAsync();

            subscribe.resolve();
            zones.resolve([{ href: "/AREA/ZONE" }]);
            timeclocks.resolve([{ href: "/AREA/TIMECLOCK" }]);
            controls.resolve([{ AssociatedGangedDevices: [{ Device: { Name: "DEVICE" } }] }, {}]);
            statuses.resolve([{ Zone: "/AREA/ZONE", OccupancyStatus: true }, {}]);

            await clock.runToLastAsync();

            device.resolve([{ DeviceType: "OutdoorPlugInSwitch" }]);

            await clock.runToLastAsync();

            client.close();
        });

        it("should create a processor even without devices", async () => {
            has.returns(true);
            get.returns(undefined);
            parse.returns("Switch");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.be.called;

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");

            addresses["/zone/status"]([{ Zone: { href: "/AREA/ZONE" } }]);
            addresses["/area/status"]([{ href: "/AREA", OccupancyStatus: true }, {}]);
            addresses["/timeclock/status"]([{ Timeclock: { href: "/AREA/TIMECLOCK" } }]);

            await clock.runToLastAsync();

            subscribe.resolve();
            zones.resolve([{ href: "/AREA/ZONE" }]);
            timeclocks.resolve([{ href: "/AREA/TIMECLOCK" }]);
            controls.resolve([{ AssociatedGangedDevices: [{ Device: { Name: "DEVICE" } }] }, {}]);
            statuses.resolve([{ Zone: "/AREA/ZONE", OccupancyStatus: true }, {}]);

            await clock.runToLastAsync();

            device.resolve([{ DeviceType: "OutdoorPlugInSwitch" }]);

            await clock.runToLastAsync();

            client.close();
        });

        it("should recreate a processor when disconnected", async () => {
            has.returns(true);
            get.returns(undefined);
            parse.returns("Switch");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            processor["Disconnect"]();
            processor["Connect"]();

            expect(clear).to.be.calledTwice;

            client.close();
        });

        it("should reject if any system, project or areas fails", async () => {
            has.returns(true);
            get.returns(undefined);
            parse.returns("Switch");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.reject("TEST_ERROR");
            project.reject("TEST_ERROR");
            areas.reject("TEST_ERROR");

            await clock.runToLastAsync();
        });

        it("should reject if subscriptions fail", async () => {
            const update = sinon.stub();

            has.returns(true);
            get.returns({ update });
            parse.returns("Occupancy");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.be.called;

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");

            addresses["/zone/status"]([{ Zone: { href: "/AREA/ZONE" } }]);
            addresses["/area/status"]([{ href: "/AREA", OccupancyStatus: true }, {}]);
            addresses["/timeclock/status"]([{ Timeclock: { href: "/AREA/TIMECLOCK" } }]);

            await clock.runToLastAsync();

            subscribe.reject("TEST_ERROR");
            zones.reject("TEST_ERROR");
            timeclocks.reject("TEST_ERROR");
            controls.reject("TEST_ERROR");
            device.reject("TEST_ERROR");

            await clock.runToLastAsync();
        });

        it("should reject if device requests fail", async () => {
            const update = sinon.stub();

            has.returns(true);
            get.returns({ update });
            parse.returns("Occupancy");
            addressable.returns(true);

            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_ONE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: true, href: "/AREA/CONTROL" }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.be.called;

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");

            addresses["/zone/status"]([{ Zone: { href: "/AREA/ZONE" } }]);
            addresses["/area/status"]([{ href: "/AREA", OccupancyStatus: true }, {}]);
            addresses["/timeclock/status"]([{ Timeclock: { href: "/AREA/TIMECLOCK" } }]);

            await clock.runToLastAsync();

            subscribe.resolve();
            zones.resolve([{ href: "/AREA/ZONE" }]);
            timeclocks.resolve([{ href: "/AREA/TIMECLOCK" }]);
            controls.resolve([{ AssociatedGangedDevices: [{ Device: { Name: "DEVICE" } }] }, {}]);
            statuses.resolve([{ Zone: "/AREA/ZONE", OccupancyStatus: true }, {}]);

            await clock.runToLastAsync();

            device.reject("TEST_ERROR");

            await clock.runToLastAsync();
        });

        it("should not call clear when refresh is not true", async () => {
            has.returns(true);
            client = new clientType();
            discovery["Discovered"]({ id: "ID_TWO", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve({
                DeviceType: "RadioRa3Processor",
                FirmwareImage: { Firmware: { DisplayName: "VERSION" } },
            });

            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(clear).to.not.be.called;
        });

        it("should use default values for system", async () => {
            has.returns(true);
            client = new clientType(true);
            discovery["Discovered"]({ id: "ID_THREE", addresses: [{ family: 4, address: "0.0.0.0" }] });
            processor["Connect"]();

            system.resolve(undefined);
            project.resolve({ ProductType: "TEST_PRODUCT" });
            areas.resolve([{ IsLeaf: true }, { IsLeaf: false }]);

            await clock.runToLastAsync();

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
            expect(logger.info.getCall(1).args[0]).to.contain("Firmware");
            expect(logger.info.getCall(1).args[0]).to.contain("Unknown");
            expect(logger.info.getCall(2).args[0]).to.contain("TEST_PRODUCT");
        });

        it("should create a processor when discovered and only has ip v6", () => {
            has.returns(true);
            client = new clientType(true);
            discovery["Discovered"]({ id: "ID", addresses: [{ family: 6, address: "aa.bb.cc" }] });

            expect(logger.info.getCall(0).args[0]).to.contain("Processor");
        });

        it("should not create a processor if not authenticated", () => {
            has.returns(false);
            client = new clientType(true);
            discovery["Discovered"]({ id: "ID", addresses: [{ family: 4, address: "0.0.0.0" }] });

            expect(logger.info).to.not.be.called;
        });

        it("should log an error when the connection fails", () => {
            has.returns(true);
            client = new clientType(true);
            discovery["Discovered"]({ id: "ID", addresses: [{ family: 4, address: "0.0.0.0" }] });

            connect.reject();
        });
    });
});
