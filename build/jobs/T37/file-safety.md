# file-safety (T37)

**Status** · session_012hj83mp9G2GYcwFaSkn8TU · depth 2 · COMPLETE · handled B2

## Completion

**Entry applied: T37-8 (N771, N762, N753, N777; K2099, K2129, K2130, K2153, K2155, K2160, K2161, K2175; readings K2188).** Every T37 mark in `build/requirements/file-safety.md` is met:
- **R12** `renderBatch` answers `{ok, rendered, failed, none, data, copies: {made, failed, queued}, remaining}`; `copies.queued` and `remaining` are counted after the batch.
- **R15** `scanFindings({after?, since?, limit?, viewer})`: `since` (ms or a `Date.parse`-readable string) keeps notes at or after it; a `since` that is no instant answers `{findings: [], cursor: null, since_invalid: true}` (as `following` R21). Each finding carries `held`, true when an open hold of that capture (not released; `pending_second` still holds) names any of its finding names (K2188 (3)), read in the same synchronous call. `cursor` is the last note answered when more follow, else null. `limit` default 200, clamped to 1–1,000 (0 or below is 1). The route `op=scanfindings` passes `since`.
- **R21** `FILE_SAFETY_POLL_MS` 300,000 and `REPUTATION_REFRESH_MS` 21,600,000 exported.
- **R27** each offered entry carries `config: [{name, label, required}]` from `file-scanner`'s descriptor (a template's names `engine_family` and `handling`, required).
- **R28** `CONFIG_MISSING` (a required field absent, null, blank, `[]` or `{}`) and `CONFIG_UNKNOWN` (a field the entry does not name), each naming `field`, writing nothing; `host` and `region` are read out of `config` first as the spec's own fields. Checked after the descriptor's own refusal, before `HANDLING_NOT_SHOWN`.
- **R31** events carry `reason` (the `off_reason` for `switched_off`, else null; a new `fs_tool_events.reason` column, added to an older store by `migrate`); `cursor` null once nothing follows; `limit` as R15.
- **R33** a flaw fixed: the copy's `/scan` named `area: "derived"` on the request body, which `file-scanner` R2 (`store.mjs` `normaliseTarget`) reads per target, so every copy was read from `captures/` and withheld. It now sends the area on the target. A clean verdict releases the copy; found, unknown and not_scanned withhold it (tested; the fixture answers `NOT_FOUND` to a copy target with no area).
- **R35** with neither `from` nor `to`, the period is the module's own: from the kept end (at most 24 h back; at the first, the previous whole UTC hour) to the current hour's start. The end is kept on `ok: true`, even with a tool in `failed` (K2188 (4)). An empty period answers `{ok: true, sent: [], failed: [], record: null}`. An explicit period keeps nothing.
- **R36** `deeperBatch` reads its queued and running checks first; if they cannot be read it answers `DEEPER_CHECKS_UNREADABLE` (C-140.42), starting and asking nothing, and never counts of null.
- **R39** `scanWake`, `renderWake`, `deeperWake`, `forwardWake`, `reputationWake` (now in ms or ISO, answer epoch ms or null; K2188 (2)), read from the new table `fs_wakes` (group row, purge-exempt, declared), so they survive a restart. Retry floor (K2188 (1)): a file already due at the last `scanBatch` (sent and not resolved, or the batch refused) waits at least `FILE_SAFETY_POLL_MS` after it; a file queued after it is due at once; `remaining` > 0 answers `now`; a reputation tool whose last refresh failed waits a poll after that try. `scanWake` is never before `now`; `forwardWake` is the exact hour start. Each writes nothing and never throws.
- **R40** `onFileWork(module, fn)` through `membership.listenerRefusal`. A receipt that queues a new file arms `scan` (`now`) and `render`; a queued deeper check arms `deeper`; a tool switched on arms `forward` (log sink) or `reputation`. Each fires only when sooner than the batch's last answer (any wake call updates it), with `{batch, at}`, through record-core's `afterCommit` (R66), so after the outermost commit and never on a rollback. A throwing or rejecting listener changes nothing.
- **R41** `refreshReputationLists({at})`: `POST /provider/refresh {tool: spec}` per `on` url_reputation tool. Answers `{ok, refreshed, failed, skipped}`. `NO_LOCAL_LIST` is kept and skipped until the tool is tested again (`securityToolTest` clears the mark). A failed refresh is named by its `code` or `error`. With no scanner bound, `SCANNER_ABSENT` and nothing asked.

**New refusal rows (await T38's stamp, rule 6's red 2):** C-140.40 `CONFIG_MISSING`, C-140.41 `CONFIG_UNKNOWN` (both `securityToolAdd > is-config-named`), C-140.42 `DEEPER_CHECKS_UNREADABLE` (`deeperBatch > is-deeper-readable`). No other module's family holds these codes (`rows.test.mjs` R2/R24 test).

**Tests:** a new `wakes.test.mjs` (R39 ×3, R40), a new R35 (T37) and R41 test in `tools.test.mjs`, and R12, R15, R21, R27, R28, R31, R33, R36, R23, R25 extended to the whole of each requirement. The fixture's scanner now reads `area` per target, as `file-scanner` R2 does, and answers `/provider/refresh`.

