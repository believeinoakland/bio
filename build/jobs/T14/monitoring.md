# monitoring (T14)

**Status** · session_018U5XyRWoqFTg8mE97Ju4Dc · depth 2 · WORKING · handled B2

## Completion (MONITORING #6)

**Entries applied.**
- N330, R47 `archiveEligible(now)` (`src/monitoring/index.mjs`, beside R32): R20's own read of `source_reachability` (rows at `floor()`, oldest failing run first) taken one past `MONITOR_TICK_BATCH` (50), each asked `capture.sourceReachability`; the `fallback_eligible` ones answered `{address, first_failure_since, reachability}` (capture's answer whole), with `limit` 50, `truncated` (a 51st at the floor) and `paused` (R30) beside them, never emptying them. Writes nothing. Never throws: a failed read answers `ok: false, reason: null` with a sentence (no bare code of this module's, DEC-49, as N297 ruled for `#markOverdue`).
- N330, R48 `flagged({viewer, limit})`: every bundle whose projection has `monitor_enabled = 1` (K472, answering J1), joined to its `bundle.md` in `files` (record-core's read contract, as `driveShells` reads it), with membership's `viewerPredicate` inside the SQL, read in id order in pages of 200; lists `{bundleId, source_status, since}` where `reeval_pending.flag` is true and `source` is `source_status`, until one past `limit` (1–200, default 200, new export `FLAGGED_LIMIT_MAX`), so `truncated` is over flagged visible documents, never ids (K391). Writes nothing; never throws (as R47).
- N339 with N349, R49: `monitorOp` (the `monitor` relay) takes an optional `storeRefusal`; a `refused` answer from `doAnswer` is relayed through it, or, when none is handed, as `json(out.reply.body, out.reply.status)` (the same answer); a silence is `storeSilent("monitor", out.correlation)`. The malformed-body silence (answered, wrong shape) stays `storeSilent("monitor")`.

**For legacy-index at layer 11, per call site.** `src/index.mjs`:736 (`op === "monitor"`, the only caller of `monitorOp`): add `storeRefusal` to what it hands (`{json, storeSilent, storeRefusal, requiredArgument, doAnswer, …}`). Until then the relay answers a refusal identically without it.

**`not yet met` marks my work meets:** R47 *(N330)*, R48 *(N330)*, R49 *(N339, N349)*, for BOB to strike.

**Rows awaiting stamp.** None: no check row added, moved or retired.

**Found elsewhere (REPORT).**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (holds monitoring's source); not rebuilt.
- `civicos-ui/` and affordances' lists: no hit for `archiveEligible`, `flagged`, `FLAGGED_LIMIT_MAX` or `storeRefusal`.
- No routes were added for R47/R48: `queue` reads them in process at layer 11. Say if queue needs a store route.

**Deferred.** Nothing.

**Tests and checks.**
- `node --test test/m/monitoring/`: tests 71, pass 65, fail 0, todo 6 (the six todos are the standing not-yet-met ids, unchanged). New: `queue-reads.test.mjs` (R47 ×4: eligibility and order, agreeing with `archiveTick`; a 51st address gives `truncated`; paused still lists with `paused`; never throws. R48 ×6: listing and shape; `limit` and `truncated`; paging past 200 unflagged documents; a hidden flagged document neither listed nor counted; a `restyled` verdict (docprofile's calendar, header moved) is not flagged, with a substance change as the negative control; never throws) and `relay.test.mjs` (R49 ×3, over stubs in control-plane R23/R25's shapes: 400 `BAD_JSON` relayed at 400 through `storeRefusal`, and the same without it; 500 `{ok:false, error}` gives 502 `STORE_DID_NOT_ANSWER` with no stack and no `correlation` key; 500 `STORE_INTERNAL_ERROR` with a correlation gives 502 carrying it; answers still relayed). The two R49 refusal/silence tests fail against the old `monitorOp` (checked by stashing the source).
- Users re-run: `test/m/scheduler/` tests 48, pass 46, todo 2, fail 0; `test/m/queue/` tests 61, pass 60, todo 1, fail 0.
- Layer tests: none named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture monitoring`: 12 product files, 59 relative imports; 0 failures. `coverage monitoring`: 48 of 48 live requirement ids named by a test; 0 failures. `ownership monitoring tranche/T14`: 0 failures.

Size (session_018U5XyRWoqFTg8mE97Ju4Dc): test runs 9, module lines 2409

## J1 · QUESTION

R48 'the monitored documents (R32's addresses' documents)': my best reading, which I am building on: every bundle whose projection has monitor_enabled = 1 (every version R15 groups into R32's addresses, not only the version each address checks), since a flag an older version still carries is still an open flag for a member; and a bundle scheduled as itself (R15's lone subject) is included the same way. Visibility is membership's viewerPredicate in the SQL, so a hidden document is never read, listed or counted. The alternative is to list only the current version per address (R32's rows' bundle). Carrying on with my reading.
