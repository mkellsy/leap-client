import { Association } from "./Association";
import { Context } from "./Context";
import { Discovery } from "./Discovery";
import { Location } from "./Location";

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
