import Colors from "colors";

import { program } from "commander";

import { Association } from "./Association";
import { Context } from "./Context";
import { Discovery } from "./Discovery";
import { Logger } from "./Logger";
import { Location } from "./Location";

program.option("-d, --debug", "enable debug logging");

program.command("start").action(() => {
    Logger.configure(program);

    const discovery = new Discovery();
    const context = new Context();
    const location = new Location();

    if (context.processors.length === 0) {
        Logger.log.info(Colors.yellow("No processors or smart bridges paired"));

        process.exit(1);
    }

    location.on("Update", (topic: string, message: string | number | boolean): void => {
        // PUBLISH TO MQTT BROKER
    });

    discovery.on("Discovered", (processor) => {
        if (context.processors.indexOf(processor.id) >= 0) {
            location.connect(processor, context.processor(processor.id)!);
        }
    });

    discovery.search();
});

program.command("pair").action(() => {
    Logger.configure(program);

    console.log(Colors.green("Press the pairing button on the main processor or smart bridge"));

    const discovery = new Discovery();
    const context = new Context();

    discovery.on("Discovered", (processor) => {
        if (context.processor(processor.id) == null) {
            const association = new Association(processor, context.authority);

            association
                .authContext()
                .then((certificates) => {
                    Logger.log.info(`Processor ${Colors.dim(processor.id)} paired`);

                    context.add(processor, certificates);
                })
                .catch((error) => {
                    Logger.log.error(Colors.red(error.message));
                })
                .finally(() => process.exit(0));
        }
    });

    discovery.search();
});

export = function main(args?: string[] | undefined): void {
    program.parse(args || process.argv);
};
