# Task summary · T53 · monitoring

This summary stands for the monitoring job's reading set (SESSIONS §6.3): the monitoring block of `build/plan/current.md` (:329-333), the rows file `build/plan/T53-R1/monitoring.md` (no monitoring trims file exists), `build/requirements/monitoring.md` (both parts), `build/layers.md` (head, layer 10), and the Public Purpose (and named services) of the 29 modules it uses. Cap 34,000 bytes: detail cut, codes, orders, numbers, signatures kept. The sources stay binding; read any cited section in full when the work touches it.

## Entries

- T53-311 · K4403 · CAPABILITIES rows (`current.md`:330); row (replaces `[owed: pause line]`): T53 · K4403 (2), (7) · pause also stops register slices and docket polls; a member's act under a pause is queued, `citationLookup` runs (UNVERIFIED, recommended) · N1259-c R81 (R81)
- T53-312 · K5565 · English in tests: its entry (`current.md`:331): convert English-in-test sites to the word key and its values; a B site first gets a words row key in the module; a C site kept as input or removed with its reason; Test: the words check's baseline loses the module's files, suite green (R1-R81)
- Row, layer 10, monitoring: literal A / B files 0 / 0; regex A / B / C sites 22 / 8 / 26 (13 files); model `haiku-5-5` test-only, `sonnet-5-5` where a B site needs a key (K3518) (R78)
- `current.md`:332 rows file; its **following** row (C T52-34; T53 · N1259, K5513): **monitoring** · pause stops slices and polls (R81); `current.md`:333 begins **following** (T53-313), not monitoring's

## monitoring (own requirements)
- R9, R19, R20, R65-R68, R74-R78 · shortened in this summary, and most Test, Control and history sentences dropped: read a requirement whole in build/requirements/monitoring.md before changing it or its test; acquisition R7, R8, R11-R19, R32-R35, R45-R109 are not restated: read them whole when the work touches them

Status: in force (K102; R17 as K1019). R53-R64 retired to `link-sweep` R1-R12 (N506). Not yet met: R34, R73 (T46), R74 (T47), R81 (T53). R75-R77 go in `named-requests.mjs` (P6).
Purpose: the daemon's watch over what standing intent names: checks each monitored document at its own cadence, records a look and a mechanical tick, never deciding what a change means (Intake Doctrine §4, §6); fires the archive fallback; names Drive shell baselines; guards the gathering grammar; watches action clocks and what objectives rest on.
Terms: **tick** one check of one monitored document; **look** the observation-log row a tick writes; **floor** the least consecutive-failure count from which an address could become fallback-eligible (`max(1, min(failures, minForAge))`, 2 by default).

