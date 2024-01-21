import { EventEmitter } from "@mkellsy/event-emitter";
import { MDNSService, MDNSServiceDiscovery, Protocol } from "tinkerhub-mdns";

import { HostAddress } from "./Interfaces/HostAddress";
import { HostAddressFamily } from "./Interfaces/HostAddressFamily";
import { ProcessorAddress } from "./Interfaces/ProcessorAddress";

export class Discovery extends EventEmitter<{
    Discovered: (processor: ProcessorAddress) => void;
    Failed: (error: Error) => void;
}> {
    constructor() {
        super();
    }

    public search() {
        const discovery = new MDNSServiceDiscovery({
            type: "lutron",
            protocol: Protocol.TCP,
        });

        discovery.onAvailable(this.onAvailable(discovery));
    }

    private onAvailable(discovery: MDNSServiceDiscovery): (service: MDNSService) => void {
        return (service) => {
            const type = service.data.get("systype");

            if (type == null || typeof type === "boolean") {
                return;
            }

            const addresses: HostAddress[] = [];

            for (let i = 0; i < service.addresses.length; i++) {
                addresses.push({
                    address: service.addresses[i].host,
                    family: /^([\da-f]{1,4}:){7}[\da-f]{1,4}$/i.test(service.addresses[i].host)
                        ? HostAddressFamily.IPv6
                        : HostAddressFamily.IPv4,
                });
            }

            const target = (discovery as any).serviceData.get(service.id).SRV._record.target;
            const id = target.match(/[Ll]utron-(?<id>\w+)\.local/)!.groups!.id.toUpperCase();

            this.emit("Discovered", { id, addresses, type });
        };
    }
}