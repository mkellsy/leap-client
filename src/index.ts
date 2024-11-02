import { Association } from "./Connection/Association";
import { Context } from "./Connection/Context";
import { Discovery } from "./Connection/Discovery";
import { Client } from "./Client";

export { Contact } from "./Devices/Contact/Contact";
export { ContactState } from "./Devices/Contact/ContactState";
export { Dimmer } from "./Devices/Dimmer/Dimmer";
export { DimmerState } from "./Devices/Dimmer/DimmerState";
export { Fan } from "./Devices/Fan/Fan";
export { FanState } from "./Devices/Fan/FanState";
export { Keypad } from "./Devices/Keypad/Keypad";
export { KeypadState } from "./Devices/Keypad/KeypadState";
export { Occupancy } from "./Devices/Occupancy/Occupancy";
export { OccupancyState } from "./Devices/Occupancy/OccupancyState";
export { Shade } from "./Devices/Shade/Shade";
export { ShadeState } from "./Devices/Shade/ShadeState";
export { Strip } from "./Devices/Strip/Strip";
export { StripState } from "./Devices/Strip/StripState";
export { Switch } from "./Devices/Switch/Switch";
export { SwitchState } from "./Devices/Switch/SwitchState";
export { Timeclock } from "./Devices/Timeclock/Timeclock";
export { TimeclockState } from "./Devices/Timeclock/TimeclockState";

export { Remote } from "./Devices/Remote/Remote";
export { Processor } from "./Devices/Processor/Processor";
export { Trigger } from "./Devices/Remote/Trigger";
export { Unknown } from "./Devices/Unknown/Unknown";

/**
 * Establishes a connection to all paired devices.
 *
 * @param refresh (optional) Setting this to true will not load devices from
 *                cache.
 *
 * @returns A reference to the location with all processors.
 */
export function connect(refresh?: boolean): Client {
    return new Client(refresh);
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

export { Client };
