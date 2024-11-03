[Lutron LEAP Client](../README.md) / Strip

# Interface: Strip

Defines a LED strip device.

## Extends

- `Strip`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`StripInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`StripInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`StripInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`StripInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`StripInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`StripInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`StripInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`StripInterface.room`

***

### status

> `readonly` **status**: [`StripState`](StripState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`StripInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`StripInterface.type`

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

`StripInterface.emit`

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

`StripInterface.off`

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

`StripInterface.on`

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

`StripInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
strip.set({ state: "On", level: 50, luminance: 3000 });
```

#### Parameters

• **status**: [`StripState`](StripState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`StripInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
strip.update({ Level: 100 });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`StripInterface.update`
