import fs from "fs";
import path from "path";

import { BSON } from "bson";

import { AuthContext } from "../Interfaces/AuthContext";
import { ProcessorAddress } from "../Interfaces/ProcessorAddress";

const CACHE = path.resolve(__dirname, "../../data");

export class Context {
    private authorityContext?: AuthContext;
    private processorContext: Record<string, AuthContext> = {};

    constructor() {
        const context = this.open<Record<string, AuthContext>>("pairing") || {};
        const keys = Object.keys(context);

        for (let i = 0; i < keys.length; i++) {
            context[keys[i]] = this.decrypt(context[keys[i]])!;
        }

        this.processorContext = context;
    }

    public get authority(): AuthContext {
        if (this.authorityContext != null) {
            return this.authorityContext;
        }

        const context = this.open<AuthContext>("authority");
        const authority = this.decrypt(context);

        if (authority == null) {
            throw new Error("No authority context");
        }

        this.authorityContext = authority;

        return this.authorityContext;
    }

    public get processors(): string[] {
        return Object.keys(this.processorContext).filter((key) => key !== "authority");
    }

    public processor(id: string): AuthContext | null {
        const context = this.processorContext[id];

        if (context == null) {
            return null;
        }

        return context;
    }

    public add(processor: ProcessorAddress, context: AuthContext): void {
        this.processorContext[processor.id] = { ...context };
        this.save("pairing", this.processorContext);
    }

    private decrypt(context: AuthContext | null): AuthContext | null {
        if (context == null) {
            return null;
        }

        context.ca = Buffer.from(context.ca, "base64").toString("utf8");
        context.key = Buffer.from(context.key, "base64").toString("utf8");
        context.cert = Buffer.from(context.cert, "base64").toString("utf8");

        return context;
    }

    private encrypt(context: AuthContext | null): AuthContext | null {
        if (context == null) {
            return null;
        }

        context.ca = Buffer.from(context.ca).toString("base64");
        context.key = Buffer.from(context.key).toString("base64");
        context.cert = Buffer.from(context.cert).toString("base64");

        return context;
    }

    private open<T>(filename: string): T | null {
        if (fs.existsSync(path.join(CACHE, filename))) {
            const bytes = fs.readFileSync(path.join(CACHE, filename));

            return BSON.deserialize(bytes) as T;
        }

        return null;
    }

    private save(filename: string, context: any): void {
        if (context == null) {
            return;
        }

        if (!fs.existsSync(CACHE)) {
            fs.mkdirSync(CACHE);
        }

        const clear = { ...context };
        const keys = Object.keys(clear);

        for (let i = 0; i < keys.length; i++) {
            clear[keys[i]] = this.encrypt(clear[keys[i]])!;
        }

        fs.writeFileSync(path.join(CACHE, filename), BSON.serialize(clear));
    }
}
