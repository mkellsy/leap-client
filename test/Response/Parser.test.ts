import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Parser } from "../../src/Response/Parser";

chai.use(sinonChai);

describe("Parser", () => {
    let buffer: any;
    let callback: any;

    beforeEach(() => {
        buffer = new Parser();
        callback = sinon.stub();
    });

    it("should return the response if there is only one line", () => {
        buffer.parse(
            Buffer.from(
                '{ "Header": { "StatusCode": "200 success", "MessageBodyType": "Response" }, "Body": { "KEY": "TEST_BODY" } }\r\n',
            ),
            callback,
        );

        const response = callback.getCall(0).args[0];

        expect(response.Body).to.equal("TEST_BODY");
    });

    it("should return a chunked response", () => {
        buffer.parse(Buffer.from('{ "Header": { "StatusCode": "200 success",'), callback);
        buffer.parse(Buffer.from('"MessageBodyType": "Response" },'), callback);
        buffer.parse(Buffer.from('"Body": { "KEY": "TEST_BODY" } }\r\n'), callback);

        const response = callback.getCall(0).args[0];

        expect(response.Body).to.equal("TEST_BODY");
    });
});
