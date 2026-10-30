# Task summary · T53 · notice-producers

Stands for: `build/plan/current.md` lines 400-406 (plan block), `build/plan/T53-R1/notice-producers.md` (rows file), `build/requirements/notice-producers.md` (R1-R36, Uses, Invariants), `build/layers.md` (head, layer 11's row), and the Public part of each used module's requirements file (Purpose only for `record-grammar`, `jurisdictions`, `entities`, `retrieval`). The sources stay binding; where a requirement is compressed here the line says "read R<n> whole"; read any cited section in full when your work touches it. Layer 11: a module uses only modules earlier in the total order (P4); nothing below depends on layer 11; `notice-producers` sits after `queue-producers`, before `queue` (layers.md § layer 11 row). No place is named in behaviour or outward text (layers.md § "No jurisdiction in the product", rule 5; R10).

Gaps (not in the reading set, not read): `mail-door` R6, R15; `registers` R13; `record-core` R92 and `index.mjs` ~1595, 1600; `member-roster` R29 (where `membership` R86 `activeAdmins` moved); `queue-producers` R8, R25. A job needing their text reads them.

## Entries

- **T53-342** (current.md:401; rows file, plan-T53-capabilities.md): K4403 (7): a change told once to the watch's owner with counts; an import done, stopped, failed told to its starter; no name in any item (N1259-c R30-R32). Meets R30, R31, R32 and amends R1; `NOTICE_KINDS` gains `register-changed-noticed`, `register-import-done`, `register-import-stopped`, `register-import-failed` (all FINDING). Second row (N824 R6 amended, C31): the private notice that unconfirmed mail was removed, reading `mail-clear`'s counts, kind UNVERIFIED, no line drafted: this is R36.
- **T53-343** (current.md:402; K5571, ruling in the rows file): `ai-accounts`' and `ai-use`'s notices to owners are reads this module calls (the R13 pattern), never an upward use; lines owed here for ai-accounts R45, R72, R75-R77, R5, R24 and `termsNoticesDue`. Meets R16 (amended), R33, R34, R35. Ruling (2): every downward `uses` edge named enters `modules.json`; both `ai-use` and `ai-accounts` edges exist (§ Uses).
- **T53-344** (current.md:403; K5565, rows file "English in tests"): convert the module's English-in-test sites to the word key and its values: each assertion reads the key the product reads (and its placeholders' values), never a copied sentence; a B site (text only in the module's source) first gets its key in the module (a words row, UX-DESIGN's wording where shown to a member); a C site (in neither) is test input or a dead assertion, kept as input data or removed with its reason; every test the job touches for other entries is converted with it (the words check refuses English in a new or changed test). This module: literal sites 0 A / 0 B; regex sites 3 A / 0 B / 7 C (6 files) (`tests-sweep/CENSUS.md`, `tests-sweep/CENSUS-RX.md`). Test: the words check's baseline loses the module's files; the module's suite is green. Cites R23 (tests assert keys with `hasWord`).
- **T53-549** (current.md:404; K5670, record-core R92): read settings through `getSetting`, not the module's own SQL (index.mjs ~1595, 1600): the team's time zone R25 and R5 read. Read `record-core` R92 whole (not in this set).
- **T53-566** (current.md:405; mail-door R6): the member told when unconfirmed mail is removed after 14 days: a notice per removed row's owner, read from `clearWaitingMail`'s answer (`owners`). R36 names the read `mail-door.clearedOwners({after, limit, viewer})` (mail-door R15): the entry and R36 differ in name; read `mail-door` R6, R15 and follow R36. New `modules.json` edge `mail-door` (layer 3, downward) (§ Uses).

## notice-producers (own requirements)

R16, R29's seam and R30-R36 are marked not yet met (T53). Factory `noticeProducersOf(ctx, deps)` exports `noticeItems`; registers nothing, holds no check row (§ Suggestions).

### Public

Terms (§ Provides): item, home set, class (FINDING, OBLIGATION, CONDITION), key are `queue`'s and `queue-producers`'; a gate is open only once the false-alarm rate on its gold set is at most 20% (K1504).

