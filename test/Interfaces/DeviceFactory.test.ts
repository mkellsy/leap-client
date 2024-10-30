import chai, { expect } from "chai";
import sinonChai from "sinon-chai";

import { Contact } from "../../src/Devices/Contact";
import { Dimmer } from "../../src/Devices/Dimmer";
import { Fan } from "../../src/Devices/Fan";
import { Keypad } from "../../src/Devices/Keypad";
import { Remote } from "../../src/Devices/Remote";
import { Occupancy } from "../../src/Devices/Occupancy";
import { Shade } from "../../src/Devices/Shade";
import { Strip } from "../../src/Devices/Strip";
import { Switch } from "../../src/Devices/Switch";
import { Timeclock } from "../../src/Devices/Timeclock";
import { Unknown } from "../../src/Devices/Unknown";

import { createDevice } from "../../src/Interfaces/DeviceFactory";

chai.use(sinonChai);

describe("DeviceType", () => {
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
});
