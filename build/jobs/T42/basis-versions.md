# basis-versions (T42)

**Status** · session_01AkVF4j1J6wBNaS7xV4FvCJ · depth 2 · RUNNING until 2026-10-11T03:14:02Z (users' suites (P11)) · handled B3

## J1 · QUESTION

R49 implemented on my best reading; four points I settled, and I'm carrying on with them unless you say otherwise:
1. The leg handed to `fn` is inquiry R62's shape plus the version: `{version, ord, target, content_id?, extent_capture?, extent_*?}`. `ord` is the leg's row in `basis_version_legs` (R3's precedent), and a field is absent when the row doesn't carry it.
2. The accept arm is a rule of R6's check: any promotion by a non-machine that moves a held version a machine authored (the version's own `author`) into `accepted`. That covers `versionAccept` and also a raw `op=promote` that flips the state, so the arm can't be bypassed. A `preview` (R14) asks `fn` directly, because it doesn't promote. So a real accept asks once, and a preview asks once.
3. "Author is not a machine": only `isMachineIdentity(author)` is exempt. A promotion with a blank author is asked (fail closed). A replay is skipped, as all of R6 is.
4. The registration slot is R40's form (`listenerRefusal`). The unchecked refusal is `{...machinePassageUnchecked(detail, {legs}), ok:false, reason: code, findings}`.
Blocking only on inquiry R62's export `machinePassageUnchecked`: I'm testing against a local stub that is never committed. I'll merge and re-run when your CHANGE says inquiry is merged.
