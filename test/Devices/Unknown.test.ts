import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Unknown } from "../../src/Devices/Unknown/Unknown";

chai.use(sinonChai);

describe("Unknown", () => {
    let device: Unknown;
    let area: any;
    let zone: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/ZONE", Name: "AREA", ControlType: "CONTROL" };
        zone = { href: "/AREA/ZONE", Name: "ZONE" };

        device = new Unknown(processor, area, zone);

        device.update();
        device.set();
    });

    it("should define common properties", () => {
        expect(device.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(device.id).to.equal("LEAP-ID-UNKNOWN-ZONE");
        expect(device.name).to.equal("ZONE");
        expect(device.room).to.equal("AREA");
        expect(device.address.href).to.equal("/AREA/ZONE");
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
