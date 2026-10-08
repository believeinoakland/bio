# Draft: T37 L2 and L3 requirement wording (for BOB)

**Status** · Worker draft for BOB #138, 2026-10-08, on `tranche/T37` @ `ba078f39ff`. Not committed. Covers T37-6, T37-7, T37-44 (L2) and T37-37, T37-38, T37-8 (L3). Read: `plan/current.md`, `requirements/README.md`, the requirement files of credentials, promotion, membership, acquisition, capture, file-safety, file-scanner, scheduler, notice-producers; K2099, K2101, K2129, K2130, K2153, K2155, K2160, K2161, K1185, K2171 (and K231); the code sites named below. Each new or amended line ends `*(not yet met: T37)*`. Row numbers are suggestions (the job's choice); every new row waits for a stamp.

---

## L2

### T37-6 · credentials

**R51 (N755; K2101, K231): replace the sentence** "`on: true` without a `reason` of 1 to 2,000 characters is refused `NO_REASON` with its row." **with:**

> `on: true` without a `reason` of 1 to 2,000 characters, or a `reason` that is not a string or is over 2,000 characters, is refused `AI_KEEP_AWAY_NO_REASON` with its row (C-29.32, its number unmoved; a code of this module's own, so progressions' `NO_REASON`, C-100.18, decorates its own row again, K231). *(not yet met: T37)*

(The code at `checks.mjs`:206 and `index.mjs`:1414 also refuses a reason over the bound with `on: false`; the sentence above states what the code does.)

**R35 (N765; K2130, K231): append:**

