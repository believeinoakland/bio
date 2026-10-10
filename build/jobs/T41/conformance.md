# conformance (T41)

**Status** · session_019LCq6jQwSHCrrFFYXRcWYs · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied (T41-45).**
- (D55) The Purpose as re-worded. A new file, `test/m/conformance/purpose.test.mjs`, has four tests. Each names the Purpose and holds a negative control (K874):
  - :18. A machine may prepare the comparison and never determines. Its comparison carries no outcome, and one naming any outcome is refused. A machine author naming its own comparison is refused, directly and through the op. A member naming the comparison without outcomes of their own is refused `OUTCOME_UNKNOWN`. Control: the member determines, drawing on it.
  - Per standard. Three standards with three outcomes are read one per standard; there is no verdict key, `outcomes_differ` is true, and each outcome filter finds the determination. Control: one shared outcome is still given per standard and does not differ.
  - An unclear determination names its open questions and sends each back to an inquiry. Every question, named or new, carries an inquiry. Each new one is open, titled from its question, and held in the project. An outsider, and an uninvited administrator or the founder, cannot see it; a participant and a machine can. Control: no question means `UNCLEAR_NO_QUESTION`, and nothing is written.
  - A compliant determination is recorded with the same care as a noncompliant one: the same record object with its history, the same stored rows column for column, the same pins and reads, the same `basis_changed` notice, and the same supersession rule. Control: the two differ only in the outcome.
- (N822, D54) The three listed tests are re-stated, each with a control:
  - `determine.test.mjs`:15 (two tests). The R1-order test now places `DETERMINATION_NOT_A_PARTICIPANT` with an invited member. The participant test now covers an invited administrator, and an administrator and the founder at a discoverable project, each asserted at FULL.
  - New test (determine.test.mjs, after :90). An administrator or the founder (`admin`, `member:admin`) neither invited nor joined to a hidden project is at EXISTENCE. `determine` relays membership's `existenceAct` (id, name, owners) and writes nothing. Controls: invited → FULL; a discoverable project → FULL.
  - `reads.test.mjs`:68. Uninvited administrators and the founder read `noSuchDetermination`. Control: invited, the administrator reads it.
  - `reads.test.mjs`:304. Uninvited administrators and the founder list none, and naming the project answers `PROJECT_SEEN_NOT_A_PARTICIPANT`.
  - New test in reads.test.mjs, covering `determinationRead`, `comparisonRead` and `determinationsFor` together. A discoverable project's determination reads whole; once invited, the hidden project's reads whole too.

**A flaw fixed in this module (R6, R15, R24).** An inquiry that `determine` opened for an unclear question had no `project:` in its front matter. Promotion (its R53) therefore held it outside every project, so every member could see a hidden project's question text. `#openInquiry` now states `project:` (`src/conformance/index.mjs`, `#openInquiry`). The new Purpose test fails without the fix (checked: 3 pass, 1 fail) and passes with it.

**Statements already met before this job, and the tests that show them.**
- A machine never determines:
  - determine.test.mjs:23 (R1 R13); :488 (R13: a raw promotion or revision is refused)
  - record.test.mjs:18, :40, :68 (R12)
  - reads.test.mjs:342 (the op stamps the author)
- Per standard:
  - determine.test.mjs:248 (R4)
  - contradiction-cause.test.mjs:154 (`outcomes_differ`)
  - t35.test.mjs:28 (per-standard bindings)
- Same care for compliant:
  - determine.test.mjs:270 (R5: shapes, refusals, reads)
  - act-event.test.mjs:150
  - contradiction-cause.test.mjs:148
- Unclear sends each question back to an inquiry:
  - determine.test.mjs:296, :324, :347 (R6: named or new inquiry, `opened`, both-or-neither)
  - reads.test.mjs:122
- No significance ranked: determine.test.mjs:434 (R8); record.test.mjs:40, :68.

What this job adds, beyond those tests:
- the comparison never supplies an outcome;
- three outcomes on one determination, each found by its own outcome;
- every question's inquiry held in the project;
- compliant and noncompliant compared at the stored-row and basis-notice level.

