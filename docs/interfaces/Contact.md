[Lutron LEAP Client](../README.md) / Contact

# Interface: Contact

Defines a CCO device.

## Extends

- `Contact`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`ContactInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`ContactInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`ContactInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`ContactInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`ContactInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`ContactInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`ContactInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`ContactInterface.room`

***

### status

> `readonly` **status**: [`ContactState`](ContactState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`ContactInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`ContactInterface.type`

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

`ContactInterface.emit`

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

`ContactInterface.off`

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

`ContactInterface.on`

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

`ContactInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
cco.set({ state: "Closed" });
```

#### Parameters

• **status**: [`ContactState`](ContactState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`ContactInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
cco.update({ CCOLevel: "Closed" });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`ContactInterface.update`
