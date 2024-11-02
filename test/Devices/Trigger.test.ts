import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { TriggerController } from "../../src/Devices/Remote/TriggerController";

chai.use(sinonChai);

describe("Trigger", () => {
    let trigger: TriggerController;

    let processorStub: any;
    let buttonStub: any;
    let indexStub: any;

    beforeEach(() => {
        indexStub = 1;

        processorStub = { id: "TEST-ID" };
        buttonStub = { href: "/AREA/TEST-ZONE" };
    });

    it("should properly define the id", () => {
        trigger = new TriggerController(processorStub, buttonStub, indexStub);

        expect(trigger.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");
    });

    it("should properly set the trigger definition", () => {
        buttonStub.Name = "TEST-NAME";
        trigger = new TriggerController(processorStub, buttonStub, indexStub, { raiseLower: true });

        expect(trigger.definition.name).to.equal("TEST-NAME");
        expect(trigger.definition.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");
        expect(trigger.definition.index).to.equal(1);
        expect(trigger.definition.raiseLower).to.equal(true);
    });

    describe("update()", () => {
        it("should emit a press event when a trigger is updated", (done) => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, {
                clickSpeed: 0,
                doubleClickSpeed: 0,
            });

            trigger.on("Press", (button) => {
                expect(button.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");

                done();
            });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
        });

        it("should emit a press event when a trigger is updated and long press is enabled", () => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, {
                clickSpeed: 10,
                doubleClickSpeed: 0,
            });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
        });

        it("should emit a double press event when a trigger is updated twice", (done) => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, { doubleClickSpeed: 15 });

            trigger.on("DoublePress", (button) => {
                expect(button.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");

                done();
            });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);

            setTimeout(() => {
                trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
                trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            }, 10);
        });

        it("should add double press time for raise and lower", (done) => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, {
                doubleClickSpeed: 15,
                raiseLower: true,
            });

            trigger.on("DoublePress", (button) => {
                expect(button.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");

                done();
            });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);

            setTimeout(() => {
                trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
                trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            }, 10);
        });

        it("should reset the trigger state if button is pressed during a double press", () => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, { doubleClickSpeed: 15 });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);

            setTimeout(() => {
                trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
                trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            }, 5);
        });

        it("should emit a long press event when a trigger is updated", (done) => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, { clickSpeed: 10 });

            trigger.on("LongPress", (button) => {
                expect(button.id).to.equal("LEAP-TEST-ID-BUTTON-TEST-ZONE");

                done();
            });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);

            setTimeout(() => {
                trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            }, 10);
        });

        it("should reset the trigger state if button is pressed and released during the long press timer", () => {
            trigger = new TriggerController(processorStub, buttonStub, indexStub, { doubleClickSpeed: 15 });

            trigger.update({ ButtonEvent: { EventType: "Press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
            trigger.update({ ButtonEvent: { EventType: "press" } } as any);
            trigger.update({ ButtonEvent: { EventType: "Release" } } as any);
        });
    });
});
