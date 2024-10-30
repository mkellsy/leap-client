import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";

import { parseDeviceType, isAddressable } from "../../src/Interfaces/DeviceType";

chai.use(sinonChai);

describe("DeviceType", () => {
    describe("parseDeviceType()", () => {
        const TEST_CASES = [
            { value: "Switched", type: DeviceType.Switch },
            { value: "PowPakSwitch", type: DeviceType.Switch },
            { value: "OutdoorPlugInSwitch", type: DeviceType.Switch },
            { value: "Dimmed", type: DeviceType.Dimmer },
            { value: "PlugInDimmer", type: DeviceType.Dimmer },
            { value: "Shade", type: DeviceType.Shade },
            { value: "Timeclock", type: DeviceType.Timeclock },
            { value: "WhiteTune", type: DeviceType.Strip },
            { value: "FanSpeed", type: DeviceType.Fan },
            { value: "Pico2Button", type: DeviceType.Remote },
            { value: "Pico3Button", type: DeviceType.Remote },
            { value: "Pico4Button", type: DeviceType.Remote },
            { value: "Pico3ButtonRaiseLower", type: DeviceType.Remote },
            { value: "SunnataDimmer", type: DeviceType.Keypad },
            { value: "SunnataSwitch", type: DeviceType.Keypad },
            { value: "SunnataKeypad", type: DeviceType.Keypad },
            { value: "SunnataHybridKeypad", type: DeviceType.Keypad },
            { value: "RPSCeilingMountedOccupancySensor", type: DeviceType.Occupancy },
            { value: "CCO", type: DeviceType.Contact },
            { value: "Unknown", type: DeviceType.Unknown },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should define "${TEST_CASE.value}" as "${TEST_CASE.type}"`, () => {
                expect(parseDeviceType(TEST_CASE.value)).to.equal(TEST_CASE.type);
            });
        });
    });

    describe("isAddressable()", () => {
        const TEST_CASES = [
            { AddressedState: "Unaddressed", DeviceType: "Unknown", expected: false },
            { AddressedState: "Addressed", DeviceType: "Pico2Button", expected: true },
            { AddressedState: "Addressed", DeviceType: "Pico3Button", expected: true },
            { AddressedState: "Addressed", DeviceType: "Pico4Button", expected: true },
            { AddressedState: "Addressed", DeviceType: "Pico3ButtonRaiseLower", expected: true },
            { AddressedState: "Addressed", DeviceType: "SunnataKeypad", expected: true },
            { AddressedState: "Addressed", DeviceType: "SunnataHybridKeypad", expected: true },
            { AddressedState: "Addressed", DeviceType: "RPSCeilingMountedOccupancySensor", expected: true },
            { AddressedState: "Addressed", DeviceType: "Unknown", expected: false },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should define "${TEST_CASE.DeviceType}" as ${TEST_CASE.expected ? "addressable" : "unaddressable"}`, () => {
                expect(isAddressable({ ...TEST_CASE } as any)).to.equal(TEST_CASE.expected);
            });
        });
    });
});
