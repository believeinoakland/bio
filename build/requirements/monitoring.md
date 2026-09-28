# monitoring — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 10. Code today (measured on `tranche/T3` @ `edbd39bb`; `store.mjs` 49,817 lines; `build/extraction/monitoring.md` has the table): `bio-plane/src/store.mjs` 16935–17009 (`driveShells`), 46072–46214 (`monitorObservationFor`, `recordMonitorLook`, `#recordMonitorAddressType`), 47030–47700 (the archive-monitor tick `#monitorTickMs` … `#monitorTick`, the idempotence key `#tickRunning`, `#openTickEpoch`, `#closeTickEpoch`, `#claimFire`, the cadence `MONITOR_CADENCE_MS`, `CONTRACT_FREQUENCY`, `monitorIntervalMs`, `#monitorSubjects`, `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick`, `#fireMonitorTick`, `#fireArchiveFallback`), the store routes `driveshells` and `monitorlook`. `bio-plane/src/index.mjs` 3044–3136 (`monitorCadence`, `monitorAssess`, `monitorRecordLook`) and 10304–10914 (`op=monitor`). `bio-plane/checks/bio-checks.mjs` 5277–5280 and 5664–5733 (C-18.5, `checkGatheringGrammar`; K49) and the rows C-48.8, C-48.9 (11254–11286). `schema.mjs`: `monitor_fired`, `monitor_tick_epoch` (1860–1901), `monitor_address_type` (3885–3905). `from`: `legacy-store`, and (proposed, map §5.1) `legacy-index` and `legacy-checks`. Not yet met: R17, R18 (K102), R23 (K102), R25, R28–R35 (R29 and R33 K102), R45 (K102). No old-plan row is carried to `monitoring`. N63 and N65 (2) folded by a drafting worker for BOB #43, 2026-09-26: R44, not yet met; the credential named as `runtime-limits.unattendedCredential`. Uses' `capture` line gains the `source_reachability` read contract (N166, K206's P4) by a worker for BOB #53 (K214).

**Size (P6).** About 1,760 lines move (about 970 without comment-only and blank lines): `store.mjs` 889 (464), `index.mjs` 704 (423), `bio-checks.mjs` 74 (64), `schema.mjs` 63 (23). R28–R35 are new work on top. Well under 4,000.

## Public

### Purpose

The daemon's watch over what the group's standing intent names: it checks each monitored document at its own cadence and records what it saw as a look and a mechanical tick, never deciding what a change means (Intake Doctrine §4, §6); it fires the archive fallback for a source that has stopped answering; it names Drive baselines that are shells; it guards the gathering grammar. It is to watch, too, the clocks of the group's actions and what its objectives and findings rest on (`layers.md`, layers 7 and 9).

### Provides

Terms. A **tick** is one check of one monitored document. A **look** is the observation-log row a tick writes. The **floor** is the smallest consecutive-failure count from which an address could still become fallback-eligible (`max(1, min(failures, minForAge))` of `capture.reachabilityThresholds`, 2 by default).

