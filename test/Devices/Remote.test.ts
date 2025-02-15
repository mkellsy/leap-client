import proxyquire from "proxyquire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import timers, { InstalledClock } from "@sinonjs/fake-timers";

import { ButtonMap } from "../../src/Devices/Remote/ButtonMap";
import { RemoteController } from "../../src/Devices/Remote/RemoteController";

chai.use(sinonChai);

describe("Remote", () => {
    let clock: InstalledClock;

    let remote: RemoteController;
    let remoteType: typeof RemoteController;

    let area: any;
    let device: any;
    let buttons: any;
    let processor: any;
    let subscribe: any;
    let updater: any;
    let action: any;

    let triggers: Record<string, any>;

    before(() => {
        clock = timers.install();

        remoteType = proxyquire("../../src/Devices/Remote/RemoteController", {
            "./TriggerController": {
                TriggerController: class {
                    private callbacks: Record<string, Function> = {};

                    public processor: any;
                    public options: any;
                    public button: any;
                    public index: number;

                    constructor(processor: any, button: any, index: number, options: any) {
                        this.processor = processor;
                        this.index = index;
                        this.button = button;
                        this.options = options;

                        triggers[button.Name] = this;
                    }

                    on(event: string, callback: Function): void {
                        this.callbacks[event] = callback;
                    }

                    emit(event: string, button: any): void {
                        this.callbacks[event](button);
                    }

                    update(...args: any[]): void {
                        updater(...args);
                    }
                },
            },
        }).RemoteController;
    });

    after(() => {
        clock.uninstall();
    });

    beforeEach(() => {
        subscribe = sinon.promise();
        buttons = sinon.promise();
        updater = sinon.stub();

        processor = {
            id: "ID",
            command: sinon.stub(),
            buttons: sinon.stub().returns(buttons),

            subscribe: (address: any, callback: Function) => {
                action = { address, callback };

                return subscribe;
            },
        };

        area = { href: "/AREA/REMOTE", Name: "AREA", ControlType: "CONTROL" };
        device = { href: "/AREA/REMOTE", Name: "REMOTE" };
    });

    afterEach(() => {
        clock.reset();
    });

    const ACTION_TEST_CASES = Array.from(ButtonMap.keys()).map((type) => {
        const mapping = ButtonMap.get(type)!;

        return {
            type,
            buttons: Array.from(mapping.keys()).map((entry) => {
                const map = mapping.get(entry)!;

                return {
                    raiseLower: map[1],
                    button: {
                        href: `/AREA/REMOTE/BUTTON/${entry}`,
                        ButtonNumber: entry,
                        Name: `REMOTE_BUTTON-${map[0]}`,
                    },
                };
            }),
        };
    });

    ACTION_TEST_CASES.forEach((TEST_CASE) => {
        describe(TEST_CASE.type, () => {
            beforeEach(() => {
                triggers = {};
                remote = new remoteType(processor, area, { ...device, DeviceType: TEST_CASE.type });
            });

            it("should define common properties", () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                expect(remote.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(remote.id).to.equal("LEAP-ID-REMOTE-REMOTE");
                expect(remote.name).to.equal("REMOTE");
                expect(remote.room).to.equal("AREA");
                expect(remote.address.href).to.equal("/AREA/REMOTE");
                expect(remote.type).to.equal("Remote");
                expect(remote.status.state).to.equal("Unknown");
            });

            it("should define object even if there are no groups", () => {
                buttons.resolve(undefined);
                remote.update();

                expect(remote.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(remote.id).to.equal("LEAP-ID-REMOTE-REMOTE");
                expect(remote.name).to.equal("REMOTE");
                expect(remote.room).to.equal("AREA");
                expect(remote.address.href).to.equal("/AREA/REMOTE");
                expect(remote.type).to.equal("Remote");
                expect(remote.status.state).to.equal("Unknown");
            });

            it("should define object even if there are no buttons", () => {
                buttons.resolve([{}]);
                remote.update();

                expect(remote.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(remote.id).to.equal("LEAP-ID-REMOTE-REMOTE");
                expect(remote.name).to.equal("REMOTE");
                expect(remote.room).to.equal("AREA");
                expect(remote.address.href).to.equal("/AREA/REMOTE");
                expect(remote.type).to.equal("Remote");
                expect(remote.status.state).to.equal("Unknown");
            });

            it("should log an error if the processor rejects the buttons call", async () => {
                buttons.reject("TEST_ERROR");
                remote.update();

                await clock.runToLastAsync();
            });

            it("should emit an action event when a button is pressed", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                await clock.runToLastAsync();

                triggers[TEST_CASE.buttons[0].button.Name].emit("Press", TEST_CASE.buttons[0].button);

                clock.tick(101);
            });

            it("should emit an action event when a button is double pressed", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                await clock.runToLastAsync();

                triggers[TEST_CASE.buttons[0].button.Name].emit("DoublePress", TEST_CASE.buttons[0].button);

                clock.tick(101);
            });

            it("should emit an action event when a button is long pressed", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                await clock.runToLastAsync();

                triggers[TEST_CASE.buttons[0].button.Name].emit("LongPress", TEST_CASE.buttons[0].button);

                clock.tick(101);
            });

            it("should invoke a trigger update when subscription publishes", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                clock.tick(10);

                await clock.runToLastAsync();

                const button = TEST_CASE.buttons[0].button;

                subscribe.resolve();
                action.callback(button);

                clock.tick(10);

                await clock.runToLastAsync();

                expect(updater).to.be.calledWith(button);
            });

            it("should log an error when the subscribe rejects", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons.map((entry) => entry.button) }]);
                remote.update();

                clock.tick(10);

                await clock.runToLastAsync();

                subscribe.reject("TEST_ERROR");

                clock.tick(10);

                await clock.runToLastAsync();
            });
        });
    });

    it("should resolve unsupported set interface", async () => {
        remote = new remoteType(processor, area, device);

        await remote.set();
    });
});
