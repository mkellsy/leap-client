[Lutron LEAP Client](../README.md) / Shade

# Interface: Shade

Defines a window shade device.

## Extends

- `Shade`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`ShadeInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`ShadeInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`ShadeInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`ShadeInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`ShadeInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`ShadeInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`ShadeInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`ShadeInterface.room`

***

### status

> `readonly` **status**: [`ShadeState`](ShadeState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`ShadeInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`ShadeInterface.type`

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

`ShadeInterface.emit`

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

`ShadeInterface.off`

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

`ShadeInterface.on`

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

`ShadeInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
shade.set({ state: "Open", level: 50, tilt: 50 });
```

#### Parameters

• **status**: [`ShadeState`](ShadeState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`ShadeInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
shade.update({ Level: 100 });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`ShadeInterface.update`
