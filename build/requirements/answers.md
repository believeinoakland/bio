# answers — requirements

**Status** · Reviewed (K1505; banner cleared K1599). New module (K1439; `plan/draft-T33-plan.md` T33-53, Rule 3; entries C Q1-1 and C:B-3; scope §1 QUESTIONS: Q1, Q3 rule services, L5 standing questions). Layer 6, after `skills`, before `agent-harness` (L6: … skills → answers → agent-harness → agent-model → agent-runner → agent-worker). Its meaning is the ladders' (§2 QUESTIONS and "Cross-cutting rulings", §9.4 L1 and L3, §9.5 L5, §10) and the rulings K1450, K1474, K1479, K1481, K1500, K1502, K1504. All requirements are new and not yet met (T33-53). Built switched off (Rule 7): the AI half of standing questions (R24) until the 150-question bar is met (M-Q9, T33-D10).

**Size (P6).** About 1,500–2,500 lines (entries C P6 table; ladders §9.4 L1). Under 4,000.

## Public

### Purpose

The plane's half of the assistant: what an ask may read, what an answer must look like, and the checks every answer passes before a member sees it, so that every rule comes from the plane and every quote, figure and absence is bound to what was read. It also answers the plane's rule services (law, time, organisations, people, figures) and keeps a member's standing questions, which re-run their saved search on the schedule and call the model only when something new is found. The model only understands the member's words, writes queries, quotes and translates; it never answers from its own knowledge.

### Provides

Terms. An **ask** is one member's question, answered under a **grant**: `credentials`' short-lived, read-only `ai` grant minted at that member's act, with that member as viewer, writing no run row (K1450). The **read log** is the set of reads the plane served under one grant, each with its op, its arguments and what it answered. A **level** and the **absence terms** are `observation-log`'s (the four levels; the five terms). A **rule item** is one answer of R12. Every refusal names `reason`; one with a catalogue row carries its `check`, `code` and `translation` (DEC-49).

#### The asking scope (K1450; ladders §2 QUESTIONS)

- **R1** `ASK_SCOPE` is the one closed list of plane reads an ask may make, each entry naming its op and the ruling that admitted it (a recorded widening, D9, DEC-55): the record's search and look states (`retrieval`, `query-language`, `observation-log`); law (`standards`), profiles (`jurisdictions`), the registry (`entities`, `person` entities with their identifiers included, C:B-3), `lines`, `duties` and occurrences, the frontier and the bar (K1450); `timeline`, `eventsFor` (`events`), `moneyOf`, `committedAgainstPaid` (`money`), `holderAt`, `careerOf` (`lines`, `people`) and `explore` (the audit's R37 widening, K1470); calculation results and money facts (C:B-3); and R12's rule services. It holds no `sources*` op, no member history, no administrative op and no export op. `askAdmits(op)` answers whether an op is in the list; pure. *(not yet met: T33-53)*
- **R2** (constructs-2 §3 QUESTIONS; K1489) A read made under a grant never answers, names or counts a member's declared tie (`MTI-`), the link from a source to a person, or a row of a project hidden from the asking member. Each ASK_SCOPE read is answered with these rows removed before the read log records it, and a count it carries counts none of them. *(not yet met: T33-53)*

#### The answer contract and its checks (ladders §9.4 L1)

