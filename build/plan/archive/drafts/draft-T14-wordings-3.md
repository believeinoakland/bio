# T14 wordings (3): N346 (a worker for BOB #66, 2026-09-29; P18)

**Reviewed** · by BOB #66, 2026-09-29 (K448). The failed-read defect is confirmed (`publication/index.mjs`:1178–1182 answers before :1185's ratified check). All five MEANING? points are BOB's, read from DEC-79 as folded in State Rules §4.3: (1) the bars stack in order, a skipped stage `reached: true` with `earned: null`; (2) a closed project states how far it had come beside `closed` and its reason; (3) OWED, not a new entry: §4.3 says the larger view shows when each stage was reached, so each reached stage also answers `since`, the instant of the evidence that earns it now (the earliest current leg, the conclusion, or the ratified edition), null for a skipped stage; after a withdrawal it moves to the evidence that earns it then. Add a test: withdrawing the earning conclusion moves `matured`'s `since` or unreaches it. (4), (5) as drafted.

Read on `tranche/T13` @ 18395466ea (T13 open). Not folded. Sources: next.md N346; N300 (`archive/next-applied.md`:429); K356, K362, K364, K379, K396, K399, K439; DEC-79 (`docs/development/DECISIONS.md`, "DEC-79 · answered"); State Rules §4.3, "How a project's stage is shown" (`BIO_State_Rules_Consistency_v1_5.md`:875–883).

