import { proxy } from "proxyrequire";

import chai, { expect } from "chai";
import sinonChai from "sinon-chai";
import sinon from "sinon";

chai.use(sinonChai);

describe("index", () => {
    let Leap: any;

    let discovery: any;
    let association: any;

    let searchStub: any;
    let authStub: any;
    let stopStub: any;
    let setStub: any;
    let getStub: any;

    before(() => {
        Leap = proxy(() => require("../src"), {
            "./Association": {
                Association: class {
                    constructor() {
                        association = {
                            then(callback: any) {
                                association.resolve = callback;

                                return association;
                            },

                            catch(callback: any) {
                                association.reject = callback;

                                return association;
                            },

                            finally(callback: any) {
                                association.fulfill = callback;

                                return association;
                            },
                        };

                        authStub.returns(association);
                    }

                    authenticate() {
                        return authStub();
                    }
                },
            },
            "./Context": {
                Context: class {
                    set() {
                        setStub();
                    }

                    get() {
                        return getStub();
                    }
                },
            },
            "./Discovery": {
                Discovery: class {
                    constructor() {
                        discovery = {};
                    }

                    on(event: any, callback: any) {
                        discovery.event = event;
                        discovery.discovered = callback;
                    }

                    search() {
                        searchStub();
                    }

                    stop() {
                        stopStub();
                    }
                },
            },
            "./Client": {
                Client: class {},
            },
        });
    });

    beforeEach(() => {
        getStub = sinon.stub();
        setStub = sinon.stub();
        authStub = sinon.stub();
        stopStub = sinon.stub();
        searchStub = sinon.stub();
    });

    it("should define a connect function", () => {
        expect(Leap.connect).to.not.be.null;
        expect(typeof Leap.connect).to.equal("function");
    });

    it("should define a pair function", () => {
        expect(Leap.pair).to.not.be.null;
        expect(typeof Leap.pair).to.equal("function");
    });

    it("should export the API", () => {
        expect(Leap.Contact).to.not.be.null;
        expect(Leap.Dimmer).to.not.be.null;
        expect(Leap.Fan).to.not.be.null;
        expect(Leap.Keypad).to.not.be.null;
        expect(Leap.Occupancy).to.not.be.null;
        expect(Leap.Shade).to.not.be.null;
        expect(Leap.Strip).to.not.be.null;
        expect(Leap.Switch).to.not.be.null;
        expect(Leap.Timeclock).to.not.be.null;
        expect(Leap.Remote).to.not.be.null;
        expect(Leap.Processor).to.not.be.null;
        expect(Leap.Unknown).to.not.be.null;
    });

    it("should return a location object when connect is called", () => {
        const location = Leap.connect();

        expect(location).to.not.be.null;
    });

    describe("pair()", () => {
        it("should resolve and set the proper processor and certificate", (done) => {
            getStub.returns(null);

            Leap.pair()
                .then(() => {
                    expect(searchStub).to.be.called;
                    expect(stopStub).to.be.called;

                    done();
                })
                .catch((error: any) => console.log(error));

            discovery.discovered({ id: "TEST_PROCESSOR" });

            association.resolve();
            association.fulfill();
        });

        it("should only authenticate for processors that are not associated", (done) => {
            Leap.pair()
                .then(() => {
                    expect(authStub).to.be.calledOnce;

                    done();
                })
                .catch((error: any) => console.log(error));

            getStub.returns(true);

            discovery.discovered({ id: "TEST_KNOWN_PROCESSOR" });

            getStub.returns(null);

            discovery.discovered({ id: "TEST_PROCESSOR" });

            association.resolve();
        });

        it("should reject if association rejects", (done) => {
            getStub.returns(null);

            Leap.pair().catch((error: any) => {
                expect(error).to.equal("TEST_ERROR");

                done();
            });

            discovery.discovered({ id: "TEST_PROCESSOR" });

            association.reject("TEST_ERROR");
        });
    });
});
