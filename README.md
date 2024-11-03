# Lutron LEAP Client

Publishes devices, states and actions to an event emitter using the Lutron LEAP protocol.

## API

[**API Documentation**](docs/README.md)

Pairing a processor or bridge

```js
import { pair } from "@mkellsy/leap-client";

console.log("Press the pairing button on the main processor or smart bridge");

await pair();
```

This will autopmatically discover processors. You will need to press the pairing button on your processor or bridge.

If you have multiple systems Caseta and RA3, you can pair other processors or bridges by runnging the pair command again, and pressing the pairing button on the other device.

> Systems that have more than one processor, such as RA3, you will only need to pair the first bridge. Devices programed for other bridges are vended from all processors.

After you have a processor or bridge paired, you can connect.

```js
import { connect } from "@mkellsy/leap-client";

const location = connect();

location.on("Available", (processor): void => {
    // event fired when all devices are available
});

location.on("Update", (device, state): void => {
    // event fired when the device state updates
});

location.on("Action", (device, button, action): void => {
    // event fired when a device action occurs
});
```

> The processor will cache slow changing data, to refresh the areas, zones, remotes, etc... you can set the refresh flag when calling connect `connect(true)`.

Fetch a list of processors.

```js
for (const id of location.processors) {
    // the id is the processor id string
}
```

Accessing the processor

```js
const processor = location.processor(id);
```

Pinging the a processor or bridge

```js
const response = await processor.ping();
```

Processor details.

```js
const system = await processor.system();
const project = await processor.project();
```

Fetch a list of areas

```js
const areas = await processor.areas();
```

Fetch all statuses

```js
const statuses = await processor.statuses();
```

Fetch zones in an area

```js
const zones = await processor.zones(area);
```

Fetch a zone or area status

```js
const areaStatus = await processor.status(area);
const zoneStatus = await processor.status(zone);
```

Fetch an area's controls

```js
const controls = await processor.controls(area);
```

Fetching ganged controls

```js
const controls = await processor.controls(area);

for (const gangedDevice of control.AssociatedGangedDevices) {
    const address = gangedDevice.Device;

    // the the address can be used to fetch the pico remote, sensor, keypad
}
```

Fetching a device

```js
const device = await processor.device(address);
```

Fetching a devices buttons

```js
const buttons = await processor.buttons(device);
```

Executing a command

```js
await processor.command(deviceOrZone, commandObject);
```

Fetching a discovered device

```js
const device = processor.devices.get(id);
```

Update the status of a device

```js
device.update(state);
```

Set a property(s) of a device

```js
device.set(state);
```
