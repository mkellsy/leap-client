[Lutron LEAP Client](../README.md) / Occupancy

# Interface: Occupancy

Defines a occupancy sensor device.

## Extends

- `Occupancy`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`OccupancyInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`OccupancyInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`OccupancyInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`OccupancyInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`OccupancyInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`OccupancyInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`OccupancyInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`OccupancyInterface.room`

***

### status

> `readonly` **status**: [`OccupancyState`](OccupancyState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`OccupancyInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`OccupancyInterface.type`

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

`OccupancyInterface.emit`

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

`OccupancyInterface.off`

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

`OccupancyInterface.on`

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

`OccupancyInterface.once`

***

### set()

> **set**(`state`): `Promise`\<`void`\>

Controls the device.

#### Parameters

• **state**: `unknown`

#### Returns

`Promise`\<`void`\>

#### Inherited from

`OccupancyInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
sensor.update({ OccupancyStatus: "Occupied" });
```

#### Parameters

• **status**: `AreaStatus`

The current device state.

#### Returns

`void`

#### Overrides

`OccupancyInterface.update`
