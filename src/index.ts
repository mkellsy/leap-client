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

export { Action } from "./Interfaces/Action";
export { Button } from "./Interfaces/Button";
export { Device } from "./Interfaces/Device";
export { DeviceState } from "./Interfaces/DeviceState";
export { DeviceType } from "./Interfaces/DeviceType";

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
}

export function connect(): Location {
    return new Location();
}

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
