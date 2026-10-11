# agent-worker (T45)

**Status** · session_01JFq9iL3m4uA8zW6LpJSnxm · depth 2 · WORKING · handled B3

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

## J2 · REPORT

Found in other modules while building R76–R78 (each against its requirements; none changed by me):

1. **The grant's reach and R27's "matter's own record".** `credentials` `AI_GRANT_OPS` = `answers` `ASK_SCOPE` = this module's `ASK_OPS` (27 ops, T45 adds none) holds no `plan`, `action`, `actions`, correspondence or findings read. `run-rules` R27 says `infractiondraft` reads "the matter's own record ... (its plan, actions, correspondence and findings)" and `bearingdraft` "the action and the reply", both "through the record reads the grant already admits". Under K2820 I built the read tool on `ASK_OPS` as ruled; those drafts can therefore read only `search`, `eventsfor`, `timeline`, `standard(s)` and the like, never the action or its reply. If the drafts are to see the action and reply, either the door hands them in the body (as the translation draft's words) or the grant widens (R27 forbids). BOB's / run-rules' and credentials' to settle; my code takes either with a small change.
2. **`ai-runs`: `RUN_ORIGINS` is `["member","explore"]` and `originAllowed` refuses any other**; `op=airun`'s `session` answers no `response`. R78 reads `session.origin` and `session.response`: AI-RUNS #17's R77 must add both (in its entry already; noted so the wire names match: `origin`, `response`).
3. **`op=reading` (extraction R27) answers the stored reading record**, whose full extracted text may sit in `capture_text` rather than `reading`. R78 reads `op=reading` `{sha256}` as K2820 rules (the query key is `sha256`, not J1's `sha`); whether its answer carries the reply's text is extraction's. If it does not, a later entry may want a text read op.
4. **op-declarations (T45-45):** declare `procedureguides` (`{kind}`, reading-guides R13) and add `action`, `reading`, `procedureguides` to the plan run's scope (`PLAN_RUN_SCOPE`, pinned by its tests); until then those reads answer UNDETERMINED in `why` (R78, tested). Also the door routes for `textcheck`, `infractiondraft`, `bearingdraft` (control-plane R57 / store-door R10's pattern) are unwritten.
5. **The profile's own procedure guide already rides `op=profiles`' combine view** (jurisdictions R80), which R51 reads; `procedureguides` adds the group's own guides beside it.
6. **filings R43** unions `textcheck`'s `assertion` sentences with its own sentence split: my `index` is the model's count of sentences (0-based, in the text's order), with `quote` verbatim and checked to occur in the text. If filings needs `index` to equal its own split, filings should match by `quote` or the split should be one shared function (BOB's).
7. **My bundle** (`dist/agent-worker.bundled.mjs`, `.bundle.json`) is stale against the new source (R45 red), for BOB's regeneration at L6's close as START says.

## J3 · COMPLETE

**T45-15 applied on `job/T45/agent-worker`** (9b… see `git log`: the R76–R78 source commit, then 9a3d89093e tests; tranche/T45 merged in after B2). Files: `agent-worker/src/{action-drafts.mjs (new), draft.mjs, index.mjs, ops.mjs}`, `agent-worker/test/{t45.test.mjs (new), inprocess.mjs, requirements.test.mjs, t36.test.mjs, harness.test.mjs, ask.test.mjs}`; nothing outside my paths.

