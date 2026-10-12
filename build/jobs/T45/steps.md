# steps (T45)

**Status** · session_0161B3XdiXB5jvDtBdU7GjzU · depth 2 · COMPLETE · handled B0

## J1 · COMPLETE

**T45-9 applied on `job/T45/steps`** (b666e13ea1). Files: `bio-plane/src/steps/index.mjs`, `bio-plane/test/m/steps/due-holder.test.mjs` (new), `bio-plane/test/m/steps/create.test.mjs` (R4's key list gains `by_when_held`). Nothing outside my paths. `tranche/T45`'s commits since my branch (plan Jobs lines, K2819 stewards) touch no file I read, so no merge.

**Read whole by me (P20; K2730):**
- `build/requirements/steps.md`;
- all three files of `src/steps/` and all ten files of `test/m/steps/`;
- T45-9 and the plan's Rules at the opening (rule 4);
- K2780, K2781, K2787;
- `BIO_Action_v0_2.md` rule 6;
- `draft-T45-lower.md` §5;
- layer 6's contract;
- the Public parts of all 15 modules in my Uses, read in this session, not by a helper.

**Entries applied**
- **R29** `registerDueHolder(module, fn)`.
  - It registers one holder through `membership.listenerRefusal`. A malformed registration is `LISTENER_MALFORMED`. A second, by any module, is `LISTENER_DECLARED` naming the holder.
  - `fn` is asked `{step, byWhen, waits}` only for a step with a date. `byWhen` is the date as set; `waits` are the step's live waits as `{wait, on}`, R11's `on` shapes.
  - A held step draws no `past_date` item from `stepsDue`, so `notice-producers` makes no `step-date-due` for it.
  - Every R4 read (`step`, `stepsOn`, `stepsIn`, `stepsOfGroup`) answers `by_when_held: {module, entry}` beside `byWhen`, and null when not held.
  - A holder that throws, or answers anything but `{entry}` with a non-empty string or object entry, reads as not held. That includes a promise, a bare string, `{}`, `{entry: null}` and an array.
  - The control: with no holder, R12 answers as before, key for key.
- **R30** `stepsWaitingOn({kind, id})`, in process.
  - It answers the steps with a live (not removed) arrival wait on `{kind, id}`. Ids are trimmed as `stepWait` stores them. A step with two such waits is answered once.
  - Each answer is `{step, byWhen, state}`. `byWhen` is as stored, else null. `state` is as R4 reads it, `waiting` included.
  - It answers at most 200 (`WAITING_ON_MAX`) by step id, with `truncated`.
  - It takes no viewer and writes nothing. A missing or malformed `kind` or `id` answers no steps, and it never throws. Steps exports no ops map, so no route reaches it.

**Mine, done (told as done):** a member's own `stepReminder` on a held step still fires. BOB's START says a held step draws no `step-date-due`, and v0.2 rule 6 says a reminder fires as asked. Only the step's own date item gives way to the clock entry.

**Deferred:**
- `stepsDue` reads at most 1,000 dated steps and 1,000 reminders per member and says nothing when it is cut. R12 states no bound, so adding one (or `truncated`) is BOB's wording. Realistic loads are far below it.

**Found in other modules / owed (REPORT):**
- `action-clocks` (L9, its R16) registers the holder and reads R30. The `entry` it answers is passed to every viewer of the step exactly as given. R16 should hold the entry to what any viewer of the step may see, or name nothing private.
- `steps.md` Private Uses names `inquiry` (not in `modules.json`, and not imported) and omits `jurisdictions`, `calc-grammar` and `connection-grammar` (in `modules.json`, and imported). This is text only; the architecture check passes.
- The plane bundle is staled by this merge (rule 4 (5)).

**Tests and checks** (on b666e13ea1)
- steps: 44 pass, 0 fail (`node --test bio-plane/test/m/steps/`); the 6 new tests name R29 and R30.
- The users of steps (investigation 32, question-explorer 28, capture-requests 108, ai-runs 81, run-productions 58, notice-producers 97, wizard-scripts 76: all pass).
- control-plane: 222 pass, 1 fail. The fail is R53, duties' `dutiesarising` and `dutyfromresponse`, accepted red rule 4 (12).
- plane: 194 pass, 2 fail. These are rule 4 (9) and (11), accepted.
- `format`: 0 failures. `architecture steps`: 0 failures. `coverage steps`: 29 of 29 live ids named, 0 failures. `ownership steps tranche/T45`: 4 files, 0 failures.

Size (session_0161B3XdiXB5jvDtBdU7GjzU): test runs 6, module lines 1703
