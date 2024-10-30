import { Association } from "./Association";
import { Context } from "./Context";
import { Discovery } from "./Discovery";
import { Host } from "./Host";

export { Contact } from "./Devices/Contact";
export { ContactState } from "./Devices/ContactState";
export { Dimmer } from "./Devices/Dimmer";
export { DimmerState } from "./Devices/DimmerState";
export { Fan } from "./Devices/Fan";
export { FanState } from "./Devices/FanState";
export { Keypad } from "./Devices/Keypad";
export { KeypadState } from "./Devices/KeypadState";
export { Occupancy } from "./Devices/Occupancy";
export { OccupancyState } from "./Devices/OccupancyState";
export { Shade } from "./Devices/Shade";
export { ShadeState } from "./Devices/ShadeState";
export { Strip } from "./Devices/Strip";
export { StripState } from "./Devices/StripState";
export { Switch } from "./Devices/Switch";
export { SwitchState } from "./Devices/SwitchState";
export { Timeclock } from "./Devices/Timeclock";
export { TimeclockState } from "./Devices/TimeclockState";

export { Remote } from "./Devices/Remote";
export { Processor } from "./Devices/Processor";
export { Unknown } from "./Devices/Unknown";

/**
 * Establishes a connection to all paired devices.
 *
 * @param refresh (optional) Setting this to true will not load devices from
 *                cache.
 *
 * @returns A reference to the location with all processors.
 */
export function connect(refresh?: boolean): Host {
    return new Host(refresh);
}

/**
 * Starts listening for pairing commands from processors.
 */
export function pair(): Promise<void> {
    return new Promise((resolve, reject) => {
        const discovery = new Discovery();
        const context = new Context();

        discovery.on("Discovered", (processor) => {
            if (context.get(processor.id) == null) {
                const association = new Association(processor);

                association
                    .authenticate()
                    .then((certificate) => {
                        context.set(processor, certificate);

                        resolve();
                    })
                    .catch((error) => reject(error))
                    .finally(() => {
                        discovery.stop();
                    });
            }
        });

        discovery.search();
    });
}
