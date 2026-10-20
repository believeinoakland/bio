# action-clocks (T51)

**Status** · session_01V7byxdmjg2NpBgmASX69w6 · depth 2 · WORKING · handled B1

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

**Entries applied.** `clockPropose`'s `NO_SUCH_RULE` (R2) also answers `deadlines: [{rule, label?, citation?}]`: the deadlines of the active view (`local-facts.governingView`, as the proposal reads them) that apply to the action's kind, which are the rules `clockPropose` would accept; `label` and `citation` only where the profile states them; `[]` when none applies or no view is held. Built as the exported pure `deadlinesFor(view, kind)`. The code (`NO_SUCH_RULE`), `target`, `rule` and `detail` are unchanged; a valid rule's answer carries no `deadlines`. Requirement line amended in `build/requirements/action-clocks.md` (R2's refusal arm), as K4210 asks.

**Finding for BOB.** The profile grammar (`jurisdictions` R26) has no `label` field on a deadline and `combine`'s view never carries one, so today every item has `rule` and `citation` only; `label` appears if a deadline ever states one. The screen (screens-investigate R59) should show the citation, or its own words for the rule, until `jurisdictions` adds a label. No sentence added, no refusal added, no word row.

**Deferred.** None. **Found in another module.** The label gap above (jurisdictions); `checks/run.mjs` lists 26 words failures, all in op-grades, none naming this module.

**Tests and checks.**
- New in `t51.test.mjs`, each naming R2: the list for a kind with deadlines (three, with citations, the rest of the refusal unchanged, an absent rule alike, each listed rule accepted); the empty list (a kind with none, no active profile; `deadlinesFor` keeps a stated label); the control that a valid rule's proposal is unchanged.
- `node --test bio-plane/test/m/action-clocks/*.test.mjs`: tests 83, pass 83, fail 0.
- Consumers: `screens-investigate/due-date.test.mjs` 6/6; action-plans, affordances t45 and t46, plane compose, monitoring: 283/283.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs bio action-clocks`: 0 failures. `checks/coverage.mjs bio action-clocks`: 25 of 25 live ids named, 0 failures. `checks/words.mjs bio action-clocks`: 0 failures. `checks/ownership.mjs bio action-clocks tranche/T51 job/T51/action-clocks`: see J3 after commit.
- `build.mjs --check`: rows.mjs stale at action-plans' id, not mine.

Size (session_01V7byxdmjg2NpBgmASX69w6): test runs 7, module lines 2128
