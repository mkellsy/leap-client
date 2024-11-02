import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { DimmerController } from "../../src/Devices/Dimmer/DimmerController";

chai.use(sinonChai);

describe("Dimmer", () => {
    let dimmer: DimmerController;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        dimmer = new DimmerController(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(dimmer.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(dimmer.id).to.equal("LEAP-ID-DIMMER-ZONE");
        expect(dimmer.name).to.equal("ZONE");
        expect(dimmer.room).to.equal("AREA");
        expect(dimmer.address.href).to.equal("/AREA/ZONE");
        expect(dimmer.type).to.equal("Dimmer");
        expect(dimmer.status.state).to.equal("Off");
    });

    it("should define a logger for the device", () => {
        expect(dimmer.log).to.not.be.undefined;
        expect(dimmer.log.info).to.not.be.undefined;
        expect(dimmer.log.warn).to.not.be.undefined;
        expect(dimmer.log.error).to.not.be.undefined;
    });

    it("should contain state and level in the capabilities", () => {
        expect(dimmer.capabilities.state.type).to.equal("String");
        expect(dimmer.capabilities.state.values).to.contain("On");
        expect(dimmer.capabilities.state.values).to.contain("Off");
        expect(dimmer.capabilities.level.type).to.equal("Integer");
        expect(dimmer.capabilities.level.min).to.equal(0);
        expect(dimmer.capabilities.level.max).to.equal(100);
    });

    describe("update()", () => {
        const TEST_CASES = [
            { level: 0, state: "Off" },
            { level: 10, state: "On" },
            { level: 20, state: "On" },
            { level: 30, state: "On" },
            { level: 40, state: "On" },
            { level: 50, state: "On" },
            { level: 60, state: "On" },
            { level: 70, state: "On" },
            { level: 80, state: "On" },
            { level: 90, state: "On" },
            { level: 100, state: "On" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the dimmer level to "${TEST_CASE.level}"`, (done) => {
                dimmer.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);
                    expect(status.level).to.equal(TEST_CASE.level);

                    done();
                });

                dimmer.update({} as any);
                dimmer.update({ Level: "Off" } as any);
                dimmer.update({ Level: TEST_CASE.level } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [
            { level: 0, state: "Off" },
            { level: 10, state: "On" },
            { level: 20, state: "On" },
            { level: 30, state: "On" },
            { level: 40, state: "On" },
            { level: 50, state: "On" },
            { level: 60, state: "On" },
            { level: 70, state: "On" },
            { level: 80, state: "On" },
            { level: 90, state: "On" },
            { level: 100, state: "On" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set level to "${TEST_CASE.state}:${TEST_CASE.level}"`, () => {
                dimmer.set({ state: "Off" } as any);
                dimmer.set({ level: TEST_CASE.level } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: 0 }],
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: TEST_CASE.level }],
                    },
                );
            });
        });
    });
});
