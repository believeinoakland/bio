# skills — the fold's changes

**Status** · Written by a worker for BOB #74, 2026-09-30, from `build/plan/action-design/deltas.md` §5, against `build/requirements/skills.md` on `tranche/T17` (highest id R27). Id final: **R28**. The Status line gains: "Action layer folded 2026-09-30 (K608): R5 widened, R28 added, not yet met."

**P4.** `skills` is layer 6; the modules whose proposal acts the skill names are layer 9. The design's "writes through proposal ops only" needs no `uses` edge: the pack names acts as `published.catalog` publishes them over the wire (R8, R5's `acts`), and the doctrine it carries is authored from canon (R21). No module import is added, and no `uses` edge. Running the skill (a run mode that proposes plan options) is `ai-runs`' and `agent-worker`'s, not drafted; see `t18-entries.md`, "Not in T18".

## Replacement

**R5** — in the current line, the clause

> `contradiction` (R27) and `recipes`.

becomes

> `contradiction` (R27), `action_planning` (R28) and `recipes`.

## Addition (after R27)

- **R28** (K608; `BIO_Action_v0_1.md`) The `action_planning` layer: `sourcing` `authored`, `load_when` "the run proposes plan options, standards, comparisons, candidate theories or communication drafts for an action or a plan", body the clauses the run works under, each a sentence found in `BIO_Action_v0_1.md` §4 by R21's normaliser: rule 1 (humans decide; the machine proposes and drafts, labelled, and never takes an act), rule 2 (the gate is at the outward act), rule 3 (no significance, no score), rule 6 (addressees are roles, not people), rule 8 (no catalogue, no budgets), rule 9 (the doctrine's limits: lobbying only to enforce or restore an existing requirement), rule 10 (the kind of work shapes suggestions and nothing else) and rule 13 (the venue sets the standard of evidence); and `acts`, the member-only acts it must leave to a member and the proposal acts it may use, each read from `published.catalog` by id (`action-plans` R11's `optionpropose`, the proposal acts of `standards` R9 and `conformance` R12, `filings` R14's theory proposal and R23's `communicationprepare`), never typed as a list here (this module's R23). No clause carries control-flow authority (R16, R24). *(not yet met: new)*

(The proposal acts' op ids are as `control-plane` publishes them; the job reads them from the catalogue, and a missing one is R1's throw naming it.)

## Satisfies (add)

> - `BIO_Action_v0_1.md` §4 rules 1–3, 6, 8–10 and 13 (the doctrine the `action_planning` layer carries).