**monitor({bundleId, actor}) → answer** (`op=monitor`; classes admin, member, probe, daemon; mutating)
- **R1** Refusals, in order, each writing nothing: no `bundleId` is the required-argument refusal; a bundle absent or invisible to the actor is `ABSENT`, identically; a store that does not answer is named as silent, never `ABSENT`; `NOT_MONITORED` when `monitoring.enabled` is not `true`; `NO_LOCATOR` when `source.locator` is not a public https locator; a Drive address that is a folder, a file of undetermined kind or an unrecognised shape is `DRIVE_FOLDER_NOT_A_DOCUMENT`, `DRIVE_KIND_UNDETERMINED`, `DRIVE_SHAPE_UNRECOGNISED`, each with its catalogue row.
- **R2** The tick fetches the export address of a harvestable Drive document and the locator otherwise, through `host-governor`. A governed refusal answers `HOST_COOLING_OFF` with `retry_in_ms`, writes a governed look (R11) and nothing else.
- **R3** The baseline is the bundle's register row naming the Drive export address (harvestable Drive only), else the row whose locator is the bundle's locator, else a row whose `archive.org` hop names this document address (normalised). For a rendered capture the baseline is the pair's shell digest, or none (stated), never the rendered digest. An unparsable register gives no baseline.
- **R4** 404 or 410 is `removed`. Any other non-success, or a fetch that fails, is unreachable: no status, the reason stated. A Drive export answered as `text/html` or `application/xhtml+xml` is refused `DRIVE_TICK_EXPORT_IS_THE_SHELL` (C-48.8), and one whose first kibibyte sniffs as HTML `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL` (C-48.9); each writes an `unreachable` look and leaves the document untouched.
- **R5** Comparison. A rendered capture compares the served bytes with the shell digest: equal is `frame: unchanged` with no status, different is `modified` about the frame; its content is stated undetermined on every tick (`capture-sources`' sentence). With no baseline nothing is compared and the check is recorded. Otherwise the evidentiary digests are compared only when the baseline recorded a determined one and the fetched bytes identify under the same handler key and version, over the same member, with a determined digest (`capture.substanceDigests`); else the raw SHA-256. `compared` is `evidentiary`, `raw`, `shell` or null and `compared_basis` says why.
- **R6** `assess` runs over the baseline's own bytes, read from the capture store under its key and verified by hash, and the fetched text; each way it cannot run is a named `assessment_basis`, never a substitute. The fetched document's type and contract are read whenever text was fetched, and `cadence` is answered by R14's rule.
- **R7** A shell captured as the document (contract `unmonitorable`, not rendered) grades no change: the status is withdrawn and the look is indeterminate. A `removed` address is not affected.
- **R8** The tick writes one promotion through `promotion.promote`: `writer: mechanical`, `operation: monitor-tick`, author `bio-monitor`, base the live digest. It changes only `source_status` (when a status was found), `monitoring.last_checked` (added when absent), `last_updated`, and, when flagged, `reeval_pending.flag: true`, `.since`, `.source: source_status`; and it adds one Session Log entry naming what was compared, the Drive export fetched and the capture line. Every other file is carried unchanged. Flagged is `removed`, or `modified` unless `assess` settled it `identical`, `unchanged`, `restyled` or `routine`; the answer's `reeval_raised` says which.
- **R9** A non-rendered `modified` tick captures the bytes it fetched (D-455): held in the capture store under the capture key (`existed` says whether already held), filed in the same promotion as `snapshots/monitor-<first 12 hex>-<leaf>` with a register row. A promotion refused with them is retried once without them, the refusal kept as `why`; no capture store is a stated `why`. The answer's `capture` gives `sha256`, `file` (null unless registered), `bytes`, `content_type`, `retrieved`, `fetched_address`, `taken_by`, `held`, `existed`, `registered`, `why`.
- **R10** The answer carries `ok` (the promotion accepted), `checked`, `status`, `note`, `baseline`, `seen`, `compared`, `compared_basis`, `assessment`, `assessment_basis`, `cadence`, `observation`, `capture`, `reeval_raised`, `revision` or the promotion's `reason` and `detail`, and for a Drive document `drive` and `fetched_address`. A store that does not answer the promotion is named as silent, never reported as recorded.

**recordLook({bundleId, address, outcome, …})** (the store route `monitorlook`)
- **R11** The look is one observation row, authority `sweep` naming the bundle, level `document`, subject the address: `unchanged` → `PRESENT` referring to the baseline; `changed` → `PRESENT` referring to the new capture when R12 admits it, else to the baseline with the served digest in `detail`; `removed` → `LOOKED_ABSENT`; `unreachable` and `unmonitorable` → `LOOKED_INDETERMINATE`; `governed` → `LOOKED_INDETERMINATE` with `governed` set and condition `source-unreachable-governed`. `unchanged` or `changed` with no baseline, and any other outcome, write nothing and say why. A rendered tick's detail says `frame` and that the content is undetermined.
- **R12** A `changed` look names a capture only when the register holds that digest under this bundle and it is the digest the tick saw; it then records the version at the address through `provenance`'s captured-locator writer under the sweep's authority, once. Otherwise `uncaptured` says why.
- **R13** What a tick read the address as is kept per normalised address: a reading that determined a contract replaces what is held; one that could not is written only where nothing is held; a contract word the catalogue gives no frequency is kept as undetermined with the word in its basis.

**The cadence** (REC-26, REC-191, Content Framework §6 as ruled by BOB #31)
- **R14** The frequency that governs: a word the document authors that the catalogue's `MONITOR_FREQ` knows; an authored word it does not know is undetermined, stated; none authored takes the contract the last tick read (`membership` daily, `substance` weekly, `unmonitorable` none); otherwise undetermined, stated. Intervals: hourly 1 h, daily 24 h, weekly 7 d, monthly 30 d; `per_meeting` and `none` have no interval.
- **R15** The subject of a schedule is an address. Monitored bundles group by the addresses of their captured versions; each address is checked once, against its current version (the newest version there that asks to be monitored), whose frequency governs, never the shortest. A newer version that does not ask is stated (`newer_unmonitored`); versions authoring different words are stated (`disagreement`). An address was last checked when any of its versions was. A bundle with no captured address, or captured at several none of which is singly its locator, is its own subject, stated.
- **R16** The plan: a subject never checked is due now; one with nothing authored and nothing read is due now (`frequency_source: unread`); one with no computable interval is `unscheduled` with its reason; otherwise due when last check plus interval ≤ now, else it sets `next`. Due subjects run longest-overdue first, then by id.
- **R17** An address's own frequency, when one is set, governs over its versions' (BOB #31's first clause). *(not yet met: REC-191's stated design gap; no setting or act exists)*
- **R18** A document whose substance has not moved across repeated checks earns a longer interval (ARCHIVE-FALLBACK, "Why volume is mostly not the constraint"). Volatility lengthens only a contract default (R14): never an authored frequency, never an address's own (R17), and never to a shorter interval; the lengthened interval is stated on the plan row (R16) with its basis. *(not yet met: K102)*

**For `scheduler`: cadenceDue(now), cadenceWake(now), cadenceTick(now); archiveDue(now), archiveWake(now), archiveTick(now)**
- **R19** The cadence tick is inert unless monitoring is configured (R23, R24). Due while the plan has a due subject; wake is now + 1 s while one is due, else `next`, else null. A tick checks at most 50 due subjects by R1–R10 and answers `{configured, at, epoch, monitored, addresses, candidates, next, ticked, skipped, failed, unscheduled}`, each entry carrying its address's account from R15.
- **R20** The archive tick is inert unless configured; due on every firing; its wake is now + its interval (1 h, a binding may set it) while some address has at least the floor of consecutive failures, else null. It reads at most 50 such addresses, oldest failing run first, asks `capture.sourceReachability` of each, and for each eligible one fires the fallback through `capture.acquire`'s archive arm naming only the document address. It answers `{configured, at, checked, epoch, eligible, fired: [{address, grade, hops}], failed: [{address, reason}], skipped}` and records nothing about the source itself.
- **R21** A retry never fires a subject twice (MACHINE-PROCESSES risk 2). Each tick claims a subject under its consumer's open epoch before acting. An open epoch is reused while younger than the consumer's interval (the archive tick's, or one hour for the cadence) and replaced after; a fresh epoch drops the claims of every other. A tick closes its epoch only when nothing failed and nothing was skipped (D-518).
- **R22** A tick is not re-entrant: one called while the same tick runs answers `busy: true` and does nothing.
- **R23** The ticks call R1–R10 and `capture.acquire` in process and spend no credential. *(not yet met: K102; they reach `op=monitor` and `op=acquire` over the instance's own Worker today)*
- **R45** Monitoring runs on every instance where a document asks to be monitored, since asking is the group's standing intent: no binding or credential is a condition of it (R23). An administrator may pause the daemon (R30); the pause is stated on every tick's answer and in R32's answer. DEC-43's credential fallback then carries nothing for monitoring. *(not yet met: K102; with R23 and R30)*
- **R24** While ticks go over the instance's Worker, configured means a self binding and a bound daemon or administrator credential; a fire spends only a credential the gate admits (the daemon's, then the administrator's) and otherwise fails that subject with `MONITOR_NO_LIVE_CREDENTIAL`'s sentence (D-334).
- **R25** Each tick's outcome at an address is recorded with `capture`'s reachability (success; `removed` or another refusal as `source_refused`; a failed fetch as `fetch_failed`; `governed` apart), so a monitored source that stops answering reaches the fallback. *(not yet met: found in this reading; only `acquire` records outcomes)*

**driveShells({viewer, limit, after})** (`op=driveshells`; read)
- **R26** Pages, through the viewer's sight, bundles whose projected locator is a Google address (200 by default, at most 1,000, `truncated` and `cursor`). For each harvestable Drive document it classifies the baseline (`capture-sources.classifyDriveBaseline` over `driveBaselineRow` and at most 50 retrievals, `retrievals_truncated` when cut) into `shells`, `export`, `undetermined`, `no_baseline`; a register not held inline or not parsable is `unreadable` with why; a Drive address that is not a document is counted in `not_documents` by shape. A shell names its remedy (re-acquire the document address) and nothing is re-acquired. `counts` totals each.

**The gathering grammar** (a check registered with `promotion`, its R39)
- **R27** A non-replay promotion carrying `data/gathering.json` whose C-18.5 grammar finds an error is refused `GATHERING_REFUSED` with `findings: [{check, detail}]`; a replay is exempt; a bundle without the file is not asked.

**Standing intent** (Intake Doctrine §4)
- **R28** Each open named request in a bundle's `data/gathering.json` whose cadence is due is captured through `capture.acquire` from its locators in order, the authoritative publisher first, with the request named as authority; what it brings lands no higher than its verification earns. *(not yet met: Intake Doctrine §4; nothing executes a gathering request)*
- **R29** A ratified sweep is run within its scope and breadth budget (per-tick fetch cap, backlog ceiling, an anomaly note when yield departs its history); what it brings lands at `collected`. Sweeps wait for a design of what a sweep's query is; until then only named requests (R28) are run. *(not yet met: Intake Doctrine §4; K102)*
- **R30** The daemon is pausable by an administrator (monitoring's and the fallback's fetches stop; a paused tick says so), and its due slate (every named request, sweep and monitored address now due) is exported as quoted data inside fixed instruction framing. *(not yet met: Intake Doctrine §4, "the manual path"; K102)*

**What reaches members** (NOTIFICATIONS.md, the catalogue and the item contract)
- **R31** It publishes items in the item contract, with their options: `source-modified` and `source-removed` (FINDING) for each flagged tick; `archive-fallback-eligible` (CONDITION) for an eligible address; `monitoring-recheck-due` (CONDITION) for a monitored address overdue by more than its interval or unscheduled. `queue` reads them. *(not yet met: `queuestate.mjs` names the four kinds with no producer)*
- **R32** `monitoring({viewer})` answers every monitored address the viewer may see with its R15–R16 row, the unscheduled among them, so a document that is not being checked is visible without waiting for a tick. *(not yet met: found in this reading; REC-26's stated limit)*

**What the understanding and action layers rest on** (`layers.md`, layers 7 and 9)
- **R33** The sources a live objective or a published finding rests on are known to monitoring; one not monitored is proposed for monitoring to the members who own the objective or finding, never enabled by the daemon, and a member's adoption of the proposal is the ratification; a change at a watched source reaches `reevaluation` as R8's flag. *(not yet met: new; K102)*
- **R34** A `pending` clock entry of an action whose date has passed is marked `overdue` by a mechanical promotion `deadline-recheck` (only `clock[].status` and `last_updated`), and its action's members are told (State Rules §4.4, I-11). *(not yet met: new)*
- **R44** R34's mark is bounded by `actions` R33: it reads the entries through `actions.pendingClocks` (actions R31) and moves an entry only from `pending` to `overdue`, never to or from any other status, and never adds, removes or re-dates an entry; an entry already `met`, `waived` or `overdue` is left as it is. *(not yet met: N65, with R34)*
- **R35** When a clock is marked overdue or a response is recorded against an action, monitoring asks `escalation` whether a stage's trigger is met, so the next stage is proposed; monitoring never advances a stage. *(not yet met: new)*

## Private

### Uses

- `legacy-checks`: `MONITOR_FREQ`, `MECHANICAL_FIELD_SETS`, `isPublicHttpsLocator`, `parseFrontmatter`, the C-48 rows (read, as `capture` reads them, K72 (1)).
- `record-core`: `recordOf(ctx)`, the image read, `stampInstant` (R47), `declarePurge` (R41).
- `membership`: `viewerPredicate`, bundle sight (R1, R26, R32).
- `promotion`: `promote` (R8, R34), `registerStep` (R27). *(not declared)*
- `provenance`: the `register` and `captured_locators` read contract, the captured-locator writer (R12, R15). *(not declared)*
- `host-governor`: `governedFetch` (R2). *(not declared)*
- `capture-sources`: `readDriveAddress`, `driveBaselineRow`, `classifyDriveBaseline`, `RENDERED_METHOD`, `RENDER_TICK_UNDETERMINED`. *(not declared)*
- `capture`: `acquire`'s archive arm (R20), `sourceReachability`, `reachabilityThresholds` (R43), the outcome record (R8, for R25), `substanceDigests`, `profilesAsText`, the capture key; and `source_reachability` (the pending count and the failing addresses R20 reads), through the read contract `capture` states in its Provides (N166), never by the table's name. *(not yet met: N166)*
- `docprofile`: `identify`, `doctypeFor`, `assess`, `CONTRACT`; `format-registry`: `detectFormat`. *(not declared)*
- `observation-log`: its one append (R11). *(not declared)*
- `retrieval`: the projection's monitoring columns and `source_locator` (K75 (3)). *(not declared)*
- `intent`, `publication`, `reevaluation` (R33); `actions`: `pendingClocks` (its R31) and the bound of its R33 (R34, R44); `escalation` (R35). `publication` is *(not declared)*.
- `runtime-limits`: `unattendedCredential(env)` (its R26: `bound` for R24's configured test, `token()` for the credential a fire spends), until R23. *(not declared)*
- `extraction`, `content`: nothing here calls them.

### Invariants

- **R36** The daemon fetches only what store state authorizes: a bundle that asks, a named request, a ratified sweep. No caller names what is fetched; `op=monitor` takes a bundle id, and the fallback names only the document address (Intake Doctrine §4).
- **R37** Detecting change is mechanical; what a change means is not. A tick writes only `monitor-tick`'s field set, never the document's hash as current, and a change raises a flag for a member (Intake Doctrine §6; State Rules §8).
- **R38** An equality that costs nothing is not evidence: a shell's match never reads `unchanged`, and a rendered capture's content is undetermined on every tick.
- **R39** A governed refusal is a fact about the instance: its look is marked governed and it never counts as the source failing (D-104).
- **R40** Bias never shapes what is monitored: no service here takes a lens, and a lens change moves no plan (Content Framework, "bias never shapes what is captured or monitored").
- **R41** `monitor_fired`, `monitor_tick_epoch` and `monitor_address_type` are this module's, derived and declared to purge (K23): `monitor_fired` by subject; `monitor_address_type` only by a whole-store purge, an address outliving any one version.
- **R42** Each check moves here as an invariant with its test (K6, K49): C-18.5 (every arm of `checkGatheringGrammar`), C-48.8, C-48.9.
- **R43** No place is named in this module's behaviour or outward text.

### Satisfies

- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §4 (standing intent, the manual path, constraints as controls), §6 (the daemon's rung).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part I §6 (`assess`, contracts, which frequency governs, the Drive shell sweep).
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1 (the monitor's look); `docs/development/ARCHIVE-FALLBACK.md`; `docs/development/LINK-FIDELITY.md` (corroboration is not manufactured); `docs/development/CLIENT-RENDERED.md` (the rendered tick); `docs/development/DOCUMENT-PROFILES.md` (three digests).
- `docs/development/NOTIFICATIONS.md`, the catalogue (clock-driven and data-flow entries) and the item contract.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.4 (the clock), §6 I-11, §8 (mechanical field sets); `docs/architecture/BIO_Design_Requirements_v2.md` §7; Roadmap v5 principle 3 ("the clock runs").
- `docs/architecture/BIO_System_Design.md` §3, construct 10. DEC-37, DEC-43 (the daemon credential, R24).

### Suggestions

- **Factory.** `monitoringOf(ctx, env)` answers the one instance per Durable Object storage (K61); `op=monitor` becomes a service inside the Durable Object, as `acquire` did (K72 (11)), and `control-plane` keeps routing, classes and stamps (K3).
- **The helpers `monitorCadence` and the plan's `cadence`** state R14 twice today; one function serves both.
- **Removed addresses.** R25 records `removed` as `source_refused`, so a withdrawn document can reach the archive. If BOB prefers a removed address never to trigger the fallback, R25 names that exception.
- **The items.** R31's can be derived on read from the looks and the plan, as `queue`'s other conditions are; nothing new needs storing.
- Tests: each R1 and R4 refusal and each C-18.5 arm gets a negative control; R21 gets the retry arm (observations counted once, D-518's skipped-only tick keeps its epoch); R38 an over-strictness arm (a plain document still reads `unchanged`).

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings)

- `from`: `legacy-store`, `legacy-index` (`op=monitor` and its helpers), `legacy-checks` (C-18.5), as K72 (1) did for layer 3; the C-48.8 and C-48.9 rows stay in `legacy-checks`, read as capture's are.
- The idempotence key (`monitor_fired`, `monitor_tick_epoch`, `#openTickEpoch`, `#claimFire`) is this module's: its only users are its two ticks.
- `recordSourceOutcome`, `sourceReachability` and the thresholds stay `capture`'s (its R8, R43); this module reads them.
- The credential choice (`#monitorTokenBound`, `#monitorToken`, `MONITOR_NO_LIVE_CREDENTIAL`) is shared with `capture-requests` today (store.mjs 40137, 40829), an earlier module; it goes to `runtime-limits` beside `liveToken` (`tokens.mjs`) as one `unattendedCredential(env)`, which both read until their in-process paths retire it. `#tickRunning` is per module: each keeps its own.
- R25 and R32 are stated as requirements from this reading.
- Uses as listed above (map §5.2).
