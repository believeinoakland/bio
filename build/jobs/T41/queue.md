# queue (T41)

**Status** · session_01K4gx81sfhF2PvktYCx31f6 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three readings, built on now; each is a one-line change if you rule otherwise.

1. **Investigation's reader (B1, K2523) and a question's set-aside (R27).** R27 names no form for `finding` when a project sets a QUESTION aside (inquiry R39 sends the member to this arm). My reading: `finding` is the question's own bundle id (`{project, finding: <question id>, to: deferred|dismissed, reason}`), and the reader I register with `investigation.registerProjectDisposition("queue", fn)` answers the state of the row `(project, question)`, null when none. Registered in `queueOf` beside the scheduler consumer (skipped with `start: false` unless `deps.investigation` is given). My `uses` gain `investigation` (layer 7, earlier).
2. **`step-reminder` and `milestone-reminder` (R1 OBLIGATIONs, `notice-producers` R17).** R52 gives them no door, and R12's "`taskresolve` otherwise" names a task door neither has (no task row). My reading, as `action-reminder`'s `reminderanswer`: `instead: stepreminder` and `instead: milestonereminder` (op-declarations R43's ops: answer with another reminder, or none), the detail saying it leaves at the end of its day (steps R12, investigation R3: told once, on that day).
3. **`project-quiet`'s acts (R52: `projectwatch, projectclose, setcondition`).** Only `projectwatch` is an op; op-declarations R43 and intent name the others `projectclosewithgaps` (investigation R18) and `objectivecondition` (intent R2). My reading: publish the ops a member can send, `[projectwatch, projectclosewithgaps, objectivecondition]`, so no item names a door that does not exist (R18's rule for acts); R52's words read as descriptions.
