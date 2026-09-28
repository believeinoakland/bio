# conformance (T8)

**Status** · session_01F4NHaY2fe7KVfrhugvz5hD · depth 2 · WORKING · handled B6

## J1 · QUESTION

Ambiguities in `build/requirements/conformance.md`; I am building on each best reading below and will bring the work in line with your answer.

1. **Refusal family.** R1's codes need catalogue rows (DEC-49; K107 (3), K171 (11)). Best reading: conformance mints family **C-113** (C-111 is intent's; I assume standards takes C-112 and consequences, filings, escalation C-114–C-116, so the six concurrent layer-9 jobs do not collide). Please confirm the number, or assign one.
2. **R2's input and which edition is pinned.** `findings` is a list whose items are an id or `{finding, version?, case?, edition?}`. The finding must be in a ratified edition of `project` (`publishedEditionsOf({finding, version, project})`, narrowed by `case`/`edition` when named). When several editions remain, the pin is the latest edition of the last case in case-id order. A finding naming no remaining edition is `FINDING_NOT_PUBLISHED`.
3. **R1's evidence.** An act's `evidence` is a list of content ids; one `content.contentRow` does not hold is `ACT_INCOMPLETE`, naming the part `evidence` and the ids. Dates are `YYYY-MM-DD`: `at`, or `period: {from, to}` with both ends; an unreadable one is `ACT_INCOMPLETE` naming it.
4. **R3 over a period.** A standard read at each end of the period: `not_in_force` at either end is `STANDARD_NOT_IN_FORCE`; `undetermined` at either end is accepted and stated.
5. **Outcomes (R4).** `determine` names no outcome parameter, so each `standards` item is `{standard, outcome}` (an id alone has no outcome and is `OUTCOME_UNKNOWN`).
6. **A later determination naming an act (R7, R11).** `act: {id}` names an act minted by an earlier determination **in the same project**; its description, actor, date and evidence are those recorded at minting (other fields sent beside `id` are ignored, and the answer states the act as recorded). An id naming no act of this project is `ACT_INCOMPLETE`, naming the part `id`.
7. **R7's codes.** With `supersedes`: a predecessor absent, invisible or of another project is `NO_SUCH_DETERMINATION`; a predecessor of another act (the `act` id differs) is a new code `SUPERSEDES_ANOTHER_ACT`; no reason or one over 500 is `BAD_REASON`; `ALREADY_SUPERSEDED`. These are asked after R1's list (R8's refusal last in R1, then R7's).
8. **R6's questions.** A question entry that is malformed (no text) or names an inquiry that is absent, not an inquiry or not visible to the author is `UNCLEAR_NO_QUESTION`, naming the entry. Questions on a determination with no `unclear` outcome are accepted and stored. The new inquiry is "in `project`" by this module's record (`determination_questions.project`) and by a line in its Session Log; nothing in the inquiry's front matter names the project (no inquiry field for it exists).
9. **Bounds.** A determination carries at most 50 findings, 50 standards, 200 rows, 20 questions and 50 evidence content ids; over any, a new code `DETERMINATION_TOO_LARGE` (naming the part and the cap), asked right after `NOT_A_PARTICIPANT`. Proposals (R12) the same caps.
10. **R12's two missing parameters.** R12 says "a determination may name the proposal it drew on, and the proposal records that", but neither `determine` nor any read carries it. Best reading: `determine` takes `proposal?` (an id; absent, invisible or of another project is `NO_SUCH_PROPOSAL`, a new code), and a read `comparisonRead({id, viewer})` answers a proposal with its label and the determinations that drew on it. Please add both to Provides, or rule otherwise.
11. **A project seen at existence (membership R44).** An act (`determine`, `comparisonPropose`) and `determinationsFor({project})` naming a project the viewer sees only at existence answer membership's `PROJECT_SEEN_NOT_A_PARTICIPANT` (its `existenceAct`); a project at none, or not a project, is `NO_SUCH_PROJECT`.
12. **R8's scan.** Every key anywhere in the input (nested objects and lists included) named `significance`, `severity`, `priority`, `urgency`, `rank` or `score`, compared lower-cased, refuses. `comparisonPropose` is scanned the same way.

**Also (not a question):** `standards` is built concurrently. I build against its Provides (`standardRead`, `inForce`) and test with a stand-in until it is merged; please merge it into `tranche/T8` early (§4) so my tests run against the real module before I complete.

## J2 · REPORT

**Provides built and tested (K247, K248): please merge conformance early**, after standards. `job/T8/conformance` @ the commit after this entry. `bio-plane/src/conformance/index.mjs` imports `../standards/index.mjs` (`standardsOf`), so it loads only once standards is on the tranche; until then my 29 tests (`bio-plane/test/m/conformance/`, 29/0, every id R1–R18 named) ran against a local, uncommitted stand-in of standards' Provides. I re-run them against the real standards as soon as it lands, and bring my code in line if its shapes differ from what I read (`standardRead({id, viewer})` → `{ok, …, text: [content ids], superseded_by}`; `inForce(id, date)` → `"in_force" | "not_in_force" | "undetermined"` or an object carrying it as `answer`/`state`, with `why`).

