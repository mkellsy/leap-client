[Lutron LEAP Client](../README.md) / ShadeState

# Interface: ShadeState

Defines a shade's current status response.

## Extends

- `DeviceState`

## Properties

### level

> **level**: `number`

The shade's open level.

***

### state

> **state**: `"Open"` \| `"Closed"`

Is the shade open or closed.

#### Overrides

`DeviceState.state`

***

### tilt?

> `optional` **tilt**: `number`

The shade's tilt level.
