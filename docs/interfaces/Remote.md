[Lutron LEAP Client](../README.md) / Remote

# Interface: Remote

Defines a Pico remote device.

## Extends

- `Remote`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`RemoteInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`RemoteInterface.area`

***

### buttons

> `readonly` **buttons**: `Button`[]

The buttons available on the device.

#### Overrides

`RemoteInterface.buttons`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`RemoteInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`RemoteInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`RemoteInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`RemoteInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`RemoteInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`RemoteInterface.room`

***

### status

> **status**: `DeviceState`

The current state of the device.

#### Inherited from

`RemoteInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`RemoteInterface.type`

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

`RemoteInterface.emit`

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

`RemoteInterface.off`

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

`RemoteInterface.on`

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

`RemoteInterface.once`

***

### set()

> **set**(`state`): `Promise`\<`void`\>

Controls the device.

#### Parameters

• **state**: `unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`RemoteInterface.set`

***

### update()

> **update**(`_status`): `void`

Is called when a new state is available.

#### Parameters

• **\_status**: `unknown`

#### Returns

`void`

#### Inherited from

`RemoteInterface.update`
