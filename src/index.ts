import * as Logger from "js-logger";

import Colors from "colors";
import { program } from "commander";

import { Association } from "./Association";
import { Context } from "./Context";
import { Discovery } from "./Discovery";
import { Location } from "./Location";

program
    .command("start")
    .option("-d, --debug", "enable debug logging")
    .action((options) => {
        const formatter = (messages: any[], context: any): void => {
            if (context.name != null) {
                messages.unshift(Colors.cyan(context.name));
            }

            messages.unshift(Colors.dim(new Date().toLocaleTimeString()));
        }

        if (options.debug) {
            Logger.setDefaults({ defaultLevel: Logger.default.DEBUG, formatter });
        } else {
            Logger.setDefaults({ defaultLevel: Logger.default.INFO, formatter });
        }

        const discovery = new Discovery();
        const context = new Context();
        const location = new Location();

        const exit = (code?: number): void => {
            discovery.stop();
            location.close();

            process.exit(code || 0);
        }

        process.on("exit", exit);
        process.on("SIGINT", exit);
        process.on("SIGUSR1", exit);
        process.on("SIGUSR2", exit);

        if (context.processors.length === 0) {
            Logger.default.info(Colors.yellow("No processors or smart bridges paired"));

            exit(1);
        }

        location.on("Update", (topic: string, status: string | number | boolean): void => {
            Logger.default.info(`${topic} ${Colors.green(String(status))}`);
        });

        discovery.on("Discovered", (processor) => {
            if (context.processors.indexOf(processor.id) >= 0) {
                location.connect(processor, context.processor(processor.id)!);
            }
        });

        discovery.search();
    });

program.command("pair").action(() => {
    const formatter = (messages: any[], context: any): void => {
        if (context.name != null) {
            messages.unshift(Colors.cyan(context.name));
        }

        messages.unshift(Colors.dim(new Date().toLocaleTimeString()));
    }

    console.log(Colors.green("Press the pairing button on the main processor or smart bridge"));

    const discovery = new Discovery();
    const context = new Context();

    const exit = (code?: number): void => {
        discovery.stop();

        process.exit(code || 0);
    }

    process.on("exit", exit);
    process.on("SIGINT", exit);
    process.on("SIGUSR1", exit);
    process.on("SIGUSR2", exit);

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
                .finally(() => {
                    association.close();

                    exit(0);
                });
        }
    });

    discovery.search();
});

export = function main(args?: string[] | undefined): void {
    program.parse(args || process.argv);
};
