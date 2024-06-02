import { Association } from "./Association";
import { Context } from "./Context";
import { Discovery } from "./Discovery";
import { Location } from "./Location";

import { Common } from "./Devices/Common";
import { Contact } from "./Devices/Contact";
import { Dimmer } from "./Devices/Dimmer";
import { Keypad } from "./Devices/Keypad";
import { Occupancy } from "./Devices/Occupancy";
import { Processor } from "./Devices/Processor";
import { Remote } from "./Devices/Remote";
import { Shade } from "./Devices/Shade";
import { Strip } from "./Devices/Strip";
import { Switch } from "./Devices/Switch";
import { Unknown } from "./Devices/Unknown";

export const Devices = {
    Common,
    Contact,
    Dimmer,
    Keypad,
    Occupancy,
    Processor,
    Remote,
    Shade,
    Strip,
    Switch,
    Unknown,
};

/**
 * Establishes a connection to all paired devices.
 *
 * @param refresh (optional) Setting this to true will not load devices from
 *                cache.
 *
 * @returns A reference to the location with all processors.
 */
export function connect(refresh?: boolean): Location {
    return new Location(refresh);
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
