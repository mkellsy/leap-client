[Lutron LEAP Client](../README.md) / Fan

# Interface: Fan

Defines a fan device.

## Extends

- `Fan`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`FanInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`FanInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`FanInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`FanInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`FanInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`FanInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`FanInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`FanInterface.room`

***

### status

> `readonly` **status**: [`FanState`](FanState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`FanInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`FanInterface.type`

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

`FanInterface.emit`

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

`FanInterface.off`

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

`FanInterface.on`

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

`FanInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
fan.set({ state: "On", speed: 3 });
```

#### Parameters

• **status**: [`FanState`](FanState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`FanInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
fan.update({ SwitchedLevel: "On", FanSpeed: 7 });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`FanInterface.update`
