# monitoring — requirements

**Status** · APPROVED by Bob 2026-09-26 (K102). DRAFT by a drafting worker for BOB #43, 2026-09-26 (P18), from a reading of the code, reviewed by BOB #43; for Bob's approval (a product module, P17). Layer 10. Code today (measured on `tranche/T3` @ `edbd39bb`; `store.mjs` 49,817 lines; `build/extraction/monitoring.md` has the table): `bio-plane/src/store.mjs` 16935–17009 (`driveShells`), 46072–46214 (`monitorObservationFor`, `recordMonitorLook`, `#recordMonitorAddressType`), 47030–47700 (the archive-monitor tick `#monitorTickMs` … `#monitorTick`, the idempotence key `#tickRunning`, `#openTickEpoch`, `#closeTickEpoch`, `#claimFire`, the cadence `MONITOR_CADENCE_MS`, `CONTRACT_FREQUENCY`, `monitorIntervalMs`, `#monitorSubjects`, `#monitorCadencePlan`, `#monitorCadenceWake`, `#monitorCadenceTick`, `#fireMonitorTick`, `#fireArchiveFallback`), the store routes `driveshells` and `monitorlook`. `bio-plane/src/index.mjs` 3044–3136 (`monitorCadence`, `monitorAssess`, `monitorRecordLook`) and 10304–10914 (`op=monitor`). `bio-plane/checks/bio-checks.mjs` 5277–5280 and 5664–5733 (C-18.5, `checkGatheringGrammar`; K49) and the rows C-48.8, C-48.9 (11254–11286). `schema.mjs`: `monitor_fired`, `monitor_tick_epoch` (1860–1901), `monitor_address_type` (3885–3905). `from`: `legacy-store`, and (proposed, map §5.1) `legacy-index` and `legacy-checks`. Not yet met: R17, R18 (K102), R23 (K102), R25, R28–R34 (R29 and R33 K102), R45 (K102). No old-plan row is carried to `monitoring`. Action layer folded 2026-09-30 (K608, K611): R50 added, not yet met; R34's mark re-worded, R35's struck (met); `actions.pendingClocks` (its R31) re-pointed to `action-clocks.pendingClocks` (its R1) by K617's split, no meaning changed. N63 and N65 (2) folded by a drafting worker for BOB #43, 2026-09-26: R44, not yet met; the credential named as `runtime-limits.unattendedCredential`. Uses' `capture` line gains the `source_reachability` read contract (N166, K206's P4) by a worker for BOB #53 (K214). N324 folded by a drafting worker for BOB #64, 2026-09-29 (K408): R30 answers through `membership.notAnAdmin`, not yet met. folded by a worker for BOB #66, 2026-09-29 (T14 opening; `build/plan/draft-T14-wordings.md`, K444, K445): N330 R47 (`archiveEligible`) and R48 (`flagged`) for `queue`; N339 (with N349) R49, a relayed store refusal keeps its status; met in T14 (MONITORING #6, K474). Folded by a worker for BOB #80, 2026-10-01 (T19 layer-10 fold; K719, `build/extraction/legacy-store.md` §4.2 (2)): R50 gains N429 (the wake leaves out an entry whose last mark failed, until the next day); R51 registers R46's `counts()` with record-core. Monitoring R17 folded by a worker for BOB #90 on `tranche/T22`, 2026-10-01, as Bob agreed it (K1019: a reasoned act by a member owning the source's project, the reason canned or custom, corrected forward, shown on the plan row): R17 re-worded, R52 (the act) added; Uses gain `membership.isProjectOwner` (no new module); not yet met (T22 layer 10). A32, A35, by a worker for BOB #90 on `tranche/T22`, 2026-10-02 (K1038): R31 and R34 worded as built (`queue-producers` publishes the items and tells the members); their todos are monitoring's T22 layer-10 job. T23 (the link sweep), by a fold worker for BOB #94 at T23's opening, on `fold/T23-b` from `tranche/T23`, 2026-10-02, from `build/plan/draft-monitoring-r29.md` (K1019, K1036, K1044, K1094): R29, R31 and R36 amended, R53–R63 added, not yet met (T23 L10); Uses gain `format-registry.listFormats`, `capture.heldCount` (its R82), `record-core.bundleInfo` and `project-stage.projectStage` (the `modules.json` edge to `project-stage` is the other fold worker's).

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
- **R17** An address's own frequency, when one is set (R52), governs over its versions' (BOB #31's first clause), and R16's plan row for the address states it: `frequency_source: address`, the frequency, its reason (the canned reason's key and sentence, or the custom text), who set it and when. (Monitoring R17 as Bob agreed it, K1019)
- **R52** `addressFrequencySet({address, frequency, reason, reasonText?, author, viewer})` (`op=addressfrequencyset`) is the reasoned act that sets an address's own frequency. Refusals, in order, each writing nothing: an empty or machine author `MACHINE_CANNOT_SET_FREQUENCY`; an address that is not a subject of R15 the viewer may see `NO_SUCH_ADDRESS` (absent and invisible alike); `frequency` not one of `MONITOR_FREQ`'s words or `null` `BAD_FREQUENCY`; an author who owns no project holding a monitored document at that address (`membership.isProjectOwner`) `NOT_A_SOURCE_OWNER`; `reason` not one of the canned keys or `custom`, or `custom` with a `reasonText` absent, blank or over 2,000 characters, `FREQUENCY_NO_REASON`. The canned reasons (BOB's wording), each key with its sentence: `source_changes_rarely` "The source changes rarely."; `source_changes_often` "The source changes often."; `legal_deadline_approaching` "A legal deadline that depends on this source is approaching."; `source_unreliable` "The source is unreliable, so it is checked more often."; `custom`, the member's own words in `reasonText`. Otherwise it records the setting with its reason, who and when. A setting is never edited: a later one replaces it (`frequency: null` returns the address to R14's rule), and every setting stays readable on the address's history. (Monitoring R17 as Bob agreed it, with his addition of the canned or custom reason; K1019)
- **R18** A document whose substance has not moved across repeated checks earns a longer interval (ARCHIVE-FALLBACK, "Why volume is mostly not the constraint"). Volatility lengthens only a contract default (R14): never an authored frequency, never an address's own (R17), and never to a shorter interval; the lengthened interval is stated on the plan row (R16) with its basis. The figures: after 10 checks in a row that find the substance unchanged, the interval moves one step up R14's list (daily, weekly, monthly), and after 10 more unchanged checks at that interval one step again, never past monthly; any change, or a check that is unreachable or indeterminate, returns it to the contract default; the plan row states the count and the step (K1051).

**For `scheduler`: cadenceDue(now), cadenceWake(now), cadenceTick(now); archiveDue(now), archiveWake(now), archiveTick(now)**
- **R19** The cadence tick is inert unless monitoring is configured (R23, R24). Due while the plan has a due subject; wake is now + 1 s while one is due, else `next`, else null. A tick checks at most 50 due subjects by R1–R10 and answers `{configured, at, epoch, monitored, addresses, candidates, next, ticked, skipped, failed, unscheduled}`, each entry carrying its address's account from R15, and `gathered: {due, captured, failed}` for R28's requests (K1096). (N224) Given the scheduler's rank (`cadenceTick(now, rank)`, scheduler R10), the tick reads at most ten times its batch of due subjects in R16's order and checks its batch in the rank's order, each offered as `{kind: "address", id: the address, waitingSince: the instant it fell due (last check plus interval), or null for a subject due because never checked or unread}`. Without `rank`, or when it throws or answers no list, R16's order stands.
- **R20** The archive tick is inert unless configured; due on every firing; its wake is now + its interval (1 h, a binding may set it) while some address has at least the floor of consecutive failures, else null. It reads at most 50 such addresses, oldest failing run first, asks `capture.sourceReachability` of each, and for each eligible one fires the fallback through `capture.acquire`'s archive arm naming only the document address. It answers `{configured, at, checked, epoch, eligible, fired: [{address, grade, hops}], failed: [{address, reason}], skipped}` and records nothing about the source itself. (N224) Given the rank (`archiveTick(now, rank)`), it reads at most ten times its 50 failing addresses, oldest failing run first, and takes its 50 in the rank's order, each offered as `{kind: "address", id, waitingSince: the first failure of its current run}`. Without it, or when it throws or answers no list, the oldest failing run first stands.
- **R21** A retry never fires a subject twice (MACHINE-PROCESSES risk 2). Each tick claims a subject under its consumer's open epoch before acting. An open epoch is reused while younger than the consumer's interval (the archive tick's, or one hour for the cadence) and replaced after; a fresh epoch drops the claims of every other. A tick closes its epoch only when nothing failed and nothing was skipped (D-518).
- **R22** A tick is not re-entrant: one called while the same tick runs answers `busy: true` and does nothing.
- **R23** The ticks call R1–R10 and `capture.acquire` in process and spend no credential.
- **R45** Monitoring runs on every instance where a document asks to be monitored, since asking is the group's standing intent: no binding or credential is a condition of it (R23). An administrator may pause the daemon (R30); the pause is stated on every tick's answer and in R32's answer. DEC-43's credential fallback then carries nothing for monitoring.
- **R24** *(retired, K372: R23 and R45 put the ticks in process with no binding or credential, so no fire spends one and `MONITOR_NO_LIVE_CREDENTIAL` leaves monitoring; `configured()` answers true on every instance, which the scheduler's R9 arms read (K260).)* Formerly: while ticks go over the instance's Worker, configured means a self binding and a bound daemon or administrator credential (D-334).
- **R25** Each tick's outcome at an address is recorded with `capture`'s reachability (success; `removed` or another refusal as `source_refused`; a failed fetch as `fetch_failed`; `governed` apart), so a monitored source that stops answering reaches the fallback.

**counts()** (N266, K261; for `legacy-store`'s `op=stats`)
- **R46** `counts()` answers `{monitorFired, monitorTickEpoch, monitorAddressType}`: the number of rows held in R41's three tables, whole-store. It is synchronous, writes nothing and never throws.
- **R51** This module registers R46's `counts()` once at start through `record-core`'s `registerCounts` (its R63) under the figures `monitorFired`, `monitorTickEpoch` and `monitorAddressType`, each whole-store whatever `hid` names (its tables name no bundle), so `op=stats` and purge's proof read them through record-core, as `store.mjs` calls it by name today, no meaning changed; `legacy-store`'s own job deletes its call (`build/extraction/legacy-store.md` §4.2 (2)).

**driveShells({viewer, limit, after})** (`op=driveshells`; read)
- **R26** Pages, through the viewer's sight, bundles whose projected locator is a Google address (200 by default, at most 1,000, `truncated` and `cursor`). For each harvestable Drive document it classifies the baseline (`capture-sources.classifyDriveBaseline` over `driveBaselineRow` and at most 50 retrievals, `retrievals_truncated` when cut) into `shells`, `export`, `undetermined`, `no_baseline`; a register not held inline or not parsable is `unreadable` with why; a Drive address that is not a document is counted in `not_documents` by shape. A shell names its remedy (re-acquire the document address) and nothing is re-acquired. `counts` totals each.

**The gathering grammar** (a check registered with `promotion`, its R39)
- **R27** A non-replay promotion carrying `data/gathering.json` whose C-18.5 grammar finds an error is refused `GATHERING_REFUSED` with `findings: [{check, detail}]`; a replay is exempt; a bundle without the file is not asked.

**Standing intent** (Intake Doctrine §4)
- **R28** Each open named request in a bundle's `data/gathering.json` whose cadence is due is captured through `capture.acquire` from its locators in order, the authoritative publisher first, with the request named as authority; what it brings lands no higher than its verification earns Wording (K1096, Intake Doctrine §2, §4): one locator at a time through `acquire`'s capture-request arm, stopping at the first that files; the request is the look's authority (one observation per attempt, R11's mapping), never asserted onto the bytes. New bytes land as §2 says, a gated Information bundle promoted through `promotion.promote` (`origin: named_request`, the request's id and its bundle as the authorisation), at the state its grade earns for a mechanical writer and never verified (a member's act, §4); bytes the record already holds land nothing new. A request is due by R14's intervals from its last attempt (never attempted: due; no cadence: once; `none`: never); only `open` requests. The cadence tick runs due requests after its batch's addresses, within R19's budget of 50, and answers them as `gathered`; paused (R30), nothing is gathered, stated. The bundle's own `daemon` block governs its requests (K1102; LINK-FIDELITY "The budget mechanism already exists"): `daemon.enabled: false` runs none of them, stated; `daemon.tick_budget`, when set, bounds the locators tried for that bundle in one tick, within R19's 50; `daemon.sweep_budget` is R29's.
- **R29** A ratified sweep is named standing intent. It is run by R56–R61, within its scope (R53) and its budget, and each document it brings in is filed as its own Information bundle at `collected`, never higher.
- **R30** The daemon is pausable by an administrator (monitoring's and the fallback's fetches stop; a paused tick says so); a pause or resume asked by a member who is not an administrator (`membership` R64's `isAdministrator`, read of the stamped `actor`) is refused `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84), with nothing written, and the root of trust is an administrator here (N314, K380); this module mints no `NOT_AN_ADMIN` of its own and reads no C-96.1 row (K403's local site retires; N324); and its due slate (every named request, sweep and monitored address now due) is exported as quoted data inside fixed instruction framing.

**The sweep's definition** (an entry of `data/gathering.json` `sweeps[]`, refused by C-18.5 through R27)
- **R53** A sweep is `{id, title, ratified, sources, seeds, match, cadence, budget}` and nothing else. C-18.5 refuses an entry that breaks any of the following, with one finding per field:
  - `id`: `^[a-z0-9][a-z0-9-]{0,39}$`, unique within the file. A sweep's full name is `"<bundle>#<id>"`.
  - `title`: a non-empty single line of at most 200 characters.
  - `ratified`: a boolean.
  - `sources`: the origin allowlist. It holds 1–20 public https prefixes (`isPublicHttpsLocator`). Each is a scheme and a host with an optional path prefix, and has no query or fragment. An address is **in scope** when its normalised form (`subresources.normalizeAddress`) equals a prefix, or continues one at a `/`.
  - `seeds`: 1–10 public https locators, each in scope. These are the listing pages read on every run.
  - `match`: `{terms?, paths?, formats?}`.
    - `terms`: 0–20 terms, each as R54 states.
    - `paths`: 0–20 prefixes, each in scope.
    - `formats`: 0–10 format names, each one that `format-registry.listFormats()` (its R8) answers at the gate.
  - `cadence`: `daily`, `weekly` or `monthly` (R14's intervals).
  - `budget`: `{per_run, backlog}`. `per_run` is an integer 1–100 and `backlog` an integer 1–1,000.

  `title` and `terms` are only ever shown as quoted data. `daemon.sweep_budget`, when set, caps the fetches all of a bundle's sweeps make in one tick together. When it is 0, they make none, and the run says so.
- **R54** A **term** is a single-line string of 1–200 characters. It is a regular expression when it is written between slashes (`/…/`), and a literal otherwise. Both match without regard to case.
  - C-18.5 refuses a regular expression that does not compile, or that uses a backreference, a lookahead or a lookbehind (`SWEEP_TERM_REFUSED`, naming the term and the construct).
  - A term's matching time is linear in the length of the text it is matched against, whatever the term is. No term can make a run take longer than its text's length bounds.
  - A term is matched against at most 2,048 characters of a link's text and 2,048 of its decoded address. The rest is not read, and the run says how many links it cut.

**Who may write a sweep** (K1036 (7))
- **R55** A non-replay promotion carrying `data/gathering.json` is refused before anything is written, as follows:
  - `SWEEP_NOT_A_MEMBER` (C-18.5) when its author is not a member (an identity in `record-grammar`'s non-member set) and it adds a sweep, removes one, or changes any field of one. The one exception is setting `ratified` to `false`.
  - `SWEEP_RATIFY_NOT_AN_OWNER` (C-18.5) when its author is not an owner of the bundle's project (`record-core.bundleInfo`, its R34; `membership.isProjectOwner`, its R54) and the promotion does either of these:
    - sets a sweep's `ratified` to `true`;
    - changes any field of a sweep that is ratified before or after the write.

    A bundle in no project has no owner, so every such promotion on it is refused.

  Any member who may write the bundle may add or change an unratified sweep. An owner's change to a ratified sweep re-ratifies it. Any writer, the daemon included, may set `ratified` to `false`, because stopping breadth is never refused. The ratifying member and the instant are those of the promotion that last set `ratified` to `true` or changed a ratified sweep, read from the bundle's history.

**The run** (`sweepDue(now)`, `sweepWake(now)` and `sweepTick(now, rank?)`, for `scheduler`'s `gathering-sweep` consumer)
- **R56** A sweep is due when all of the following hold:
  - it is ratified;
  - the daemon is not paused (R30);
  - its bundle's `daemon.enabled` is not `false`;
  - its project is not at stage `closed` (Bob, K1094 (1));
  - it is not held (R60);
  - it has never run, or its last run plus its cadence's interval is at or before `now`.

  `sweepWake` answers now + 1 s while one is due, else the earliest next run, else null. A tick runs at most 5 due sweeps, longest-overdue first and then by full name. Given the scheduler's rank, it reads at most ten times that number in that order and runs its batch in the rank's order. Each sweep is offered as `{kind: "sweep", id: "<bundle>#<id>", waitingSince}`. Claims and epochs are R21's, and the tick is not re-entrant (R22).
- **R57** **Seeds.** Each seed is fetched through `capture.acquire`, paced by `host-governor`, with `origin: {kind: "sweep", matched_sweep: "<bundle>#<id>", deeming_actor: "bio-monitor"}` and the sweep's `sources` as the redirect scope (`acquisition` R31). Its capture is filed in the sweep's own bundle as a monitor snapshot, in the way R9 files a tick's bytes.
  - A seed whose bytes equal its last capture is recorded as `unchanged`, and its candidates are read again from that capture.
  - A seed that fails is recorded with `capture`'s reachability (its R8), and the run goes on with the other seeds.
  - A seed redirected out of scope is not fetched beyond the redirect, and is recorded as `out_of_scope_redirect` with its target.
- **R58** **Candidates and the match.** The candidates are the links in this run's seed captures, read from the seed's own bytes: HTML anchors with their text, feed items with their titles, and sitemap entries (address only). A candidate matches when all of these hold:
  - its normalised address is in scope;
  - it lies under one of `match.paths`, when any are given;
  - one of `match.terms` (R54) matches its text or its decoded address, when any are given.

  Only one hop is followed. A matching candidate is skipped, with the reason stated, in each of these cases:
  - this sweep has already filed a capture at that address (`already_swept`);
  - the record already holds a capture at that address (`already_held`);
  - the run's budget is spent (`budget_spent`). Seed fetches count toward `per_run` and toward `daemon.sweep_budget`.

  The rest are fetched in seed order and then in link order, each through `capture.acquire` with R57's origin and redirect scope. A redirect out of scope is recorded as `out_of_scope_redirect` with its target, and nothing at the target is fetched.
- **R59** **Filing.** Each fetched candidate whose detected format (`format-registry.detectFormat`) is in `match.formats` (any format when none are given) is filed as a new Information bundle at `collected`:
  - in the project of the sweep's bundle;
  - with the register entry's `origin` as R57 states it;
  - with the seed capture that listed it named in the bundle's Provenance Notes.

  A fetched document of another format is not filed (`format_excluded`), and its fetch still counts toward the budget.
- **R60** **Backlog, hold, anomaly and silence.**
  - **Backlog** is `capture.heldCount({sweep: "<bundle>#<id>"})` (`capture` R82): this sweep's documents still at `collected`, neither released nor set aside. When it answers `null` (the store could not be read), the sweep is held as if over its ceiling (K1129).
  - **Held:** while the backlog is at or over `budget.backlog`, the sweep does not run, and every read of it (R61) states `held: backlog`.
  - **Anomaly:** once at least 4 runs exist, a run notes an anomaly in either of these cases:
    - it filed more than three times the median of the last 8 runs, and more than 5;
    - it filed 0 while that median is at least 2.

    The note is kept on the run and changes nothing else.
  - **Silent:** a sweep whose last 4 runs each filed nothing, and which is not held, is `silent`.
- **R61** **Reads.**
  - `sweeps({viewer})` (`op=sweeps`; read; member session) answers every sweep in a `gathering.json` the viewer may see. Each comes with:
    - its definition, as quoted data;
    - `ratified`, with the ratifying member and instant (R55);
    - `due`, `next`, `held` and the backlog;
    - its last 20 runs, each with the seeds fetched, unchanged, failed or redirected, the candidates, the number filed, the skipped by reason, the links cut (R54) and any anomaly.

    It also answers `formats`, which is `format-registry.listFormats()`, the list the member chooses `match.formats` from (K1036 (6)).
  - R30's due slate carries each due sweep's definition as quoted data inside the fixed framing.
- **R62** **Looks.** Each seed fetch and each candidate fetch writes one observation row (`observation-log`), with these fields:
  - authority kind `sweep`, authority `"<bundle>#<id>"`, level `document`, subject the address;
  - state `PRESENT`, referring to the capture, or `LOOKED_INDETERMINATE` with the reason (a failed fetch, `out_of_scope_redirect`, `format_excluded`, or a governed refusal marked `governed`).

  A skipped candidate writes nothing, because nothing was looked at.

**What reaches members** (NOTIFICATIONS.md, the catalogue and the item contract)
- **R63** `sweepConditions({viewer})` answers, for each sweep the viewer may see, every condition that needs a member's look, derived on read and writing nothing. Each condition is `{sweep, kind, since, detail}`:
  - `sweep-held-backlog`: the sweep is held (R60). `detail` gives the backlog and the limit.
  - `sweep-yield-anomaly`: the last run noted an anomaly (R60). `detail` gives the count filed and the median.
  - `sweep-seed-unreachable`: a seed failed on the last run (R57). `detail` names each such seed and its reachability.
  - `sweep-redirect-out-of-scope`: the last run met a redirect out of scope (R57, R58). `detail` names each address and its target.
  - `sweep-silent`: the sweep is silent (R60).

  A condition leaves on the first read after it stops holding.
- **R31** Its reads give the items `queue-producers` publishes in the item contract, with their options:
  - `source-modified` and `source-removed` (FINDING), one for each flagged tick, from R48 (`queue-producers` R2);
  - `archive-fallback-eligible` (CONDITION), one for each eligible address, from R47;
  - `monitoring-recheck-due` (CONDITION), one for each monitored address overdue by more than its interval or unscheduled, from R16 and R32 (`queue-producers` R3);
  - the five sweep conditions of R63 (CONDITION; `queue-producers` R26).

  This module publishes no item itself, and `queue` reads them. (A32; K1038; K1036 (8))
- **R32** `monitoring({viewer})` answers every monitored address the viewer may see with its R15–R16 row, the unscheduled among them, so a document that is not being checked is visible without waiting for a tick.

**archiveEligible(now), flagged({viewer, limit})** (N330, K406; for `queue`)
- **R47** `archiveEligible(now)` answers what the next unranked archive tick (R20) would find eligible, asking the same questions and writing nothing: of at most 50 addresses at the floor of consecutive failures, oldest failing run first, those `capture.sourceReachability` answers `fallback_eligible`, each `{address, first_failure_since, reachability}`, with `limit` (50), `truncated` (more addresses at the floor) and `paused` (R30), stated beside them and never emptying them. It never throws.
- **R48** `flagged({viewer, limit})` answers the monitored documents (R32's addresses' documents) the viewer may see whose last tick flagged them (R8: `reeval_pending.flag` true, `source: source_status`), each `{bundleId, source_status, since}`, reading at most the first `limit` (1–200, default 200) such documents the viewer may see, in id order; a document the viewer may not see is skipped and never counted (K391); `truncated` when more follow. It writes nothing and never throws.

**What the understanding and action layers rest on** (`layers.md`, layers 7 and 9)
- **R33** The sources a live objective or a published finding rests on are known to monitoring; one not monitored is proposed for monitoring to the members who own the objective or finding, never enabled by the daemon, and a member's adoption of the proposal is the ratification; a change at a watched source reaches `reevaluation` as R8's flag. A live objective's sources are read through `intent` R7, a published finding's through `publication` R42 (`restingCapturesOf`), each followed by its cursor to the end (N230).
- **R34** A `pending` clock entry of an action whose date has passed is marked `overdue` by a mechanical promotion `deadline-recheck` (only `clock[].status` and `last_updated`), and its action's members are told (State Rules §4.4, I-11): the telling is `queue-producers` R15's `action-clock-overdue` item (from `action-clocks.overdueClocks`, its R3), not this module's. (A35; K1038, wording of what is built)
- **R44** R34's mark is bounded by `actions` R33: it reads the entries through `action-clocks.pendingClocks` (its R1; `actions` R31 before K617's split) and moves an entry only from `pending` to `overdue`, never to or from any other status, and never adds, removes or re-dates an entry; an entry already `met`, `waived` or `overdue` is left as it is.
- **R35** When a clock is marked overdue or a response is recorded against an action, monitoring asks `escalation` whether a stage's trigger is met, so the next stage is proposed; monitoring never advances a stage.
- **R50** `deadlineRecheckWake(now)` answers the start of the UTC day after the earliest date among `pending` clock entries of visible-to-this-module actions (`action-clocks.pendingClocks`, read as this module's machine viewer), or null when none is pending; `deadlineRecheckDue(now)` answers that instant when it is at or before `now`, else null. So `scheduler`'s `deadline-recheck` consumer (its R5) runs R34 on the first alarm of the day an entry passes, and an instance with no pending entry holds no wake for it (scheduler R15). (N429, K719) An entry of an action whose last R34 mark failed (`deadlineRecheck`'s `failed`) is left out of that earliest date until the start of the UTC day after the failure, so a mark that keeps failing is asked again once a day (the bound `scheduler`'s `deadline-recheck` consumer keeps today by holding a past wake, K719) and never holds the wake in the past for the entries that can be marked.

- **R64** (K1099, K1122; `capture-requests` R45) At its construction the module registers with `capture-requests` the sweep scope check that module's R45 calls (K31's pattern): given a sweep `<bundle>#<id>` and a request's locators, it answers whether the sweep is ratified and not held (R53 onward) and whether every locator is within the sweep's scope, by the same matcher a sweep's run uses. A request filed under a sweep this way counts toward that sweep's `per_run` on its next run.

## Private

### Uses

- `capture-requests`: the scope-check registration its R45 reads (R64; K1122).

- `record-grammar`: `isPublicHttpsLocator`, `ISO_TS_RE`, `parseFrontmatter`, `createSha256`, `MACHINE_CLASS_PREFIX` (`MONITOR_FREQ`, `MECHANICAL_FIELD_SETS` and the C-48.8/.9 rows are this module's own since T18, K717).
- `record-core`: `recordOf(ctx)`, the image read, `stampInstant` (R47), `declarePurge` (R41).
- `membership`: `viewerPredicate`, bundle sight (R1, R26, R32); `isAdministrator` (its R64) and `notAnAdmin` (its R84), for R30's pause (N314, N324); `isProjectOwner` (its R54), for R52 (K1019).
- `promotion`: `promote` (R8, R34), `registerStep` (R27).
- `provenance`: the `register` and `captured_locators` read contract, the captured-locator writer (R12, R15).
- `host-governor`: `governedFetch` (R2).
- `capture-sources`: `readDriveAddress`, `driveBaselineRow`, `classifyDriveBaseline`, `RENDERED_METHOD`, `RENDER_TICK_UNDETERMINED`.
- `capture`: `acquire`'s archive arm (R20), `sourceReachability`, `reachabilityThresholds` (R43), the outcome record (R8, for R25), the capture key; and `source_reachability` (the pending count and the failing addresses R20 reads), through the read contract `capture` states in its Provides (N166; capture R59, K235).
- `acquisition`: `substanceDigests`, `profilesAsText`, `ODF_DIGEST_MAX` (its R17), `civicosUserAgent` (its R24); the acquisition act itself through `capture`'s `acquire` (capture R73). *(K649 (1): moved from `capture`; this module's T18 job re-points its imports)*
- `docprofile`: `identify`, `doctypeFor`, `assess`, `CONTRACT`; `format-registry`: `detectFormat`.
- `observation-log`: its one append (R11; the sweep's looks, R62).
- `format-registry`'s `listFormats` (its R8; `detectFormat` is already used); `capture`'s `heldCount` (its R82); `record-core`'s `bundleInfo` (its R34); `project-stage`'s `projectStage` (its R1, R2), for R56's closed test.
- `retrieval`: the projection's monitoring columns and `source_locator` (K75 (3)).
- `intent` (its R7), `publication` (its R42, `restingCapturesOf`; N230), `reevaluation` (R33); `action-clocks`: `pendingClocks` (its R1; R34, R44, R50); `actions`: the bound of its R33 (R34, R44); `escalation` (R35). `publication` is.
- `runtime-limits`: `unattendedCredential(env)` (its R26: `bound` for R24's configured test, `token()` for the credential a fire spends), until R23.
- `subresources`: `normalizeAddress` (the look's subject, D-524's baseline match); `jurisdictions`: `combine` over record-core's `jurisdiction_profiles` setting, the view N116 passes to `identify`/`doctypeFor`/`assess` (K259).
- `extraction`, `content`: nothing here calls them.

### Invariants

- **R36** The daemon fetches only what store state authorizes:
  - a bundle that asks to be monitored;
  - a named request's locators;
  - a ratified sweep's seeds, and the candidates that R58 admits.

  No caller names what is fetched. `op=monitor` takes a bundle id, the fallback names only the document address, and no sweep fetch reaches an address out of its scope (Intake Doctrine §4).
- **R37** Detecting change is mechanical; what a change means is not. A tick writes only `monitor-tick`'s field set, never the document's hash as current, and a change raises a flag for a member (Intake Doctrine §6; State Rules §8).
- **R38** An equality that costs nothing is not evidence: a shell's match never reads `unchanged`, and a rendered capture's content is undetermined on every tick.
- **R39** A governed refusal is a fact about the instance: its look is marked governed and it never counts as the source failing (D-104).
- **R40** Bias never shapes what is monitored: no service here takes a lens, and a lens change moves no plan (Content Framework, "bias never shapes what is captured or monitored").
- **R41** `monitor_fired`, `monitor_tick_epoch` and `monitor_address_type` are this module's, derived and declared to purge (K23): `monitor_fired` by subject; `monitor_address_type` only by a whole-store purge, an address outliving any one version.
- **R42** Each check moves here as an invariant with its test (K6, K49): C-18.5 (every arm of `checkGatheringGrammar`), C-48.8, C-48.9. C-48.8 and C-48.9 (R4's `DRIVE_TICK_EXPORT_IS_THE_SHELL` and `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL`) are held in this module's own table with their code, number, translation and reasons unchanged and their `where` naming this module's site, copied from the catalogue's `DRIVE_CAPTURE_CHECKS` (whose copy T19's layer 1 deletes, K529); they are no longer read in place. The rest of C-48 is `acquisition`'s (its R29). *(worded by BOB, K649 (6): the Uses below and `monitoring/checks.mjs` said the rows stay in the catalogue, read in place)*
- **R43** No place is named in this module's behaviour or outward text.
- **R49** (N339, K421) A store answer this module's Worker handlers relay that is the store's own refusal (`control-plane` R23: `ok: false` below 500) is answered with the store's status, code and sentence through `storeRefusal`; only a reply that is no answer is `STORE_DID_NOT_ANSWER`, with the store's correlation id when it gave one (`control-plane` R25; N349).

### Satisfies

- `docs/architecture/BIO_Intake_Doctrine_v1_1.md` §4 (standing intent, the manual path, constraints as controls), §6 (the daemon's rung).
- `docs/architecture/BIO_Content_Framework_v0_10.md` Part I §6 (`assess`, contracts, which frequency governs, the Drive shell sweep).
- `docs/development/OBSERVATION-LOG-DESIGN.md` §4.1 (the monitor's look); `docs/development/ARCHIVE-FALLBACK.md`; `docs/development/LINK-FIDELITY.md` (corroboration is not manufactured); `docs/development/CLIENT-RENDERED.md` (the rendered tick); `docs/development/DOCUMENT-PROFILES.md` (three digests).
- `docs/development/NOTIFICATIONS.md`, the catalogue (clock-driven and data-flow entries) and the item contract.
- `docs/architecture/BIO_State_Rules_Consistency_v1_5.md` §4.4 (the clock), §6 I-11, §8 (mechanical field sets); `docs/architecture/BIO_Design_Requirements_v2.md` §7; Roadmap v5 principle 3 ("the clock runs").
- `docs/architecture/BIO_System_Design.md` §3, construct 10. DEC-37, DEC-43 (the daemon credential, R24).
- K1019 (Bob's answer to `t22-check.md` question 5, with his addition of the canned or custom reason): R17, R52.
- The link sweep (R29, R31, R36, R53–R63): Intake Doctrine §4 (the ratified sweep, the ratification fence, constraints as security controls), §6 (bounded breadth), §9 (named standing intent); State Rules §4.1 (the register's sweep origin) and §6 I-18; `docs/development/NOTIFICATIONS.md` (the CONDITION items); K1036.

### Suggestions

- **Factory.** `monitoringOf(ctx, env)` answers the one instance per Durable Object storage (K61); `op=monitor` becomes a service inside the Durable Object, as `acquire` did (K72 (11)), and `control-plane` keeps routing, classes and stamps (K3).
- **The helpers `monitorCadence` and the plan's `cadence`** state R14 twice today; one function serves both.
- **Removed addresses.** R25 records `removed` as `source_refused`, so a withdrawn document can reach the archive. If BOB prefers a removed address never to trigger the fallback, R25 names that exception.
- **The items.** R31's can be derived on read from the looks and the plan, as `queue`'s other conditions are; nothing new needs storing.
- Tests: each R1 and R4 refusal and each C-18.5 arm gets a negative control; R21 gets the retry arm (observations counted once, D-518's skipped-only tick keeps its epoch); R38 an over-strictness arm (a plain document still reads `unchanged`).
- **The link sweep** (R53–R63):
  - Tables: `sweep_runs` (one row per run, with its counts and anomaly) and `sweep_filed` (the addresses each sweep filed, for `already_swept`). Both are this module's, declared to purge and derived, as R41's are.
  - A linear-time matcher (R54) is a Thompson-NFA or RE2-class engine, never JavaScript's backtracking `RegExp`. Banning backreferences and lookaround alone does not make a backtracking engine linear, because `(a|a)*` and `(a+)+` still blow up.
  - Codes `SWEEP_TERM_REFUSED`, `SWEEP_NOT_A_MEMBER` and `SWEEP_RATIFY_NOT_AN_OWNER` each take a catalogue row in this module's table (DEC-49). `op=sweeps` takes an `op-declarations` spec (member session, read) in L11.
  - Tests:
    - each C-18.5 arm, with a negative control;
    - a regular expression with a backreference, and one with a lookbehind;
    - a pathological term over a 2,048-character text, finishing within a fixed bound;
    - an owner who ratifies against a member who ratifies;
    - a non-owner who changes a ratified sweep, and one who sets `ratified` to `false`;
    - the budget counted with seeds;
    - a redirect out of scope that fetches nothing at its target;
    - an `already_held` skip;
    - the held, anomaly and silent edges at 3/4 runs and at the median;
    - every R63 kind arriving and leaving.

## Open for Bob

None: answered by Bob 2026-09-26 (K102).

## Decided by BOB (for the rulings)

- `from`: `legacy-store`, `legacy-index` (`op=monitor` and its helpers), `legacy-checks` (C-18.5), as K72 (1) did for layer 3; the C-48.8 and C-48.9 rows move here (R42).
- The idempotence key (`monitor_fired`, `monitor_tick_epoch`, `#openTickEpoch`, `#claimFire`) is this module's: its only users are its two ticks.
- `recordSourceOutcome`, `sourceReachability` and the thresholds stay `capture`'s (its R8, R43); this module reads them.
- The credential choice (`#monitorTokenBound`, `#monitorToken`, `MONITOR_NO_LIVE_CREDENTIAL`) is shared with `capture-requests` today (store.mjs 40137, 40829), an earlier module; it goes to `runtime-limits` beside `liveToken` (`tokens.mjs`) as one `unattendedCredential(env)`, which both read until their in-process paths retire it. `#tickRunning` is per module: each keeps its own.
- R25 and R32 are stated as requirements from this reading.
- (K1019) R52's settings are a table of this module's keyed by normalised address, append-only, declared to purge only by a whole-store purge, as `monitor_address_type` is (R41). Its codes (`MACHINE_CANNOT_SET_FREQUENCY`, `NO_SUCH_ADDRESS`, `BAD_FREQUENCY`, `NOT_A_SOURCE_OWNER`, `FREQUENCY_NO_REASON`) take rows in this module's table (accepted red 3), and `addressfrequencyset` an op-declarations spec (member session) and an affordances rung `reasoned` in L11 (accepted red 5). The four canned reasons are BOB's wording; the design session may re-word them.
- Uses as listed above (map §5.2).
