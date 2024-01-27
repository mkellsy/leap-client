export interface Capability {
    type: "Integer" | "Decimal" | "String";
    values?: string[];
    min?: number;
    max?: number;
}
