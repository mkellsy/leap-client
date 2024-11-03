import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { ContactController } from "../../src/Devices/Contact/ContactController";

chai.use(sinonChai);

describe("Contact", () => {
    let contact: ContactController;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/CONTACT", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/CONTACT", Name: "CONTACT" };

        contact = new ContactController(processor, area, zone);
    });

    it("should define common properties", () => {
        expect(contact.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(contact.id).to.equal("LEAP-ID-CONTACT-CONTACT");
        expect(contact.name).to.equal("CONTACT");
        expect(contact.room).to.equal("AREA");
        expect(contact.address.href).to.equal("/AREA/CONTACT");
        expect(contact.type).to.equal("Contact");
        expect(contact.status.state).to.equal("Open");
    });

    it("should define a logger for the device", () => {
        expect(contact.log).to.not.be.undefined;
        expect(contact.log.info).to.not.be.undefined;
        expect(contact.log.warn).to.not.be.undefined;
        expect(contact.log.error).to.not.be.undefined;
    });

    it("should set the capibilities", () => {
        expect(contact.capabilities.state).to.not.be.undefined;
        expect(contact.capabilities.state.type).to.equal("String");
        expect(contact.capabilities.state.values).to.contain("Open");
        expect(contact.capabilities.state.values).to.contain("Closed");
    });

    describe("update()", () => {
        const TEST_CASES = [{ command: "Closed" }, { command: "Open" }];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should update the state to "${TEST_CASE.command}"`, (done) => {
                contact.on("Update", (_device, status) => {
                    expect(status.state).to.equal(TEST_CASE.command);

                    done();
                });

                contact.update({} as any);
                contact.update({ CCOLevel: TEST_CASE.command === "Closed" ? "Open" : "Closed" } as any);
                contact.update({ CCOLevel: TEST_CASE.command } as any);
            });
        });
    });

    describe("set()", () => {
        const TEST_CASES = [{ command: "Open" }, { command: "Closed" }];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should send command to set state to "${TEST_CASE.command}"`, () => {
                contact.set({ state: TEST_CASE.command } as any);

                expect(processor.command).to.be.calledWith(
                    { href: "/AREA/CONTACT" },
                    {
                        CommandType: "GoToCCOLevel",
                        CCOLevelParameters: { CCOLevel: TEST_CASE.command },
                    },
                );
            });
        });
    });
});
