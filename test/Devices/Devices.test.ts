import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { DeviceType } from "@mkellsy/hap-device";

import { ContactController } from "../../src/Devices/Contact/ContactController";
import { DimmerController } from "../../src/Devices/Dimmer/DimmerController";
import { FanController } from "../../src/Devices/Fan/FanController";
import { KeypadController } from "../../src/Devices/Keypad/KeypadController";
import { RemoteController } from "../../src/Devices/Remote/RemoteController";
import { OccupancyController } from "../../src/Devices/Occupancy/OccupancyController";
import { ShadeController } from "../../src/Devices/Shade/ShadeController";
import { StripController } from "../../src/Devices/Strip/StripController";
import { SwitchController } from "../../src/Devices/Switch/SwitchController";
import { TimeclockController } from "../../src/Devices/Timeclock/TimeclockController";
import { UnknownController } from "../../src/Devices/Unknown/UnknownController";

import { createDevice, parseDeviceType, isAddressable } from "../../src/Devices/Devices";

chai.use(sinonChai);

describe("Devices", () => {
    describe("createDevice()", () => {
        const TEST_CASES = [
            { value: "Switched", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: SwitchController },
            { value: "PowPakSwitch", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: SwitchController },
            {
                value: "OutdoorPlugInSwitch",
                area: { name: "TEST_AREA", href: "/AREA/ZONE" },
                constructor: SwitchController,
            },
            { value: "Dimmed", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: DimmerController },
            { value: "PlugInDimmer", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: DimmerController },
            { value: "Shade", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: ShadeController },
            { value: "Timeclock", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: TimeclockController },
            { value: "WhiteTune", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: StripController },
            { value: "FanSpeed", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: FanController },
            { value: "Pico2Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: RemoteController },
            { value: "Pico3Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: RemoteController },
            { value: "Pico4Button", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: RemoteController },
            {
                value: "Pico3ButtonRaiseLower",
                area: { name: "TEST_AREA", href: "/AREA/ZONE" },
                constructor: RemoteController,
            },
            { value: "SunnataDimmer", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: KeypadController },
            { value: "SunnataSwitch", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: KeypadController },
            { value: "SunnataKeypad", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: KeypadController },
            {
                value: "SunnataHybridKeypad",
                area: { name: "TEST_AREA", href: "/AREA/ZONE" },
                constructor: KeypadController,
            },
            {
                value: "RPSCeilingMountedOccupancySensor",
                area: { name: "TEST_AREA", href: "/AREA/ZONE" },
                constructor: OccupancyController,
            },
            {
                value: "RPSCeilingMountedOccupancySensor",
                area: { name: "TEST_AREA" },
                constructor: OccupancyController,
            },
            { value: "CCO", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: ContactController },
            { value: "Unknown", area: { name: "TEST_AREA", href: "/AREA/ZONE" }, constructor: UnknownController },
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
