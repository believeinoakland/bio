# record-core (T46)

**Status** · session_01U4VpUHnYKCeaZcQvK8i5XD · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

R83, one corner the text leaves open: what `getSetting(name, {strict: true})` answers when the read itself fails (no `settings` table, a storage that throws, a `name` whose string form throws), since R83 says the strict form never throws. My reading, which I am building: it answers `SETTING_UNREADABLE`, never `null` (fail closed: a value that may have been set is not reported unset; public-read R34 then reads `undetermined`, as it already does for a throw). Also: a stored value that is not text (a blob) reads `SETTING_UNREADABLE`; an options object whose `strict` is anything but `true` (or that throws when read) is the non-strict form; the non-strict form is left exactly as today, its read failure included. No answer needed unless you want otherwise; I carry on.

## Completion (RECORD-CORE #21)

**Read, whole:** `build/requirements/record-core.md` (public and private); the public parts (Purpose, Provides) of `record-grammar`, `id-spaces` and `test-support`; layer 2's contract and the helper/membership notes in `build/layers.md`; `build/plan/current.md` whole (T46-3, its rules at the opening); my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and every test file under my `tests` paths (`record-core.test.mjs`, `t33.test.mjs`, `t35.test.mjs`, `storage.mjs`, `stats-disclosure.test.mjs`) (P20). I also read public-read's R34 read site (`public-read/index.mjs` ~296–318, its user) to align the strict form with how it already treats a throw.

**Applied (T46-3, N904):** R83. `getSetting(name, {strict: true})` answers `null` only when no value was ever set under `name`, the exported frozen `SETTING_UNREADABLE` (`{unreadable: true}`, one object, by identity) when the value last set is not valid JSON (or not held as text), and the value otherwise (one set as `null` reads `null`). It never throws. Without the option (anything but `strict === true`), `getSetting` is byte for byte what it was, so none of its ~40 one-argument callers changes. Readings in J1 (unanswered when this was written; I built on them): in the strict form a read that fails, a name that cannot be spelled, or a stored value not held as text answers `SETTING_UNREADABLE` (fail closed, never "unset"); options that throw when read are the non-strict form. No new refusal, no row, no schema change.

**Deferred (own module, P8):** `setSetting(name, value, by)` throws when `value` is something JSON cannot hold (a function, a symbol: `JSON.stringify` gives `undefined` and the `NOT NULL` insert throws; a BigInt: `JSON.stringify` throws), and it stores `NaN`/`Infinity` silently as `null`. R25 states no answer for such a value. Fixing it means a new refusal (or widening `SETTING_INVALID`), which needs requirement text and a row. That text is BOB's, so it is not done here. No caller passes such a value today (every setter passes JSON data). Proposed: R25 refuses a value that does not round-trip through JSON with `SETTING_INVALID` (or a new `SETTING_VALUE_UNSTORABLE`, C-102.33).

**Other modules:** none found wanting. `public-read` R34 (T46-22, L8) can now ask `getSetting(DECLARED_STAKE_SETTING, {strict: true})` and read `SETTING_UNREADABLE` as `undetermined`. Generated artifacts: the plane bundle and `program.mjs` are staled by this merge (rule 5 (4), regenerated at layer close); I wrote none.

**Tests and checks:**
- `node --test bio-plane/test/m/record-core/`: tests 171, pass 171, fail 0 (new `t46.test.mjs`, six tests each naming R83, with negative controls; a mutation that answers `null` for unreadable JSON in the strict form turns all six red).
- `node bio-plane/test/stats-disclosure.test.mjs`: 31 pass, 0 fail.
- `node --test bio-plane/test/m/public-read/` (R83's user): 165 pass, 0 fail.
- No layer tests are named in the manifest.
- `checks/format.mjs`: 159 modules, 152 requirements files, 0 failures.
- `checks/architecture.mjs … record-core`: 8 product files, 0 failures.
- `checks/coverage.mjs … record-core`: 83 of 83 live ids named, 0 failures.
- `checks/ownership.mjs … record-core tranche/T46`: 3 files, 0 failures.

Size (session_01U4VpUHnYKCeaZcQvK8i5XD): test runs 7, module lines 2318
