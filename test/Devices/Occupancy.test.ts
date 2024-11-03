import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { OccupancyController } from "../../src/Devices/Occupancy/OccupancyController";

chai.use(sinonChai);

describe("Occupancy", () => {
    let occupancy: OccupancyController;
    let area: any;
    let device: any;
    let processor: any;

    beforeEach(() => {
        processor = { id: "ID", command: sinon.stub() };
        area = { href: "/AREA/OCCUPANCY", Name: "AREA", ControlType: "CONTROL" };
        device = { href: "/AREA/OCCUPANCY", Name: "OCCUPANCY" };

        occupancy = new OccupancyController(processor, area, device);
    });

    it("should define common properties", () => {
        expect(occupancy.manufacturer).to.equal("Lutron Electronics Co., Inc");
        expect(occupancy.id).to.equal("LEAP-ID-OCCUPANCY-OCCUPANCY");
        expect(occupancy.name).to.equal("OCCUPANCY");
        expect(occupancy.room).to.equal("AREA");
        expect(occupancy.address.href).to.equal("/AREA/OCCUPANCY");
        expect(occupancy.type).to.equal("Occupancy");
        expect(occupancy.status.state).to.equal("Unoccupied");
    });

    it("should define a logger for the device", () => {
        occupancy.set();

        expect(occupancy.log).to.not.be.undefined;
        expect(occupancy.log.info).to.not.be.undefined;
        expect(occupancy.log.warn).to.not.be.undefined;
        expect(occupancy.log.error).to.not.be.undefined;
    });

    it("should update the state to occupied", () => {
        occupancy.on("Update", (_device, status) => {
            expect(status.state).to.equal("Occupied");
        });

        occupancy.update({} as any);
        occupancy.update({ OccupancyStatus: "Occupied" } as any);
        occupancy.update({ OccupancyStatus: "Occupied" } as any);
    });

    it("should update the state to unoccupied", () => {
        occupancy.on("Update", (_device, status) => {
            expect(status.state).to.equal("Occupied");
        });

        occupancy.update({} as any);
        occupancy.update({ OccupancyStatus: "Unoccupied" } as any);
        occupancy.update({ OccupancyStatus: "Unoccupied" } as any);
    });

    it("should resolve unsupported set interface", (done) => {
        occupancy
            .set()
            .then(() => {
                done();
            })
            .catch((error) => console.log(error));
    });
});
