[Lutron LEAP Client](../README.md) / Dimmer

# Interface: Dimmer

Defines a dimmable light device.

## Extends

- `Dimmer`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`DimmerInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`DimmerInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`DimmerInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`DimmerInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`DimmerInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`DimmerInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`DimmerInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`DimmerInterface.room`

***

### status

> `readonly` **status**: [`DimmerState`](DimmerState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`DimmerInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`DimmerInterface.type`

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

`DimmerInterface.emit`

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

`DimmerInterface.off`

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

`DimmerInterface.on`

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

`DimmerInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
dimmer.set({ state: "On", level: 50 });
```

#### Parameters

• **status**: [`DimmerState`](DimmerState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`DimmerInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
dimmer.update({ Level: 100 });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`DimmerInterface.update`
