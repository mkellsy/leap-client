import * as Console from "js-logger";

import Colors from "colors";
import { Command } from "commander";

export type Log = Console.ILogger;

export abstract class Logger {
    static configure(program: Command) {
        const formatter = (messages: any[], context: any): void => {
            if (context.name != null) {
                messages.unshift(Colors.cyan(context.name));
            }

            messages.unshift(Colors.dim(new Date().toLocaleTimeString()));
        };

        if (program.opts().debug) {
            Console.setDefaults({ defaultLevel: Console.default.DEBUG, formatter });
        } else {
            Console.setDefaults({ defaultLevel: Console.default.INFO, formatter });
        }
    }

    static get log(): Console.GlobalLogger {
        return Console.default;
    }

    static get(name: string): Console.ILogger {
        return Console.get(name);
    }
}