> (T37; N765) `aiKeptAway()`, an in-plane read reached by no route and answered to no viewer, answers `null` while the group does not keep its material away (R52's `on` is `false`), and otherwise the one `AI_KEPT_AWAY` refusal this rule answers, with its row and `keep_away: {reason, set_by, set_at}` as R52 answers them; when the setting cannot be read it answers that refusal, saying so, with the three null (fail closed, K2093). It is the one site that mints `AI_KEPT_AWAY` (K231): R35, R27 and R32 refuse through it, and every module that gates an assistant on keep-away (`instance-setup` R55, `answers`, `wizard-scripts`, `store-door`) reads it, never a copy of the condition. It writes nothing and never throws. *(not yet met: T37)*

Choice (K231, BOB's): **recommend the helper.** One site, so the row's `where` names one function (`aiKeptAway`; today `#keptAway`, a private method no other module can call) and the fail-closed reading of an unreadable setting lives once; naming a second site in `instance-setup` would put the condition, and its unreadable arm, in two modules. The row C-29.31's `where` then moves to `aiKeptAway` (a changed row for T37-7).

**The store map's read of `secretSha` (N761; K2129; rule 4). New R, next free id R53:**

> **R53** (N761; K2129) This module's ops map takes `aicredentialmint`'s `secretSha` only from the internal request's body (the control plane sets it there after removing any a caller sent, `control-plane`'s N761 requirement), never from the request's query: a `secretSha` in the query is never read. R12 then refuses a `secretSha` that is not 64 lowercase hexadecimal characters `AI_CREDENTIAL_NO_SECRET` with its row (the next free C-29 number, C-29.33), writing nothing, so a mint that carries no digest never records a credential no lookup can find. *(not yet met: T37)*

Choices (BOB's): (1) **body, not a header**, recommended: `credentialsOps(c, url, body, env)` receives no headers; a header would need `store-door`'s door to hand a fourth value on the in-process URL (its R9's `handOn`), which is the query channel this entry leaves, and the control plane already builds `aicredentialmint`'s body itself (`control-plane/index.mjs`:2807–2810) and strips `secretSha` from callers' bodies (:2156). (2) The new refusal is optional; without it a mint read from a body with no digest stores `""` today (`index.mjs`:863), silently. Recommended: keep it (fail closed; it also makes rule 4's interim red visible by name). If BOB drops it, delete R53's second sentence.

**R3 (N776; DEC-182 (4)): replace R3 whole with:**

> **R3** (was `membership` R73) `setPassword({role, password})` stores a salted, derived hash for `role`, replacing any earlier one, and never the password; it is an in-plane call reached by no route (`enroll`'s setter, R20; `recover`, R47). (T37; N776, DEC-182 (4)) `passwordChange({current, password, by, session, source, country})` (`op=setpassword`) is a signed-in member's or administrator's change of their own password. The role is the role of the live session `session` names (R5), `by` and `session` the control plane's stamps; a `role` in the body is never read. Refusals, in order, each writing nothing but its count: `MACHINE_CANNOT_SET_PASSWORD` with its row when `by` is a machine credential or an operator token; `NOT_SIGNED_IN` (R39's row) when `session` names no live session; R38's window (`SIGN_IN_PAUSED`); `PASSWORD_TOO_SHORT` under 12 characters; `CURRENT_PASSWORD_WRONG` with its row when `current` does not match that role's stored password (R41's comparison), counted toward R38's window and R44's tally (`signin`). On success, in one act, the password is set as `setPassword` sets it and every other session of that role ends, with the ask grants minted under them (R27, R39); the presenting session stays. It answers `{ok: true, role, ended}`, never either password. Neither password is logged, stored, echoed or carried in any answer. *(not yet met: T37)*

**R38: replace its first sentence's list** "`claim` (R1), `login` (R4) and `recover` (R47) are under one sign-in window" **with** "`claim` (R1), `login` (R4), `recover` (R47) and `passwordChange` (R3) are under one sign-in window", **and append to its role clause** "(the session's role for `passwordChange`)". *(not yet met: T37)*

**R44: replace** "`signin` (a refused sign-in, claim or recovery: R1, R4, R47)" **with** "`signin` (a refused sign-in, claim, recovery or password change's current password: R1, R4, R47, R3)". *(not yet met: T37)*

New rows (C-96, as R38's are; suggested C-96.45 `MACHINE_CANNOT_SET_PASSWORD`, C-96.46 `CURRENT_PASSWORD_WRONG`), each a translation in R48's words, "Nothing was changed." Rows changed or new for T37-7's stamp: C-29.32 (re-coded), C-29.31 (`where`), C-29.33, C-96.45, C-96.46.

**Status line** gains: "Last changed T37 (T37-6: R3, R35, R38, R44, R51 amended; R53 new; K2101, K2129, K2130; DEC-182 (4)); those marked not yet met (T37)." Satisfies gains "DEC-182 (4) (a member's own password change): R3, R38, R44. K231 (one code, one site): R35, R51."

**Uses:** none new (`membership` already serves `memberFacts`, `listenerRefusal`; `record-grammar`'s `isMachineIdentity`).

### T37-44 · membership

**req: none, confirmed.** R83 already says the list names every module `build/modules.json` names, built or not, held equal to the file by a test; `image-cover` (layer 1, after `pdf-pixels`) is built and merged in L1 before L2, so no "tolerated by name" arm is needed. Only the Status line moves ("T37-44: R83 re-pinned, no text change, now naming `image-cover`; K1185, K2171").

### T37-7 · promotion

**req: none, confirmed** (a stamp; R34, R50 as written). Measured on `tranche/T37` @ `ba078f39ff` by R50's own `censusRows` against `fixtures/row-census-1.63.0.jsonl` (1,470 rows): the tree holds **1,516 rows, 88 differences**, every one in `bio-plane/src`:

| owner (T36 job) | rows | change |
|---|---|---|
| admission (T36 L11) | C-38.10 `CREDENTIAL_IN_ADDRESS`, C-38.11 `MEMBER_TOKEN_RETIRED` | new |
| standards (T36 L5) | C-112.41 `FORCE_TEXT_NOT_HELD` | changed |
| standards | C-112.59 `THROUGH_INVALID`, .60 `THROUGH_NO_SOURCE`, .61 `THROUGH_AFTER_CHECK`, .62 `NO_SUCH_RECORD` | new |
| instance-setup (T36-34) | C-119.5 `ASSISTANT_OFF` | changed |
| instance-setup | C-119.6 `ASSISTANT_SWITCH_MALFORMED` | departed |
| case-authoring (T36 L8) | C-136.2 `STANDARDS_USE_REFUSED` | new |
| acquisition (T36-10; N754) | C-137.1–.19 (`ARCHIVE_NOT_HELD` … `CO_ARCHIVE_SETTING_INVALID`) | departed (re-numbered) |
| acquisition | C-139.1–.19 (the same nineteen codes), C-139.20 `NOT_AN_ARCHIVE` | new |
| file-safety (T36-11) | C-140.1 `FILE_NOT_HELD` … C-140.39 `FORWARD_PERIOD_INVALID` (39 rows) | new |

Plus T37's L1–L2 rows, after their merges: **L1 adds none** (file-scanner holds no catalogue row: `TOOL_ADDRESS_HAS_CREDENTIAL`, `providers/net.mjs`:67, is a fleet member's wire code, outside R50's census; image-cover's refusals are module-local, as image-codecs' are: its R1, R3, R4, R7 name `DctRefusal`/`Jbig2Refusal`/`JpxRefusal` codes and no census table, and the census finds no row under `pdf-worker/`). **membership adds none.** **credentials:** C-29.32 departs as `NO_REASON` and arrives as `AI_KEEP_AWAY_NO_REASON`; C-29.31 changed (`where`, if the helper is taken); new C-29.33 `AI_CREDENTIAL_NO_SECRET` (if kept), C-96.45 `MACHINE_CANNOT_SET_PASSWORD`, C-96.46 `CURRENT_PASSWORD_WRONG`.

Also the stamp's own share: `gate.mjs`:757–758's 1.63.0 narration re-worded C-137.1–.19 → C-139.1–.19 (N754); `CATALOG_VERSION` and `ROW_CENSUS` move (1.64.0); the fixture becomes `row-census-1.64.0.jsonl`. Not stamped here: rows T37's L3–L11 jobs add (file-safety's below among them), T38's (P4). Note: the plan's "installer's new rows" do not exist in the census (installer's paths hold no row); only instance-setup's two.

---

## L3

### T37-37 · acquisition

**R44 (N774; K2155): replace its first sentence** "`acquire` takes `reputation`, … nothing in a body supplies it." **with:**

> `acquire` takes `reputation` from its caller (`opts.reputation`, else the store handed in, capture R73): a `url_reputation` tool spec (`file-scanner` R21), null, or a reader, a function answering either or a promise of either; with the `FILE_SCANNER` binding it reaches the scanner through, beside the store handed in, as it takes `ownHosts` (R42); nothing in a body supplies it. A reader is called once for each acquisition, before the lookup, and awaited within the lookup's bound (`REPUTATION_TIMEOUT_MS`), so the tool is read at each acquisition, never once at start (`plane` R29); a reader that throws, rejects, outlasts the bound or answers anything but a spec or null is recorded as no answer, `unanswered` `TOOL_UNREADABLE`, never as `listed: false`. *(not yet met: T37)*

The rest of R44 stands. **Uses:** none new. (`TOOL_UNREADABLE` is a receipt value, not a refusal; no row.)

### T37-38 · capture

**R73 (N774; K2155): append:**

> (T37; N774) `captureOf`'s options `reputation` (a reader of the reputation tool, as `acquisition` R44 takes it) and `fileScanner` (the `FILE_SCANNER` binding) are kept on the instance and handed to `acquisition` with the store: the instance exposes `fileScanner`, and `reputation` as a function that calls the reader at each call and answers what it answers (null when no reader was handed in), so the plane's per-call reader (`plane` R29) reaches every acquisition. Each is adopted from the first caller that supplies it and, once supplied, a later caller supplying another is refused as R58 refuses an `env` that differs. *(not yet met: T37)*

**Uses:** none new. (See Ambiguities 4 on R58's comparison of a function.)

### T37-8 · file-safety

Today's highest id is R38; new ids from **R39**. New refusals take the next free C-140 numbers (suggested C-140.40–.42).

**R15 (N771, N762; K2155, K2160, K2130): replace whole with:**

> **R15** `scanFindings({after?, since?, limit?, viewer})` → `{ok: true, findings: [{captureSha, note_id, tool, engine, findings, at, held}], cursor, truncated}`: every `found` note (a `copy` note excluded) in the order written, after `after` (a cursor this read answered), at most `limit` (default 200, clamped to 1–1,000), for the notices of a finding; no member is named. With `since` (an instant), only notes whose `at` is at or after `since` are answered, the order, `after`, `limit` and `cursor` unchanged; a `since` that is not an instant answers no finding and says so (`since_invalid: true`), as `following` R21's. `held` is `true` exactly when an open hold (R16, not released under R17–R19) covers that note's finding names at the call, read in the same synchronous call, else `false`. `cursor` is the last note answered when more follow (`truncated` true), else null. A note on a capture the viewer may not see is left out. It writes nothing and never throws. *(not yet met: T37)*

**R31 (K2160): replace** "`securityToolEvents({after, viewer})` (administrators) lists `{tool_id, event, at}` for each such switch, each test and each add or removal, for the administrators' notice; no file is named in an event." **with:**

> `securityToolEvents({after?, limit?, viewer})` (administrators) → `{ok: true, events: [{tool_id, event, at, reason}], cursor, truncated}`, one per switch off, test, add and removal, in order, after `after`, at most `limit` (default 200, clamped to 1–1,000), for the administrators' notice; `reason` is the tool's `off_reason` (`PRIVATE_MODE_NOT_HONOURED` today) for a switch off, else null; `cursor` is the last event answered when more follow, else null. No file is named in an event. *(not yet met: T37)*

**R27 (N777; K2161): append:**

> (N777) Each offered entry, a generic template's included, carries its `config` list as `file-scanner` R29 answers it (`[{name, label, required}]`, an empty list when the tool reads none), so a settings page asks each field by name. *(not yet met: T37)*

**R28 (N777; K2161): insert after** "for a generic template, `file-scanner.validateDescriptor`'s refusal of the descriptor it makes;" **:**

> `CONFIG_MISSING` naming the field, when a `required` field of the entry's `config` list (R27) is absent from `config` or empty; `CONFIG_UNKNOWN` naming the field, when `config` holds a field the list does not name (`host` and `region` excepted, which R28 reads as the tool's host and region); *(not yet met: T37)*

(`securityToolAdd`, `index.mjs`:919–940, copies any `config` today. Rows: C-140.40 `CONFIG_MISSING`, C-140.41 `CONFIG_UNKNOWN`, this module's own (R2's rule); `file-scanner` R21's same-named `CONFIG_MISSING` is a wire code with no row, so no row is shared.)

**R12 (K2153 (2)): append:**

> (T37) `renderBatch`'s answer is `{ok: true, rendered, failed, none, data, copies: {made, failed, queued}, remaining}`, `copies.queued` the safe copies still queued after the batch and `remaining` the files still queued to render. *(not yet met: T37)*

**R36 (K2153 (4)): append:**

> (T37) It answers `{ok: true, started, polled, done, running, queued}`, `running` and `queued` the checks left in each state; when its checks cannot be read it answers `DEEPER_CHECKS_UNREADABLE` with its row (C-140.42), starting and asking nothing, never counts of null. *(not yet met: T37)*

**R33 (N753; K2099): append:**

> (N753) The copy's scan reads it where it is stored (`file-scanner` R2's `area: "derived"`, `${store}/derived/<sha>`); a `clean` verdict releases it (`safeCopy` serves it), and a `found`, `unknown` or `not_scanned` verdict withholds it (`SAFE_COPY_WITHHELD`). *(not yet met: T37)*

**New R39 (N762; K2129, K2153): its own cadences.**

> **R39** (N762; K2129, K2153) This module states when each of its batches next wants to run, from its own durable state, so the scheduler holds no interval for it (`scheduler` R7, R24). `scanWake(now)`, `renderWake(now)`, `deeperWake(now)`, `forwardWake(now)` and `reputationWake(now)` each answer an instant, the batch's due and wake alike, or null when it wants none: **scan** (R4), null with no scanner bound or no file held, `now` while the last `scanBatch` answered `remaining` above 0, else the later of the earliest instant a file falls due (R4) and the last `scanBatch` plus `SCAN_EVERY_MS` (86,400,000, R4's "daily"); **render** (R12, R33), null while no file's view and no safe copy is queued, else the later of `now` and the last `renderBatch` plus `FILE_SAFETY_POLL_MS` (300,000); **deeper** (R36), null while no check is queued or running, else the earliest of the last `deeperBatch` plus `FILE_SAFETY_POLL_MS` for a queued check and each running sandbox's next poll (`poll_after_ms`), never before `now`, and the last `deeperBatch` plus `FILE_SAFETY_POLL_MS` while its checks cannot be read; **forward** (R35), null while no tool of kind `log_sink` is `on`, else the start of the first whole UTC hour after the end of the last period forwarded with `ok` (at the first, the start of the current hour); **reputation** (R41), null while no tool of kind `url_reputation` is `on` with a local list, else the last refresh that answered `ok` plus `REPUTATION_REFRESH_MS`, or `now` when none has. The instants each reads (each batch's last run, the last period forwarded, each list's last refresh) are kept in this module's own tables and survive a restart. Each writes nothing and never throws. `SCAN_EVERY_MS`, `FILE_SAFETY_POLL_MS` and `REPUTATION_REFRESH_MS` are exported (R21). *(not yet met: T37)*

**R35 (N762): append** (so the forward period is this module's, not the scheduler's):

> (T37) Called with neither `from` nor `to` (the scheduler's wake), it forwards the period from the end of the last period it forwarded with `ok` (never more than 24 hours back; at the first, the start of the previous whole UTC hour) to the start of the current whole UTC hour, records that end when it answers `ok`, and answers `{ok: true, sent: [], failed: [], record: null}` when that period is empty, so no period is sent twice. *(not yet met: T37)*

**New R40 (N762): the arming notice.**

> **R40** (N762) `onFileWork(module, fn)`: a later module registers once at start (a second registration by one module, or a `fn` that is not a function, is refused through `membership.listenerRefusal`, its R81, `LISTENER_DECLARED` or `LISTENER_MALFORMED`). After an act commits that gives a batch of R39 work sooner than its last answer (a receipt queued, R1; a deeper check queued, R13; a safe copy queued, R33; a tool switched `on`, R29), every registered `fn` is called once with `{batch, at}`, `batch` one of `scan`, `render`, `deeper`, `forward`, `reputation` and `at` that batch's R39 instant. A listener that throws or rejects changes nothing of the act or its answer. No call names a member, a file or a viewer (R10). *(not yet met: T37)*

**New R41 (N762; file-scanner R26): the reputation list refresh.**

> **R41** (N762; S12; `file-scanner` R26) `refreshReputationLists({at})`, an in-plane call reached by no route (the scheduler's wake), asks `file-scanner`'s `POST /provider/refresh` for each `on` tool of kind `url_reputation`, with that tool's spec and credentials as R34 hands them (read from `credentials` for that call only) and nothing else, and answers `{ok: true, refreshed: [{tool_id, list_version, fetched_at}], failed: [{tool_id, code}], skipped: [tool_id]}`: a tool answering `NO_LOCAL_LIST` is skipped and not asked again until it is tested again (R29); a failed refresh is named and keeps the last good list (`file-scanner` R26). With no scanner bound it answers `SCANNER_ABSENT` and asks nothing. It writes no note, names no file, address or member (R23), and never throws. *(not yet met: T37)*

**R21: replace with:**

> **R21** Exported by name: `RESCAN_INTERVAL_MS` 604,800,000; `DEEPER_CHECK_FRESH_MS` 86,400,000; `DEEPER_CHECKS_PER_MONTH` 900 (a tool's default `monthlyLimit`); `SCAN_EVERY_MS` 86,400,000, `FILE_SAFETY_POLL_MS` 300,000 and `REPUTATION_REFRESH_MS` 21,600,000 (R39; T37); `SCAN_BATCH_MAX` and `LOG_COUNT_KINDS` (`file-scanner`'s). *(not yet met: T37)*

(`REPUTATION_REFRESH_MS` is BOB's under K1881's rule for cadences: 6 hours recommended, a quarter of `file-scanner`'s `REPUTATION_LIST_MAX_AGE_MS`, 24 hours, so three refreshes can fail before R25 answers `REPUTATION_LIST_STALE`.)

**Uses:** add to `membership`: "`listenerRefusal` (R81, for R40)". No `modules.json` edge is new (file-safety already uses `membership`, `credentials`, `file-scanner`; `scheduler` and `notice-producers` already use `file-safety`).

**Status line:** "Last changed T37 (T37-8: R12, R15, R21, R27, R28, R31, R33, R35, R36 amended; R39–R41 new; K2099, K2129, K2130, K2153, K2155, K2160, K2161)". Satisfies gains "K2153, K2155, K2160 (the scheduler's and notices' reads): R12, R15, R31, R36, R39–R41."

---

## `modules.json` edges

- None missing for these six entries.
- `promotion`'s `tests` names `bio-plane/test/fixtures/row-census-1.63.0.jsonl`: T37-7's re-pin must rename it (`row-census-1.64.0.jsonl`), a `modules.json` edit BOB makes at T37-7's START or merge (ownership fails otherwise).
- For later entries (not this draft's, noted): `wizard-scripts` does not use `credentials`; T37-25 reading `aiKeptAway` needs that edge (or reads it through a module it uses). `answers`, `store-door`, `instance-setup` already use `credentials`.

## Ambiguous, for BOB

1. **`secretSha`'s channel** (rule 4 says "body or a header"): this draft fixes the body for credentials. The same choice serves ratification, case-authoring, review, filing-templates and store-door (T37-19, -21, -22, -23, -32) and control-plane's new R (T37-33); one choice for all six keeps control-plane to one send. If BOB picks a header, `store-door` R9 gains a fourth handed header and every owner's wording changes with it.
2. **`passwordChange` vs `setPassword`**: this draft keeps `setPassword` as the in-plane setter (enroll, recover) and gives the op a new service name. The plan's wording ("`op=setpassword` becomes a member's own password change") would allow re-shaping `setPassword` itself; that breaks R20's setter, so a new name is recommended. Whether an administrator may still set *another* member's password through any op: this draft says no (recovery codes, R47, and enrolment cover it); DEC-182 (4) names only the own change.
3. **file-safety's cursor at the end**: following R21's rule (null when nothing more follows) is adopted, per K2160. A poller then resumes by `since` (R15) or its own last `note_id`/`at`, not by the cursor; `notice-producers` R14 (T37-28) must read so. The window R14 reads with `since` (90 days, as R13?) is T37-28's, but note: a finding older than the window is no longer re-read, so its item cannot leave on `held: false`; R14 should say whether such an item stays until disposed of.
4. **capture R58 and a reader function**: a reader is a fresh closure at each `captureOf` call (`plane/store.mjs`:375 passes `() => fileSafety.reputationTool()`), so "another" is every later supply. The plane supplies it once per object, so the throw is safe there; tests calling `captureOf` twice with readers would throw. Alternative: adopt the first and ignore later ones (as `ownHosts` is compared by value, a function cannot be).
5. **scan cadence**: R39 keeps the daily batch (the scheduler's `FILE_SCAN_EVERY_MS` moved here), so a new capture waits up to a day for its first routine scan (R8's on-demand scan before first opening covers opening). Scanning as soon as a file is queued would be `scanWake` = earliest due; BOB's.
6. **The scheduler share (T37-24)**: R39–R41 add a fifth consumer, the reputation refresh (`file-reputation`, key `filereputation`), beside R24's four, and R24's registration with `onFileWork`; scheduler R2's key list gains all five (K2153 (5)). T37-24's wording must name it; the plan's T37-24 names four keys.
7. **`config` and a generic template**: today `securityToolAdd` reads `host`, `region` and (for a generic template) `engine_family` and `handling` out of `config` (`index.mjs`:931–935; `file-scanner/src/providers/catalogue.mjs`:240–244). Whether those are fields of R19's `config` list is T37-5's (L1); R28's `CONFIG_UNKNOWN` exception names only `host` and `region` and must match what T37-5 lists. Check at T37-8's START.
8. **R11's safe view and the derived scan**: T37-5's text says file-scanner scans "R11's safe view" in the derived area, but file-safety R12 never asks for a view's scan and serves views unscanned (they are rendered page images). This draft adds no view scan; BOB confirms that only R33's copy is scanned.
9. **`DEEPER_CHECKS_UNREADABLE`'s wake**: R39 keeps polling at `FILE_SAFETY_POLL_MS` while the checks cannot be read (so a passing fault does not strand queued checks); SCHEDULER #30 J1 (4) called that a needless poll. The alternative is null (then only a producer or a restart re-arms).
10. **T37-7's stamp and credentials' `where`**: if BOB takes the helper, C-29.31's `where` moves to `aiKeptAway` in T37-6, inside L2, so it is stamped by T37-7; `instance-setup`'s `ASSISTANT_OFF` (C-119.5) retiring at T37-30 (L11) is T38's departure.