- **R1** `noticeItems({member, viewer, now, identity, homesOf, optionsOf}) → {items, facts}`. Answers every item R2-R6, R12-R17, R24, R29-R31, R33-R36 derive, each homed through `homesOf(subjectIds)`, carrying `options` from `optionsOf(subjectIds)` (as `queue-producers` R8); `facts` states each producer's bound and `truncated`. Writes nothing, never throws; a provider that throws contributes no item and is named in `facts.failed`. Read R1 whole.
- **R2** FINDING `interest-check-noticed`: one per result of `people.checkResults({project, viewer})` not switched off for the project; key `FINDING::interest-check-noticed::<check>::<result>`; to the project's members who may see every input, nobody else. Detail: the check's data-defined condition, denominator, cited derivation; `label` `noticed`; names no judgment of a person (not "conflict", not suspicion); subject the pattern or transaction. Raised once; leaves on disposal or when the result no longer holds.
- **R3** FINDING `money-detector-noticed`: one per `money-checks.noticed({project, viewer})` result, key `FINDING::money-detector-noticed::<detector>::<result>`; recipients, detail, label, words, leaving as R2's.
- **R4** FINDING `standing-answer`: one per `answers.standingAnswersFor({member})` entry, key `FINDING::standing-answer::<question>::<run>`, to the question's author alone; subject the standing question; detail the new finds and answer (or what held the AI half back), labelled the assistant's machine work. Told once (DEC-94); leaves on disposal.
- **R5** FINDING `temporal-expectation-due`: one per occurrence `duties.occurrencesOf` answers `overdue` (after the latest candidate) or `undetermined` ("possibly overdue", between candidates), for duties `duties.dutiesOf` answers the viewer; key `FINDING::temporal-expectation-due::<duty>::<occurrence>::<state>`; to the member who adopted the duty, else the project's owners (`membership.projectOwners`, R65), else administrators; subject the duty naming occurrence, due date or candidates, basis kind, derivation; `label` `noticed`; `due` the local day. Never states a violation. Once per occurrence and state; leaves when met, met late or no longer overdue. The group's own checkpoint occurrence is never an item (D234; `action-plans` R23). No item for an occurrence whose due date (undetermined: latest candidate) falls after the day `following.dutyWatchEnd(duty)` answers; items already raised unchanged; null means as before. Read R5 whole.
- **R6** Item `inquiry-recheck-due`, key `<CLASS>::inquiry-recheck-due::<inquiry>::<date>` (class left open for BOB, § Suggestions 1: OBLIGATION or FINDING): one per wait `inquiry.datedWaits({member, asOf, viewer})` (its R55) answers `due`, to the setter alone; subject the inquiry naming what is awaited, from whom, by when (DEC-98); `due` that day. Leaves when she records a look, sets a new date, removes the wait, or the inquiry concludes.
- **R12** FINDING `security-level-high`: when `credentials.securityLevel()` answers `High`, one item to each active administrator (`membership.activeAdmins`), nobody else. Episode: an unbroken run of `High`; starts at the first whole hour at whose end the level was `High` after one at whose end it was not (from `credentials.securityMap`, R45, under the administrator's own `by`, at most 90 days); lasts until a call answers `Raised` or `Ordinary`. Key `FINDING::security-level-high::<episode start>` (instant to the hour): once per episode per administrator. Subject the group's Civicsmith (no bundle); `label` `noticed`; detail one plain sentence: level High, since when, whether anything got through (`through` count, `credentials` R44), counts only, no address, country, role, handle or member; carries `screen: {op: "securitymap", from, to}` (`from` episode start, `to` derivation instant). Leaves on disposal or episode end. A throwing or unanswering read contributes no item, named in `facts.failed`, never read as `Ordinary`. Read R12 whole.
- **R13** FINDING `policy-changed-noticed`: one per change of `following.policyChanges({since, after, limit, viewer})` with `amendment_held` false, `since` = 90 days before the call, following `cursor` to at most 1,000 (`facts` bound, `truncated`; the window read through `since`, never by filtering an unbounded read); key `FINDING::policy-changed-noticed::<watch>::<after.capture>`; to the declaring member (`standards` R1 author, via `standardRead` R5) while `active`, else administrators, only while the recipient may see the policy. Subject the policy naming address and both captures; `label` `noticed`; detail DEC-145 (5)'s sentence ("Changed without notice: the text differs from the copy captured on <date>, and no amendment was announced"; `<date>` the local day of `before.at`). Never says what a change means, never a violation, no R11 mark. Once per change; leaves on disposal or when a later read answers `amendment_held` true.
- **R14** FINDING `scan-found`: one per finding of `file-safety.scanFindings({since, after, limit, viewer})`, `since` = 90 days before the call, from the first page following `cursor` while `truncated`, at most 1,000 (`facts` bound, `truncated`); each read restarts from `since`, never a kept cursor; key `FINDING::scan-found::<captureSha>::<note_id>`; to each active member who may see the capture, nobody else (a finding on a capture the viewer may not see is no item and not counted, R7). Subject the capture's home (`provenance.homeOf`); detail: the file is held (`file-safety` R16), the names with engine, tool and date, each explained by `file-safety.findingKind` words (R38), the safe view stays open, the original opens again only when two members each release the hold with a reason or a second, different engine's clean check releases a hold the built-in scanner alone placed (`file-safety` R17, R18; DEC-169 (4)). Names no member. No hint mark. Leaves on disposal, `held: false`, or the finding leaving the window (K2238). Read R14 whole.
- **R15** FINDING `security-tool-off`: one per `file-safety.securityToolEvents({after, viewer})` event that switched a tool off (`PRIVATE_MODE_NOT_HONOURED`), read under the administrator's own viewer to at most 1,000 (`facts` bound, `truncated`); key `FINDING::security-tool-off::<tool_id>::<at>`; to each active administrator, nobody else. Subject the group's Civicsmith; detail names the tool, that it was switched off because it did not confirm the private mode its handling requires, and stays off until an administrator tests it again (`file-safety` R29); no file or member. Leaves on disposal or when `file-safety.securityTools` shows it `on`. A refusing or throwing read: no item, named in `facts.failed`.
- **R16** *(not yet met: T53)* One "Ask" item per `ai-use.exploreAsksPending` entry, one "Noticed" item per `ai-use.limitsReached` entry for the viewer (`ai-accounts` R13 and `projectAccountsSuspended` retired). Key is the entry's own `key`, read as given, never composed here. Words by key from `words.json`: `ai.queue.exploreask`, `ai.queue.limitreached` (a use), `.overall`, `.member` (by scope), `ai.queue.suspended`; a missing key fails the test, never a fallback. Fills: `{account}` from `ai.account.group|project|own` (`{project}` the name); `{period}` `ai.period.*`; `{use}` `ai.use.<use>.inline`; `{when}` `ai.until.day` or `ai.until.month` (`{month}` from `date.month.*`); `{date}` is `date.daymonth` (`{day}` unpadded local day `reached_at` falls on via `civil-time`, `{month}`) or `date.daymonthyear` (`{year}` four digits) when not in the current local year. Ask: `{scope}` from `ai.scope.group|own` or the project's name, `{account}` from `ai.account.<kind>.inline`. Names whose limit, which use, the period's end; never a member. Read R16 whole.
- **R17** Items, each told once, keyed as their source says: `question-find` (FINDING, "Hint · machine work"; `question-explorer` R5), `step-later-found` (FINDING; `steps` R23), `step-date-due`, `step-reminder` (OBLIGATION, to the setter; `steps` R12), `milestone-overdue` (FINDING), `milestone-reminder` (OBLIGATION, to the asker) (`investigation` R3), `project-quiet` (FINDING; `investigation` R18), `step-cost-shared`, `step-cost-message` (FINDING, to owners; `steps` R14, R15), `review-comment-left-out` (FINDING; `review` R33). `summary`/`detail` read by key `queue.<kind>.summary|detail` for all ten kinds. A find made while exploring carries `ai.label.explored` (`{owner}` from `ai-use` R6's `enabled_by`) only for the paying account's owners; others get `ai.label.explored.member` (no account, no person). Every `{date}` filled as R16's (`queue.step-later-found.detail` from `steps` R23's `looked_at`, else `at`; `queue.step-date-due.detail`; `queue.milestone-overdue.detail`). A step whose `byWhen` an action's clock entry holds (`steps` R29; `by_when_held`) draws no `step-date-due` (`action-producers` R1's item is the one). Read R17 whole.
- **R18** An occurrence R5 already raised keeps its item until disposed (`queue` R16) or met, met late or no longer overdue; a later end of watch never removes it; R5's end of telling holds only for an occurrence not yet told.
- **R19** `steps.stepsDue`'s `truncated: true` is carried into `facts` as the steps producer's bound reached; otherwise false (1,001 open dated steps names it; 1,000 does not).
- **R20** Sentences of R5, R6, R13, R14, R15 read from `words.json` by key, items answering `summary_key`/`detail_key`: R5 `queue.temporal-expectation-due.overdue.summary|.overdue.detail|.undetermined.summary|.undetermined.detail` (`{duty}`, `{office}`, `{what}`, `{basis}`, `{reason}`, `{date}`, `{from}`, `{to}`); R6 `queue.inquiry-recheck-due.summary|.detail` (`{question}`, `{what}`, `{who}`, `{date}`); R13 `queue.policy-changed-noticed.summary|.detail` (`{policy}`, `{date}`); R14 `queue.scan-found.summary|.detail` (`{document}`, `{engine}`, `{names}`, `{meanings}`, `{date}`); R15 `queue.security-tool-off.summary|.detail` (`{tool}`). Every date/`{from}`/`{to}` is `date.daymonth`, or `date.daymonthyear` when not in the current local year. R12 keeps its plain sentence. Read R20 whole.
- **R21** "Told before the end" is read from `following.dutyWatchEndAt(duty)` (`{day, at}` or null): an occurrence whose told state (`overdue`, or `undetermined` once its first candidate passed, in the duty's zone) began at or before `at` keeps its item (R18), for `keep` as for `stop`; one whose told state began after `at` with due date (latest candidate) after `day` raises none. Null is no end.
- **R22** `{reason}` of an `undetermined` item (and an `overdue` one whose sentence has it) is `duties.occurrencesOf`' `reason.says` (`duties` R33), never `why`; `reason: null` fills nothing and draws no reason clause; the item also answers `reason_code` (`reason.code`).
- **R23** Every member-facing sentence is read by key through `setup-words`' `word(key, vars)`; `NOTICE_WORDS` retired; tests assert keys with `hasWord`; DEC-247/268: "Past its date", "Its date may have passed", never "overdue" on Home or queue.
- **R24** FINDING `watched-changed`: for the member asking, one per item of `retrieval-browse.browse({only: "watched", viewer})` whose `last_changed` is later than her mark's instant from `following.watchedBy(item)`; key `FINDING::watched-changed::<item>::<last_changed>`; to her alone, no other member's mark read. Subject the item with its own home; `label` `noticed`; `queue.watched-changed.summary` (`{what}` title), `.detail` (`{date}` as R16), with `summary_key`/`detail_key`; says nothing of what changed. Leaves on disposal or watch off. Follows `next` to at most 1,000 (`facts` bound, `truncated`); a `browse`/`watchedBy` that throws or answers `undetermined`: no item, named in `facts.failed`. Read R24 whole.
- **R25** R12's `detail` writes the instant as `word("time.at", {date, time})`: `{date}` = `date.daymonthyear` ("October 16, 2026"), `{time}` = `time.clock` ("{hour}:{minute} {ampm}", hour 1-12 unpadded, `time.am`/`time.pm`), in the team's time zone (`time_zone` of the combined profile view). No zone: UTC reading followed by the literal "UTC". Day via `civil-time.localDay`; hour and minute via `Intl.DateTimeFormat` with `hourCycle: "h23"`. An unreadable instant is not written, the item still raised. `id`, `subject.episode`, `basis.episode`, `screen` keep ISO instants. Test: 2026-10-16T16:00:00Z, Pacific: "October 16, 2026", "9:00 AM", no `\d{4}-\d{2}-\d{2}T` or `Z\b`. Read R25 whole.
- **R26** No day in R5, R6, R13, R14, R15 is ISO text: `date.daymonth`/`date.daymonthyear` only (R20); an unreadable date is not written (no raw `YYYY-MM-DD`, no "an earlier date"); `dayInSentence` is the one function. Test: no summary or detail matches `\d{4}-\d{2}-\d{2}`.
- **R27** FINDING `fetch-done`: one per `capture.fetchesDone({after, limit})` record, pages of 200 (`FETCH_DONE_PAGE`) following `next` to at most 1,000 (`FETCH_DONE_MAX`; `facts` bound, `truncated`), older than 90 days (`FETCH_DONE_DAYS`) not told; key `FINDING::fetch-done::<session>`; to the `opener` alone while `active`. Subject the document, home set the project, door "Open the document"; words by key (`{document}`), no size. A session listed twice is one item. `facts.fetch_done`; a failing read named `capture` in `facts.failed`.
- **R28** FINDINGs `ingest-done`, `ingest-stopped`: one per `calculations.ingestNotices` entry, key `FINDING::ingest-<state>::<ingest>`, to the viewer alone while active; each cycle reads from the start, pages by `next` to at most 1,000, window 90 days of `finished_at`; `facts.ingest`; a failing read named `calculations` in `facts.failed`. Words `notice-producers.ingest.done|stopped` fill `{written}`, `{rows}`, `{not_written}`. Test `g55-ingest.test.mjs`.
- **R29** FINDING `reading-ended`: one per row of `deps.readingsEnded({after, limit})` (finished, ended in part with reason, refused with limit, or ended `final`; never one still being read), pages by `next` to at most 1,000, older than 90 days not told; key `FINDING::reading-ended::<sha>::<state>`; to the opener the row names while `active`, nobody else. Subject the document, home set the project, door "Open the document"; words by key fill `{document}`, state, `{read}`, `{total}`, the limit; never "read" of a file that was not (R-SILENT). Once per state (a row that goes on after a stop and ends again raises a fresh key). `facts.reading_ended`; a failing read named `readings` in `facts.failed`; no `deps.readingsEnded`: none, no name. Seam over the real job table not yet met (`control-plane` seam section 11). Read R29 whole.
- **R30** *(not yet met)* FINDING `register-changed-noticed`: one per `following.registerChanges({after, since, limit, viewer})` entry, pages of 200 following `cursor` to at most 1,000 (`facts` bound, `truncated`), older than 90 days not told; key `FINDING::register-changed-noticed::<watch>::<change>`; to the watch's author while `active` and may see the project, else the project's active owners (`membership` R65), else administrators; nobody else. Subject the register (and project); `label` `noticed`; `summary`/`detail` by key fill `{register}`, `{count}` (the entry's `total`), `{added}`, `{changed}`, `{removed}`, `{date}`. No name, amount or row; no meaning, no violation. Once per change; leaves on disposal; an ended watch none; two refreshes, two items each with its count. A throwing or `undetermined` read: none, named `following` in `facts.failed`. Read R30 whole.
- **R31** *(not yet met)* FINDINGs `register-import-done|stopped|failed`: one per import of `registers`' `importsEnded({after, limit})` (its R13), injected as `deps.importsEnded` by `store-assembly`'s `assemble.mjs` (:576-581) as `readingsEnded` is (R29), so no `registers` import and no `uses` edge; key `FINDING::register-import-<state>::<import>`; to the starter while `active` (team pre-read: the administrator who started it), nobody else; `reason: "watch"` makes none (R30). Subject the register, home the project or registers screen, door "Open the register"; words by key fill `{register}`, `{rows}` (kept), `{bytes}`, and for failed/stopped the reason; no row. Once per state; window 90 days, at most 1,000; a restarted failed import raises a new key; a running import none. Read R31 whole.
- **R32** *(not yet met)* R30's and R31's items hold counts and the register's name only: with sentinel names and contact values in the rows, none is in any summary, detail, facts or subject; the register's own label appears (K1484, K1485).
- **R33** *(not yet met)* One "Noticed" item per `ai-use.thresholdsReached({viewer, at})` entry, keyed by its own `key` as given (R16's rule); sentence by key `ai.alert.threshold` (R23) filled with `level`, `scope`, `unit`, period and `basis`; no member, no cost beyond the level. A throwing read: none, named `ai-use` in `facts.failed`.
- **R34** *(not yet met)* One "Noticed" item per `ai-accounts.termsNoticesDue({viewer, at})` row, keyed by its `key`; sentence by key `ai.notice.termschange` (R23) filled with provider, plan, document, `effective_from` as a local day (R20's words), with the same link to the quotes as the connect act. Blocks nothing, asks no acceptance, no secret; leaves on disposal. A throwing read: none, named `ai-accounts` in `facts.failed`.
- **R35** *(not yet met)* One "Noticed" item per `ai-accounts.accountNoticesFor({viewer, after, limit})` entry, pages following `after` to at most 1,000 (`facts` bound, `truncated`), older than 90 days not told, keyed by the entry's own `key` as given; kinds `left-list` (R72), `left-project-list` (R77: the project's owners other than the removed member), `signin-ended` (R59: owner of an ended project sign-in account). Names the account by provider and plan and the project or list by name; no secret, digest, key or removed member; sentence by key (R23). Once per entry; leaves on disposal. A throwing read: none, named `ai-accounts` in `facts.failed`. Read R35 whole.
- **R36** *(not yet met)* FINDING `mail-cleared`: one per (owner, clearing) entry of `mail-door.clearedOwners({after, limit, viewer})`, following `cursor` to at most 1,000 (`facts` bound, `truncated`), key `FINDING::mail-cleared::<owner>::<cleared_at>`, to that owner alone (no administrator). Detail names the count removed and their received dates, by key; never a sender, subject, header or text; subject the member's own mail (no bundle). Told once. Test: three removed gives her one item naming three and their dates; none removed gives none; an administrator who is not the owner none; no item or `facts` holds sender, subject, header or text.

### Private

- **R7** No answer names a bundle, row or project the viewer may not see, and no count reveals one; a check, detector or hypothesis in a hidden project is neither shown nor counted outside it.
- **R8** An item of R2 or R3 is never stored on a person, never moves a grade or finding, never offered as a citation; its acts are dispose, or take up as a hunch or hypothesis.
- **R9** While a gate is closed, R2 and R3 raise no item and count none.
- **R10** No place is named in this module's behaviour or outward text.
- **R11** (DEC-131) Every member-facing sentence for an R2 or R3 item (summary, detail, option words) marks it "Hint · machine work" and says "hint", never "signal"; R4, R5, R6 items carry no mark.
- **Uses** (§ Uses): `queue-producers`, `people`, `money-checks`, `duties`, `answers`, `inquiry`, `membership`, `civil-time`, `credentials`, `following`, `standards` (edge added at L11's START, P17), `file-safety`, `provenance`, `ai-use`, `ai-accounts`, `steps`, `question-explorer`, `investigation`, `review`, `setup-words`, `retrieval-browse` (R24; the requirement text says `retrieval`, whose `browse` moved), `capture`, `calculations`, `mail-door` (R36, new edge). `readingsEnded` and `importsEnded` are injected callbacks, no upward edge (R-LAYER; R29, R31). The old `credentials.projectAccountsSuspended` and `ai-accounts.projectAccountsSuspended` lines are retired (R16).
- **Tests** (§ Suggestions): closed gate yields no item and no count (R9); hidden project's check reaches no outsider (R7); between candidates "possibly overdue", after "overdue", group's checkpoint nothing (R5); a standing answer reaches only its author, once (R4).

## Uses: retrieval-browse

Purpose: "Find in this" and `browse`, over what the viewer may see; writes nothing.
- **R10** `browse({kinds?, only?, since?, after?, limit?, viewer})` (moved from `retrieval` R85): `only` `new_since` (needs `since`), `watched` (the viewer's own), `flagged`; refusals in order `VIEWER_MISSING`, `KIND_UNKNOWN`, `ONLY_UNKNOWN`, `NO_SINCE`, `BAD_SINCE`; answers `{ok, kinds, only, items, count, limit, truncated, next}`, item `{kind, id, title, last_changed, new, watched, flagged}`, `limit` 1-200 (default 50); an entity's `last_changed` is its creation instant; with `watched`/`flagged` and nothing registered (R11) it answers empty with `undetermined: {why}`.

## Uses: setup-words

Purpose: the word list as frozen data; pure.
- **R11** `word(key, vars)` fills `{name}` from `vars`; throws `UNKNOWN_WORD`, `WORD_VAR_MISSING`; never falls back.
- **R12** `hasWord(key)` true exactly when the list holds `key`.

## Uses: civil-time

Purpose: the one engine for civil time; pure.
- **R1** `localDay(instant, zone)`: the calendar day in `zone`; unknown zone `ZONE_INVALID`; no local clock.

## Uses: membership

Purpose: members, capabilities, projects at setup, the fence.
- **R65** `projectOwners(projectId)`: owners' ids in the order they became owners; `[]` for none.
- **R86** (moved to `member-roster` R29) `activeAdmins`; read `member-roster` R29.

## Uses: money-checks

Purpose: checks over money facts that raise questions, never verdicts.
- **R9** `noticed` answers a project's results only of detector versions with rate at most 20% and switched on, labelled "Noticed" with derivation; others withheld and not counted; 1-500 with `truncated`.

## Uses: duties

Purpose: the one obligation object; "overdue" raises a question, never a violation.
- **R7** `dutiesOf({entity, as?, at?, limit, viewer})`, 1-500 with `truncated`.
- **R10** states `met`, `met_late`, `discharged`, `pending`, `overdue`, `undetermined`; uncertain due date: `overdue` only after the latest candidate.
- **R33** `occurrencesOf({dutyId, from, to, asOf, viewer})`; `reason` `null` or `{code, says}`, codes `trigger_undated`, `deadline_not_held`, `due_not_computed`, `due_between_days`, `match_undated`, `order_unsettled`; `says` = `duty.reason.<code>`.

## Uses: people

Purpose: the people the record is about; interest checks in the hypothesis layer.
- **R24** `checkResults({project, viewer})`: only once the gate is recorded and rate at most 20%, else `{gated: true, reason}`; results labelled "Noticed", `layer: "hypothesis"`, `mark: "Hint · machine work"`.
- **R25** A result resting on a row the viewer may not see is withheld whole and not counted.

## Uses: inquiry

Purpose: the recursive object of case-making.
- **R55** `datedWaits({member, asOf, viewer})`: the waits `member` set on inquiries `viewer` may see: `text`, `description`, date, state `waiting`, `due` (from the start of that local day, `civil-time.localDay`), `looked`, `ended`; only the setter is answered.
- **R56** `waitLook({inquiry, index, note?, by})`, the setter only (`MACHINE_CANNOT_LOOK`, `NOT_YOUR_WAIT`, `NO_SUCH_WAIT`).

## Uses: answers

Purpose: the plane's half of the assistant; keeps standing questions.
- **R20** `standingAnswersFor({member, after})`: per run that found something new `{question, run, at, finds, answer, held_back}`, at most 200, with `cursor`; one entry per run.

## Uses: credentials

Purpose: credentials and the count-only security tally.
- **R44** counts only (`signin`, `credential`, `rate`, `handover`, `through`); no address, handle, role.
- **R45** `securityMap({from, to, by})` (`op=securitymap`), administrators only (`NOT_AN_ADMIN`), at most 90 days (`SECURITY_PERIOD_INVALID`); `securityLevel()` → `{level, levelAt}` (`Ordinary`, `Raised`, `High`) over the 24 hours ending at the call; failure `{level: null, levelAt: null}`.

## Uses: following

Purpose: following bodies and registers on the scheduler's alarm; never says what a change means.
- **R21** `policyChanges({after?, since?, limit?, viewer})` → `{changes: [{watch, standard, address, before: {capture, at}, after: {capture, at}, amendment_held}], cursor}`, limit 1-200 (default 200); `since` filters by the later capture's instant; a non-instant `since` answers none with `since_invalid: true`; a policy the viewer may not see is left out.
- **R25** `dutyWatchEnd(duty)`: the day after which the duty is no longer told; null while no link or any link unanswered.
- **R28** `dutyWatchEndAt(duty)`: null exactly when `dutyWatchEnd` is, else `{day, at}`.
- **R35** `watchedBy(item)` → `{ok: true, watchers: [{member, at}]}` oldest first; no mark `[]`; unlisted item `MARK_NO_SUCH_ITEM`; never throws.
- **R43** *(not yet met)* `registerChanges({after?, since?, limit?, viewer})` → `{changes: [{watch, kind, register, project?, at, counts: {added, changed, removed, possibly_removed}, total, alert?}], cursor}`, limit 1-200 (default 200); no cell, name or value; invisible or ended watches left out whole.

## Uses: standards

Purpose: each standard held as content in the record.
- **R1** the declarer is the declaration's author (R13's recipient).
- **R5** `standardRead` answers the declarer and time; `NO_SUCH_STANDARD`.

## Uses: file-safety

Purpose: keeps every captured file safe to open; scan holds; security tools.
- **R15** `scanFindings({after?, since?, limit?, viewer})` → `{ok, findings: [{captureSha, note_id, tool, engine, findings, at, held}], cursor, truncated}`, limit default 200, clamped 1-1,000; `since` as `following` R21; a note on a capture the viewer may not see is left out.
- **R16** a `found` note places a scan hold; gates opening the original only.
- **R27** `securityTools({viewer})` (administrators): the group's tools, no credentials.
- **R31** `securityToolEvents({after?, limit?, viewer})` (administrators) → `{ok, events: [{tool_id, event, at, reason}], cursor, truncated}`, no file named.
- **R38** `findingKind(name)` → `{file_kind, threat_kind, variant, words}`; pure.

## Uses: provenance

Purpose: the record's trust root.
- **R4** `homeOf(captureSha)` → `{bundleId, path, encoding, bytes, registered, authored}` or `null`; never throws.

## Uses: ai-use

Purpose: what each AI account has spent and may spend.
- **R5** *(not yet met)* `limitsReached({viewer, at})` → `{owner, scope, unit, period, period_start, reached_at, source, resets_at?}` with a stable `key`.
- **R6** the `enabled_by` is answered only to the account's owners.
- **R9** `exploreAsksPending({viewer, at})`: pending asks to an account's owners.
- **R24** *(not yet met)* `thresholdsReached({viewer, at})` → `{owner, scope, unit, period, period_start, level, crossed_at, key}` plus `basis`.

## Uses: steps

Purpose: work in pursuit of an answer; never evidence.
- **R12** `stepsDue({viewer, at})`: to the setter only; at most 1,000 steps and 1,000 reminders; `truncated: true` at either.
- **R14** `costShares({viewer, at})` → `{step, totals, projects, key}` to owners.
- **R15** `costMessages({viewer})`.
- **R23** `laterFound({viewer, at})` → `{ok, found, truncated}`, with `looked_at`.
- **R29** `stepsDue` leaves out a step whose `byWhen` a holder holds (`by_when_held`).

## Uses: question-explorer, investigation, review

Purpose: the system exploring a question; a project's own working material; the review copy.
- **R5** (question-explorer) `findsFor({viewer, at})`: each find once to each of `steps.findRecipients` who may see both; which account paid answered only to its owners.
- **R3** (investigation) `milestonesOverdue({viewer, at})`, key per milestone and date; `milestoneReminder` to her alone.
- **R18** (investigation) `quietPrompts({viewer, at})`: once per quiet spell to the joined participants.
- **R33** (review) `reviewCommentsFor({case, edition, viewer})`; after publication a reviewer whose comments were left out is told once (`review-comment-left-out`).

## Uses: ai-accounts

Purpose: the AI accounts that pay for use, and the notices owed.
- **R59** project sign-in accounts removed; each owner owed one `signin-ended` notice via `accountNoticesFor`.
- **R72** `accountNoticesFor({viewer, after, limit})` → `{kind: 'left-list', key, account_id, provider, plan, list_owner, at}`; no secret; never throws.
- **R76** `termsNoticesDue({viewer, at})` → `{account_id, plan_id, doc, version, effective_from, key}` within `TERMS_NOTICE_DAYS`.
- **R77** also `left-project-list` for the project's other owners.

## Uses: capture, calculations

Purpose: bringing material into the record with provenance; calculations and the money ingest.
- **R104** (capture) `fetchesDone({after, limit}) → {ok, fetches: [{session, document, opener, project, at, cursor}], limit, truncated, next}`, oldest first, limit default 200, 1-1,000; in-process, no viewer.
- **R14** (calculations) `ingestNotices({after, limit, viewer})` (clause 8): the viewer's own `done` and `stopped` ingests in start order, `next` null on the last page.

## Uses: record-grammar, jurisdictions, entities, retrieval

Purpose only (§ Purpose of each; no service named): `record-grammar` id and type vocabulary, canonical JSON, the one SHA-256; `jurisdictions` profiles as data, the only place a place is named (R10); `entities` the entity axis (`browse` lists entities of kind `person`, `institution`, `body`, `movement`, R24); `retrieval` the query language (its `browse` moved to `retrieval-browse`, R24).
