[Lutron LEAP Client](../README.md) / Keypad

# Interface: Keypad

Defines a keypad device.

## Extends

- `Keypad`

## Properties

### address

> **address**: `Address`

The href address of the device. This is mainly used for Lutron systems.

#### Inherited from

`KeypadInterface.address`

***

### area

> **area**: `Area`

The area the device is in.

#### Inherited from

`KeypadInterface.area`

***

### buttons

> `readonly` **buttons**: `Button`[]

The buttons available on the device.

#### Overrides

`KeypadInterface.buttons`

***

### capabilities

> **capabilities**: `object`

The devices capibilities. This is a map of the fields that can be set
or read.

#### Index Signature

 \[`key`: `string`\]: `Capability`

#### Inherited from

`KeypadInterface.capabilities`

***

### id

> **id**: `string`

The device's unique identifier.

#### Inherited from

`KeypadInterface.id`

***

### log

> **log**: `ILogger`

A logger for the device. This will automatically print the devices name,
room and id.

#### Inherited from

`KeypadInterface.log`

***

### manufacturer

> **manufacturer**: `string`

The device's manufacturer.

#### Inherited from

`KeypadInterface.manufacturer`

***

### name

> **name**: `string`

The device's configured name.

#### Inherited from

`KeypadInterface.name`

***

### room

> **room**: `string`

The device's configured room.

#### Inherited from

`KeypadInterface.room`

***

### status

> `readonly` **status**: [`KeypadState`](KeypadState.md)

The current state of the device.

#### Returns

The device's state.

#### Overrides

`KeypadInterface.status`

***

### type

> **type**: `DeviceType`

The device type.

#### Inherited from

`KeypadInterface.type`

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

`KeypadInterface.emit`

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

`KeypadInterface.off`

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

`KeypadInterface.on`

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

`KeypadInterface.once`

***

### set()

> **set**(`status`): `Promise`\<`void`\>

Controls this LEDs on this device.

```js
keypad.set({ state: { href: "/led/123456" }, state: "On" });
```

#### Parameters

• **status**: [`KeypadState`](KeypadState.md)

Desired device state.

#### Returns

`Promise`\<`void`\>

#### Overrides

`KeypadInterface.set`

***

### update()

> **update**(`_status`): `void`

Is called when a new state is available.

#### Parameters

• **\_status**: `unknown`

#### Returns

`void`

#### Inherited from

`KeypadInterface.update`
