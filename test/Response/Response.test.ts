import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { Response } from "../../src/Response/Response";

chai.use(sinonChai);

describe("Response", () => {
    it("should properly define a response object", () => {
        const response = Response.parse(JSON.stringify({ Header: {} }));

        expect(response.Body).to.be.undefined;
        expect(response.CommuniqueType).to.be.undefined;

        expect(response.Header.ClientTag).to.be.undefined;
        expect(response.Header.MessageBodyType).to.be.undefined;
        expect(response.Header.StatusCode).to.be.undefined;
        expect(response.Header.Url).to.be.undefined;
    });

    it("should properly define a response with a header code", () => {
        const response = Response.parse(JSON.stringify({ Header: { StatusCode: "200 success" } }));

        expect(response.Header.StatusCode?.message).to.equal("success");
        expect(response.Header.StatusCode?.code).to.equal(200);
    });

    it("should have an undefined body if message type is defined but body is not defined", () => {
        const response = Response.parse(
            JSON.stringify({ Header: { StatusCode: "200 success", MessageBodyType: "Response" } }),
        );

        expect(response.Body).to.be.undefined;
    });

    it("should deconstruct the body if there is only a single key", () => {
        const response = Response.parse(
            JSON.stringify({
                Header: { StatusCode: "200 success", MessageBodyType: "Response" },
                Body: { KEY: "TEST_BODY" },
            }),
        );

        expect(response.Body).to.equal("TEST_BODY");
    });

    it("should have an undefined body if the body is not deconstructable", () => {
        const response = Response.parse(
            JSON.stringify({
                Header: { StatusCode: "200 success", MessageBodyType: "Response" },
                Body: { key: false },
            }),
        );

        expect(response.Body).to.be.undefined;
    });
});
