import fs from "fs";
import path from "path";
import os from "os";

import { BSON } from "bson";
import { Certificate } from "@mkellsy/leap";

import { ProcessorAddress } from "./Interfaces/ProcessorAddress";

export class Context {
    private context: Record<string, Certificate> = {};

    constructor() {
        const context = this.open<Record<string, Certificate>>("pairing") || {};
        const keys = Object.keys(context);

        for (let i = 0; i < keys.length; i++) {
            context[keys[i]] = this.decrypt(context[keys[i]])!;
        }

        this.context = context;
    }

    public get processors(): string[] {
        return Object.keys(this.context).filter((key) => key !== "authority");
    }

    public has(id: string): boolean {
        return this.context[id] != null;
    }

    public get(id: string): Certificate | undefined {
        return this.context[id];
    }

    public set(processor: ProcessorAddress, context: Certificate): void {
        this.context[processor.id] = { ...context };
        this.save("pairing", this.context);
    }

    private decrypt(context: Certificate | null): Certificate | null {
        if (context == null) {
            return null;
        }

        context.ca = Buffer.from(context.ca, "base64").toString("utf8");
        context.key = Buffer.from(context.key, "base64").toString("utf8");
        context.cert = Buffer.from(context.cert, "base64").toString("utf8");

        return context;
    }

    private encrypt(context: Certificate | null): Certificate | null {
        if (context == null) {
            return null;
        }

        context.ca = Buffer.from(context.ca).toString("base64");
        context.key = Buffer.from(context.key).toString("base64");
        context.cert = Buffer.from(context.cert).toString("base64");

        return context;
    }

    private open<T>(filename: string): T | null {
        const directory = path.join(os.homedir(), ".leap");

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        if (fs.existsSync(path.join(directory, filename))) {
            const bytes = fs.readFileSync(path.join(directory, filename));

            return BSON.deserialize(bytes) as T;
        }

        return null;
    }

    private save(filename: string, context: Record<string, Certificate>): void {
        if (context == null) {
            return;
        }

        const directory = path.join(os.homedir(), ".leap");

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }

        const clear = { ...context };
        const keys = Object.keys(clear);

        for (let i = 0; i < keys.length; i++) {
            clear[keys[i]] = this.encrypt(clear[keys[i]])!;
        }

        fs.writeFileSync(path.join(directory, filename), BSON.serialize(clear));
    }
}