**Deferred:** nothing. Two notes, not flaws in a requirement: (a) safe copies queued under a routine CDR tool that is later switched off stay `queued`, so `renderWake` keeps polling every 5 minutes while they remain (R39 as worded). (b) A `deeperBatch` that fails after starting some checks also answers `DEEPER_CHECKS_UNREADABLE`, with `started` and `polled` beside it; its translation says none was started, true only for the unreadable read it guards.

**Found in other modules:** the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (not_product's artifact) bundles file-safety and is stale from this change; BOB regenerates it at the layer close. Nothing else.

**For the users after me:** scheduler (T37-24) can read the five wakes and register with `onFileWork`. Its tests that pin today's intervals: none turned red at my merge (scheduler 109/5 here and on the base; the 5 are census item 17's `plane.test.mjs`). notice-producers (T37-28): `since`, `held`, null cursor. setup-page (T37-43): the `config` lists.

**Reading set:** START's measure 539 KB. My measure: requirements 32 KB; my code and tests 263 KB (src 143 KB after the change); with the used services, over 300 KB, so path (3). I read whole, myself:
- the requirements; layer 3's row of `build/layers.md`; plan T37's "Rules at the opening" (with item 17, K2189) and T37-8; K2099, K2129, K2130, K2153, K2155, K2160, K2161, K2175; the draft's file-safety section and "BOB's review";
- **every file** under my `paths` and `tests` (so no worker summary was needed);
- the used services this entry touches: `file-scanner` R2, R19, R21, R26, R29 and their code (`providers/catalogue.mjs`, `store.mjs` `normaliseTarget`, `providers/routes.mjs` `providerRefresh`, `providers/reputation.mjs` `refresh`); `membership` R81 (`listenerRefusal`); record-core R66 (`afterCommit`); `provenance.onReceipt`/`recordReceipt` (its transaction); `following` R21's `since_invalid` (the shape R15 cites); and scheduler's file-safety consumers (`scheduler/index.mjs` :265–330), to fit the instant's form.

**Tests run** (on `job/T37/file-safety` after merging `tranche/T37` @ `7b3a7b26c3`, with ACQUISITION #14):
- `test/m/file-safety/`: 49 pass, 0 fail.
- Users: notice-producers 73/0; answer-envelope 27/0; store-door 38/0; control-plane 180/0; `test/system/migrate-released.test.mjs` 1/0.
- Users that are red, the same before my change, each red named in the plan:
  - scheduler 109/5: `plane.test.mjs`, census item 17 (T37-24). Same 109/5 on the base without my change.
  - setup-page 76/5: `worker-page.test.mjs`, item 17 (T37-43).
  - op-declarations 103/3: rule 6's red 11.
  - plane 140/3: `release.test` R19 ×2 (red 7) and `worker.test.mjs`:43 (item 17, T37-48).
  - affordances 188/29: `plane.test.mjs` ×27 and `t36.test.mjs`:36 (item 17, T37-27), plus `t36-backing.test.mjs`:75 (red 14).
- **Red from my merge, rule 6's red 2:** `test/system/row-census.test.mjs` names exactly my three new rows as "arrived with no record" (C-140.40 `CONFIG_MISSING`, C-140.41 `CONFIG_UNKNOWN`, C-140.42 `DEEPER_CHECKS_UNREADABLE`). They await T38's stamp.
- No layer tests are named in the manifest.

**Checks** (process repository):
- `format: 136 modules, 135 requirements files; 0 failures`
- `architecture: 15 product files, 62 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 41 of 41 live requirement ids named by a test; 0 failures`
- `ownership: 12 files changed by file-safety between tranche/T37 and HEAD; 0 failures`

**P6:** the module's own code is 2,250 lines (`src/file-safety/`, was 1,971 at the START), and its tests are 2,195 lines.

Size (session_012hj83mp9G2GYcwFaSkn8TU): test runs 26, module lines 2,250

## J1 · QUESTION

Four readings I am building on (T37-8); I carry on with each unless you answer otherwise.

1. **R39 retry floor (no hot loop).** As worded, `scanWake` answers a past instant (so the scheduler runs at every firing) for a file the scanner keeps answering `not_scanned` (`TOO_LARGE`, `SIGNATURES_STALE`), since R4 keeps such a file due, and while `/scan` is unreachable; `reputationWake` likewise after a failed refresh (its last `ok` refresh plus 6 h stays in the past). My reading: a file already due at the last `scanBatch` (sent and not resolved, or the batch refused) falls due for the wake no sooner than that batch plus `FILE_SAFETY_POLL_MS`; a file queued after the last batch is due at once (`now`), and `remaining` above 0 still answers `now`. For reputation, a tool whose last refresh failed is due no sooner than that attempt plus `FILE_SAFETY_POLL_MS`. R4's own due rule is unchanged.
2. **The instant's form.** Each wake takes `now` as epoch milliseconds or an ISO string, and answers epoch milliseconds (the scheduler's own form, `scheduler/index.mjs` `due(now)`), or null; R40's `at` is the same number. `scanWake` is never before `now` ("at once"); `forwardWake` is exactly R39's hour start (at the first, the current hour's start, which may be before `now`).
3. **R15 `held`.** `true` when an open hold (not released) of that capture names any of the note's finding names.
4. **R35 "records that end when it answers ok".** Recorded whenever the answer is `ok: true`, even if a log tool is in `failed` (re-sending would send the period twice to the tools that took it).

Also, for T37-24: `onFileWork` listeners are called through record-core's `afterCommit` (R66), so after the outermost transaction commits.
