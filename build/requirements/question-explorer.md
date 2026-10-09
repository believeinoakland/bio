# question-explorer — requirements

**Status** · Draft, BOB's (K2405, K2418, K2420): a new product module Bob approved (D51 A, D1), placed by BOB, written at T41's opening from `build/plan/draft-T41-investigation.md` §3.2 (N815, N820; D33, D36, D39, D11–D14, D66). Every requirement not yet met (T41).

**Size (P6).** About 1,450 lines. Built and tested; offered to no member until R7's gate (D11's bar) opens.

## Public

### Purpose

The system exploring a question on its own where an account owner turned exploring on (D33, D39; N815): choosing what is worth exploring, running a bounded exploring run as a system step, gauging how each find bears on the question, and offering finds once to the members following it. Members decide what becomes evidence.

### Provides

- **R1** *(not yet met: T41)* (D39; `ai-use` R6, R9) `exploreDue(now)`, `exploreWake(now)`, `exploreTick(now)` for `scheduler`. For each account owner and each question in its scope, `ai-use.exploreAllowed` decides; `{ask: true}` records `ai-use.exploreAsk` with the questions and their estimate (R12), and nothing runs that day without approval.
- **R2** *(not yet met: T41)* (BOB's detail) A question is **worth exploring** when it is open or surfaced, at least one member receives its finds (`steps` R17), and it was never explored or the record gained, since its last exploring run, a capture whose resolved entities include its subject entity (`inquiry` R43). Read bounded (at most 200 questions a tick). R9 holds before it.
- **R3** *(not yet met: T41)* (H30 (5); AI Roles rule 12) An exploring run is opened through `ai-runs` in the `investigate` mode's run path with `origin: "explore"`, use `explore`, the paying owner as principal and `ai-use` R6's label, as a system step on the question (`steps` R1, R8). A principal served by a sign-in (credentials R35) explores only while that sign-in account's `explore` use is on (credentials R55, off by default, its owner's own act; N796, Bob K2425; K2472); otherwise it is refused as any account whose `explore` use is off. It reads within its principal's sight: a member's account, that member's; a project's, its participants'; the group's, what every member may see. It asks to capture only through `capture-requests` and only an address the record already holds, each request carrying the step; a page it finds anywhere else is named to the members R5 reaches, who capture it (`capture-requests` R49).
- **R4** *(not yet met: T41)* (D33; K1473) Each find (a capture, content row or connection the run located) is gauged `supports`, `cuts_against` or `unclear` against the question's live basis, answered as `{bearing, how, false_alarm_rate, gold_set, label: "machine", enabled_by}`. The gauge is never a grade, never stored as a score, and never hides, ranks or orders what members see.
- **R5** *(not yet met: T41)* (D36) `findsFor({viewer, at})`, for `notice-producers`: each find, once, to each of `steps.findRecipients` who may see both the find and the question, keyed per find and question. A find is labelled the system's work, never a project's; which account paid is answered only to that account's owners (D64).
- **R6** *(not yet met: T41)* (D3) A find's only doors are a member's: dismiss it (a project-scoped disposition, `queue` R27; a follower outside every drawing project mutes it), accept it into the evidence by one act (`record-grammar` R52's forms: a leg the member draws by her own promotion, as found or edited, or her own instead), hold a hypothesis, or start a step. Nothing here writes a leg, a grade, a conclusion or a member's hypothesis.
- **R7** *(not yet met: T41)* (D11, D14; K1504) Finds are offered only while the gauge's gate is open: the explorer has passed D11's bar on Civicsmith's test investigations (`ai-runs` R75), its false-alarm rate there at most 20% and recorded, and `run-rules` R19 lets `investigate` deploy and the explorer's use. Closed, R5 answers nothing and counts nothing, and no member is offered exploring.
- **R8** *(not yet met: T41)* An exploring run stopped by a limit ends its step `set_aside` with the reason (`steps` R5); only its enabling owner is told (`ai-use` R5). No place is named in behaviour or outward text.
- **R9** *(not yet met: T41)* (D13) The system never explores a person on its own. An exploring run gathers about a person (searches, captures or reads aimed at a person entity, `entities`) only when a member has tied that person to the question (its subject or named entities, or a connection a member drew to it); any other look aimed at a person is refused inside the run `EXPLORE_PERSON_NOT_TIED`, recorded on the run, and the run goes on. R2 never chooses a question for a person no member tied to it.
- **R10** *(not yet met: T41)* (D13; BOB's detail) An exploring run gathers about at most 20 distinct persons (`EXPLORE_PERSON_CAP`); a look past the cap is refused `EXPLORE_PERSON_CAP_REACHED` and the run ends its step `set_aside` with that reason (R8). The cap is a constant here, changed only by a reviewed change.
- **R11** *(not yet met: T41)* (D14) A group's own test investigations (`ai-runs` R75) measure the explorer too; the result, with its false-alarm rate, is answered to that group's members only, and never opens or closes R7's gate. Test transcripts are kept for grading only (D15).
- **R12** *(not yet met: T41)* (D12) Each Ask item and each run carries `ai-use` R10's estimate before (a range, or "not known yet") and, at its close, `ai-runs` R76's actual cost, each answered to the paying account's owners only.
- **R13** *(not yet met: T41)* (D2) An exploring run may read inside documents the record holds, a few pages at a time within `run-rules` R26's reading bound, never a document under a "no AI" material limit (`credentials` R57); what it proposes while reading is `run-productions` R21's, each tied to the step.
- **R14** *(not yet met: T41)* (D66; CF invariant 7 as amended) A find that cuts against what the question's members hold is offered exactly as prominently as one that supports it: the same item, kind, place and order rule; no answer here orders, groups or filters finds by bearing.

## Private

### Uses

- `run-productions`: proposals while reading (its R21; R13; K2472). A new `modules.json` edge; `run-productions` is earlier (layer 6).
- `record-grammar`: `ACCEPTANCE_FORMS` (its R52; R6), the proposal labels.
- `civil-time`, `record-core`, `membership`: days, tables, sight.
- `credentials`: material limits (its R57; R13) and the account's uses (its R55).
- `connections`, `retrieval`: what a run located and reads (R4).
- `inquiry`: a question's state and subject entity (its R43; R2), R59's person test (R9).
- `leg-earning`, `basis-versions`, `contradiction`: the question's drawing projects and live basis (R4).
- `steps`: `stepCreate`, `stepEnd`, `findRecipients` (its R1, R5, R8, R17).
- `run-rules`: R19's deploy gate, R23's `explore` origin, R26's `pages` bound.
- `ai-use`: `exploreAllowed`, `exploreAsk`, `estimate` (its R6, R9, R10).
- `ai-runs`: the `investigate` run path, R75's test bar, R76's actual cost.
- `capture-requests`: captures asked only through it (its R49, R55).

### Invariants

Stated with its services above: R4 (a gauge is never a grade), R6 (members' doors only), R7 (the gate), R9 and R10 (persons), R14 (as prominently).

### Satisfies

- The investigation design of record (K2417): D33, D36, D39, D11–D14, D66; N815.

### Suggestions

- Paths: `bio-plane/src/question-explorer/`; tests `bio-plane/test/m/question-explorer/`.
