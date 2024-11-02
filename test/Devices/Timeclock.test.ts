import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Timeclock } from "../../src/Devices/Timeclock/Timeclock";

chai.use(sinonChai);

describe("Timeclock", () => {
    let timeclock: Timeclock;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        timeclock = new Timeclock(processor, area, zone);

        timeclock.set();
    });

    it("should define common properties", () => {
        expect(timeclock.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(timeclock.id).to.equal("LEAP-ID-TIMECLOCK-ZONE");
        expect(timeclock.name).to.equal("ZONE");
        expect(timeclock.room).to.equal("AREA");
        expect(timeclock.address.href).to.equal("/AREA/ZONE");
        expect(timeclock.type).to.equal("Timeclock");
        expect(timeclock.status.state).to.equal("Off");
    });

    it("should define a logger for the device", () => {
        expect(timeclock.log).to.not.be.undefined;
        expect(timeclock.log.info).to.not.be.undefined;
        expect(timeclock.log.warn).to.not.be.undefined;
        expect(timeclock.log.error).to.not.be.undefined;
    });

    it("should set the capibilities", () => {
        expect(timeclock.capabilities.state).to.not.be.undefined;
        expect(timeclock.capabilities.state.type).to.equal("String");
        expect(timeclock.capabilities.state.values).to.contain("On");
        expect(timeclock.capabilities.state.values).to.contain("Off");
    });

    describe("update()", () => {
        const TEST_CASES = [{ state: "On" }, { state: "Off" }];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the state to "${TEST_CASE.state}"`, (done) => {
                timeclock.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);

                    done();
                });

                timeclock.update({ EnabledState: TEST_CASE.state === "On" ? "Disabled" : "Enabled" } as any);
                timeclock.update({ EnabledState: TEST_CASE.state === "On" ? "Enabled" : "Disabled" } as any);
            });
        });
    });
});
