# extraction (T14)

**Status** · session_019uPfohVPcH6PyD4QySrBc3 · depth 2 · COMPLETE · handled B1


## Completion (EXTRACTION #6)

**Entries applied** (130a5f75a3).
- **N347 (R31).** No code change was needed: `pdfStructure` already answers an absent object through capture's `evidenceAbsent`, which capture renamed at layer 3. The two test lines are re-anchored on the new code: `test/m/extraction/pdfstructure.test.mjs`:55 (with its title) and :68 now read `EVIDENCE_NOT_HELD`. The pipeline's reads of pdf-worker's and ocr-worker's own `NOT_FOUND` (`extraction/pipeline.mjs`:86–91, :307–313) are untouched, as K445 rules.
- **N339 widened by N349 (R64, K445).** `src/extraction/ops.mjs`: `ask` no longer opens the envelope itself when it is handed the plane's `doAnswer`; both relays take `doAnswer` and `storeRefusal` from what they are handed. One local helper, `unanswered`, answers what was read that was not an answer: the store's own refusal (`refused`, `ok: false` below 500) through `storeRefusal` when handed, else `json(reply.body, reply.status)`, the same answer; a reply that is no answer, or an answer with no result, is `storeSilent(op, correlation)`. Until legacy-index hands `doAnswer` (layer 11) a local reader, `readAnswer`, reads the envelope by control-plane R23's and R25's rule, so the answer is the same either way; it goes when legacy-index hands `doAnswer`. `acquireReadingOp` is handed no `json` today, so it composes the refusal with a local `jsonAnswer` (the plane's `json` spelling without its DEC-49 decoration, which only the plane holds); that too goes at layer 11. Each relay makes a single store read, so there is no sub-read to weigh (K444).

**What legacy-index must hand at layer 11, per call site** (`src/index.mjs`):
- `:682` `pdfStructureOp(url, env, stub, {json, storeSilent, storageAbsent, requiredArgument, cls, session, caps, viewer, author, storeName})`: add `doAnswer` and `storeRefusal`.
- `:696` `acquireReadingOp(acquired.answer, stub, {storeSilent, storeName})`: add `json`, `doAnswer` and `storeRefusal`.
Then `readAnswer` and `jsonAnswer` in `ops.mjs` can go (a later extraction job).

**`not yet met` marks my work meets** (for BOB to strike in `build/requirements/extraction.md`): R31's *(not yet met: N347)*; R64's *(not yet met: N339, N349)*, met at the interface (every answer as R64 states it, with or without the helpers handed); its last sentence ("reads the store's answer through the plane's `doAnswer`") holds in production once legacy-index hands `doAnswer` at layer 11 (above). And N347/N339/N349's clause in the Status line.

**Check rows awaiting stamp.** None added, moved or retired.

**Found in other modules (reported, not changed).**
- **legacy-tests:** `bio-plane/test/pdfstructure-op.test.mjs`:126 pins `NOT_FOUND` and fails (`want "NOT_FOUND"`, `got "EVIDENCE_NOT_HELD"`); it fails identically with this job's `ops.mjs` reverted to `tranche/T14`'s, so it is capture's rename, already on legacy-tests' list (N347). `test/refusal-wire.test.mjs` and `test/acquire.test.mjs` pass.
- **legacy-index** (layer 11): the two call sites above.
- **Generated artifact made stale** (reported, not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`): `fleetbundles.test.mjs` names `src/extraction/ops.mjs` as a changed input. agent-worker, ocr-worker and pdf-worker are fresh.

**Greps.** `readAnswer`, `unanswered`, `jsonAnswer`, `storeRefusal`, `doAnswer`, `EVIDENCE_NOT_HELD`: no hits in `civicos-ui/` or affordances' lists. `pdfstructure` in `civicos-ui/`: one comment (`app.html`:5210), no branch on its answer. Nothing retired.

**Deferred.** None.

**Tests and checks** (on `job/T14/extraction`):
- `node --test bio-plane/test/m/extraction/`: tests 91, pass 91, fail 0, todo 0 (86 before, 2 of them failing on N347). New: `relays.test.mjs` (R64: both relays, each handed every helper, `doAnswer` without `storeRefusal`, and as legacy-index hands it today; refusals at 400, 404 and 413 relayed whole; through `storeRefusal` and `doAnswer` once each, the same answer as without them; a 500 with a stack is 502 with no stack and no `correlation` key; `STORE_INTERNAL_ERROR` with a correlation carries it, without one or with a malformed one or on another reason carries no key; non-JSON, an array, a thrown fetch and an answer with no result are the silence; an answer relayed as before). Three of its five fail on the old `ops.mjs`.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs extraction`: 0 failures. `checks/coverage.mjs extraction`: 59 of 59 live ids named, 0 failures. `checks/ownership.mjs extraction tranche/T14`: 0 failures (legacy-checks, legacy-store, legacy-index untouched).
- Old suites calling these handlers (for the report above): `refusal-wire` 1/1, `acquire` 1/1, `pdfstructure-op` 0/1 (N347, legacy-tests'). `fleetbundles.test.mjs`: bio-plane stale (above).

Size (session_019uPfohVPcH6PyD4QySrBc3): test runs 9, module lines 3,534

## J1 · COMPLETE

Complete at d00a061158 (record's Completion section). N347: R31 re-anchored (pdfstructure.test.mjs:55, :68 read EVIDENCE_NOT_HELD); no code change needed. N339+N349 (R64): ops.mjs relays take doAnswer and storeRefusal when handed, relay a store refusal at its status, silence with the correlation; a local reader keeps the same answer until legacy-index hands doAnswer, storeRefusal (and json for acquireReadingOp) at layer 11 (call sites :682, :696 listed). Marks to strike: R31 (N347), R64 (N339, N349; production read through doAnswer at L11). No rows. Stale: bio-plane/dist bundle. legacy-tests: pdfstructure-op.test.mjs:126 (N347, already listed). Tests 91/91; format, architecture, coverage (59/59), ownership: 0 failures.
