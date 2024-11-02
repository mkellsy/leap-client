import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Fan } from "../../src/Devices/Fan/Fan";

chai.use(sinonChai);

describe("Fan", () => {
    let fan: Fan;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        fan = new Fan(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(fan.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(fan.id).to.equal("LEAP-ID-FAN-ZONE");
        expect(fan.name).to.equal("ZONE");
        expect(fan.room).to.equal("AREA");
        expect(fan.address.href).to.equal("/AREA/ZONE");
        expect(fan.type).to.equal("Fan");
        expect(fan.status.state).to.equal("Off");
    });

    it("should define a logger for the device", () => {
        expect(fan.log).to.not.be.undefined;
        expect(fan.log.info).to.not.be.undefined;
        expect(fan.log.warn).to.not.be.undefined;
        expect(fan.log.error).to.not.be.undefined;
    });

    it("should set the capibilities", () => {
        expect(fan.capabilities.state).to.not.be.undefined;
        expect(fan.capabilities.state.type).to.equal("String");
        expect(fan.capabilities.state.values).to.contain("On");
        expect(fan.capabilities.state.values).to.contain("Off");

        expect(fan.capabilities.speed).to.not.be.undefined;
        expect(fan.capabilities.speed.type).to.equal("Integer");
        expect(fan.capabilities.speed.min).to.equal(0);
        expect(fan.capabilities.speed.max).to.equal(7);
    });

    describe("update()", () => {
        const TEST_CASES = [
            { speed: 1, command: "Low" },
            { speed: 3, command: "Medium" },
            { speed: 5, command: "MediumHigh" },
            { speed: 7, command: "High" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the fan speed to "${TEST_CASE.speed}"`, (done) => {
                fan.on("Update", (_device, status) => {
                    expect(status.state).to.equal("On");
                    expect(status.speed).to.equal(TEST_CASE.speed);

                    done();
                });

                fan.update({} as any);
                fan.update({ FanSpeed: "Off" } as any);
                fan.update({ FanSpeed: TEST_CASE.command } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [
            { speed: 0, command: "Off" },
            { speed: 1, command: "Low" },
            { speed: 2, command: "Medium" },
            { speed: 3, command: "Medium" },
            { speed: 4, command: "MediumHigh" },
            { speed: 5, command: "MediumHigh" },
            { speed: 6, command: "High" },
            { speed: 7, command: "High" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set speed to "${TEST_CASE.command}"`, () => {
                fan.set({ state: "Off" } as any);
                fan.set({ speed: TEST_CASE.speed } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToFanSpeed",
                        FanSpeedParameters: [{ FanSpeed: "Off" }],
                    },
                );

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/ZONE" },
                    {
                        CommandType: "GoToFanSpeed",
                        FanSpeedParameters: [{ FanSpeed: TEST_CASE.command }],
                    },
                );
            });
        });
    });
});
