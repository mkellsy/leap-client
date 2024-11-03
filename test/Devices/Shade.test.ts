import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { ShadeController } from "../../src/Devices/Shade/ShadeController";

chai.use(sinonChai);

describe("Shade", () => {
    let shade: ShadeController;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/SHADE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/SHADE", Name: "SHADE" };

        shade = new ShadeController(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(shade.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(shade.id).to.equal("LEAP-ID-SHADE-SHADE");
        expect(shade.name).to.equal("SHADE");
        expect(shade.room).to.equal("AREA");
        expect(shade.address.href).to.equal("/AREA/SHADE");
        expect(shade.type).to.equal("Shade");
        expect(shade.status.state).to.equal("Closed");
    });

    it("should define a logger for the device", () => {
        expect(shade.log).to.not.be.undefined;
        expect(shade.log.info).to.not.be.undefined;
        expect(shade.log.warn).to.not.be.undefined;
        expect(shade.log.error).to.not.be.undefined;
    });

    it("should contain state and level in the capabilities", () => {
        expect(shade.capabilities.state.type).to.equal("String");
        expect(shade.capabilities.state.values).to.contain("Open");
        expect(shade.capabilities.state.values).to.contain("Closed");
        expect(shade.capabilities.level.type).to.equal("Integer");
        expect(shade.capabilities.level.min).to.equal(0);
        expect(shade.capabilities.level.max).to.equal(100);
        expect(shade.capabilities.tilt.type).to.equal("Integer");
        expect(shade.capabilities.tilt.min).to.equal(0);
        expect(shade.capabilities.tilt.max).to.equal(100);
    });

    describe("update()", () => {
        const TEST_CASES = [
            { level: 0, tilt: 0, state: "Closed" },
            { level: 10, tilt: 10, state: "Open" },
            { level: 20, tilt: 20, state: "Open" },
            { level: 30, tilt: 30, state: "Open" },
            { level: 40, tilt: 40, state: "Open" },
            { level: 50, tilt: 50, state: "Open" },
            { level: 60, tilt: 60, state: "Open" },
            { level: 70, tilt: 70, state: "Open" },
            { level: 80, tilt: 80, state: "Open" },
            { level: 90, tilt: 90, state: "Open" },
            { level: 100, tilt: 100, state: "Open" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the shade level to "${TEST_CASE.level}" and tilt tl "${TEST_CASE.tilt}"`, (done) => {
                shade.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);
                    expect(status.level).to.equal(TEST_CASE.level);
                    expect(status.tilt).to.equal(TEST_CASE.tilt);

                    done();
                });

                shade.update({} as any);
                shade.update({ Level: "Off" } as any);
                shade.update({ Level: TEST_CASE.level, Tilt: TEST_CASE.tilt } as any);
            });

            it(`should update the shade level to "${TEST_CASE.level}"`, (done) => {
                shade.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.state);
                    expect(status.level).to.equal(TEST_CASE.level);

                    done();
                });

                shade.update({} as any);
                shade.update({ Level: "Off" } as any);
                shade.update({ Level: TEST_CASE.level } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [
            { level: 0, tilt: 0, state: "Closed" },
            { level: 10, tilt: 10, state: "Open" },
            { level: 20, tilt: 20, state: "Open" },
            { level: 30, tilt: 30, state: "Open" },
            { level: 40, tilt: 40, state: "Open" },
            { level: 50, tilt: 50, state: "Open" },
            { level: 60, tilt: 60, state: "Open" },
            { level: 70, tilt: 70, state: "Open" },
            { level: 80, tilt: 80, state: "Open" },
            { level: 90, tilt: 90, state: "Open" },
            { level: 100, tilt: 100, state: "Open" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set level to "${TEST_CASE.level}" and tilt to "${TEST_CASE.tilt}"`, () => {
                shade.set({ state: "Closed" } as any);
                shade.set({ level: TEST_CASE.level, tilt: TEST_CASE.tilt } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/SHADE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: 0 }],
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/SHADE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: TEST_CASE.level }],
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/SHADE" },
                    {
                        CommandType: "TiltParameters",
                        TiltParameters: { Tilt: TEST_CASE.tilt },
                    },
                );
            });

            it(`should send command to set level to "${TEST_CASE.level}"`, () => {
                shade.set({ state: "Closed" } as any);
                shade.set({ level: TEST_CASE.level } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/SHADE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: 0 }],
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/SHADE" },
                    {
                        CommandType: "GoToLevel",
                        Parameter: [{ Type: "Level", Value: TEST_CASE.level }],
                    },
                );
            });
        });
    });
});
