# progressions (T12)

**Status** · session_01X6gfmWECg3C2k8SqLBBz7h · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R27 (and Uses) says `NO_ENTITY` carries entities' row through `noEntity` (entities R37), in place of C-100.9, but B1 does not list it among my entries and entities R37 is not yet on `tranche/T12` (ENTITIES #3 runs in this same layer). Best reading: I apply B1's entries now (R35 `notADisposition`, the two renames, R19 through `extraction.noSha`) and keep C-100.9 `NO_ENTITY` minted in `#entityNamed` as today, with R27's `NO_ENTITY` clause left under a `test.todo` naming entities R37 as its cause; once entities merges, a CHANGE re-opens me to call `noEntity` and retire C-100.9 (a one-line change in `#entityNamed`). I carry on with that reading. No legacy-ui key on `NO_LABEL`/`NOT_FOUND` for progressions' ops (the `INTENT_HOLD` `NO_LABEL` at `civicos-ui/app.html`:17024 is `entitycreate`'s, entities'); `NOT_A_DISPOSITION` keeps its code.

## Completion

**Applied** (B1, N285, progressions' share; J1's reading accepted by B2).
- **R35** `notADisposition(to, extra?)` in `src/progressions/checks.mjs`, exported with `DISPOSITIONS` (now held there, the one list) from `src/progressions/index.mjs`. `null` for `deferred`/`dismissed` compared exactly (a caller trims by its own rule, as `disposeProposal` does); otherwise `{ok:false, reason, code, check, translation, to, dispositions, detail}`, `to` as given (null when absent or blank), `detail` one fixed sentence, `extra` spread first so it never replaces these. Row C-100.20, `where` `src/progressions/checks.mjs notADisposition > is-disposition-word`, translation R35's text word for word. `disposeProposal` (R21) answers through it.
- **Renames**: `NO_LABEL` → `PROGRESSION_NO_LABEL` (C-100.2), `NOT_FOUND` → `PROGRESSION_VERSION_NOT_HELD` (C-100.8), each keeping its translation, `where` and region.
- **R19**: `captureProgressions` answers a missing digest with `extraction.noSha(detail)` (R63, C-51.6); row C-100.19 retired (added to the retired-ids test).
- **Kept** (B2): C-100.9 `NO_ENTITY` in `#entityNamed`; R27's clause under `test.todo` naming entities R37.

**Strike.** Met by this work: R1's and R5's `not yet met: N285`, R35's `not yet met: N285`. R27's stays until the `NO_ENTITY` CHANGE.

**Deferred.** R27's `NO_ENTITY` through `noEntity` (waits on entities R37, B2). R32 as before (K102).

**Found (reported to BOB).**
1. Legacy suite `bio-plane/test/progression-versions.test.mjs`:196 pins `NOT_FOUND`; it fails now (passes on the parent). It is legacy-tests' to re-anchor to `PROGRESSION_VERSION_NOT_HELD`. `test/capture-progressions.test.mjs` still passes.
2. Plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (progressions' source is an input). Not rebuilt (§14).
3. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs --strict`), my change against its parent: the `PROGRESSION_CHECKS.NO_SHA`/`EXTRACTION_CHECKS.NO_SHA` identical-translation failure clears; progressions leaves arm G's `NO_SHA`, `NOT_FOUND` and `NO_LABEL` lists (multi-site codes 68 → 67). New: `NO_LABEL` is now untranslated and in reach (ratchet 32 → 33, untranslated 287 → 288), because entities still mints a bare `NO_LABEL` that used to borrow my C-100.2 row. It clears when ENTITIES #3 lands `ENTITY_NO_LABEL`. `NOT_A_DISPOSITION` stays at 3 literal sites (`store.mjs`, `inquiry`) until those later-layer jobs call R35. The floor figures (rows 785, census 1068, reach 813, governedSites 496, regions 457, regionLines 5475, outcomeReturns 261, refusalsJudged 859) are legacy-tests' to re-pin on the merged tree.
4. Legacy-ui: nothing keys on progressions' `NO_LABEL`/`NOT_FOUND`. `civicos-ui/app.html`:17024's `NO_LABEL` is `entitycreate`'s (entities). `NOT_A_DISPOSITION` keeps its code, but its `detail` is now R35's fixed sentence; `civicos-ui/test/act-proposal.test.mjs`:53 mocks the old detail text in its own fixture (no real-plane read).

**Tests and checks.**
- `node --test bio-plane/test/m/progressions/*.test.mjs`: pass 41, fail 0, todo 2 (R27 `NO_ENTITY`; R32). New: "R35" (both words null; ten other shapes each the full answer with `to` as given; one fixed detail; `extra` adds and never replaces; R21's refusal is exactly R35's; writes nothing).
- Users' tests: intent 41/0, scheduler 46/0 (todo 2), affordances 74/0 (todo 1), queue 10/0.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture … progressions`: 10 product files, 33 relative imports; 0 failures. `coverage … progressions`: 35 of 35 live ids named; 0 failures. `ownership … progressions tranche/T12`: 6 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_01X6gfmWECg3C2k8SqLBBz7h): test runs 9, module lines 1621

## J2 · REPORT

Found beyond my module (record, Completion 'Found'): (1) legacy suite test/progression-versions.test.mjs:196 pins NOT_FOUND and fails now (legacy-tests re-anchors it to PROGRESSION_VERSION_NOT_HELD). (2) Plane bundle stale; not rebuilt. (3) DEC-49 guard: NO_SHA's identical-translation failure clears and multi-site codes go 68 -> 67. But entities' bare NO_LABEL has no row now (reach ratchet 32 -> 33, untranslated 287 -> 288) until ENTITIES #3 lands ENTITY_NO_LABEL. NOT_A_DISPOSITION stays at 3 sites until store.mjs and inquiry call R35. Floors are for legacy-tests to re-pin on the merged tree. (4) Legacy-ui: no key on progressions' renamed codes; act-proposal.test.mjs:53 mocks the old NOT_A_DISPOSITION detail in its own fixture.

## J3 · COMPLETE · re B2

N285 applied: R35 notADisposition (C-100.20, R35's translation), exported with DISPOSITIONS, and R21 answers through it. Renamed PROGRESSION_NO_LABEL (C-100.2) and PROGRESSION_VERSION_NOT_HELD (C-100.8). R19 answers through extraction.noSha, and C-100.19 is retired. NO_ENTITY is kept per B2 under a test.todo. Tests 41 pass, 0 fail, 2 todo; users intent, scheduler, affordances and queue are green; format, architecture, coverage 35/35 and ownership each report 0 failures. Strike: R1, R5, R35 N285 marks. Record: build/jobs/T12/progressions.md, Completion.
