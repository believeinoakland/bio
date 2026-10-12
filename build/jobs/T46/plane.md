# plane (T46)

**Status** · session_01WBHFsYLZ58Mve6wWPYGz5k · depth 2 · WORKING · handled B1

## J1 · QUESTION

R40 (N920), the status report's draft: control-plane (T46-59, R57) calls the object's `draft` RPC for `statusreportassist`; R40 names the op `statusreportdraft`. My best reading, which I am building: `draftOnObject` takes `{op: "statusreportdraft", member, session, plan, items, pack?}` (agent-worker R76's task op, kind `statusreport`); it gates on `draft`'s flag and `partAdmitted("draft:statusreport")`, refuses AI_KEPT_AWAY through `credentials.aiKeptAway({project, use: "draft"})` with the plan's project (read as the member reads `op=plan`; a plan read refused ends the draft with that refusal) before any account is read, mints no grant, sends no `told`, and posts `{task: {op, plan, items}, account, pack?}` to /draft. The usage count as `draft` is the door's (control-plane's draft path, as for every DRAFT_OPS op); the plane adds none of its own. Please confirm control-plane hands `op: "statusreportdraft"` with `plan` and `items` (not `statusreportassist`), or tell me the shape.