| file | next free id | used by |
|---|---|---|
| publication | R49 (R48 is N339's, `draft-T14-wordings.md`) | N346 R49 |

N345 may also give publication new ids (DEC-76's disclosure, DEC-81's grade disclosure). If it folds first, BOB renumbers R49 here.

Field names, the shape of `needs`, the fixed sentences and the order of the answer are wording under meaning Bob already holds. Places where meaning might move are marked **MEANING?**, each saying whether it goes to Bob or stays with BOB.

**Folding.** No T13 job reads `publication.md`. T14 already opens a publication job for N339 (R48), so this folds into the same job's file at T14's opening (P10).

---

## 1. N346: what each stage not reached still needs, and `closed` with its reason

**Finding.** R44–R47 answer the stage and the rule that decided it (`basis`). They do not say what a stage not reached still needs. So DEC-79's larger view has nothing to show that comes from the rule.

What the code computes today (`publication/index.mjs`):

- `stage` is decided by R45's four rules in order, in one pass (:1133–1198). Rule 1 returns before any question is read (:1159–1161). The question read stops once rule 2 is met (:1162–1177).
- `basis` names only the deciding rule's evidence. No other stage is described.
- `closed_reason` is carried only when rule 1 holds. A document saying `current_state: closed` with a missing or unknown reason is not closed and nothing says so (:1159). C-2.9 calls that document an error (`checks/bio-checks.mjs`:3640–3641).
- Two `undetermined` answers carry `at_least` and a `detail` (:1178–1182, :1187–1194). One carries neither: the project's own document could not be read (:1156–1157).
- **A defect against R45 as written.** A thrown question read answers `undetermined` (:1178–1182) before the ratified-edition half of rule 2 is asked (:1185). A project owning a ratified case edition is `matured` whatever its questions say, so this under-states the stage. The cap path asks it first (:1185, then :1187), so only the thrown path is wrong.
- Readiness already states each unmet rung with a fixed `why` (:1226–1232). R46 therefore needs no change for DEC-79.

**The one-rule guarantee.** DEC-79's condition is that the display never promises a stage the computation would not give. The wording gets this by producing `needs` in the same evaluation that decides `stage`, and by listing only inputs R45 counts. A test then adds each listed input alone and checks that the stage moves.

### publication.md, R44

In the answer's field list, after `basis`, add `stages`:

> … `readiness, basis, stages}`, derived afresh at every read. *(not yet met: N346)*

The rest of R44 is unchanged.

### publication.md, R45

Append two sentences:

> A read of the held questions that fails still asks rule 2's second half: a project owning a ratified case edition is `matured`, with that edition as `basis`; only with none is it `undetermined` with `at_least`. A document recording `current_state: closed` without a recognised `closed_reason` does not meet rule 1, and R49's `closed` entry says so. *(not yet met: N346)*

### publication.md, R49 (new, under "A project's stage")

> - **R49** `stages` lists State Rules §4.3's four in order (`forming`, `investigating`, `matured`, `closed`), each as `{stage, reached, earned, needs, why}`. It is produced in the same evaluation of R45's rules that decides `stage`, never by a second reading of the record.
>   - **The three computed stages.** `reached` is true for the decided stage and each stage before it, and false for each stage after it. `earned` names what met that stage's own rule where the read found it (`{question}`, or `{case, edition}` as in `basis`), else null.
>   - **What a stage not reached needs.** `needs` is null for a reached stage. For a computed stage not reached, it is `{any_of: [{condition, have}]}`, and `why` is one fixed sentence per case.
>     - `investigating`: `held_question_with_leg`, `have` = `questions.with_legs`. The `why` says whether the project holds no question yet, or holds some and none has a leg in its basis.
>     - `matured`: `concluded_held_question` (`have` = `questions.concluded`) and `ratified_case_edition` (`have` = `published_editions`).
>   - **No promise.** Any one listed condition, met with nothing else changed, makes R45 decide that stage or a later one. `needs` never lists an input R45 does not count: a conclusion made without the project, a severed citation, a signed edition not ratified, the document's own `current_state`.
>   - **`closed`.** `reached` is true only by rule 1, and `earned` is `{closed_reason}`. When false, `needs` is null and `why` says a close is the owner's recorded act with its reason (resolved, superseded or abandoned), not a stage the record grows into. When the document records `current_state: closed` without a recognised reason, `recorded` holds the reason as written (null if absent, cut to 40 characters) and `why` says the close is not read because its reason is not one of the three.
>   - **When `stage` is `closed`.** Rules 2–3 are still evaluated, bounded as R45 states, and the three computed stages are stated as above. Every `needs` is null, with `why` saying the project is closed and a reopening is the owner's act. So the answer shows how far the work had come, and a close never reads as the last bar of a finished stack. *(See MEANING? 2.)*
>   - **When `stage` is `undetermined`.** Stages up to and including `at_least` are reached. Each stage above it has `reached: null` and `needs: null`, and its `why` is the answer's `detail`. With no `at_least` (the project's document was not read), all four have `reached: null`.
>   - Every `why` is a fixed sentence that states counts only. It never names a member, a question's text or a place (R34). *(not yet met: N346)*

### publication.md, R47

Append:

> `stages`, with its `needs`, is computed and never stored in the same way, and no part of the answer is read back as an input. *(not yet met: N346)*

### publication.md, Suggestions

- **"For callers of R44"** becomes: "The control plane routes `op=projectstage`, stamps `viewer` and keeps the route. The redesign shows `stages` on the project's home screen (DEC-79's bars, each named). It states each unmet stage's `why` and each unmet rung's `why`, never hiding them, and shows no need that the answer does not carry (N300, N346)."
- **"R44–R47 tests"** gains: "R49: the stage walk re-run asserting `stages` at every step, and each listed need added alone."

### Satisfies

The §4.3 line gains "and DEC-79 (R49)".

### Interface tests (`test/m/publication/stage.test.mjs`)