**Factory:** `conformanceOf(host, deps)`; the class `Conformance`; ops `conformanceOps(c, url, body)`.

**The one shape (K248).** `determinationRead({id, viewer})` →
`{ok, id, project, act: {id, description, actor: {role, body}, at, period, evidence}, outcomes: [{standard, outcome}], standards: [{standard, outcome, in_force, in_force_why, rows: [{requires, did, reading, content}], disagreement}], findings: [{finding, case, edition, version_sha, role, frozen, live}], questions: [{question, inquiry, opened}], author, at, supersedes, reason, superseded_by, live, proposal, basis_changed: null | {causes: [{kind, subject, source, since, detail, affects?}], says}}`.
`at` is the act's date (`YYYY-MM-DD`) or null, `period` `{from, to}` or null. `frozen` and `live` are `{capture, connection, testimony}`, each `{state, grade}` or null, never composed. A standard or finding the viewer may not see is `null` with `says`. Absent or unseen: `NO_SUCH_DETERMINATION` (C-113.15).
`determinationsFor({project?, act?, standard?, finding?, outcome?, live?, after?, limit?, viewer})` → `{ok, items, limit, truncated, cursor}`, each item a strict subset of the read: `{id, project, act, outcomes, findings: [{finding, case, edition, version_sha, role}], author, at, supersedes, superseded_by, live}`.
**Corrections to the users' readings:** FILINGS read `findings[].id` and `standards[].id`: they are `findings[].finding` and `standards[].standard` (R2's and R1's own words); `basis_changed: {causes} | null` is as read. ESCALATION's `{act: {id, actor}, outcomes: [{standard, outcome}], live, at}` is as read, on both the read and each list item (`at` there is when the determination was recorded; the act's date is `act.at` or `act.period`).

**Found in other modules (for routing):**
1. **strength** (a flaw against its R6): `strengthOf(host)` called with no `deps.inquiry` builds an instance whose walk throws (`#legsOf` reads `this.inquiry.basisFor` of undefined), so `inquiryStrength` throws `TypeError` instead of answering. A module reaching strength lazily through its factory (as K61 says) gets that broken instance unless something created strength first with inquiry. Its factory should reach `inquiryOf(host)` lazily as the other factories do. My tests pass strength its inquiry reads explicitly; conformance catches the throw and answers `live: null`.
2. **legacy-index / legacy-store (layer 11; K3):** conformance's ops need routing (`determine`, `determination`, `determinations`, `comparisonpropose`, `comparison`, stamps `author` and `viewer` from the session), and `conformanceOf(host)` must be reached at the plane's start so its promotion step (C-113.21, R13) and its `reevaluation.onBasisChanged` listener (R10) are registered before any promotion.
3. **affordances (layer 11):** the five ops need their `NON_ACTS` row or published act and rung, as K208 (2).
4. **legacy-tests:** a new refusal family C-113.1–21 in `src/conformance/checks.mjs`, each code minted in one `DEC-49 REGION`; the guard's harvest and ratchets see it.
No generated artifact is stale: nothing bundled imports conformance yet.

**Lower-level choices made (for rulings):** C-113.21 `DETERMINATION_ONLY_BY_ITS_ACT`, a promotion step refusing any non-replay promotion of a `determination` not made by `determine` (R7 "never edited", R13); the determination's bundle id is `CONF-<year>-NNNN-determination`, the act id `ACT-<year>-NNNN`, a proposal id `CMP-<year>-NNNN` (no bundle); R10's causes are what reevaluation told (recorded in `determination_flags`) together with what the record answers at the read (finding superseded, reopened since the determination, later edition of its case; standard superseded; `content.passageNotice` `affected` or `undetermined` on a newer capture of an evidence or standard-text passage).

## J3 · REPORT

**Green on the real standards: ready for the early merge (K252).** `job/T8/conformance` @ the commit before this entry. It merges `tranche/T8` (standards included) and no longer carries a stand-in.
- **Tests:** `node --test bio-plane/test/m/conformance/` gives 29 tests, 29 pass, 0 fail. The only fixture change is `standards.migrate()`, as standards' own suite does; the host migrates in production.
- **Reader brought in line:** `inForce(id, date)` is read as `{ok, id, date, state, why}`. A refusal or unreadable answer counts as `undetermined`, never in force.
- **Checks:** format 0 failures; architecture 0 failures (0 imports unjudged); coverage 18 of 18 ids named; ownership 0 failures (8 files, all mine).
- **Answer shapes:** exactly as in J2.
