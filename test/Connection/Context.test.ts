import { proxy, registerNode } from "proxyrequire";

import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { Context } from "../../src/Connection/Context";

chai.use(sinonChai);
registerNode();

describe("Context", () => {
    let context: Context;
    let contextType: typeof Context;

    let decode: any;
    let encode: any;
    let exists: any;
    let mkdir: any;
    let write: any;
    let read: any;

    before(() => {
        contextType = proxy(() => require("../../src/Connection/Context").Context, {
            fs: {
                existsSync() {
                    return exists();
                },

                readFileSync() {
                    return read();
                },

                writeFileSync() {
                    return write();
                },

                mkdirSync() {
                    return mkdir();
                },
            },
            bson: {
                BSON: {
                    deserialize() {
                        return decode();
                    },

                    serialize() {
                        return encode();
                    },
                },
            },
        });
    });

    beforeEach(() => {
        decode = sinon.stub();
        encode = sinon.stub();
        exists = sinon.stub();
        mkdir = sinon.stub();
        write = sinon.stub();
        read = sinon.stub();
    });

    it("should create a context from existing keys", () => {
        exists.returns(true);

        decode.returns({
            authority: {
                ca: "VEVTVF9DQQ==",
                key: "VEVTVF9LRVk=",
                cert: "VEVTVF9DRVJU",
            },
            TEST_ONE: {
                ca: "VEVTVF9DQQ==",
                key: "VEVTVF9LRVk=",
                cert: "VEVTVF9DRVJU",
            },
            TEST_TWO: {
                ca: "VEVTVF9DQQ==",
                key: "VEVTVF9LRVk=",
                cert: "VEVTVF9DRVJU",
            },
        });

        context = new contextType();

        expect(context.processors.length).to.equal(2);

        expect(context.has("TEST_ONE")).to.be.true;
        expect(context.has("TEST_TWO")).to.be.true;

        const first = context.get("TEST_ONE")!;

        expect(first.ca).to.equal("TEST_CA");
        expect(first.key).to.equal("TEST_KEY");
        expect(first.cert).to.equal("TEST_CERT");

        const second = context.get("TEST_TWO")!;

        expect(second.ca).to.equal("TEST_CA");
        expect(second.key).to.equal("TEST_KEY");
        expect(second.cert).to.equal("TEST_CERT");
    });

    it("should create a context even if the certificates are empty", () => {
        exists.returns(true);

        decode.returns({
            authority: {
                ca: "VEVTVF9DQQ==",
                key: "VEVTVF9LRVk=",
                cert: "VEVTVF9DRVJU",
            },
            TEST_ONE: null,
            TEST_TWO: null,
        });

        context = new contextType();

        expect(context.processors.length).to.equal(2);

        expect(context.has("TEST_ONE")).to.be.false;
        expect(context.has("TEST_TWO")).to.be.false;

        expect(context.get("TEST_ONE") == null).to.be.true;
        expect(context.get("TEST_TWO") == null).to.be.true;
    });

    it("should create the folder and return no context in initial run", () => {
        exists.returns(false);

        context = new contextType();

        expect(mkdir).to.be.called;

        expect(context.processors.length).to.equal(0);

        expect(context.has("TEST_ONE")).to.be.false;
        expect(context.has("TEST_TWO")).to.be.false;

        expect(context.get("TEST_ONE") == null).to.be.true;
        expect(context.get("TEST_TWO") == null).to.be.true;
    });

    it("should add a processor to the context and save", () => {
        exists.returns(true);
        encode.returns("TEST_ENCODE");

        context = new contextType();

        context.set(
            {
                id: "TEST_THREE",
                addresses: [],
                type: "TYPE",
            },
            {
                ca: "TEST_CA",
                key: "TEST_KEY",
                cert: "TEST_CERT",
            },
        );

        expect(write).to.be.called;
    });

    it("should add a processor to the context and create the storage folder", () => {
        exists.returns(true);

        decode.returns({
            authority: {
                ca: "VEVTVF9DQQ==",
                key: "VEVTVF9LRVk=",
                cert: "VEVTVF9DRVJU",
            },
            TEST_ONE: null,
            TEST_TWO: null,
        });

        context = new contextType();

        encode.returns("TEST_ENCODE");
        exists.returns(false);

        context.set(
            {
                id: "TEST_THREE",
                addresses: [],
                type: "TYPE",
            },
            {
                ca: "TEST_CA",
                key: "TEST_KEY",
                cert: "TEST_CERT",
            },
        );

        expect(mkdir).to.be.called;
        expect(write).to.be.called;
    });
});