`monitor({bundleId, actor})` (`op=monitor`; admin, member, probe, daemon; mutating):
- R1 · Refusals in order, nothing written: no `bundleId`; absent/invisible `ABSENT` identically; silent store named silent, never `ABSENT`; `NOT_MONITORED` unless `monitoring.enabled` is `true`; `NO_LOCATOR` unless `source.locator` public https; Drive folder / undetermined kind / unrecognised shape `DRIVE_FOLDER_NOT_A_DOCUMENT`, `DRIVE_KIND_UNDETERMINED`, `DRIVE_SHAPE_UNRECOGNISED`.
- R2 · Fetches the Drive export address (harvestable Drive) or the locator via `host-governor`; governed refusal `HOST_COOLING_OFF` + `retry_in_ms`, a governed look (R11), nothing else.
- R3 · Baseline: register row naming the Drive export address (harvestable Drive), else row with the bundle's locator, else row whose `archive.org` hop names this address (normalised). Rendered: the pair's shell digest or none, never the rendered digest. Unparsable register: none.
- R4 · 404/410 `removed`; other non-success/failed fetch unreachable (no status, reason). Drive export `text/html`/`application/xhtml+xml` `DRIVE_TICK_EXPORT_IS_THE_SHELL` (C-48.8); first KiB sniffing HTML `DRIVE_TICK_EXPORT_BYTES_ARE_THE_SHELL` (C-48.9): `unreachable` look, document untouched. (K5148) First 404/410 `unconfirmed_removal` (not flagged); `removed` only when a look 24 h+ after still answers 404/410; redirect `moved` (final address, bytes compared there); other non-success `refused` + reason.
- R5 · Rendered: served bytes vs shell digest: equal `frame: unchanged`, different `modified` about the frame; content undetermined every tick. No baseline: nothing compared, recorded. Else evidentiary digests only when the baseline recorded a determined one and the fetched bytes identify under the same handler key+version, member, determined digest; else raw SHA-256. `compared` `evidentiary`/`raw`/`shell`/null + `compared_basis`.
- R6 · `assess` runs over the baseline's own bytes (capture store, hash-verified) and the fetched text; each way it cannot run is a named `assessment_basis`, never a substitute. R7 · A shell captured as the document (contract `unmonitorable`, not rendered) grades no change: status withdrawn, look indeterminate; `removed` unaffected.
- R8 · One promotion via `promotion.promote`: `writer: mechanical`, `operation: monitor-tick`, author `bio-monitor`, base the live digest; changes only `source_status` (if found), `monitoring.last_checked` (added if absent), `last_updated`, and when flagged `reeval_pending.flag: true`, `.since`, `.source: source_status`; one Session Log entry. Flagged: `removed`, or `modified` unless `assess` settled `identical`/`unchanged`/`restyled`/`routine`. (K5148) Flagged is a confirmed `removed` or `modified`; `unconfirmed_removal`, `moved`, `refused` never.
- R9 · A non-rendered `modified` tick captures its fetched bytes (D-455): held under the capture key (`existed`), filed in the same promotion as `snapshots/monitor-<first 12 hex>-<leaf>` with a register row; refused with them, retried once without (refusal kept as `why`); no capture store a stated `why`. Answer `capture` (`sha256`, `file`, `existed`, `registered`, `why`, ...).
- R10 · Answer: `ok`, `checked`, `status`, `note`, `baseline`, `seen`, `compared`, `compared_basis`, `assessment`, `assessment_basis`, `cadence`, `observation`, `capture`, `reeval_raised`, `revision` or the promotion's `reason`/`detail`; a silent store is named.

