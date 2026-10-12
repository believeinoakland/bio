# record-core (T47)

**Status** · session_01UoXK9QPNAj5jdUwKRxUk56 · depth 2 · RUNNING until 2026-10-12T13:00:47Z (neighbour suites: instance-setup, answer-envelope, public-read, control-plane envelope) · handled B2

## J1 · QUESTION

R84's list ("at every depth null, a boolean, a string, a finite number, an array of such values or a plain object whose values are all such") and its closing sentence ("a value that round-trips is stored and read back equal to the value set") part on two edges:

1. `-0` is a finite number, but JSON writes it as `0`, so it reads back `0` (equal by `==`, not by `Object.is` or a strict deep-equal).
2. An object with a null prototype (`Object.create(null)`) holds only JSON values, but reads back as an ordinary object.

My best reading, which I am building: the list governs. `-0` is a finite number and is stored (it reads back `0`). "Plain object" means an object whose prototype is `Object.prototype`, so a null-prototype object is refused `SETTING_NOT_JSON`, like any other non-plain object. Also refused, because JSON would silently drop or change them: an array with holes or extra named properties, an object with symbol keys, non-enumerable properties or getters, and any value whose inspection throws (a hostile Proxy). Each refusal records nothing.

If you read either edge the other way, say so and I will change it. Nothing else waits on this answer.

## Completion (RECORD-CORE #22)

**Read, whole:** `build/requirements/record-core.md` (public and private), and again after BOB's B2 amended R84; the public parts (Purpose, Provides) of `record-grammar`, `id-spaces` and `test-support`; `build/layers.md` whole (layer 2's contract among it); my entry in `build/plan/current.md` (T47-6) and its rules at the opening; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every file under my `tests` paths (`record-core.test.mjs`, `t33.test.mjs`, `t35.test.mjs`, `t46.test.mjs`, `storage.mjs`, `stats-disclosure.test.mjs`) (P20).

**Applied (T47-6, N939):** R84. `setSetting` refuses `SETTING_NOT_JSON`, recording nothing, a value that does not round-trip through JSON. It answers `{name, ok, reason, code, check, translation, detail}` under the new row C-102.33 in `RECORD_CORE_CHECKS`, beside C-102.29–.32. The row's `where` is `setSetting > is-setting-refused`, and its translation is a build fault ending with `BUILD_FAULT`. The refusal is asked after `SETTING_VALUE_REQUIRED` and before `SETTING_INVALID`, which keeps its row and meaning. The one test, `roundTripsJson`, accepts only `null`, booleans, strings, finite numbers, dense arrays with no named properties, and objects whose prototype is `Object.prototype` and whose own properties are all enumerable, string-keyed data properties, at every depth and with no cycle. A value whose inspection throws, or that nests too deep to walk, is refused, and `setSetting` never throws for it. The stored text is the one `JSON.stringify` the check passed. J1's reading of the two edges (`-0` taken and read back `0`; a null-prototype object refused) was confirmed in B2 (K3036), and R84 now states it. Row `awaiting stamp` for T47-10.

**Deferred:** nothing. The flaw RECORD-CORE #21 deferred (`setSetting` threw on a function, symbol or BigInt, and stored `NaN` and `Infinity` silently as `null`) is closed by R84. I found no other flaw in my module.

**Other modules:** none found wanting. Every `setSetting` caller (answers, acquisition, monitoring, instance-setup) passes JSON data, and their suites pass. Generated artifacts: this merge stales the plane bundle and `program.mjs` (rule 5 (4), regenerated at the layer's close). I wrote none.

**Tests and checks:**
- `node --test bio-plane/test/m/record-core/`: tests 178, pass 178, fail 0. The new `t47.test.mjs` holds seven tests, each naming R84, and the last names each K3036 edge. Negative control: with the refusal removed, the four refusal tests go red and the row and round-trip tests stay green, as they should.
- `node bio-plane/test/stats-disclosure.test.mjs`: 31 pass, 0 fail.
- Neighbours: answers 63/0, acquisition 158/0, monitoring 137/0, instance-setup 157/0, public-read 186/0, control-plane `envelope.test.mjs` 16/0. answer-envelope 32 pass, 1 fail: R8's `DISCLOSURE_DUE` words pin, which is rule 5's accepted red 7a (answer-envelope (1)) and not mine.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 165 modules, 158 requirements files, 0 failures.
- `checks/architecture.mjs … record-core`: 0 failures.
- `checks/coverage.mjs … record-core`: 84 of 84 live ids named, 0 failures.
- `checks/ownership.mjs … record-core tranche/T47`: 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (3060 files), channels 0. Coverage has 12 failures, all in other modules' T47 ids (rule 5.1) and none in record-core.

Size (session_01UoXK9QPNAj5jdUwKRxUk56): test runs 16, module lines 2372
