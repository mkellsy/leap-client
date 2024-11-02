import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { StripController } from "../../src/Devices/Strip/StripController";

chai.use(sinonChai);

describe("Strip", () => {
    let strip: StripController;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        strip = new StripController(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(strip.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(strip.id).to.equal("LEAP-ID-STRIP-ZONE");
        expect(strip.name).to.equal("ZONE");
        expect(strip.room).to.equal("AREA");
        expect(strip.address.href).to.equal("/AREA/ZONE");
        expect(strip.type).to.equal("Strip");
        expect(strip.status.state).to.equal("Off");
    });

    it("should define a logger for the device", () => {
        expect(strip.log).to.not.be.undefined;
        expect(strip.log.info).to.not.be.undefined;
        expect(strip.log.warn).to.not.be.undefined;
        expect(strip.log.error).to.not.be.undefined;
    });

    it("should contain state and level in the capabilities", () => {
        expect(strip.capabilities.state.type).to.equal("String");
        expect(strip.capabilities.state.values).to.contain("On");
        expect(strip.capabilities.state.values).to.contain("Off");
        expect(strip.capabilities.level.type).to.equal("Integer");
        expect(strip.capabilities.level.min).to.equal(0);
        expect(strip.capabilities.level.max).to.equal(100);
        expect(strip.capabilities.luminance.type).to.equal("Integer");
        expect(strip.capabilities.luminance.min).to.equal(1800);
        expect(strip.capabilities.luminance.max).to.equal(3000);
    });

    describe("update()", () => {
        const TEST_CASES = [
            { state: "Off", level: 0, kelvin: 1800 },
            { state: "On", level: 10, kelvin: 1900 },
            { state: "On", level: 20, kelvin: 2000 },
            { state: "On", level: 30, kelvin: 2100 },
            { state: "On", level: 40, kelvin: 2200 },
            { state: "On", level: 50, kelvin: 2300 },
            { state: "On", level: 60, kelvin: 2400 },
            { state: "On", level: 70, kelvin: 2500 },
            { state: "On", level: 70, kelvin: 2600 },
            { state: "On", level: 70, kelvin: 2700 },
            { state: "On", level: 80, kelvin: 2800 },
            { state: "On", level: 90, kelvin: 2900 },
            { state: "On", level: 100, kelvin: 3000 },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the strip level to "${TEST_CASE.level}" and luminance to "${TEST_CASE.kelvin}"`, (done) => {
                strip.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);
                    expect(status.level).to.equal(TEST_CASE.level);
                    expect(status.luminance).to.equal(TEST_CASE.kelvin);

                    done();
                });

                strip.update({} as any);
                strip.update({ Level: "Off" } as any);

                strip.update({
                    Level: TEST_CASE.level,
                    ColorTuningStatus: { WhiteTuningLevel: { Kelvin: TEST_CASE.kelvin } },
                } as any);
            });

            it(`should update the strip level to "${TEST_CASE.level}"`, (done) => {
                strip.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);
                    expect(status.level).to.equal(TEST_CASE.level);

                    done();
                });

                strip.update({} as any);
                strip.update({ Level: "Off" } as any);
                strip.update({ Level: TEST_CASE.level } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [
            { state: "Off", level: 0, kelvin: 1800 },
            { state: "On", level: 10, kelvin: 1900 },
            { state: "On", level: 20, kelvin: 2000 },
            { state: "On", level: 30, kelvin: 2100 },
            { state: "On", level: 40, kelvin: 2200 },
            { state: "On", level: 50, kelvin: 2300 },
            { state: "On", level: 60, kelvin: 2400 },
            { state: "On", level: 70, kelvin: 2500 },
            { state: "On", level: 70, kelvin: 2600 },
            { state: "On", level: 70, kelvin: 2700 },
            { state: "On", level: 80, kelvin: 2800 },
            { state: "On", level: 90, kelvin: 2900 },
            { state: "On", level: 100, kelvin: 3000 },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set level to "${TEST_CASE.state}:${TEST_CASE.level}" and luminance to "${TEST_CASE.kelvin}"`, () => {
                strip.set({ state: "Off" } as any);
                strip.set({ level: TEST_CASE.level, luminance: TEST_CASE.kelvin } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToWhiteTuningLevel",
                        WhiteTuningLevelParameters: { Level: 0 },
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToWhiteTuningLevel",
                        WhiteTuningLevelParameters: {
                            Level: TEST_CASE.level,
                            WhiteTuningLevel: { Kelvin: TEST_CASE.kelvin },
                        },
                    },
                );
            });
        });
    });
});
