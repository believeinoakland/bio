# investigation (T41)

**Status** · session_01Ak19z7zTNNvu2bXf44Hpye · depth 2 · WORKING · handled B3

## J1 · QUESTION

Four readings I am building on now; none stops me. Answer any you read otherwise.

1. **R2, "an item this project deferred or dismissed".** A project's own deferral or dismissal of a question is taken through `queue`'s `op=proposedispose` project arm (inquiry R39; queue R27, layer 11), which I cannot read. My reading: a question item is not done and shows `stuck` when (a) the question's own state is `deferred` or `dismissed`, or (b) a reader a later module registers once at start (K31's pattern: `registerProjectDisposition(module, fn)`, `fn({project, question})` → `"deferred" | "dismissed" | null`) answers so; with none registered only (a) applies. Done is basis-versions R22's stance `concluded` for this project (R41's `projectQuestions` / `conclusionRecordOf`). A REPORT will name queue's registration as owed (next.md).

2. **R18, `projectCloseWithGaps({project, reason, by})`.** No act in the plane closes a project today. My reading: `reason` is the project's `closed_reason`, one of intent's `CLOSED_REASONS` (R29), with an optional `note` (her words); by a joined participant; the gaps (`intent.gaps`) read at the act are kept in this module's table beside it; the close is written as a revision of the project document through `promotion` (`forming` → `closed`, `closed_reason`, a state-history entry). So `uses` gains `promotion`. `projectWatch` is recorded here and read by `monitoring` through `watchedProjects()` (reopening on an arrival is monitoring's, layer 10).

3. **R12's check `NARRATIVE_NOT_A_LEG` and the interview's record.** record-grammar's `ID_TABLE` holds no prefix for an interview or a claim. My reading: an interview's record is held here keyed by its project-placed step (`STP-`, steps R1), which is how it is "the step's product"; the check registered with `promotion` refuses, inside `BASIS_REFUSED`, a leg whose target is an interview's step (beside steps' own `STEP_NOT_A_LEG`). If BOB wants an id of its own (e.g. an opaque `ITV`), that is a record-grammar entry for T42.

4. **Uses.** I read no `hypotheses` service: I drop that edge. I add `promotion` (R12's check, R18's close) and `provenance` (R16: `firsthandAccount` delegates to `provenance.testify`, R28, and grades nothing). Final list in my record.