`monitorSet({bundleId, enabled, frequency?, author, viewer})` (`op=monitorset`; member session; mutating):
- R74 · (amends R1) Sets `monitoring.enabled` and, if given, `monitoring.frequency` (`MONITOR_FREQ`). Refusals in order, nothing written: empty/machine `author` `MACHINE_CANNOT_SET_MONITORING` (C-18.20); no `bundleId`; `ABSENT`; `enabled` not boolean or bad `frequency` `MONITOR_SET_REFUSED` (C-18.21, names the field); `enabled: true` without public-https locator `NO_LOCATOR`. Already in state: `{ok: true, existed: true}`. Else one promotion authored by the member (not mechanical; `promotion`'s refusal relayed) changing only `monitoring.enabled`, `.frequency`, `last_updated`, one Session Log entry; answers `{ok: true, bundleId, enabled, frequency, revision}`; fetches nothing.

`recordLook` (route `monitorlook`):
- R11 · One observation row, authority `sweep` naming the bundle, level `document`, subject the address: `unchanged` `PRESENT` (baseline); `changed` `PRESENT` (new capture if R12 admits, else baseline, served digest in `detail`); `removed` `LOOKED_ABSENT`; `unreachable`, `unmonitorable` `LOOKED_INDETERMINATE`; `governed` `LOOKED_INDETERMINATE`, `governed` set, condition `source-unreachable-governed`. Without baseline `unchanged`/`changed`, and other outcomes: nothing written, why said.
- R12 · A `changed` look names a capture only if the register holds that digest under this bundle and the tick saw it; then records the version via `provenance`'s captured-locator writer under the sweep's authority, once; else `uncaptured` says why. R13 · What a tick read an address as is kept per normalised address: a contract-determining reading replaces; one that could not is written only where nothing is held.

The cadence (BOB #31; Content Framework §6):
- R14 · Frequency: authored `MONITOR_FREQ` word; authored unknown word undetermined, stated; none takes the last-read contract (`membership` daily, `substance` weekly, `unmonitorable` none); else undetermined, stated. hourly 1 h, daily 24 h, weekly 7 d, monthly 30 d; `per_meeting`, `none` no interval.
- R15 · Subject is an address. Bundles group by their captured versions' addresses; each address checked once against its current version (newest asking), whose frequency governs, never the shortest; `newer_unmonitored`; `disagreement`; last checked when any version was. A bundle with no captured address, or several none singly its locator, is its own subject. A public register's query for one identifier a member names for a person is watched as any address, nothing followed out or searched elsewhere; never a crawl of a person; a name-only or cross-register query is not watched.
- R16 · Plan: never checked, or nothing authored/read (`frequency_source: unread`), due now; no interval `unscheduled` + reason; else due when last check + interval <= now, else `next`. Due: longest-overdue first, then id. R17 · An address's own frequency (R52) governs over its versions', stated on the row (`frequency_source: address`, reason, who, when).
- R52 · `addressFrequencySet({address, frequency, reason, reasonText?, author, viewer})` (`op=addressfrequencyset`). Refusals in order, nothing written: empty/machine author `MACHINE_CANNOT_SET_FREQUENCY`; non-subject/unseen `NO_SUCH_ADDRESS`; frequency not a `MONITOR_FREQ` word or `null` `BAD_FREQUENCY`; author owning no project with a monitored document there (`membership.isProjectOwner`) `NOT_A_SOURCE_OWNER`; reason not canned/`custom`, or `custom` with blank/absent/over-2,000-char `reasonText` `FREQUENCY_NO_REASON`. Canned keys (BOB's wording in source R52): `source_changes_rarely`, `source_changes_often`, `legal_deadline_approaching`, `source_unreliable`, `custom`. Kept with reason, who, when; never edited, a later replaces (`null` returns to R14).
- R71 · `addressWatchEnd({address, until, by, viewer})` (in process, from `following` R25): `until` a calendar day (`civil-time.isCalendarDate`) not before today's local day in the instance zone; `null` clears. Refusals in order: empty/machine `by` `MACHINE_CANNOT_SET_FREQUENCY`; `NO_SUCH_ADDRESS`; bad or past `until` `WATCH_END_REFUSED`. After the end day the row is `ended`: never due, no tick, no look, no `monitoring-recheck-due` (R31); a document still asking: `asked_after_end`, no restart.
- R72 · `addressWatchers(address)` (in process, for `following` R24): ids of projects whose monitored documents ask there, `[]` for a non-subject; not an op.
- R18 · Volatility lengthens only a contract default (R14), never authored or an address's own (R17), never shorter; row states basis, count, step. 10 unchanged checks in a row: one step up (daily, weekly, monthly); 10 more: one more, never past monthly; any change, or unreachable/indeterminate check, returns to the default (K1051).

For `scheduler`: `cadenceDue/Wake/Tick(now)`, `archiveDue/Wake/Tick(now)`:
- R19 · Cadence tick inert unless configured (R23, R24). Due while a subject is due; wake now + 1 s while due, else `next`, else null. At most 50 due subjects by R1-R10; answers `{configured, at, epoch, monitored, addresses, candidates, next, ticked, skipped, failed, unscheduled}`, `gathered`. `cadenceTick(now, rank)` (scheduler R10): reads at most ten times its batch in R16's order, checks in the rank's order, offered `{kind: "address", id, waitingSince: instant it fell due, or null}`; else R16's order.
- R20 · Archive tick inert unless configured; due every firing; wake now + interval (1 h, binding may set) while an address has at least the floor of consecutive failures, else null. At most 50 such addresses, oldest failing run first, asks `capture.sourceReachability`, fires the fallback per eligible via `capture.acquire`'s archive arm naming only the document address. Answers `{configured, at, checked, epoch, eligible, fired, failed, skipped}`. `archiveTick(now, rank)`: reads ten times its 50, takes 50 in the rank's order, offered `{kind: "address", id, waitingSince: first failure of its run}`.
- R21 · A retry never fires a subject twice: a tick claims a subject under its consumer's open epoch first; epoch reused while younger than the consumer's interval (archive's, or 1 h for cadence), else replaced, a fresh epoch dropping the others' claims; closed only when nothing failed and nothing skipped (D-518).
- R22 · Not re-entrant: `busy: true`, does nothing. R23 · Ticks call R1-R10 and `capture.acquire` in process, spend no credential. R45 · Runs wherever a document asks to be monitored; no binding or credential a condition; an administrator may pause (R30), stated on every tick's answer and R32's. R24 · retired (K372).
- R25 · Each tick's outcome is recorded with `capture`'s reachability (success; `removed`/other refusal `source_refused`; failed fetch `fetch_failed`; `governed` apart), so a silent source reaches the fallback.
- R46 · `counts()` answers `{monitorFired, monitorTickEpoch, monitorAddressType}`, row counts of R41's three tables, whole-store; writes nothing, never throws. R51 · Registered once at start via `record-core.registerCounts` (its R63), whole-store whatever `hid` names.
- R26 · `driveShells({viewer, limit, after})` (`op=driveshells`; read) pages bundles with a Google projected locator (200, max 1,000, `truncated`, `cursor`); each harvestable Drive baseline classified (at most 50 retrievals) `shells`, `export`, `undetermined`, `no_baseline`; also `unreadable`, `not_documents`. A shell names its remedy (re-acquire); nothing is re-acquired.

`namedRequestSet({bundle, request, target, locators, authority, criticality, cadence, status, author, viewer})` (`op=namedrequestset`, mutating, member session), `namedRequests({viewer})` (`op=namedrequests`, read):
- R75 · One request of `data/gathering.json` `requests[]` by one promotion authored by the member, others/`daemon`/`sweeps` unchanged, via R77. `request` absent mints the id (`GATH`, R69); present revises. Fields as C-18.5: `target.text` (1-200, one line), `target.description` (2,000), `locators` (public https, authoritative first), `authority`, `criticality` (`crucial`, `supporting`), `cadence` (`hourly`, `daily`, `weekly`, `monthly`, `none`; absent once), `status` (`open` default, `retired`; `captured` refused); `planted` the act's instant. Refusals in order, nothing written: `MACHINE_CANNOT_SET_REQUEST` (new row); R1's required-argument; `ABSENT`; `NAMED_REQUEST_REFUSED` (new row; `checkGatheringGrammar`); `NO_SUCH_REQUEST`; then `promotion`'s (`GATHERING_REFUSED`). Unchanged `{ok: true, existed: true}`. A revision keeps an absent `status` and the planted instant; a minted id is taken back with any refusal. Fetches nothing; an open new request is due next tick.
- R76 · `namedRequests` answers every request of every `data/gathering.json` the viewer may see (R32's sight): with `last_attempt`, `due`, `next`, `daemon`, `state` (`due`, `scheduled`, `done`, `unscheduled`, `disabled`, `closed`; reasons given), `paused`, `counts`, `limit`, `truncated`; an unseen request neither answered nor counted; writes nothing.
- R78 · `DECLARED_OPS` beside the ops map, worded by key: `monitor`, `monitoring`, `monitorpause`, `monitorset`, `monitorslate`, `namedrequestset` (`admin`, `member`; `machineClasses: []`; mutating; `reversible`), `namedrequests` (`admin`, `member`, `probe`; read). `accepts` every field read (stamps excluded), `requires` those refused without (`monitor` `bundleId`; `monitorpause` `paused`; `monitorset` `bundleId`, `enabled`); a helper test per op.

Gathering grammar and standing intent:
- R27 · A non-replay promotion carrying `data/gathering.json` whose C-18.5 grammar finds an error is refused `GATHERING_REFUSED` with `findings: [{check, detail}]`; replay exempt; a bundle without the file not asked.
- R28 · Each open named request whose cadence is due is captured via `capture.acquire` from its locators in order, authoritative first, the request as authority; lands no higher than verification earns Wording (K1096; §2, §4): one locator at a time through `acquire`'s capture-request arm, stopping at the first that files; one observation per attempt (R11). New bytes: a gated Information bundle via `promotion.promote` (`origin: named_request`, request id and bundle as authorisation), at the state its grade earns for a mechanical writer, never verified; held bytes land nothing. Due by R14 from last attempt (never attempted due; no cadence once; `none` never); only `open`. Runs after the batch's addresses within R19's 50, as `gathered`; paused (R30) nothing. The bundle's `daemon` block governs (K1102): `enabled: false` runs none; `tick_budget` bounds locators per tick; `sweep_budget` is R29's.
- R29 · A ratified sweep is named standing intent, run by link-sweep R4-R9 within its scope and budget; each document is its own Information bundle at `collected`, never higher.
- R30 · Pausable by an administrator (monitoring's and the fallback's fetches stop, and docket reads, R67; a paused tick says so); pause/resume by a non-administrator (`membership` R64 `isAdministrator`, of the stamped `actor`) refused `NOT_AN_ADMIN` through `membership.notAnAdmin` (its R84), nothing written; root of trust is an administrator (N314, K380); mints no `NOT_AN_ADMIN`; its due slate (every named request, sweep (R66) and monitored address now due) is exported as quoted data inside fixed instruction framing.
- R53-R64 · retired: moved to `link-sweep` R1-R12 in order, never reused.

Sweep's seam (for `link-sweep`):
- R65 · `sweepHost()` (writes nothing, never throws) answers `paused()` (R30's held pause), `openEpoch(consumer, now, staleAfterMs)`, `claim(consumer, subject, epoch)` (`true` once per subject per epoch), `closeEpoch` (R21), `running` (R22's guard), `ranked` (R19), `land(request, filed, at, say?)` (R28's landing: bundle at `collected`, never verified, via `promotion.promote`), `gate(viewer)`, `recheckMs()`.
- R66 · `registerSweep(module, {grammar, fence, dueForSlate})` once at composition (link-sweep R1-R3, R9). `grammar(entry, ids)` gives C-18.5 findings for an object `sweeps[]` entry, added to R27's check and R42's audit: one refusal, `SWEEP_TERM_REFUSED` before `GATHERING_REFUSED` (DEC-49); `fence(c, nextText)` asked last, its refusal the promotion's; `dueForSlate(now, sees)` for R30's slate. A second registration, or not three functions, refused `{ok: false, reason}`; a throwing `grammar`/`fence` fails closed, a throwing `dueForSlate` lists none.
- R77 · (amends R65) One writer of `data/gathering.json`: `sweepHost().write({bundle, mutate, author, viewer, log})` reads the file (absent `{}`), applies `mutate`, writes canonically (two-space JSON + newline) via `promotion.promote` as the member (R27 check and sweep fence run there); `log` the one Session Log sentence; one transaction. Refusals in order: empty/machine `author`, missing `bundle`/`mutate`/`log`; `ABSENT`; held file not inline/JSON/object `GATHERING_REFUSED`, not overwritten; `mutate`'s, then `promotion`'s. Unchanged `{ok: true, existed: true}`. R75, `link-sweep` R13, R14 write only through it.

Docket watch (DEC-101 (3); Publication §5A, §5D):
- R67 · Cadence tick reads `caseImport.watchedImports` (`case-import` R18) to its end. Due when never read or `last_read.at` + 24 h <= now; read after the batch's addresses, before named requests (R28), within R19's 50, oldest due first, each claimed as `docket:<import>` under R21's epoch. Read = GET via `host-governor` (R2), at most 8 MiB: `read` if HTTP 200 and JSON `{ok: true, result}` with `result` an object with an `entries` list; else `unreadable` (`http_<status>`, `not_json`, `not_a_docket`, `too_large`, `fetch_failed`). Outcome to `caseImport.recordDocketRead`, `answer` = `result`. Governed refusal: nothing recorded, counts `governed`, stays due (R39). A refusing `recordDocketRead`: `failed`, epoch open. Answer gains `watched: {due, read, unreadable, governed, failed}`; no observation row (DEC-116). Paused (R30): none read.
- R68 · `cadenceDue` also due while a watch is due; `cadenceWake` takes the earliest watch due instant as a candidate for `next`; with rank a watch is offered `{kind: "docket", id: <import>, waitingSince: last_read.at + 24 h, or null}`. Settled (K1392): a watch claimed by an unfinished tick is neither read nor listed, epoch stays open; each read (governed included) spends one of R19's 50; a non-public-https docket address is `unreadable`, `fetch_failed` (R36), not fetched; paused, `cadenceWake` looks again one archive interval on.

What reaches members (NOTIFICATIONS.md):
- R31 · Reads give the items `queue-producers`, `machinery-producers` publish: `source-modified`, `source-removed` (FINDING), one per flagged tick (R48); `archive-fallback-eligible` (CONDITION), one per eligible address (R47); `monitoring-recheck-due` (CONDITION), one per monitored address overdue by more than its interval or unscheduled (R16, R32); link-sweep R11's five sweep conditions. No item is published here.
- R32 · `monitoring({viewer})` answers every monitored address the viewer may see with its R15-R16 row, unscheduled included, each with `until` (R71's setting) or `until: null` + `ends: "none_set"`; (K5148) last look's outcome (`unconfirmed_removal`, `moved`, `refused` + reason); such a watch stays due.
- R47 · `archiveEligible(now)`: what the next unranked archive tick (R20) would find eligible, writing nothing: of at most 50 addresses at the floor, oldest failing first, those `capture.sourceReachability` answers `fallback_eligible`, each `{address, first_failure_since, reachability}`, with `limit` (50), `truncated`, `paused` stated beside them. Never throws.
- R48 · `flagged({viewer, limit})`: monitored documents the viewer may see whose last tick flagged them (R8: `reeval_pending.flag` true, `source: source_status`), each `{bundleId, source_status, since}`, at most the first `limit` (1-200, default 200) in id order; unseen skipped, never counted (K391); `truncated`. Never throws.

Understanding and action layers (`layers.md` 7, 9):
- R33 · Sources a live objective or published finding rests on are known here; one not monitored is proposed to the members who own it, never enabled by the daemon; a member's adoption is the ratification; a change at a watched source reaches `reevaluation` as R8's flag. Read via `intent` R7, `publication` R42 to cursor end.
- R34 · A `pending` clock entry whose date has passed (before the local day of the office's or venue's jurisdiction, as `actions` R12 reads it through `civil-time`, never UTC; K1444 (iii)) is marked `overdue` by a mechanical promotion `deadline-recheck` (only `clock[].status`, `last_updated`); members told (State Rules §4.4, I-11) by `action-producers` R1's item. An entry with a time of day (`action-clocks` R3 `due_at`, the office's zone) is past at that instant in that zone. Not yet met (T46).
- R73 · (amends R34, R50) A timed entry's instant is read from `action-clocks.pendingClocks` items: `due_at`, `due_zone` (entry's own zone if named, else the action's), never from the action's document; both null = date-only. R34 marks at that instant (`actions` R98), R50 offers it as candidate wake; date-only from the local day after; a wall time the zone skips or repeats is read by date alone, never early (K2871). Not yet met (T46).
- R44 · R34's mark is bounded by `actions` R33: via `action-clocks.pendingClocks`, an entry moves only `pending` to `overdue`, never adds/removes/re-dates; `met`, `waived`, `overdue` left. R35 · When a clock is marked overdue or a response recorded against an action, monitoring asks `escalation` whether a stage's trigger is met so the next is proposed; never advances a stage.
- R50 · `deadlineRecheckWake(now)`: start of the local day (R34's zone, `civil-time.dayRange`) after the earliest date among `pending` entries of visible actions (`action-clocks.pendingClocks`), null if none; `deadlineRecheckDue(now)`: that instant if at or before `now`, else null. `scheduler`'s `deadline-recheck` consumer (its R5) runs R34 on the first alarm of that day. (K719) An entry whose last mark failed is left out until the next local day; a timed entry offers its instant.
- R70 · (K2524) For each project `investigation.watchedProjects()` answers (`investigation` R18), watches the sources `intent` R7 names at their own cadence; a look recording something new calls `investigation.watchArrival({project, source, at})` once, deciding nothing about meaning.
- R79 · (K5157) A copy the tick files (R9) carries its provenance document entry and a `reading` job owed through the capture's registrar (control-plane R123). R80 · (K5186; amends R79) That entry carries `provenance_chain` (one hop, the tick's fetch) and the capture's `profile`, as acquisition's does, so the register files a vouched copy (never `PROVENANCE_REGISTER_REFUSED`, C-18.9 `chain-absent`) and a textual copy is read as text.
- R81 · (T53; N1259; K4403 (2), (7); amends R30) Not yet met. The pause also stops `registers.importTick` fetches (through the host's `paused()`, R65, handed in by `scheduler` R34) and every `docket-entries` poll (`following` R41); answers say `paused`; resuming continues from cursors; a member's acts (`importStart`, `registerRefresh`) are accepted and queued; a member's `citationLookup` is not a daemon read and is not stopped (UNVERIFIED: R30 silent on a member's act under a pause; BOB's to confirm). Test: paused, no slice runs and no docket is polled; resumed, both continue; non-administrator pause `NOT_AN_ADMIN`.

- R36 · Invariant: the daemon fetches only what store state authorizes: a monitored bundle; a named request's locators; a ratified sweep's seeds and the candidates link-sweep R6 admits; a watch's docket address (R67). No caller names what is fetched.
- R37 · Invariant: change detection is mechanical, meaning is not: a tick writes only `monitor-tick`'s field set, never the document's hash as current (Intake Doctrine §6; State Rules §8). R38 · A costless equality is not evidence: a shell's match never reads `unchanged`; a rendered capture's content is undetermined. R39 · A governed refusal is a fact about the instance, never the source failing (D-104). R40 · Bias never shapes what is monitored. R43 · No place is named in behaviour or outward text.
- R41 · Invariant: `monitor_fired`, `monitor_tick_epoch`, `monitor_address_type` are this module's, derived, declared to purge (K23): `monitor_fired` by subject; `monitor_address_type` whole-store only; (K5152) `monitor_address_look` a fourth table, whole-store.
- R42 · Invariant: C-18.5 (every `checkGatheringGrammar` arm; sweep arms via R66), C-48.8, C-48.9 each with its test, in this module's own table; the rest of C-48 is `acquisition`'s. R69 · The gathering id C-18.5 tests uses the pattern `record-grammar`'s id table answers (`idPattern`), never its own: four-plus-digit counters accepted, ids valid before stay valid. R49 · A store's own refusal (`answer-envelope` R3) is answered with its status, code, sentence via `storeRefusal`; only a non-answer is `STORE_DID_NOT_ANSWER`.
- Satisfies (R1-R81): Intake Doctrine §4, §6, §9; Content Framework Part I §6; State Rules §4.1, §4.4, §6 I-11, I-18, §8; Design Requirements §7; Action v0_2 rules 6, 17; Publication §5A, §5D. Open for Bob: none.


## Uses: record-grammar
Purpose: shared grammar; no store (R1, R69).
## Uses: runtime-limits
Purpose: token hygiene; no store (R23).
## Uses: subresources
Purpose: `normalizeAddress` (R11).
## Uses: jurisdictions
Purpose: jurisdiction profiles as data (R43).
## Uses: format-registry
Purpose: formats known (R5).
## Uses: docprofile
Purpose: document type; `assess`, never by raw bytes (R5, R6).
## Uses: record-core
Purpose: storage (ids, history, purge).
`declarePurge(module, tables, {exempt?})` (R41):
- R21 · Tables declared once at start via `declareTable(module, entries)` with classes `purge` (`clear`/`exempt`), `expunge` (`tombstone`/`none`), `export` (`yes`/`admin-only`/`never`), `sight` (`group`/`bundle`/`source`/`owner`), `derive` (`stored`/`derived-rebuildable`), `version_chain`; missing `TABLE_CLASS_MISSING`, unknown value `TABLE_CLASS_UNKNOWN`, nothing registered. `declarePurge` default: `purge` `clear` (`exempt` if listed), `expunge` `none`, `export` `admin-only`, `sight` `bundle` if keyed else `group`, `derive` `stored`, `version_chain` `false`. Declared twice or by two modules: `TABLE_DECLARED`. R46 · A table is a name keyed by `bundle_id`, or `{name, keys: [columns], whole: "<WHERE clause>"}`.
`stampInstant(precision, when?)`, `instantOrder(a, b)`:
- R47 · UTC ISO 8601: `"second"` `YYYY-MM-DDTHH:MM:SSZ`, `"millisecond"` `...SS.sssZ`; other precision throws. R48 · `instantOrder` compares as instants, NaN if unreadable; never throws.
## Uses: membership
Purpose: members and what each may do.
`notAnAdmin(by, act, extra?) → refusal` (R30):
- R84 · retired: moved to `member-roster` R28 (T51); R30 calls it by this name.
## Uses: promotion
Purpose: the one write path for a bundle.
`registerStep(module, {check?, project?})`, `registerFact(name, module, fn)` (R27):
- R39 · A later module registers once at start a `check` before the write and a `project`ion after, inside one `record-core.transact`; a check's refusal refuses the promotion under R2 with its own `reason`; registered twice: `STEP_DECLARED`; order: own refusals, registered checks (layer order), `commit`, projections. R40 · No provider for a `registerFact` fact: `FACT_UNAVAILABLE`.
## Uses: host-governor
Purpose: paces fetches per host; its refusal is a fact about this instance, never the source (R2, R39).
`governedFetch(target, {userAgent, fetch, governor}) → {res} | {refusedByGovernor: true, reason, retry_in_ms, last_refusal_status}` (R2):
- R15 · Asks R1-R6 for the host; refused: the refusal, nothing fetched. R16 · Admitted: waits `wait_ms`, fetches once with the caller's user agent, reports status to R8-R10. R17 · An unreachable governor never blocks the fetch.
## Uses: provenance
Purpose: the trust root; a hop attests bytes, address, time, never credibility (R3, R12).
## Uses: capture-sources
Purpose: rules for rendered, archive and Drive capture.
`readDriveAddress(address)` (R1, R26):
- R39 · `null` unless `https:` on a Drive host; else `{address, host, shape, harvestable, ...}`. R40 · `shape`: `folder`, `published`, `file`, `unknown` (not harvestable, `why`); `document`|`spreadsheet`|`presentation` harvestable (`kind`, `fileId`, `format`, `mimetype`, `exportAddress`); folder/unknown named, never skipped.
`driveBaselineRow(rows, drive, locator)`, `classifyDriveBaseline({drive, locator, rows, retrievals})` (R3, R26):
- R45 · The row naming the export address when harvestable, else naming `locator`, else `null`. R46 · `no_baseline` with no row; else `export`, `shell` or `undetermined` (sources disagree, both addresses fetched, or neither speaks) from `retrievals` and the register profile, with `basis`.
## Uses: capture
Purpose: brings material in with provenance; keeps reachability.
`acquire(body, {cls, member})` (R20, R28; R1-R7, R9-R14, R16-R20 moved to `acquisition`):
- R8 · Each attempt `success`, `source_refused`, `fetch_failed` or `governed` (apart, never a failure). Fallback-eligible after 3 consecutive failures, or 2+ with the first 14+ days old. `sourceReachability({addressNorm})`: counts, thresholds, eligibility, basis, `known: false` if never attempted. R90 · judged at the server's instant (request `now` ignored).
## Uses: acquisition
Purpose: the acquisition act; binding core only; read its `acquire` block when the work touches it.
`acquire(store, body, {cls, member, sessMember, storeName, captureRequest})` (R20, R28):
- R1 · `daemon` refused `NOT_PERMITTED` except archive and capture-request arms. R2 · `BAD_LOCATOR`. R3 · archive arm: `BAD_ADDRESS`, `NOT_ELIGIBLE`, `ARCHIVE_UNREACHABLE`, `ARCHIVE_REFUSED`, `HOST_COOLING_OFF`. R4 · Drive arm: `DRIVE_HOP_FACT_SUPPLIED` (C-48.1), `DRIVE_FOLDER_NOT_A_DOCUMENT`, `DRIVE_KIND_UNDETERMINED`, `DRIVE_SHAPE_UNRECOGNISED`, `DRIVE_EXPORT_IS_THE_SHELL` (C-48.5), `DRIVE_EXPORT_UNREACHABLE` (C-48.6), `DRIVE_EXPORT_BYTES_ARE_THE_SHELL` (C-48.7). R5, R6 · render arm (`RENDER_*`, C-83). R9 · every fetch through the host governor. R10 · `FETCH_FAILED`, `SOURCE_REFUSED`, `NO_BODY`, `TOO_LARGE`, `EMPTY`, `HASH_DISAGREEMENT`.
- R21 · capture-request arm: `captureRequest.origin` files `origin: {kind: "sweep", matched_sweep, deeming_actor}`. R22 · `heldSha`: conditional fetch; `304` files nothing. R31 · sweep origin: `scope`, `SWEEP_REDIRECT_OUT_OF_SCOPE`, `SWEEP_SCOPE_MISSING`. R36 · `keyedFetch`: a daemon only `purpose: "docket-entries"` on `courtlistener`, once a day per followed case, else `NOT_PERMITTED`. R37 · `citationLookup`, never verified.
`civicsmithUserAgent(version, instance, purpose)` (K649 (1)):
- R24 · `Civicsmith/<version> (+<CIVICSMITH_CONTACT_URL>; instance <instance>; <purpose>)`, missing version `0.0.0`, instance `unnamed`; the one spelling, read here by `capture-requests`, `monitoring`, `ratification`, `instance-setup`.
## Uses: observation-log
Purpose: records looking, nothing-found included (R11).
## Uses: retrieval
Purpose: query language; monitoring columns (R32).
## Uses: intent
Purpose: objectives (R7, R33, R70).
## Uses: reevaluation
Purpose: says which findings a change affects (R33).
## Uses: publication
Purpose: the published record; `restingCapturesOf` (its R42) for R33.
## Uses: actions
Purpose: the Action object (R34, R44).
## Uses: action-clocks
Purpose: action deadlines (`pendingClocks`) (R34, R44, R50, R73).
## Uses: escalation
Purpose: escalation stages (R35).
## Uses: credentials
Purpose: credentials (R23, R36).
## Uses: case-import
Purpose: imports a case file read-only; `watchedImports`, `recordDocketRead` (its R18) for R67, R68.
## Uses: civil-time
Purpose: civil time; pure (R34, R71).
## Uses: investigation
Purpose: project working material; `watchedProjects`, `watchArrival` (R70).
## Uses: setup-words
Purpose: frozen word list (R74).
## Uses: test-support
Purpose: sandbox, fixtures (R78).

