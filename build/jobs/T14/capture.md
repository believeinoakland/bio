# capture (T14)

**Status** · session_01JeqPFLgSenZTbeFG1Gi4Wo · depth 2 · COMPLETE · handled B1


## Completion (CAPTURE #7)

**Entries applied** (6c6cd226bf).
- **N339 with N349 (R64).** One helper in `src/capture/ops.mjs`, `relayUnanswered(out, op, {json, storeSilent, storeRefusal})`, answers what `doAnswer` read that was not an answer, at all four relays: `linksOp` (op=links), `archiveLookupOp` (op=archivelookup), `acquireOp` (op=acquire, inside `{response}`) and `knockOp` (`src/capture/doorbell.mjs`, op=knock). The store's own refusal (`refused`, `ok: false` below 500) goes through the caller's `storeRefusal` when handed, else `json(out.reply.body, out.reply.status)`, the same answer; a reply that is no answer is `storeSilent(op, out.correlation)`. Each relay is a single store read, so there is no sub-read to weigh (K444).
- **N347 (R63, with R21 and R32).** `evidenceAbsent` answers `EVIDENCE_NOT_HELD` (reason and code); `CAPTURE_CHECKS.NOT_FOUND` is re-keyed `CAPTURE_CHECKS.EVIDENCE_NOT_HELD`, C-118.1 with its number, `where` and translation unchanged. `NO_SUCH_KNOCK` (C-118.2) keeps its code. The comments naming the old code say what it became (`checks.mjs`, `ops.mjs`, `index.mjs`).

**What legacy-index must hand at layer 11, per call site** (`src/index.mjs`; today each hands `{json, storeSilent, doAnswer}` and the relay composes the same answer itself):
- `:378` `knockOp(req, env, stub, {json, requiredArgument, storeSilent, doAnswer})`: add `storeRefusal`.
- `:675` `linksOp(url, stub, {json, storeSilent, doAnswer, viewer})`: add `storeRefusal`.
- `:687` `archiveLookupOp(req, url, stub, {json, storeSilent, doAnswer})`: add `storeRefusal`.
- `:693` `acquireOp(req, env, stub, {json, storeSilent, storageAbsent, doAnswer, cls, member, sessMember, storeName})`: add `storeRefusal`.
- `:678` `captureObjectOp` relays no store answer (it reads R2 directly); nothing to add.

**`not yet met` marks my work meets** (for BOB to strike in `build/requirements/capture.md`): R21's *(not yet met: N347)*, R63's *(not yet met: N347)*, R64's *(not yet met: N339, N349)*, and N339/N347's clause in the Status line. Observation, not struck by this job's work: R32's *(not yet met: K383)* looks met (the store's `#noSuchKnock`, one site for read and resolve, and the door answers it 404 at `src/control-plane/index.mjs`:3505).

**Check rows awaiting stamp** (R50, K408; promotion at T15's layer 2, N318): **C-118.1 re-keyed `NOT_FOUND` → `EVIDENCE_NOT_HELD`** (`src/capture/checks.mjs`, `where` `src/capture/ops.mjs evidenceAbsent > is-evidence-held`), awaiting stamp. No row added or retired.

**Found in other modules (reported, not changed).**
- **extraction** (layer 4, N347's two test lines): `test/m/extraction/pdfstructure.test.mjs`:55 and :68 pin `NOT_FOUND`; both fail on this branch (84 pass, 2 fail; 86/0 before) and read `EVIDENCE_NOT_HELD` once re-anchored. Its behaviour is right: R31 answers through `evidenceAbsent`.
- **legacy-tests** (old battery): `test/capture.test.mjs`:74 (`unknown sha is NOT_FOUND`) and `test/pdfstructure-op.test.mjs`:126 fail on the new code (each passed before). `civicos-ui/check-refusal-codes.mjs` (the DEC-49 guard, already red on the tranche with 15 failures) gains two: arm G's `MULTI_SITE_CLOSED` entry for `NOT_FOUND` (:3823) is now stale, and R3's FED half reads 91 against its floor of 92. `test/fixtures/row-census-1.43.0.jsonl`:236 keys C-118.1 as `NOT_FOUND` (the 1.43.0 census; the next stamp's census carries the new key). `test/refusal-wire`, `plane-envelope`, `doorbell` and `versiongrade` suites still pass.
- **legacy-ui** (not in T14): `civicos-ui/test/snapshot-render.test.mjs`:93, :168 and `artifact-fetch.test.mjs`:21, :44 imitate the plane's `NOT_FOUND`, as BOB named; also `add-surface.test.mjs`:260, `bound-sweep.test.mjs`:612 and `version-predecessor.test.mjs`:221 (fixture stubs answering `reason: "NOT_FOUND"`). `app.html` does not branch on it.
- **control-plane** (layer 11): N347's `MODULE_CHECK_FILES` read of `src/capture/checks.mjs` now finds `EVIDENCE_NOT_HELD` and `NO_SUCH_KNOCK`.
- **Generated artifacts made stale** (reported, not rebuilt): `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) and `agent-worker/dist/agent-worker.bundled.mjs` (`agent-worker`): `fleetbundles.test.mjs` names `src/capture/checks.mjs`, `doorbell.mjs`, `index.mjs`, `ops.mjs` as changed inputs of both. pdf-worker and ocr-worker are fresh.

**Greps.** `EVIDENCE_NOT_HELD`, `relayUnanswered`, `storeRefusal`: no hits in `civicos-ui/` or affordances' lists. `NOT_FOUND` (retired from capture): the civicos-ui hits above and the guard's `MULTI_SITE_CLOSED` entry; none in `app.html` or `src/affordances.mjs` (its one `NOT_FOUND` is content's version grade).

**Deferred.** None.

**Tests and checks** (on `job/T14/capture` @ 6c6cd226bf):
- `node --test bio-plane/test/m/capture/`: tests 75, pass 75, fail 0, todo 0. New: `relays.test.mjs` (R64: every relay with and without `storeRefusal`, refusals at 400 and 404 relayed whole, a 500 with a stack, `STORE_INTERNAL_ERROR` with and without a correlation, a non-JSON reply, a thrown fetch, a 503 refusal-shaped reply); `evidence-absent.test.mjs` gains N347's code and the sweep of the plane's `src/` for a `NOT_FOUND` refusal (a `reason`/`code` field, a refusal helper call, a `json({...})` answer, or a key of a `checks.mjs` table).
- Modules that use capture, `test/m/<module>/`: connections 66/0, retrieval 65/0, capture-requests 62/0, ratification 70/0, monitoring 52/0, scheduler 46/0, queue 60/0, instance-setup 53/0; extraction 84 pass, 2 fail (N347's two lines, above).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs capture`: 0 failures. `checks/coverage.mjs capture`: 64 of 64 live ids named, 0 failures. `checks/ownership.mjs capture tranche/T14`: 0 failures (legacy-store and legacy-index untouched).

Size (session_01JeqPFLgSenZTbeFG1Gi4Wo): test runs 27, module lines 3,101

