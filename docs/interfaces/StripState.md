[Lutron LEAP Client](../README.md) / StripState

# Interface: StripState

Defines a LED strip's current status response.

## Extends

- `DeviceState`

## Properties

### level

> **level**: `number`

The LED strip's brightness level.

***

### luminance

> **luminance**: `number`

The LED's color temperature luminance.

***

### state

> **state**: `"On"` \| `"Off"`

Is the LED strip on or off.

#### Overrides

`DeviceState.state`
