[Lutron LEAP Client](../README.md) / Timeclock

# Interface: Timeclock

Defines a timeclock device.

## Extends

- `Timeclock`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`TimeclockInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`TimeclockInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`TimeclockInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`TimeclockInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`TimeclockInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`TimeclockInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`TimeclockInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`TimeclockInterface.room`

***

### status

> `readonly` **status**: [`TimeclockState`](TimeclockState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`TimeclockInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`TimeclockInterface.type`

## Methods

### emit()

> **emit**(`event`, ...`payload`): `boolean`

Emits events for this device.

#### Parameters

• **event**: `string`

The event to emit.

• ...**payload**: `any`[]

The payload attached to the event.

#### Returns

`boolean`

#### Inherited from

`TimeclockInterface.emit`

***

### off()

> **off**(`event`?, `listener`?): `this`

Unbinds a listener to an event.

#### Parameters

• **event?**: `string`

The event to unbind from.

• **listener?**: `Function`

The listener to unbind.

#### Returns

`this`

#### Inherited from

`TimeclockInterface.off`

***

### on()

> **on**(`event`, `listener`): `this`

Binds a listener to an event.

#### Parameters

• **event**: `string`

The event to bind to.

• **listener**: `Function`

The listener to bind.

#### Returns

`this`

#### Inherited from

`TimeclockInterface.on`

***

### once()

> **once**(`event`, `listener`): `this`

Binds a, rone once listener to an event.

#### Parameters

• **event**: `string`

The event to bind to.

• **listener**: `Function`

The listener to bind.

#### Returns

`this`

#### Inherited from

`TimeclockInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls the device.

#### Parameters

• **status**: `Partial`\<`DeviceState`\>

A partial device state object.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`TimeclockInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
timeclock.update({ EnabledState: "Enabled" });
```

#### Parameters

• **status**: `TimeclockStatus`

The current device state.

#### Returns

`void`

#### Overrides

`TimeclockInterface.update`