- **R3** An **answer** is `{question_as_read, clarifying, summary, sentences, holdings, rules, looks, bound, truncated, out_of_view, lens, not_established, query, next_acts, label}`: `question_as_read` the question as the model read it; `clarifying` null or exactly one question (an answer with one has no `summary` and no `sentences`); `summary` one line naming the sentences it rests on; each sentence `{text, kind, support}`, `kind` one of `quote`, `list`, `figure`, `absence`, `rule`, `explain`, `support` the ids of the holdings, rule items or looks it rests on; each holding `{address, quote}`; `looks` `[{level, state}]`; `query` the query run, shown; `label` `"machine work"`. `checkAnswer` refuses any other shape as `ANSWER_MALFORMED`, naming the field, and nothing is shown. *(not yet met: T33-53)*
- **R4** `checkAnswer(answer, {readLog, viewer})` → `{ok: true, answer, withheld}`: each sentence that fails a check is withheld, never rewritten, and `withheld` lists `{sentence, code, translation}` for each; a summary resting on a withheld sentence is withheld too, and when nothing remains the answer states what could not be established. The checks, each a catalogue row with its translation:
  - `ANSWER_CITES_UNREAD`: a holding whose address the read log did not answer, or whose quote is not a byte-exact substring of the object as the read log answered it;
  - `ANSWER_FIGURE_UNSOURCED`: a figure (an amount, count, ratio or percentage) stated outside a quote that does not equal a figure of a `CALC-` result or of a money fact (C:B-3) the read log answered and the sentence cites;
  - `ANSWER_RULE_NOT_PLANE`: a `rule` sentence or rule item not among R12's answers in the read log;
  - `ANSWER_ABSENCE_WITHOUT_LEVEL`: an `absence` sentence or a look that names no level, or states absence in a word outside the five absence terms.

  Never throws; writes nothing but R18's counts. *(not yet met: T33-53)*
- **R5** (K1474 (i); closed book) Where the read log holds nothing for the question, a correct answer states "not held" at the level searched and names in `next_acts` the act that would find it; an answer whose `sentences` other than `absence` rest on no read is withheld whole by R4. *(not yet met: T33-53)*
- **R6** (K1474 (ii), (iii)) Each rule item carries a `label` naming its kind: `legal_information` for a reading of a held statute, ordinance or policy, which carries its quote beside it and its limits; `procedural_fact` for a form, venue or deadline from the profile; `computed_fact` for a date, count or figure the plane computed. A reading of a court ruling is quote-only: its rule item carries the quote and no reading (D40). A rule item without its label, or a `legal_information` item without its quote, is `ANSWER_MALFORMED` (R3). The words shown for each label are the design stream's. *(not yet met: T33-53)*

#### Rule services (Q3; ladders §9.4 L3)

- **R7** `ruleAnswer({service, args, viewer, at?})` → `{ok: true, service, value, basis, grade, status, label, as_of}` or `{ok: true, not_held: {level, reason, act}}`, non-mutating and as of `at` (now when absent); an unknown service is `RULE_SERVICE_UNKNOWN`. Never throws; a service that throws answers `not_held` with its reason. Each answer is recorded in the read log of the grant it was asked under. *(not yet met: T33-53)*
- **R8** Law: `standard` answers a held standard with its captured text, version and portion; `standardinforce` answers in force, not in force or undetermined with its reason at its level (`standards.inForceAt`); `profiles` answers a profile fact with its citation, status and confirmation horizon, a venue's standard of proof included (`jurisdictions` R39). A profile rule without a primary source, or `UNMEASURED`, is `not_held` (K1445). *(not yet met: T33-53)*
- **R9** Time: `deadlinecompute({rule, start, office})` answers a due date with its zone and calendar status, or undetermined with its reason, computed from the profile rule over the start event's date by `civil-time`; an uncertain date answers both candidates, the group's own deadline the earliest and a body's overdue only after the latest (K1444 (i)). It is derived on each ask and never stored. *(not yet met: T33-53)*
- **R10** Organisations and people: `entities`, `lines`, `holderAt`, `careerOf`, `duties` and `occurrences` answer as their owners answer, each with its grade and basis; a holder is never inferred from a line its owner does not hold. *(not yet met: T33-53)*
- **R11** Figures: `evaluate` runs a recipe through `calculations` without persisting it and answers its result with its denominator, labelled `computed_fact`; a `compare` result is never worded as a breach (D275). *(not yet met: T33-53)*
- **R12** `registerRuleService(name, fn)` takes, once per name, at start, a later module's rule service (K31's pattern). A name already registered, or one R8–R11 serve, is refused `RULE_SERVICE_EXISTS` and the first stays. A registered service is answered through R7 like the built-in ones. *(not yet met: T33-53)*

#### Tallies (B17 (iii); K1450)

