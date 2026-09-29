# connections (T12)

**Status** · session_01Tpv6PUqFfj5j6NHC4X1yVi · depth 2 · COMPLETE · handled B1

## Completion (CONNECTIONS #5)

**Entry applied.** N285 (layer 5), connections' share: R1's no-entity answer through `entities.noEntity` (entities R37). `derive` answers a request naming no entity id (absent, not a string, or empty) with `noEntity(<this act's sentence>)`, imported from `src/entities/index.mjs` (a module-level function, as `noSuchEntity` is), never minted here; the sentence is the one this site carried before ("a connection is derived among the documents that concern one entity, by its id (op=connect&id=ENT-...)"). R1's `not yet met: N285` mark is met by this work (BOB strikes it). R1's `test.todo` is now a test: for `undefined`, `null`, `""`, `42`, `{}` and an array, the answer deep-equals `noEntity(detail)` (so `code`, `check` and `translation` are entities' row, whole), the detail is this act's sentence, nothing is written (`connections`, `connection_dirty`, `connection_pair_choices` snapshots unchanged) and no `onDerived` listener runs.

**Built against R37's text as worded (B1).** Entities' `noEntity` is not yet on `tranche/T12`, so this branch loads only once it is: `src/connections/index.mjs` imports it by name. The run below used a local, never-committed stub of R37 (removed before commit; `git status` clean of `src/entities/`). On BOB's CHANGE I merge `tranche/T12` and re-run steps 5–7 against the real helper.

**Codes renamed:** none (`NO_ENTITY` stays). Legacy-ui and old battery: `civicos-ui/app.html` 17029 and `bio-plane/test/connection.test.mjs` 262 key only on `reason === "NO_ENTITY"`, which holds; affordances' lists name no connections code changed. Nothing to report.

**DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`, with the stub): every ratchet key measures the same as on `tranche/T12` without this change (reach 811, rows 786, multiSiteCodes 68, untranslated 287, reachGap 32, …). The base's own failures (floors with slack, three breached ceilings) are the layer-11 re-pin's (legacy-tests), not this change's.

**Deferred:** none. **Other modules:** nothing found. **Generated artifacts:** none made stale by this change beyond what the layer close regenerates (the plane bundle includes `src/connections/`).

**Tests and checks** (on `job/T12/connections` @ the commit before this record, with the R37 stub):
- `node --test bio-plane/test/m/connections/`: tests 66, pass 66, fail 0, todo 0.
- Layer tests: none named in `build/manifest.md`. No provided service changed.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture connections`: 12 product files, 51 relative imports; 0 failures.
- `coverage connections`: 59 of 59 live requirement ids named by a test; 0 failures.
- `ownership connections tranche/T12`: 3 files changed; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_01Tpv6PUqFfj5j6NHC4X1yVi): test runs 1, module lines 2227

## J1 · COMPLETE

N285 applied: R1's NO_ENTITY is now entities.noEntity(<this act's sentence>), imported by name from src/entities/index.mjs; R1's test.todo is a full-compliance test (answer deep-equals the helper's, nothing written, no listener). R1's 'not yet met: N285' mark is met. Built against R37 as worded: this branch loads only once entities' noEntity is on tranche/T12; my run used an uncommitted local stub (66/66 pass, 0 todo; format, architecture, coverage 59/59, ownership all 0 failures). No code renamed; legacy-ui and the old battery key only on reason NO_ENTITY (unchanged). DEC-49 guard ratchets unchanged by this work. Awaiting your CHANGE to merge entities and re-run.
