import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { UnknownController } from "../../src/Devices/Unknown/UnknownController";

chai.use(sinonChai);

describe("Unknown", () => {
    let device: UnknownController;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/UNKNOWN", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/UNKNOWN", Name: "UNKNOWN" };

        device = new UnknownController(processor, area, zone);

        device.update();
        device.set();
    });

    it("should define common properties", () => {
        expect(device.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(device.id).to.equal("LEAP-ID-UNKNOWN-UNKNOWN");
        expect(device.name).to.equal("UNKNOWN");
        expect(device.room).to.equal("AREA");
        expect(device.address.href).to.equal("/AREA/UNKNOWN");
        expect(device.type).to.equal("Unknown");
        expect(device.status.state).to.equal("Unknown");
    });

    it("should define a logger for the device", () => {
        expect(device.log).to.not.be.undefined;
        expect(device.log.info).to.not.be.undefined;
        expect(device.log.warn).to.not.be.undefined;
        expect(device.log.error).to.not.be.undefined;
    });
});