- **R13** `countAsk({outcome, codes, mode, at})` adds to counts per local day of the group's jurisdiction and per mode: asks answered, asks refused by refusal code, sentences withheld by R4's code. A count carries no member, viewer, question, address or answer text. `tallies({viewer, from, to})` answers them to an administrator (`membership` R64) and refuses any other viewer as `NOT_AN_ADMIN`. *(not yet met: T33-53)*
- **R14** (K1450: nothing kept) An ask writes no row but R13's counts: after an ask, every table this module or a module it reads declares holds the same rows as before, except the counts. *(not yet met: T33-53)*

#### Standing questions (L5; K1481, K1500, K1502)

- **R15** `standingQuestionSet({author, question, query, cadence, ends, viewer})` records a member's standing question by that member's own act: the question in their words, the saved query the assistant wrote and showed when it was first asked (`query-language`'s saved-query form), a `cadence` (`daily`, `weekly` or `monthly`) and an end date. Refusals, each writing nothing: a machine author `MACHINE_CANNOT_AUTHOR`; a query the saved-query form refuses, with that refusal; a cadence not in the list `BAD_CADENCE`; `ends` absent, not a date, or not after today `STANDING_NEEDS_END`. *(not yet met: T33-53)*
- **R16** (K1481) A standing question, its runs and what they found are seen only by its author: any other viewer, an administrator included, is answered as if it did not exist, identically. `standingQuestionEnd({id, author})` ends it at its author's act at any time; a question passes its end date and ends itself. An ended question runs no more. *(not yet met: T33-53)*
- **R17** For `scheduler`: `standingDue(now)`, `standingWake(now)`, `standingTick(now)`. A question is due at its cadence from its last run (local day, `civil-time`). The tick re-runs each due question's saved query under its author's sight at that moment, with no model call, at most 50 questions per tick, oldest due first, and records the result's ids. *(not yet met: T33-53)*
- **R18** (K1481: something new) A run finds something new when its result holds an id the previous run's did not, or an occurrence it reads changed state since the previous run. A first run finds nothing new. A run that finds nothing new records only that it ran. *(not yet met: T33-53)*
- **R19** (K1481, K1502, K1500; Rule 7) When a run finds something new, the AI half answers it only when all of these hold: the copy's switch for the AI half is on (off until the 150-question bar is met); the author's own standing-question switch is on; the author has an account reference; and the author's use ceiling is not reached (`ai-runs`). It then runs read-only under a grant scoped as an ask, bounded per ask (`run-rules`), on the author's account, and its answer passes R4. Otherwise no model is called, and what is held names the new finds and the condition that held the AI half back (switch off, no account, or the ceiling's refusal in its plain words). *(not yet met: T33-53)*
- **R20** `standingAnswersFor({member, after})` answers, for each run of that member's own questions that found something new, `{question, run, at, finds, answer, held_back}` with the label "machine work, from your standing question", in run order after `after`, at most 200, with `cursor`; one entry per run, so each new find is told once (DEC-94). It answers nothing about another member's questions. *(not yet met: T33-53)*
- **R21** (K1481; K1449) A standing question reads only ASK_SCOPE's reads (R1, R2): it makes no capture request, no fetch and no outside-source read, and no AI run starts in this module but R19's. *(not yet met: T33-53)*

## Private

### Uses

Rule 3's list: `retrieval`, `query-language` (the saved-query form; search), `observation-log` (levels, absence terms, the frontier), `strength` (the bar), `inquiry`, `skills` (the pack's `ask` layer, for `next_acts` wording), `run-rules` (mode `ask`, the per-ask bounds), `ai-runs` (the ceiling, usage), `calculations` (results; `evaluate`), `standards` (`standardRead`, `inForceAt`), `lines` (`holderAt`, `chain`), `events` (`timeline`, `eventsFor`), `money` (`moneyOf`, `committedAgainstPaid`, money facts), `duties` (duties, occurrences), `people` (`careerOf`, `personAt`), `explore`, `jurisdictions` (`combine`, the profile's rules and R39).
**Not in Rule 3, needed by this draft (open):** `civil-time` (R9, R13, R17: the local day and the deadline computation), `entities` (R10, the registry reads), `membership` (R13's administrator test; R16's sight), `record-core` (`declareTable`, `transact`, `stampInstant`).

### Invariants

- **R22** (ladders §10 "Closed-book answers") The model never gains a source of rules: no rule item reaches a member but through R7 (R4's `ANSWER_RULE_NOT_PLANE`). *(not yet met: T33-53)*
- **R23** (S0-3; K1450, K1481) Its tables are declared with their classes: R13's counts `admin-only`; standing questions and their runs seen only by their author, `export` per Suggestions. *(not yet met: T33-53)*
- **R24** Its rows (`ANSWER_MALFORMED`, `ANSWER_CITES_UNREAD`, `ANSWER_FIGURE_UNSOURCED`, `ANSWER_RULE_NOT_PLANE`, `ANSWER_ABSENCE_WITHOUT_LEVEL`, `RULE_SERVICE_UNKNOWN`, `RULE_SERVICE_EXISTS`, R15's refusals) are held in its own table with their translations; a change to any row moves `CATALOG_VERSION` (rule 17). *(not yet met: T33-53)*
- **R25** No place is named in this module's behaviour or outward text. *(not yet met: T33-53)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 QUESTIONS (all bullets) and "Cross-cutting rulings" (the member's own account; standing questions; sight), §9.1, §9.4 L1 and L3, §9.5 L5, §9.6, §10 rows "Closed-book answers", "Four-level absence", "No standing AI run but a member's standing question", "The machine never concludes", "Basis and grade; undetermined".
- `docs/architecture/BIO_Assistant_and_AI_Roles_v0_1.md` §3, §5.
- `docs/development/ASSISTANT-PILOT.md` §1 (self-description from the plane), §4 (read-only scope).
- DEC-8, DEC-27, DEC-49, DEC-55, DEC-94; D9, D13 (lifted for standing questions by K1481), D40, D59, D275; K1444 (i), K1445, K1450, K1474 (i)–(iii), K1481, K1489, K1500, K1502, K1504.

### Suggestions

- **Open for BOB.**
  1. **Uses** beyond Rule 3 (above). Without `civil-time`, R9 cannot compute; without `entities`, R10's registry read goes through `people`.
  2. **Where the ask allow-list lives.** Q1-3 puts it in `credentials` (L2) as the grant's class; R1 makes `answers` the one list. Keep both with a copy test (`credentials`' class equals `ASK_SCOPE`, both ways, the `agent-worker` R44 pattern), or let the control plane (L11) admit grant ops through `askAdmits`.
  3. **The read log.** The plane must hold what a grant read for the grant's life (memory or a purged scratch table) so R4 can check against it without trusting the Worker; the holder is BOB's (control plane or `credentials`).
  4. **Q3 shown.** The plan's release table says M-Q9 unlocks "Q3 rule services shown". If rule services are to be hidden until then, R7 needs a switch like R19's; the draft builds them on.
  5. **A standing question's id and export class.** A new prefix (`SQ-`?) enters `record-grammar`'s id table (S0-1), and K1481's "seen only by its owner" suggests export `never`, or exported to its author alone; both BOB's.
  6. **K1474 (iv)** (procedural reasoning for the group's own situation) is not drafted: it is the backward question's procedural form, left out with T33-B1.
  7. Refusal codes in R3, R7, R12, R15 other than the ladders' four checks are this draft's.
- **Figures.** Use `calc-grammar`'s figure parser (through `calculations`) to find R4's figures, so a figure means the same thing everywhere; a date or a record address is not a figure.
- **Tests.** The 150-question set's support kinds (`measures-T33/assistant-substrate.md` §7) make good fixtures for R4: one stubbed answer per kind, with a fabricated quote, an unsourced figure, a rule from the model and an absence without a level each withheld by name.
- **Words.** Every member-facing word (labels, "not held", the standing item's text) is the design stream's (NOTICE B28; K1486); this module holds codes and translations only.
