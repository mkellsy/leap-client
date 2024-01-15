import * as Logger from "js-logger";

import Colors from "colors";
import { program } from "commander";

import { Association } from "./Modules/Association";
import { Context } from "./Modules/Context";
import { Discovery } from "./Modules/Discovery";
import { Platform } from "./Modules/Platform";

Logger.setDefaults({
    defaultLevel: Logger.default.INFO,
    formatter: (messages, context) => {
        if (context.name != null) {
            messages.unshift(Colors.cyan(context.name));
        }

        messages.unshift(Colors.dim(new Date().toLocaleTimeString()));
    }
});

const log = Logger.default;

program.command("start", { isDefault: true }).action(() => {
    const discovery = new Discovery();
    const context = new Context();
    const platform = new Platform();

    discovery.on("Discovered", (processor) => {
        if (context.processors.indexOf(processor.id) >= 0) {
            platform.connectProcessor(processor, context.processor(processor.id)!);
        }
    });

    discovery.search();
});

program.command("pair").action(() => {
    console.log(Colors.yellow("Press the pairing button on the processor"));

    const discovery = new Discovery();
    const context = new Context();

    discovery.on("Discovered", (processor) => {
        if (context.processor(processor.id) == null) {
            const association = new Association(processor, context.authority);

            association
                .authContext()
                .then((certificates) => {
                    log.info(`Processor ${Colors.dim(processor.id)} paired`);

                    context.add(processor, certificates);
                })
                .catch((error) => {
                    log.error(Colors.red(error.message));
                })
                .finally(() => process.exit(0));
        }
    });

    discovery.search();
});

program.parse();
