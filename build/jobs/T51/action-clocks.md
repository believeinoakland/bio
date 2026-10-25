# action-clocks (T51)

**Status** · session_01BbaZvVVyVvTx28XGJdeNbi · depth 2 · WORKING · handled B4

## Completion (T51-238)

**Entries applied.**
- Words (K3949, K3957, K3962): all 9 findings of `checks/words.mjs` (the 6 conversion findings, the 2 `plain` ones, `checks.mjs` CLOCK_ENTRY_REFUSED) fixed by the words rule. Existing rows read by `word` where one held the sentence (`action-clocks.source_stated`, `.confirmed`, `.corrected_locally`, `.why.malformed_rule`, `.later_event`, `.machine_credential_computed`, `.member_asked_clock`, `.basis_commitment`, `.basis`, `.closed_day_skipped`, `refusal.CLOCK_ENTRY_REFUSED`); the rest by `localize('action-clocks.<index|count|ics>.<slug>', en, vars)`, ids fixed once. Also converted (setup-words R13, whatever the check counts): every refusal `detail`, the proposal's UNMEASURED reason, the trace-line fragments, the basis fragments of the calendar file, the calendar's name, `computed fact` and `observed practice` labels. "the other side" gets its own id (`action-clocks.index.the_other_side`) rather than another module's row. No string was judged unread, so no REPORT of such strings.
- Tests: sentence copies in my tests now compare with `word`/`localize` by equality (adopt, calendar, clocks, factreader, ics, lateness, overdue, t45, t46, t47); regexes over sentences that are civil-time's own (`disputed`, `cannot be read`, `weekend`, `whole number`, `close of business`, `does not cover for every office`, `anchor's time`) stay, being that module's words.
- The eight reds (K3958, K3997, K4036): `count.mjs` `whyOf` rendered civil-time's `{key, vars}` reason with `String()`, printing "[object Object]". It now renders it with civil-time's `reasonText`, only where this module builds the sentence a member reads. All 8 are green (`calendar.test.mjs`, `clocks.test.mjs`, `factreader.test.mjs`, `worked.test.mjs`).

**Shape of `why` (for filings).** `computeDeadline(...).why`, `clockPropose` `proposal.undetermined`, `clockProposalsFor` `undetermined` and `clockAdopt`'s `CLOCK_PROPOSAL_UNDETERMINED` `why` are plain rendered sentences (strings), never `{key, vars}`: a civil-time reason is rendered at the count, once. `factReader` answers `why` as a string as before. Nothing in this module passes a keyed reason on, so filings reads a string.

**Deferred.** None.

**Found in another module.** `word(key, vars)` does not yet fill a var that is itself a reason (CR-14 not merged): I did not need it, using civil-time's `reasonText` instead. Tests in this module hold civil-time sentences in regexes (listed above); they belong to civil-time's words.

**Generated artifacts made stale.** `setup-words/rows.mjs` and `words-unreviewed.json` (my new `localize` ids): BOB regenerates at the layer close. `build.mjs --check` reports rows.mjs stale at my first new id; setup-words R10, R16 and R17 tests read red only for that reason.

**Tests and checks.**
- `node --test test/m/action-clocks/*.test.mjs`: tests 74, pass 74, fail 0 (before: 66 pass, 8 fail).
- Tests of every module that imports action-clocks, before and after my change: the same failures, apart from the three setup-words stale-rows tests above.
- `checks/words.mjs bio action-clocks`: 0 failures; the 14-module cross run names no line of this module.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio action-clocks`: 0 failures. `checks/coverage.mjs bio action-clocks`: 23 of 23 live ids named, 0 failures. `checks/ownership.mjs bio action-clocks tranche/T51 job/T51/action-clocks`: 15 files changed, 0 failures. `checks/run.mjs bio`: format and architecture 0 failures, no line names this module.

Size (session_01GRpmGF7jXboFitBgdF89Tk): test runs 8, module lines 2081

## J1 · COMPLETE

T51-238 done. Words: all 9 findings fixed (rows by word, the rest by localize ids action-clocks.<index|count|ics>.*; refusal details and trace/basis fragments converted too); nothing judged unread, so no REPORT. The 8 reds are green: whyOf rendered civil-time's {key, vars} with String(); it now uses civil-time's reasonText where this module builds a sentence. Shape of why for filings: computeDeadline.why, proposal.undetermined and CLOCK_PROPOSAL_UNDETERMINED.why are rendered strings, never {key, vars}. Module tests 74/74; format, architecture, coverage (23/23), ownership 0 failures; words 0 for this module (also in the 14-module cross run). Stale: setup-words rows.mjs / words-unreviewed.json (my new localize ids; BOB regenerates). Details in the record.

## J2 · COMPLETE

T51-267 done: `clocksRunning({viewer})` (R24) is built and its op `clocksrunning` joins `actionClocksOps`.

**Entries applied.**
- R24: `clocksRunning` counts the `pending` clock entries of the visible actions not `resolved` or `abandoned`: `total`, and `by_owed` for `group`, `body` and `undetermined` (R18), each `{count, next}` with `next` the earliest valid date (null when none). It reads at most 500 actions (`CLOCKS_RUNNING_ACTIONS_MAX`), `truncated` stated; it writes nothing. It adds no sentence and no refusal, so no word or row is needed.
- The module header and the op map's comment name T51 and R24.

**Tests.** New file `bio-plane/test/m/action-clocks/t51.test.mjs`, three tests each naming R24: (1) the counts over three actions (one `owed_by: group` with two entries, one `body`, one undetermined) with a met entry not counted, a resolved action's pending entry not counted, a viewer who sees no action counting none, and the proposals table unchanged; (2) 501 actions, 500 read, `truncated` true; (3) the op reads the viewer from the query and not from the body. One existing assertion changed: `reminders.test.mjs` (the R4 R6 ops test) pins the op key list, which now includes `clocksrunning`.

**Deferred.** None.

**Found in another module.** None. No other module changed.

**Tests and checks.**
- `node --test bio-plane/test/m/action-clocks/*.test.mjs`: tests 77, pass 77, fail 0. Before the change the new file did not exist; the pinned op list failed until updated, then passed.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio action-clocks`: 0 failures.
- `checks/coverage.mjs /home/user/bio action-clocks`: 24 of 24 live ids named, 0 failures.
- `checks/ownership.mjs /home/user/bio action-clocks tranche/T51 job/T51/action-clocks`: 0 failures.
- `checks/run.mjs /home/user/bio`: format and architecture 0 failures; coverage 24 failures, none in action-clocks; words: no finding naming action-clocks (the failures it lists are in other modules, e.g. wizard-scripts).
- `bio-plane/src/setup-words/build.mjs --check`: `words-unreviewed.json` reported stale or absent. Expected; the generated artifacts were not regenerated (BOB regenerates at the layer close).

Size (session_01DhBxoHRd3fUcaMLx8zTL85): test runs 7, module lines 2108

## Completion (K4227 CHANGE, B3)

**Entries applied.** `clockPropose`'s `NO_SUCH_RULE` (R2) also answers `deadlines: [{rule, label?, citation?}]`: the deadlines of the active view (`local-facts.governingView`, as the proposal reads them) that apply to the action's kind, which are the rules `clockPropose` would accept; `label` and `citation` only where the profile states them; `[]` when none applies or no view is held. Built as the exported pure `deadlinesFor(view, kind)`. The code (`NO_SUCH_RULE`), `target`, `rule` and `detail` are unchanged; a valid rule's answer carries no `deadlines`. The requirement line is BOB's to apply: ownership refuses a module job's edit of `build/requirements/action-clocks.md`; the text is in the COMPLETE post.

**Finding for BOB.** The profile grammar (`jurisdictions` R26) has no `label` field on a deadline and `combine`'s view never carries one, so today every item has `rule` and `citation` only; `label` appears if a deadline ever states one. The screen (screens-investigate R59) should show the citation, or its own words for the rule, until `jurisdictions` adds a label. No sentence added, no refusal added, no word row.

**Deferred.** None. **Found in another module.** The label gap above (jurisdictions); `checks/run.mjs` lists 26 words failures, all in op-grades, none naming this module.

**Tests and checks.**
- New in `t51.test.mjs`, each naming R2: the list for a kind with deadlines (three, with citations, the rest of the refusal unchanged, an absent rule alike, each listed rule accepted); the empty list (a kind with none, no active profile; `deadlinesFor` keeps a stated label); the control that a valid rule's proposal is unchanged.
- `node --test bio-plane/test/m/action-clocks/*.test.mjs`: tests 83, pass 83, fail 0.
- Consumers: `screens-investigate/due-date.test.mjs` 6/6; action-plans, affordances t45 and t46, plane compose, monitoring: 283/283.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio action-clocks`: 0 failures. `checks/coverage.mjs bio action-clocks`: 25 of 25 live ids named, 0 failures. `checks/words.mjs bio action-clocks`: 0 failures. `checks/ownership.mjs`: 0 failures (the requirements edit reverted).
- `build.mjs --check`: rows.mjs stale at action-plans' id, not mine.

Size (session_01V7byxdmjg2NpBgmASX69w6): test runs 7, module lines 2133

## J3 · COMPLETE · re B3

CHANGE B3 (K4227) done. `clockPropose`'s `NO_SUCH_RULE` now also answers `deadlines: [{rule, label?, citation?}]`: the active view's deadlines that apply to the action's kind (the rules clockPropose accepts), `[]` when none applies or no profile is active; code, target, rule and detail unchanged; a valid rule's answer has no `deadlines`. Exported pure helper `deadlinesFor(view, kind)`. No sentence, refusal or word row added.

Two things for BOB:
1. Requirement line (yours to apply; ownership refuses a job's edit of build/requirements/action-clocks.md, so I reverted mine). Suggested text for R2's refusals, after "`NO_SUCH_RULE` (no active profile states a deadline of that rule for the action's kind, naming both": "; T51, K4227, a field added: it also answers `deadlines: [{rule, label?, citation?}]`, the deadlines the active profiles state that apply to the action's kind, what this call would accept as `rule`, each with its `label` and `citation` where the profile gives them, `[]` when none applies; the code and the rest of the answer are unchanged; controls: a valid rule's answer carries no `deadlines`)".
2. Finding for jurisdictions: a deadline in the profile grammar (R26) has no `label` field and the combined view never carries one, so today each item has `rule` and `citation` only. The due-date screen (screens-investigate R59) should draw the citation until a label exists.

Tests (t51.test.mjs, each naming R2): list for a kind with deadlines, the empty list (kind with none; no profile), control of a valid rule. Module suite 83/83; consumers (due-date 6/6, action-plans, affordances t45/t46, plane compose, monitoring) 283/283. format, architecture, coverage (25/25), words, ownership: 0 failures; checks/run.mjs lists words failures only in op-grades. Size (session_01V7byxdmjg2NpBgmASX69w6): test runs 7, module lines 2133.

## Completion (fix round 3, B4; ACTION-CLOCKS #17)

**Cause met.** C53 (the action page cannot read reminders after a reload): action-clocks **R26**. `op=remindersfor` is an arm of `actionClocksOps` answering `remindersFor({action, viewer})` (R4): `{ok: true, reminders}` or `actions.noSuchAction` for an absent or invisible action; `action` read from the address, else the body; `viewer` from the stamp only. Declared in `DECLARED_OPS` as `remindersfor` (classes admin, member; `mutating: false`; weight `read`; accepts and requires `action`), its description a `localize` id (`action-clocks.declared.remindersfor`). No new sentence a member reads and no refusal.

**Tests** (written first; the op test seen failing with "remindersfor is not a function").
- `t51.test.mjs`: R26 through the op map: a reminder set by a member is answered by a fresh op call, equal to the service's own answer; the action from the body; controls: an invisible and an absent action answer `actions.noSuchAction`; a viewer in the body is not the stamp; the declaration's fields and `mutating: false`.
- `declared-ops.test.mjs`: R25 R26 `declaredOpHolds` for `remindersfor`.
- `reminders.test.mjs`: the pinned op key list gains `remindersfor`.

**Deferred.** None. **Found in another module.** None. op-declarations' and op-grades' rows for `remindersfor` are theirs (sent by BOB as the job merges); my declared test does not need them.

**Tests and checks.**
- `node --test --test-force-exit bio-plane/test/m/action-clocks/*.test.mjs`: tests 86, pass 86, fail 0.
- `build/plan/impact.mjs origin/tranche/T51 HEAD`: 36 modules; reds pdf-worker 1/12, scheduler 12/13, affordances 21/28, queue 29/31, screens-wizards 9/10, control-plane 62/63, plane 39/42, journey-check 1/16 are identical on the tranche tip with a no-op change to this module (checked in a worktree), so inherited, not this change.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs action-clocks`: 0. `checks/coverage.mjs action-clocks`: 26 of 26 live ids named, 0. `checks/words.mjs action-clocks`: 0 findings. `checks/ownership.mjs action-clocks tranche/T51 job/T51/action-clocks`: 5 files, 0 failures.

Size (session_019moQM11yaAcc7xfvrEDnxX): test runs 5, module lines 2162

## J4 · COMPLETE

C53 met: action-clocks R26. op=remindersfor (read, member and admin) answers remindersFor({action, viewer}) or actions.noSuchAction; declared in DECLARED_OPS as remindersfor (mutating false, weight read, accepts/requires action). Tests (written first, seen failing): t51 R26 through the op with controls (invisible, absent, viewer from stamp only), declared-ops R25 R26, pinned op list updated. Module suite 86/86; format, architecture, coverage (26/26), words, ownership 0 failures. Impact suites: 8 reds (pdf-worker, scheduler, affordances, queue, screens-wizards, control-plane, plane, journey-check) identical on the tranche tip, inherited. op-declarations/op-grades rows for remindersfor are theirs. Details in the record.

## Completion (fix round 10, Wave A batch 4, B5; ACTION-CLOCKS #18, session_01BbaZvVVyVvTx28XGJdeNbi)

**Causes done.**
- Published `pendingClocksRefusal({before})` in `bio-plane/test/m/action-clocks/fixtures.mjs` (new): the real `pendingClocks` refusal PENDING_CLOCKS_BAD_BEFORE (C-117.5) over `world()`. Its test, `fixtures.test.mjs` (R1), checks code, check, `before` echoed, and the translation of `ACTION_CLOCK_CHECKS`. Its one user (monitoring, `understanding.test.mjs:479`) re-points in its own job.
- `fixture.mjs:116` (retrieval stand-in): now retrieval's published `actionRegistrar()`; each registration is also kept in `reg` for the projection step, as `actions`' fixture does.
- `fixture.mjs:133` (conformance stand-in): conformance is earlier than this module in `build/modules.json` (124 < 130), so FIX-E, not a contract marker. The stand-in and `w.determinations` are gone. `world({conformance})` takes conformance's published `determinationRead` fixture, through the new `determinations(viewers)` helper (the named members join the fixture's real project through its own `member`/`join`); a test naming none gets the real conformance over an empty store (`noDeterminations`), made on first read.
- Tests re-pointed: `calendar.test.mjs` (R11), `lateness.test.mjs` (R15), `overdue.test.mjs` (R3 R5) now use the fixture's real ids (`live`, `unclear`, `superseded`, `supersededBy`) and its real `project`.

**Markers added.** No `fixtures-own`, `fixtures-generic` or `fixtures-contract` marker.

**One limit, for BOB.** conformance's fixture holds one project, so the old calendar/overdue assertions that told two projects apart (PROJ-2026-0001 against -0002, and "the first determination the viewer sees" among determinations of different projects) now tell *seen* from *unseen* (a member who has not joined the project reads `project: null`) but not one project from another. Each requirement still holds: the leg kinds passed over (advances, a document) and the unseen determination are still asserted. If BOB wants the ordering among projects back, conformance would publish a fixture with two projects visible to different members; I have not asked for it.

**Lines left.** None: `checks/fixtures.mjs . action-clocks --list`: answer 0, stub 0, code 0, contract 0, 0 failures.

**Tests and checks.**
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/action-clocks/*.test.mjs`: tests 87, pass 87, fail 0.
- `node build/plan/impact.mjs origin/tranche/T51 HEAD`: affected modules 4 (action-clocks, affordances, action-producers, control-plane); the tests of the three users that import this fixture (`affordances/t46`, `action-producers/stamps`, `control-plane/declared-ops`): tests 17, pass 17, fail 0.
- `checks/format.mjs .`: 0 failures. `architecture`: 0. `coverage`: 26 of 26 live ids, 0. `words`: 0. `fixtures`: 0. `ownership . action-clocks origin/tranche/T51`: 0 failures.

Size (session_01BbaZvVVyVvTx28XGJdeNbi): test runs 8, module lines 2116