**Reading set (mechanics §17, K2304).** The module's own code and tests alone measure about 340 KB, over 300 KB, so step (3) applies.
- I read whole myself: `build/requirements/conformance.md`; layer 9's section and row in `build/layers.md`; `determine.test.mjs`, `reads.test.mjs` and `fixture.mjs` (the tests the entry changes, and their fixture); `index.mjs`'s `determine` entry, `#determine` head, `#openInquiry` and `comparisonPropose` entry; membership's terms and R13, R18, R43, R44, R60, R77, R78, R85, R88 (the services my Uses names, as D54 changed them).
- Two workers read the rest in full:
  - one read `src/conformance/index.mjs` (1,686 lines), giving a summary of about 9 KB;
  - the other read `checks.mjs`, `schema.mjs` and the eight other test files, giving a summary of about 11 KB.
  - Each statement in both summaries cites file and line. They cover the API, `determine`'s refusal order and membership calls, R6's questions, the branches on outcome, significance, the comparisons, each read's answer at EXISTENCE, every use of an administrator in the tests (none outside the three listed), and which tests show each Purpose statement.
- What mattered from the summaries:
  - The inquiry-project flaw above (found by the index worker, verified here and fixed).
  - That no other test relies on an administrator's FULL sight.
- Not taken up, all in this module and deferred (see below): weaker checks on a named inquiry, which R6 allows; questions on non-unclear outcomes opening inquiries, which determine.test.mjs:321 expects; measures being read before the first refusal; and per-item queries in `determinationsFor`.

**Deferred, in this module, with why.**
- (1) `determine` and `comparisonPropose` read R29's measures, which are asynchronous, before any synchronous refusal, so a machine author or an unseen project still costs a calculation read. Nothing is written either way. Moving the refusals ahead changes when the act answers a Promise rather than a value, which its op and users relay, so it waits for an entry that names R29's form.
- (2) `determinationsFor` makes several queries for each item (supersession, standards, findings, `eventForAct`), up to 200 a page. An efficiency point only, outside this entry.
- (3) The answers at EXISTENCE differ across reads:
  - `determinationsFor({project})` relays membership's existence refusal;
  - `determinationRead` and `comparisonRead` answer as absent, as R9, R12 and R15 state and membership R44 allows ("a read of anything inside the project … is never widened");
  - an unfiltered list leaves the project out.
  This is consistent with the requirements; noted, not changed.

**Found in other modules.** None caused by this job. Its users' suites fail the same tests with this change and without it. The comparison was made at this branch's head before the change, in a separate worktree. The failures, all inherited under rule 4 or owed to those modules' own jobs:

| module | fails |
| --- | --- |
| consequences | 9 |
| actions | 1 |
| filings | 1 (rule 4 (9)) |
| affordances | 34 |
| answer-envelope | 4 (rule 4 (16)) |
| plane | 130 |

action-clocks, escalation and action-plans pass.

**Final `uses`:** unchanged (record-grammar, record-core, membership, promotion, content, inquiry, strength, contradiction, reevaluation, publication, standards, corpus-export, entities, events, civil-time, calculations). The Purpose's `*(not yet met: T41)*` mark is for BOB to strike at the merge: the requirements file is not in this job's paths.

**Tests and checks.**
- conformance (`node --test bio-plane/test/m/conformance/`): tests 87, pass 87, fail 0 (before: 81, 77/4, the four being rule 4 (11)'s three lines).
- Users' suites: as above, identical with and without the change.
- `node checks/format.mjs`: 145 modules, 144 requirements files; 0 failures.
- `node checks/architecture.mjs … conformance`: 14 product files, 59 relative imports; 0 failures.
- `node checks/coverage.mjs … conformance`: 29 of 29 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … conformance tranche/T41`: 0 failures (re-run after this commit, below).

Size (session_019LCq6jQwSHCrrFFYXRcWYs): test runs 14, module lines 2,086

## J1 · COMPLETE

T41-45 complete; conformance 87/0; checks 0 failures (format, architecture, coverage 29/29, ownership). D54: the three listed tests re-stated (determine :15 twice, reads :68, :304) and two new D54 tests, each with a FULL control (invited administrator; discoverable project). D55: purpose.test.mjs, four Purpose tests with negative controls; the statements already met are named with their tests in my record. A flaw fixed here: an unclear question's new inquiry held no project (promotion R53), so any member saw a hidden project's question text; #openInquiry now states project:. Users' suites identical with and without the change (all reds inherited). Final uses unchanged. The Purpose's not-yet-met mark is yours to strike at the merge. Deferred items, with why, are in my record (Completion).
