# Lutron LEAP Client
Publishes devices, states and actions to an event emitter using the Lutron LEAP protocol.

## API
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

location.on("Identify", (device): void => {
    // event fired when a device is discovered
});

location.on("Update", (device, state): void => {
    // event fired when the device state updates
});

location.on("Action", (device, button, action): void => {
    // event fired when a device action occurs
});
```