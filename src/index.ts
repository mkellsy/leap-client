import * as Logger from "js-logger";

import Colors from "colors";
import { program } from "commander";

import { Association } from "./Modules/Association";
import { Context } from "./Modules/Context";
import { Discovery } from "./Modules/Discovery";
import { Platform } from "./Modules/Platform";

const formatter = (messages: any[], context: any) => {
    if (context.name != null) {
        messages.unshift(Colors.cyan(context.name));
    }

    messages.unshift(Colors.dim(new Date().toLocaleTimeString()));
}

program
    .command("start", { isDefault: true })
    .option("-d, --debug", "enable debug logging")
    .action((options) => {
        if (options.debug) {
            Logger.setDefaults({ defaultLevel: Logger.default.DEBUG, formatter });
        } else {
            Logger.setDefaults({ defaultLevel: Logger.default.INFO, formatter });
        }

        const discovery = new Discovery();
        const context = new Context();
        const platform = new Platform();

        if (context.processors.length === 0) {
            Logger.default.info(Colors.yellow("No processors or smart bridges paired"));

            process.exit(1);
        }

        discovery.on("Discovered", (processor) => {
            if (context.processors.indexOf(processor.id) >= 0) {
                platform.connectProcessor(processor, context.processor(processor.id)!);
            }
        });

        discovery.search();
    });

program.command("pair").action(() => {
    console.log(Colors.green("Press the pairing button on the main processor or smart bridge"));

    const discovery = new Discovery();
    const context = new Context();

    discovery.on("Discovered", (processor) => {
        if (context.processor(processor.id) == null) {
            Logger.setDefaults({ defaultLevel: Logger.default.INFO, formatter });

            const association = new Association(processor, context.authority);

            association
                .authContext()
                .then((certificates) => {
                    Logger.default.info(`Processor ${Colors.dim(processor.id)} paired`);

                    context.add(processor, certificates);
                })
                .catch((error) => {
                    Logger.default.error(Colors.red(error.message));
                })
                .finally(() => process.exit(0));
        }
    });

    discovery.search();
});

program.parse();
