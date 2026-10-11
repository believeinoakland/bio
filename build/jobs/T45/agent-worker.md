# agent-worker (T45)

**Status** · session_01JFq9iL3m4uA8zW6LpJSnxm · depth 2 · WORKING · handled B1

## J1 · QUESTION

R78's reads name ops and a response id no requirement fixes yet. My best reading, which I am building on now (each name one constant, so an answer is a one-line change):

1. **The response id.** ai-runs R77 stores `response` opaque; plan-work R10 (L9, later) writes it from actions R95's `{action, ord}`. I read it as `"<action id>#<ord>"` (the action bundle id, `#`, the entry's position in its `correspondence[]`, a non-negative integer). A response not of that form: the reads are UNDETERMINED and carried into `why` (R51's rule), never a refusal of the run.
2. **The correspondence entry**: `op=action` (`{id: <action>}`, declared today, actions' read), the entry at `ord` taken from its `correspondence[]`, and the action's `action_kind` from the same answer.
3. **The capture's extracted text**: `op=reading` (`{sha: <the entry's captured reply>}`, FW-5's "a captured document's reading", declared today); R63's text-only filter applies.
4. **The procedure guide for the kind**: no op serves `reading-guides.procedureGuidesFor` (R13) yet. I name it `op=procedureguides` (`{kind}`), for op-declarations (T45-45) to declare as an `ownread` in reading-guides' family. Until it is routed the read answers a refusal, carried UNDETERMINED (R51), so nothing breaks.
5. **PLANE_OPS (R37) gains exactly `action`, `reading`, `procedureguides`.**

Also for R76, readings I am building on (tell me if any is wrong):
- `textcheck`'s `text` is 1 to 20,000 characters (a prepared outward text, a letter, is longer than `told`'s 4,000); `matter`, `action`, `reply` are ids, non-empty strings of at most 200 characters.
- R76's three tasks take no `told` (as the translation draft takes none); `told` is not read for them.
- The read tool for `infractiondraft`/`bearingdraft` is R59's: `ASK_OPS` (= `AI_GRANT_OPS`, no op added, run-rules R27); the narrowing to the matter's own record is the plane's (the grant and the door's read-log check), not judged here (R37).
- Each answer is held to its shape whole: a `textcheck` entry whose `quote` is not verbatim in `text` (a rewrite), an unknown `reads_as`/`bearing`, makes the answer `DRAFT_UNFORMED` (nothing returned), never partly answered.
