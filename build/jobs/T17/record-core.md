# record-core (T17)

**Status** · session_015Z2ibFGipKFWMV5BopFcPH · depth 2 · WORKING · handled B1

## J1 · QUESTION

N376 against R62's text. R62 says `prefix` is "the gated prefix asked (R3's set)" and `detail` names "a project, case, draft, grant or task id"; its caller list is promotion R19, case-authoring R7, review R27, tasks R1. `SRC` is not in R3's gated set (`allocIdOp` does not refuse it), and sources (`src/sources/index.mjs`:159, :181) is not among the named callers. So N376 widens a service I provide, and step 5 says BOB words the requirement first.

My best reading, which I am building now: R62 answers for "a prefix whose ids are minted opaque by `mintOpaqueId`: R3's set, and `SRC`", `detail` naming "a project, case, draft, grant, task or source id", and sources joins the callers (sources' R that mints). `prefix` echoes `SRC`. `SRC` stays out of R3's gated set: gating `allocIdOp` for it is not N376's ask (a caller stepping the `SRC-<year>` counter learns nothing, since sources never read `seq`). No catalogue row or translation changes: C-59.6's `check`, `where` and `translation` are untouched; only `detail` for `SRC` changes (from "a free id" to "a free source id"). So nothing is `awaiting stamp`.

Please word R62 accordingly (or tell me otherwise).
