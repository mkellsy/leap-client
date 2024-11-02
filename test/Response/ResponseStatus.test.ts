import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { ResponseStatus } from "../../src/Response/ResponseStatus";

chai.use(sinonChai);

describe("ResponseStatus", () => {
    describe("fromString()", () => {
        it("should properly set the response status", () => {
            const status = ResponseStatus.fromString("200 TEST");

            expect(status.message).to.equal("TEST");
            expect(status.code).to.equal(200);
        });

        it("should make a status object without a code", () => {
            const status = ResponseStatus.fromString("TEST");

            expect(status.message).to.equal("TEST");
            expect(status.code).to.be.undefined;
        });

        it("should make a status object without a numeric code", () => {
            const status = ResponseStatus.fromString("TEST STATUS");

            expect(status.message).to.equal("TEST STATUS");
            expect(status.code).to.be.undefined;
        });

        it("should make a status object for invalid values", () => {
            const status = ResponseStatus.fromString();

            expect(status.message).to.be.undefined;
            expect(status.code).to.be.undefined;
        });
    });

    describe("isSuccessful()", () => {
        it("should return true for successfull status codes", () => {
            const status = new ResponseStatus("TEST", 200);

            expect(status.isSuccessful()).to.be.true;
        });

        it("should return false for unsuccessfull status codes", () => {
            const status = new ResponseStatus("TEST", 404);

            expect(status.isSuccessful()).to.be.false;
        });

        it("should return false for invalid status codes", () => {
            const status = new ResponseStatus();

            expect(status.isSuccessful()).to.be.false;
        });
    });
});
