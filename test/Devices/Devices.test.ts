import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";

import { Contact } from "../../src/Devices/Contact/Contact";
import { Dimmer } from "../../src/Devices/Dimmer/Dimmer";
import { Fan } from "../../src/Devices/Fan/Fan";
import { Keypad } from "../../src/Devices/Keypad/Keypad";
import { Remote } from "../../src/Devices/Remote/Remote";
import { Occupancy } from "../../src/Devices/Occupancy/Occupancy";
import { Shade } from "../../src/Devices/Shade/Shade";
import { Strip } from "../../src/Devices/Strip/Strip";
import { Switch } from "../../src/Devices/Switch/Switch";
import { Timeclock } from "../../src/Devices/Timeclock/Timeclock";
import { Unknown } from "../../src/Devices/Unknown/Unknown";

import { createDevice, parseDeviceType, isAddressable } from "../../src/Devices/Devices";

chai.use(sinonChai);

describe("Devices", () => {
    describe("createDevice()", () => {
        const TEST_CASES = [
            { value: "Switched", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Switch },
            { value: "PowPakSwitch", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Switch },
            { value: "OutdoorPlugInSwitch", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Switch },
            { value: "Dimmed", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Dimmer },
            { value: "PlugInDimmer", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Dimmer },
            { value: "Shade", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Shade },
            { value: "Timeclock", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Timeclock },
            { value: "WhiteTune", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Strip },
            { value: "FanSpeed", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Fan },
            { value: "Pico2Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Remote },
            { value: "Pico3Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Remote },
            { value: "Pico4Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Remote },
            { value: "Pico3ButtonRaiseLower", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Remote },
            { value: "SunnataDimmer", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Keypad },
            { value: "SunnataSwitch", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Keypad },
            { value: "SunnataKeypad", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Keypad },
            { value: "SunnataHybridKeypad", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Keypad },
            {
                value: "RPSCeilingMountedOccupancySensor",
                area: { name: "TEST_AREA", href: "/AREA/ZONE" },
                constructor: Occupancy,
            },
            { value: "RPSCeilingMountedOccupancySensor", area: { name: "TEST_AREA" }, constructor: Occupancy },
            { value: "CCO", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Contact },
            { value: "Unknown", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: Unknown },
        ];

        TEST_CASES.forEach((TEST_CASE) => {
            it(`should define "${TEST_CASE.value}" as the proper device`, () => {
                const device = createDevice(
                    {
                        id: "TEST_PROCESSOR",
                        buttons(): Promise<void> {
                            return new Promise((resolve) => {
                                resolve();
                            });
                        },
                    } as any,
                    TEST_CASE.area as any,
                    {
                        DeviceType: TEST_CASE.value,
                    },
                );

                expect(device instanceof TEST_CASE.constructor).to.be.true;
            });
        });
    });

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
