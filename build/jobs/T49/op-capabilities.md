# op-capabilities (T49)

**Status** · session_01PAsfLsftny7fjfWK1VEbrx · depth 2 · COMPLETE · handled B2

## Completion (T49-16)

**Read.** Requirements, the extraction map and the copied range of `op-declarations/index.mjs` (2,413–3,301 and 3,307–3,330), whole. I have no other code or tests; the module imports nothing, so I read no other module's services. I did not touch op-declarations.

**Entries applied.** R1–R3. `bio-plane/src/op-capabilities/index.mjs` (927 lines): the header comment, the 323 rows with their comments copied unchanged, and the wrapper `let rows; export function needsRows() { return rows ??= build(); }`, `build()` returning `Object.freeze({...})`. One word changed in the copied header comment: "This module's R3 test" is now "op-declarations' R3 test", because the test stays there. Measured: 323 rows by value against the live pre-split `NEEDS` (0 mismatches); `contribute` 185, `publish` 7, `create_projects` 1, `null` 130; none is an alias (0 of the 27 alias names).
**Words (K3366/K3368).** No member-facing English added; no REPORT for a key owed.

**Paths for BOB to fill in `modules.json` (K1043).** `paths`: `["bio-plane/src/op-capabilities/"]`; `tests`: `["bio-plane/test/m/op-capabilities/"]`; `uses` stays empty.

**Tests** (`bio-plane/test/m/op-capabilities/`): `rows.test.mjs` (R1: the names and values against `golden-rows.json`, a copy of the rows taken from the pre-split literal; the count by value and the seven `publish` ops; control: an absent op answers `undefined`, not `null`, and a present `null` is a key), `frozen.test.mjs` (R2: frozen, plain, write refused, two loads byte-identical; no import in the source text; no network, clock, randomness, timer or environment touched; no place named), `lazy.test.mjs` (R3: child process by `t48.test.mjs`:440's method: no large table frozen at import, one at the first call, none after; control: arguments ignored, never throws).
- `node --test bio-plane/test/m/op-capabilities/`: pass 9, fail 0.
- With `paths` and `tests` set in a scratch copy of `modules.json`: format `0 failures`; architecture `5 product files … 0 failures`; coverage `3 of 3 live requirement ids named by a test; 0 failures`; ownership `1 files changed by op-capabilities … 0 failures`. With the lists empty as committed, coverage reports R1–R3 as named by no test (the inherited red, closed when BOB fills them). The `checks/run.mjs` run shows my row red for that reason alone; the other reds listed are other modules'.

**Deferred.** None. **Found in another module.** Nothing. The empty overlap between the hand rows and `FAMILY_NEEDS` (map §2) is for T49-17's composition test: this module's tests cannot import op-declarations (architecture refuses it), so I did not test it here.

Size (session_01PAsfLsftny7fjfWK1VEbrx): test runs 8, module lines 927

## J1 · COMPLETE

T49-16 complete: op-capabilities built by copy (index.mjs 927 lines; 323 rows by value = pre-split, 185/7/1/130); tests rows/frozen/lazy name R1-R3, 9 pass; format, architecture, coverage, ownership 0 failures with paths set in a scratch modules.json. Please fill modules.json: paths [bio-plane/src/op-capabilities/], tests [bio-plane/test/m/op-capabilities/]. op-declarations untouched. Details in my record.
