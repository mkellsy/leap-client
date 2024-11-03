[Lutron LEAP Client](../README.md) / Unknown

# Interface: Unknown

Defines an unknown device.

## Extends

- `Unknown`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`UnknownInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`UnknownInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`UnknownInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`UnknownInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`UnknownInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`UnknownInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`UnknownInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`UnknownInterface.room`

***

### status

> **status**: `DeviceState`

The current state of the device.

#### Inherited from

`UnknownInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`UnknownInterface.type`

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

`UnknownInterface.emit`

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

`UnknownInterface.off`

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

`UnknownInterface.on`

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

`UnknownInterface.once`

***

### set()

> **set**(`state`): `Promise`\<`void`\>

Controls the device.

#### Parameters

• **state**: `unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`UnknownInterface.set`

***

### update()

> **update**(`status`): `void`

Is called when a new state is available.

#### Parameters

• **status**: `unknown`

#### Returns

`void`

#### Inherited from

`UnknownInterface.update`
