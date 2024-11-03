[Lutron LEAP Client](../README.md) / Switch

# Interface: Switch

Defines a on/off switch device.

## Extends

- `Switch`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`SwitchInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`SwitchInterface.area`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`SwitchInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`SwitchInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`SwitchInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`SwitchInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`SwitchInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`SwitchInterface.room`

***

### status

> `readonly` **status**: [`SwitchState`](SwitchState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`SwitchInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`SwitchInterface.type`

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

`SwitchInterface.emit`

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

`SwitchInterface.off`

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

`SwitchInterface.on`

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

`SwitchInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this device.

```js
switch.set({ state: "On" });
```

#### Parameters

• **status**: [`SwitchState`](SwitchState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`SwitchInterface.set`

***

### update()

> **update**(`status`): `void`

Recieves a state response from the connection and updates the device
state.

```js
switch.update({ SwitchedLevel: "On" });
```

#### Parameters

• **status**: `ZoneStatus`

The current device state.

#### Returns

`void`

#### Overrides

`SwitchInterface.update`
