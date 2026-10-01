# observation-log (T21)

**Status** · session_013cUgWrip5dZGALsDxc2eyV · depth 2 · WORKING · handled B0

## Completion (OBSERVATION-LOG #7)

**Entries applied.**
- **N458** (K899 (1)): "record" for "bundle" in the text members read, re-scanned first: the scan of my paths found exactly the two named strings (identifiers, SQL, comments, `bundle_id`, `bundle.md` and the code `AI_LOG_NOT_A_BUNDLE` left as they are). `index.mjs` `registerAuthority`'s `AUTHORITY_NOT_RESOLVABLE` detail now reads "the records every other authority kind names are fixed by the observation log"; `vocabulary.mjs` C-22.6's detail "this entry names record '…'". No test pinned either; R2's test (`append.test.mjs`) and R13's (`fence.test.mjs`) now check each detail's words and that neither says "bundle" (negative control: both fail against the old source). No row's translation changed, so nothing awaits a stamp.
- **N468** (K923): `index.mjs` R32 comments (were :585, :592) say plane registers this module's figures under its name (`src/plane/stats.mjs`) and the module registers nothing itself; `figures.test.mjs` no longer names `src/plane/held.mjs` or "plane's copy": its pinned value is worded as this test's own (`pinned`, "the pinned count"), the figures unchanged. Also corrected while there: two writer notes said "the legacy store calls it until entities/connections is extracted"; they are registered by `attachMeaning`.
- **N469** (K931): `checks.mjs` C-22.10 note (`check-refusal-codes.mjs`; "Section K of `test/observation-log.test.mjs`") now points at R26's test (one code per C-22 number) and R2's C-22.10 arm in `append.test.mjs`; `vocabulary.mjs`:57 (`check-semantics.mjs`) kept as a provenance note ("deleted in T20"), the reason re-stated without it; :1439 (`check-refusal-codes.mjs`) now DEC-49 and R26's test. Re-scan beyond the list found five more live claims naming the deleted `observation-log.test.mjs` (arms B9, M4b, M3, M3b, B8, section K), each made provenance ("the old suite's arm …, deleted in T20") with the live claim pointing at the module test that proves it (R1, R11, R6 here; ai-runs' R14 test, `converts.test.mjs`, for the rollup reducer, which is ai-runs'). For `vocabulary.mjs`:112's claim that the coverage read and C-22.10 are held together by driving `checkObservation` over one matrix, no test did so: added "R1 R2 the coverage of a row and C-22.10 turn on one condition" (`vocabulary.test.mjs`). No "battery" prose in my paths.
- **Flaws fixed in my module:** `vocabulary.mjs`' reader-run note said the Durable Object does not import `docprofile` and "the store passes null": stale since `store.mjs` left (extraction, which the plane builds, uses docprofile); re-worded to what holds (the fallback fact is not on the reading this module is handed; `observeReaderRun` passes null). `checks.mjs` C-22.4 note said the condition vocabulary is `queuestate.mjs`'s; it is this module's `CONDITION_KINDS` (N174). `schema.mjs`: the fold's copy is ai-runs' migration (its R38), not `#migrate`; lead visibility is BOB #14's ruling (R15, `leadReach`), not "stated in store.mjs leadRead".

**Deferred:** none.

**Found in other modules / generated artifacts (REPORT J1):** stale: `agent-worker/dist/agent-worker.bundled.mjs` (inputs `observation-log/checks.mjs` and `vocabulary.mjs` changed; `fleetbundles.test.mjs` reports STALE BUNDLE for both) and the plane's `bio-plane/dist/bio-plane.bundled.mjs` (`index.mjs`, `checks.mjs`, `vocabulary.mjs`, `schema.mjs` changed). `release/bio-plane.bundled.mjs` holds the old strings too (distribution's). Not a module: `build/layers.md` row legacy-store still names `src/plane/held.mjs` as holding the residue (BOB's). Nothing found in another module's code.

**Tests and checks.**
- `node --test test/m/observation-log/`: tests 60, pass 60, fail 0 (was 59; one added).
- Users of the module (no service changed; sanity): run-rules 16/16, ai-runs 56/56, capture-requests 63/63, retrieval 122/122, inquiry-grammar 24/24.
- No layer tests are named in `build/manifest.md`.
- format: 86 modules, 84 requirements files; 0 failures. architecture: 14 product files, 49 relative imports; 0 failures. coverage: 32 of 32 live requirement ids named by a test; 0 failures. ownership: 9 files changed by observation-log between tranche/T21 and HEAD; 0 failures.

Size (session_013cUgWrip5dZGALsDxc2eyV): test runs 8, module lines 3134
