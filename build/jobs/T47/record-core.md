# record-core (T47)

**Status** · session_01UoXK9QPNAj5jdUwKRxUk56 · depth 2 · RUNNING until 2026-10-12T13:00:47Z (neighbour suites: instance-setup, answer-envelope, public-read, control-plane envelope) · handled B2

## J1 · QUESTION

R84's list ("at every depth null, a boolean, a string, a finite number, an array of such values or a plain object whose values are all such") and its closing sentence ("a value that round-trips is stored and read back equal to the value set") part on two edges:

1. `-0` is a finite number, but JSON writes it as `0`, so it reads back `0` (equal by `==`, not by `Object.is` or a strict deep-equal).
2. An object with a null prototype (`Object.create(null)`) holds only JSON values, but reads back as an ordinary object.

My best reading, which I am building: the list governs. `-0` is a finite number and is stored (it reads back `0`). "Plain object" means an object whose prototype is `Object.prototype`, so a null-prototype object is refused `SETTING_NOT_JSON`, like any other non-plain object. Also refused, because JSON would silently drop or change them: an array with holes or extra named properties, an object with symbol keys, non-enumerable properties or getters, and any value whose inspection throws (a hostile Proxy). Each refusal records nothing.

If you read either edge the other way, say so and I will change it. Nothing else waits on this answer.