1. **One rule.** On every fixture of the four-stage walk (:55–91), `stage` is the last computed stage with `reached: true`, or `closed`. The reached stages form an unbroken prefix.
2. **No promise.** For each stage not reached, add exactly one listed input: a leg on a held question, the project's conclusion, a ratified edition. The stage becomes that stage or a later one.
3. **Uncounted inputs move nothing.** A conclusion made without the project, a signed edition not ratified, a document's `current_state: matured` and a severed citation each leave `stage` and `stages` byte-identical.
4. **The investigating need.** With no held question, `investigating.why` is the "holds no question" sentence. With one held question and no leg, `have` is 0 and `questions.read` is 1.
5. **A skipped stage.** A project owning a ratified edition and holding no question with a leg reads `matured`. `investigating` has `reached: true` and `earned: null`. *(Depends on MEANING? 1.)*
6. **The cap.** Past 2,000 held questions with rules 1–2 unmet, `matured` has `reached: null` and `needs: null`, and the stages up to `at_least` are reached.
7. **A failed question read.** When `projectQuestions` throws and the project owns a ratified edition, the answer is `matured` with that edition as `basis`. When it owns none, the answer is `undetermined` with `at_least`.
8. **Closed.** Each of the three reasons appears in `closed_reason` and in `closed.earned`. The computed stages are stated with every `needs` null. After a reopening, the stage is derived again and `closed.reached` is false with the owner's `why`.
9. **A close without a reason.** `current_state: closed` with no reason, or with `finished`, is not closed. `closed.recorded` holds the value as written, and the stage is computed.
10. **An unread document.** All four stages have `reached: null`.
11. **Fixed text.** Every `why` is one of the module's fixed sentences, with counts filled in. None contains a handle or a question's title.
12. **Nothing written.** Every table's rows are the same before and after the read (R47).

### Jobs

- **publication (layer 8)**, in the same job as N339's R48.
- **None elsewhere.** The control plane relays the answer unchanged (`control-plane/dispatch.mjs`:49, `ops.mjs`:74), and the only other test naming the op checks only the op's name (`test/m/affordances/catalogue.test.mjs`:403–416). The redesign reads `stages`, and its UI is not worded here.

### Rows

None. No refusal code is added or changed, and `CATALOG_VERSION` does not move.

### MEANING?

1. **Bob's (UX: what a bar claims).** A stage can be skipped: a ratified case edition makes the project `matured` with no question that has a leg. As drafted, stages count in order, so the bars stack without a gap and the skipped stage has `earned: null`. The alternative follows K364's rule for readiness, where each stage shows only by its own evidence, which can leave a gap in the stack.
2. **Bob's (UX: what a closed project shows).** As drafted, a closed project still states how far it had come (for example, an abandoned project that was still `forming`), which costs the bounded question read R45 now skips. The alternative is to show `closed` and its reason alone, with the three computed stages marked "not read: closed".
3. **Bob's (whether it is owed).** §4.3's fold says the larger view shows *when* each stage was reached. That is not in DEC-79's response or in N346. It is not drafted here. A reached time is not stable once withdrawals are possible (the walk withdraws a conclusion at :77–79). Recommendation: a separate entry if Bob wants it.
4. **BOB's.** The failed-read fix in R45: rule 2's ratified half already holds, so answering `matured` carries out R45 as written.
5. **BOB's.** A close without a recognised reason is stated in `closed.recorded`, not passed over in silence. Meaning is unchanged (K362 requires the reason; C-2.9 already calls it an error). Also BOB's: the shape of `needs`, the condition names, and the fixed `why` sentences.

### T13

No T13 job edits publication's code or requirements, so there is no conflict. N321's route (`op=projectstage`) is T13's and does not depend on this entry.

Evidence: `build/requirements/publication.md`:69–71 (R44–R46), :101 (R47), :120–121 (Suggestions); `bio-plane/src/publication/index.mjs`:78–86 (bounds, stages, reasons, rungs), :1133–1198 (`projectStage`), :1156–1157 (unread document), :1159–1161 (rule 1), :1162–1177 (the read and its early stop), :1178–1182 (thrown read, no rule-2 check), :1183–1194 (rule 2, then the cap), :1203–1247 (`#workProducts`, rungs with `why` at :1226–1232); `bio-plane/checks/bio-checks.mjs`:3640–3641 (C-2.9, a close without a reason); `bio-plane/test/m/publication/stage.test.mjs`:55–91; `docs/architecture/BIO_State_Rules_Consistency_v1_5.md`:875–883; `build/plan/next.md`:103.