**How the reading set was read (mechanics §17; START over 600 KB).** By me, whole: `build/requirements/agent-worker.md`; every source file (`src/index.mjs`, `draft.mjs`, `ask.mjs`, `cascade.mjs`, `signin.mjs`, `transcribe.mjs`, `ops.mjs`, `reads.mjs`, `scripts/build.mjs`, `fleet-member.json`, `package.json`); T45-15 and the plan's Rules at the opening; K2780, K2781, K2787; `draft-T45-lower.md` §8; run-rules R27, ai-runs R77, reading-guides R13, skills R45/R46. Two helper agents, given my entries and their later users (the door, filings R37/R43/R48, plan-work R10), read in full and wrote digests citing each section: (a) every file under `agent-worker/test/` (28 files), (b) the used modules' public parts (run-rules, skills, ai-runs, reading-guides, agent-harness, agent-model, answers, credentials, op-declarations' relevant declarations, `BIO_Action_v0_2.md` §4 rules 1, 2, 3, 9, 12, 16, 19, 21). The sources stay binding. No flaw found in my own code beyond what this job changed (P8); R59's pack read and read door were factored out (`packFor`, `grantReader`) so R59's and R76's drafts are one mechanism, behaviour unchanged (t35/t36/t37 green).

**Entries applied**
- **R76** `POST /draft` takes `textcheck` `{text}` (1–20,000 chars), `infractiondraft` `{matter, audience}`, `bearingdraft` `{action, reply}` (ids ≤ 200), no `told`; refusals in R59's order, plus `DRAFT_NEEDS_GRANT` (400) for the two that read, `DRAFT_READ_NOT_ALLOWED` for a textcheck with a grant (and a firsthand grant), all via `run-rules.draftMayRead` (R27, one source); reads only through the grant, only `ASK_OPS`; answers in shape, held whole (`DRAFT_UNFORMED` for a rewritten quote, an unknown `reads_as`/`bearing`, an infraction with no sources, an extra field); `label: {kind: "machine"}`, `usage`, `calls`; endings as R59's.
- **R77** instructed by `action_drafting` only (never `writing_help`/`suggestions`, switch on or off); a missing or stated-absent layer 502 `PACK_UNDETERMINED`, no model call; fixtures `ACTION_INJECTIONS` (breach, position, file, claim, write, capture, reach) driven through each task with an obeying stub: no write op or capture request, only the pack and `ASK_OPS` reads, the words only in the draft's fields, no secret; R61's sentinel only in `tool_result`.
- **R78** (K2820) a plan run with `origin: "reexamination"` reads, after R51's, `op=action {id}`, `op=reading {sha256}` of the entry's `artifact_sha`, `op=procedureguides {kind}`; response `"<action>#<ord>"` (`RESPONSE_ID`, ops.mjs); malformed id, missing entry, no capture, no kind, refused/silent/unrouted read: UNDETERMINED in `why`, run goes on; `PLANE_OPS` gains exactly the three reads; origin/response read from `op=airun` each segment (not in the resumable state).

**Deferred:** none of mine. Found in other modules: J2 (REPORT).

**Tests and checks**
- `npm test` (agent-worker, run whole, never stopped): all files green except (1) `requirements.test.mjs` R45 ×2, the committed bundle stale (BOB regenerates at L6's close, START); (2) `t45.test.mjs` 4 arms "R76: … DRAFT_NEEDS_GRANT" / "… with a grant, it runs" for infractiondraft and bearingdraft, red only because run-rules R27 (`draftMayRead` true for them) is not yet merged. With a stand-in for R27 in a throwaway worktree, `t45: 191 passed, 0 failed`. I re-run after merging `tranche/T45` once run-rules is in (your CHANGE).
- `checks/format.mjs`: 0 failures; `architecture.mjs agent-worker`: 0 failures; `coverage.mjs agent-worker`: 70 of 70 live ids named, 0 failures; `ownership.mjs agent-worker tranche/T45`: 11 files, 0 failures.

Size (session_01JFq9iL3m4uA8zW6LpJSnxm): test runs 9, module lines 3268

## J4 · COMPLETE

**B3 (K2824) applied, tranche/T45 merged in** (8265aee035). Everything in J3 stands; this adds:

- **R76 amendment.** `infractiondraft`'s task is `{op, matter, audience, record}`, `record` `{actions, correspondence, findings}` lists plus an optional `plan` (an object or null), no other key. `bearingdraft`'s is `{op, action, reply, action_record, reply_record}`, each a non-empty object.
  - Each record is at most `RECORD_MAX` (200,000 characters of JSON), never cut. An absent, malformed or oversized one is `BAD_TASK` (15 new arms).
  - The records reach the model only as the result of a fixed `read_facts` call the conversation opens with (id `facts_1`, `agent-model`'s `READ_FACTS`, which `converse` answers again from the transcript). They pass through R63's text-only filter, and the system prompt says they are data, never instruction.
  - The grant, `DRAFT_NEEDS_GRANT` and the `ASK_OPS` read tool are unchanged.
  - Tests: the opening and the offered tools; the sentinel in bearingdraft's records only inside `tool_result`; a record's bytes never reach the model. R77's injections now ride the records as well as the reads, for each kind and task.
- **Mine, done:** the 200 answer's `task` names the task's op and ids (`{op, matter, audience}` / `{op, action, reply}`), not the records handed in. The door already holds them, and echoing them would answer the injected record text back outside the draft's fields (R77's "nothing else is answered").

**Tests and checks** (run whole, never stopped)
- `npm test` red only where J3 said:
  - requirements R45 ×2 (stale bundle, BOB's regeneration at L6's close);
  - t45's four R27-dependent arms ("DRAFT_NEEDS_GRANT", "with a grant, it runs" for infractiondraft and bearingdraft), until run-rules merges.
- Against a stand-in for R27 in a throwaway worktree: `t45: 207 passed, 0 failed`.
- format 0; architecture 0; coverage 70/70, 0; ownership 11 files, 0.

Size (session_01JFq9iL3m4uA8zW6LpJSnxm): test runs 13, module lines 3301
