# notice-producers — requirements

> **DRAFT by a requirements-drafting worker for BOB #114, not reviewed.** 2026-10-05, on `tranche/T32` (P18), for T33's opening (§5.9). Not yet in `build/requirements/`.

**Status** · New module, a new seam after `queue-producers` with no copy (K617; `plan/draft-T33-plan.md` T33-82, Choices 8 and 23; scope §2: queue-producers, 3,875 lines, is split before any new producer). No `queue-producers` requirement moves; its R8's read stays, and `queue` reads this module beside it (T33-83). Layer 11, after `queue-producers`, before `queue`. Its meaning is the ladders' (§2 "Cross-cutting rulings": machine checks, standing questions, sight; §9.5 L5; §10 rows "A due threshold raises a question, never a violation", "Machine signals live in the hypothesis layer") and K1444 (i), K1466, K1473, K1481, K1489, K1491, K1504. All requirements are new and not yet met (T33-82). Interest-check and money-detector items are built and shown only once their gate opens (Rule 7).

**Size (P6).** About 600–1,000 lines (T33-82, est 10 requirements).

## Public

### Purpose

The feed's newer producers: each derives, on read and writing nothing, the items one provider's facts earn for a viewer: what the machine noticed about people and money ("Noticed", the machine's, in the hypothesis layer), a member's standing-question answers, a body's duty occurrences that have come due, and an inquiry's dated waits that have come round. It names each item's subjects and homes for `queue` to home, offer, mint and publish, exactly as `queue-producers` does for the rest.

### Provides

Terms. An **item**, a **home set**, the item's `class` (FINDING, OBLIGATION, CONDITION) and its key are `queue`'s and `queue-producers`' (its Terms). A **gate** is a check's or detector's state of being shown: open only once its false-alarm rate, measured on its gold set, is at most 20% (K1504), as its owner answers it.

**noticeItems({member, viewer, now, identity, homesOf, optionsOf}) → {items, facts}** (`queue`'s one read of this module)
- **R1** Answers every item R2–R6 derive for this member and viewer, each homed through `homesOf(subjectIds)` and carrying `options` from `optionsOf(subjectIds)` (as `queue-producers` R8), and `facts` stating each producer's bound and `truncated`. Writes nothing and never throws; a provider that throws contributes no item and is named in `facts.failed`. *(not yet met: T33-82)*

**The producers**
- **R2** (K1491, K1473; ladders §2 "Machine checks") FINDINGs `interest-check-noticed`: one per result of an interest check that `people.checkResults({project, viewer})` answers (its R24: only once the check's gate is recorded open; its R25: withheld whole from a viewer who may not see an input) and which is not switched off for the project it runs in, keyed `FINDING::interest-check-noticed::<check>::<result>`, to the members of that project who may see every input it rests on, and to nobody else. Its detail states the check's data-defined condition, its denominator and its cited derivation, and its `label` is `noticed` (the machine's, in the hypothesis layer). It names no judgment of a person: not "conflict", not suspicion; the subject is the pattern or transaction, never the person alone. It is raised once and leaves when its recipient disposes of it or the result no longer holds. *(not yet met: T33-82)*
- **R3** (K1491, K1473) FINDINGs `money-detector-noticed`: one per result `money-checks.noticed({project, viewer})` answers (its R9: only detector versions whose recorded rate is at most 20% and switched on for that project), keyed `FINDING::money-detector-noticed::<detector>::<result>`, to the members of that project who may see every input, and to nobody else; detail, label, words and leaving as R2's. *(not yet met: T33-82)*
- **R4** (K1481; ladders §9.5 L5) FINDINGs `standing-answer`: one per entry `answers.standingAnswersFor({member})` answers (its R20), keyed `FINDING::standing-answer::<question>::<run>`, to the question's author and to nobody else; its subject the standing question, its detail the new finds and the answer as `answers` holds it (or what held the AI half back), labelled as the assistant's machine work. It is told once (DEC-94): raised once per run and never repeated, and leaves when its recipient disposes of it. *(not yet met: T33-82)*
- **R5** (K1466, K1444 (i); ladders §10 "A due threshold raises a question") FINDINGs `temporal-expectation-due`: one per occurrence of an adopted duty that `duties` answers `overdue` (only after the latest candidate due date) or `undetermined` between the candidates (its detail "possibly overdue: undetermined, because …"), read through `duties.occurrencesOf` (the sibling draft's R10, R11) for the duties `duties.dutiesOf` answers the viewer, keyed `FINDING::temporal-expectation-due::<duty>::<occurrence>`, to the member who adopted the duty, else its project's owners (`membership` R65), else the administrators (`membership` R86); its subject the duty, naming the occurrence, its due date or candidates, its basis kind and its derivation, its `label` `noticed`, and `due` the local day (as `queue-producers` R25). It never states a violation. It is raised once per occurrence and state, and leaves when the occurrence is met, met late or no longer overdue. An occurrence of the group's own checkpoint is never such an item (D234; `action-plans` R23). *(not yet met: T33-82)*
- **R6** (Choices 23; ladders §4.5 dated waits) Items `inquiry-recheck-due`: one per dated wait `inquiry` answers due (its recheck date reached on the local day), keyed `<CLASS>::inquiry-recheck-due::<inquiry>::<date>`, to the member who set the wait and to nobody else; its subject the inquiry, naming what is awaited, from whom and by when (DEC-98), `due` that day. It is raised once and leaves when that member records a look, sets a new date or removes the wait, or the inquiry concludes. *(not yet met: T33-82)*

## Private

### Uses

Rule 3's list: `queue-producers` (the item shape and homes, as its R8), `people` (`CHK-` results, their gates and per-project switches), `money-checks` (detector results, gates, switches), `duties` (adopted duties' occurrences and their states), `answers` (`standingAnswersFor`, its R20), `inquiry` (dated waits).
**Not in Rule 3, needed by this draft (open):** `membership` (sight, `projectOwners`, `activeAdmins`), `civil-time` (the local day for R5's and R6's `due`).

### Invariants

- **R7** (K1489; `queue-producers` R11) No answer names a bundle, row or project the viewer may not see, and no count reveals one; an interest check, money detector or hypothesis inside a hidden project is neither shown nor counted to anyone outside it. *(not yet met: T33-82)*
- **R8** (K1491, K1473, K1467) An item of R2 or R3 is never stored on a person, never moves a grade or a finding, and is never offered as a citation for a claim; its only acts are to dispose of it or take it up as a member's hunch or hypothesis. *(not yet met: T33-82)*
- **R9** (Rule 7; K1504) While a check's or detector's gate is closed, R2 and R3 raise no item for it and count none: switching display on is the gate's opening, never a parameter of this read. *(not yet met: T33-82)*
- **R10** No place is named in this module's behaviour or outward text. *(not yet met: T33-82)*

### Satisfies

- `docs/architecture/BIO_Capability_Ladders_v0_1.md` §2 "Cross-cutting rulings" (machine checks; standing questions; sight), §5A and §5C (interest checks and detectors as "Noticed"), §4.5 "Dated waits on an inquiry", §9.5 L5 (one labelled item, told once), §10 rows "A due threshold raises a question, never a violation", "Machine signals live in the hypothesis layer", "Hypotheses have a place, never in findings".
- `docs/development/NOTIFICATIONS.md` (the classes, the catalogue, the item contract); `docs/architecture/BIO_Interaction_Constructs_v0_1.md` (QUEUE).
- DEC-10, DEC-69, DEC-94, DEC-98 (R6); D234, D241; K1444 (i), K1466, K1467, K1473, K1481, K1489, K1491, K1504.

### Suggestions

- **Open for BOB.**
  1. **R6's class.** The plan lists dated waits among "the new FINDING producers", but a wait the member set for themselves reads as their own to-do (an OBLIGATION, as `action-reminder`, `queue-producers` R18). The key leaves `<CLASS>` open; BOB picks one.
  2. **R2's and R3's recipients.** K1491 names no recipient; the draft sends each item to the members of the project the check runs in who may see all its inputs (K1489). A check run group-wide (no project) would then reach nobody: BOB's choice (administrators, or every member who may see all inputs).
  3. **Service names.** R2 and R3 follow the sibling drafts (`people` R24–R25 `checkResults`; `money-checks` R9 `noticed`), which already apply the gate, the per-project switch and sight; R9 here is then a second guard, kept so the queue never depends on one reader alone. The dated-wait read in `inquiry` is its job's (T33-45).
  4. **Uses** beyond Rule 3 (above).
  5. `queue` R1's `classOfKind` gains the five kinds (T33-83); the item words ("Noticed", the standing item's sentence) are the design stream's (NOTICE B36, B28), and the audit's note on "signal" (queue R48, queue-producers R24) applies to them.
- **Factory.** `noticeProducersOf(ctx, deps)`, exporting `noticeItems`; it registers nothing and holds no check row (it refuses nothing).
- **Tests.** A closed gate yields no item and no count (R9); a hidden project's check reaches no outsider (R7); a duty occurrence between its candidates reads "possibly overdue", after the latest "overdue", and the group's own checkpoint yields nothing (R5); a standing answer reaches only its author, once (R4).
