import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import timers, { InstalledClock } from "@sinonjs/fake-timers";

import { KeypadController } from "../../src/Devices/Keypad/KeypadController";

chai.use(sinonChai);

describe("Keypad", () => {
    let clock: InstalledClock;
    let keypad: KeypadController;

    let area: any;
    let device: any;
    let buttons: any;
    let processor: any;
    let subscribe: any;
    let action: any;

    before(() => {
        clock = timers.install();
    });

    after(() => {
        clock.uninstall();
    });

    beforeEach(() => {
        subscribe = sinon.promise();
        buttons = sinon.promise();

        processor = {
            id: "ID",
            update: sinon.stub(),
            buttons: sinon.stub().returns(buttons),

            subscribe: (address: any, callback: Function) => {
                action = { address, callback };

                return subscribe;
            },
        };

        area = { href: "/AREA/KEYPAD", Name: "AREA", ControlType: "CONTROL" };
        device = { href: "/AREA/KEYPAD", Name: "KEYPAD" };
    });

    afterEach(() => {
        clock.reset();
    });

    const ACTION_TEST_CASES = [
        {
            type: "SunnataKeypad",
            buttons: [
                {
                    href: "/AREA/KEYPAD/BUTTON_0",
                    ButtonNumber: 0,
                    Name: "KEYPAD_BUTTON_1",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_00/LED" },
                },
                {
                    href: "/AREA/KEYPAD/BUTTON_1",
                    ButtonNumber: 1,
                    Name: "KEYPAD_BUTTON_2",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_01/LED" },
                },
                {
                    href: "/AREA/KEYPAD/BUTTON_2",
                    ButtonNumber: 2,
                    Name: "KEYPAD_BUTTON_3",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_02/LED" },
                },
                {
                    href: "/AREA/KEYPAD/BUTTON_3",
                    ButtonNumber: 3,
                    Name: "KEYPAD_BUTTON_4",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_03/LED" },
                },
            ],
        },
        {
            type: "SunnataHybridKeypad",
            buttons: [
                {
                    href: "/AREA/KEYPAD/BUTTON_0",
                    ButtonNumber: 0,
                    Name: "KEYPAD_BUTTON_1",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_10/LED" },
                },
                {
                    href: "/AREA/KEYPAD/BUTTON_1",
                    ButtonNumber: 1,
                    Name: "KEYPAD_BUTTON_2",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_11/LED" },
                },
                {
                    href: "/AREA/KEYPAD/BUTTON_2",
                    ButtonNumber: 2,
                    Name: "KEYPAD_BUTTON_3",
                    AssociatedLED: { href: "/AREA/KEYPAD/BUTTON_12/LED" },
                },
                { href: "/AREA/KEYPAD/BUTTON_13", ButtonNumber: 3, Name: "KEYPAD_BUTTON_4" },
                { href: "/AREA/KEYPAD/BUTTON_14", ButtonNumber: 4, Name: "KEYPAD_BUTTON_5" },
            ],
        },
    ];

    ACTION_TEST_CASES.forEach((TEST_CASE) => {
        describe(TEST_CASE.type, () => {
            beforeEach(() => {
                keypad = new KeypadController(processor, area, { ...device, DeviceType: TEST_CASE.type });
            });

            it("should define common properties", () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons }]);
                keypad.update();

                expect(keypad.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(keypad.id).to.equal("LEAP-ID-KEYPAD-KEYPAD");
                expect(keypad.name).to.equal("KEYPAD");
                expect(keypad.room).to.equal("AREA");
                expect(keypad.address.href).to.equal("/AREA/KEYPAD");
                expect(keypad.type).to.equal("Keypad");
                expect(keypad.status.state).to.equal("Off");
            });

            it("should define object even if there are no groups", () => {
                buttons.resolve(undefined);
                keypad.update();

                expect(keypad.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(keypad.id).to.equal("LEAP-ID-KEYPAD-KEYPAD");
                expect(keypad.name).to.equal("KEYPAD");
                expect(keypad.room).to.equal("AREA");
                expect(keypad.address.href).to.equal("/AREA/KEYPAD");
                expect(keypad.type).to.equal("Keypad");
                expect(keypad.status.state).to.equal("Off");
            });

            it("should define object even if there are no buttons", () => {
                buttons.resolve([{}]);
                keypad.update();

                expect(keypad.manufacturer).to.equal("Lutron Electronics Co., Inc");
                expect(keypad.id).to.equal("LEAP-ID-KEYPAD-KEYPAD");
                expect(keypad.name).to.equal("KEYPAD");
                expect(keypad.room).to.equal("AREA");
                expect(keypad.address.href).to.equal("/AREA/KEYPAD");
                expect(keypad.type).to.equal("Keypad");
                expect(keypad.status.state).to.equal("Off");
            });

            it("should log an error if the processor rejects the buttons call", async () => {
                buttons.reject("TEST_ERROR");
                keypad.update();

                await clock.runToLastAsync();
            });

            it("should emit an action event when a button is pressed", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons }]);
                keypad.update();

                await clock.runToLastAsync();

                const button = TEST_CASE.buttons[0];

                subscribe.resolve();
                action.callback({ ...button, ButtonEvent: { EventType: "Press" } });

                clock.tick(10);

                await clock.runToLastAsync();

                clock.tick(101);
            });

            it("should not emit an action event when a button is released", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons }]);
                keypad.update();

                await clock.runToLastAsync();

                const button = TEST_CASE.buttons[0];

                subscribe.resolve();
                action.callback({ ...button, ButtonEvent: { EventType: "Release" } });

                clock.tick(10);

                await clock.runToLastAsync();

                clock.tick(101);
            });

            it("should log an error when the subscribe rejects", async () => {
                buttons.resolve([{ Buttons: TEST_CASE.buttons }]);
                keypad.update();

                clock.tick(10);

                await clock.runToLastAsync();

                subscribe.reject("TEST_ERROR");

                clock.tick(10);

                await clock.runToLastAsync();
            });
        });
    });

    describe("set()", () => {
        const href = "/AREA/KEYPAD/BUTTON/LED";

        beforeEach(() => {
            keypad = new KeypadController(processor, area, { ...device });
        });

        const SET_TEST_CASES = [{ state: "Off" }, { state: "On" }];

        SET_TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to led status to "${TEST_CASE.state}"`, () => {
                keypad.set({ led: { href }, state: TEST_CASE.state } as any);

                expect(processor.update).to.be.calledWith({ href }, "status", {
                    LEDStatus: { State: TEST_CASE.state },
                });
            });
        });
    });
});
