import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Switch } from "../../src/Devices/Switch";

chai.use(sinonChai);

describe("Switch", () => {
    let binary: Switch;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        binary = new Switch(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(binary.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(binary.id).to.equal("LEAP-ID-SWITCH-ZONE");
        expect(binary.name).to.equal("ZONE");
        expect(binary.room).to.equal("AREA");
        expect(binary.address.href).to.equal("/AREA/ZONE");
        expect(binary.type).to.equal("Switch");
        expect(binary.status.state).to.equal("Off");
    });

    it("should define a logger for the device", () => {
        expect(binary.log).to.not.be.undefined;
        expect(binary.log.info).to.not.be.undefined;
        expect(binary.log.warn).to.not.be.undefined;
        expect(binary.log.error).to.not.be.undefined;
    });

    it("should set the capibilities", () => {
        expect(binary.capabilities.state).to.not.be.undefined;
        expect(binary.capabilities.state.type).to.equal("String");
        expect(binary.capabilities.state.values).to.contain("On");
        expect(binary.capabilities.state.values).to.contain("Off");
    });

    describe("update()", () => {
        const TEST_CASES = [{ command: "On" }, { command: "Off" }];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the state to "${TEST_CASE.command}"`, (done) => {
                binary.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.command);

                    done();
                });

                binary.update({} as any);
                binary.update({ SwitchedLevel: TEST_CASE.command } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [
            { level: 0, command: "Off" },
            { level: 100, command: "On" },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set state to "${TEST_CASE.command}"`, () => {
                binary.set({ state: TEST_CASE.command } as any);

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
