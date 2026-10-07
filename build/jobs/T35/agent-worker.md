# agent-worker (T35)

**Status** · session_015n9TPjBe1pYaYabW7hyVhC · depth 2 · WORKING · handled B4

## J1 · QUESTION

Three points where `POST /draft` (R59) and R61 meet another module's share. I carry on with my best reading of each; none stops the rest of the job.

1. **The pack for a draft that sends no grant.** R59 has the draft read the pack "as R48 reads it" (`op=affordances`, untargeted), but a grant arrives only when the draft may read (switch on, field not firsthand). Without a grant this member has no credential to call `op=affordances` with: control-plane's `grantAdmit` admits `affordances` only under a live grant, and op-declarations gives it no anonymous class. So a switch-off or firsthand draft (the default case) could never be instructed. **My best reading, which I build:** with a grant, `op=affordances` under it (R48, R60); with none, the body carries `pack`, the rendered pack the door holds (control-plane R41), held to R48's whole-pack test; neither gives 502 `PACK_UNDETERMINED` and no model call. That adds `pack` to R59's body and to control-plane T35-72's share (the door sends it). The other reading (the door always mints a grant, its reach only the pack read) would contradict R59's `DRAFT_READ_NOT_ALLOWED`.

2. **`MODEL_FOR_MODE` has no `draft` entry** (agent-model R1; its Suggestions name it, but T35-48's entry is F5 only). `converse({mode: "draft"})` answers `refused` `MODE_UNKNOWN`, so every draft would end `MODEL_REFUSED`. **Best reading:** agent-model's job adds `draft` (provisional, today's default, until M-Q9) as R1's reviewed edit; a CHANGE to AGENT-MODEL #3. My tests stub the model and do not depend on it.

3. **Who builds a judged row's facts opening (R61; agent-model R12).** R12 takes the facts out of `rowPrompt` and has them "arrive as the result of a tool call the conversation makes or is opened with"; this member builds the parent's `messages`. **Best reading:** this member opens each judged row with the row's prompt (step and row only), an assistant `tool_use` of a fixed `read_facts` tool and the user's `tool_result` holding `rowFacts`, with `read_facts` declared in the row's tools; if agent-model exports its own opener or tool for this, I adopt it when I merge the tranche branch after its merge.

Also noted, no answer needed unless you differ: `/draft` does not gate on `run-rules`' `DEPLOYED_MODES.draft` (R59 names no such refusal; the door routes it), and it reports no `askusage` (R59: the door counts the `usage` it answers).

## Completion

**Read in full (step 2).** My requirements (both parts, as amended at K1983); the public parts of `agent-model`, `agent-harness`, `run-rules`, `skills`, `answers`, `capture-requests` (R49, R50) and the uses' T35 shares; plan T35's Rules at the opening, BOB's review, the L6 entries and the shares for later STARTs; the sweep rows for this module; my source files (`index.mjs`, `ask.mjs`, `cascade.mjs`, `ops.mjs`, the two re-export files) and the tests and controls I changed.

**Entries applied (T35-50), with B2's answer (K1983) and B3/B4's merges:**
- **R59, `POST /draft`** (`src/draft.mjs`): `{task, told, account, grant?, pack?, firsthand?}`; refusals before any model call in R59's order (`PLANE_NOT_CONFIGURED`, `BAD_BODY`, `BAD_TASK`, `BAD_TOLD`, `NO_ACCOUNT`, `BAD_ACCOUNT`, `DRAFT_READ_NOT_ALLOWED`); the pack by `op=affordances` under the grant, else the body's `pack`, held to R48's whole-pack test and to having a `writing_help` layer, else 502 `PACK_UNDETERMINED`; one `converse` in mode `draft` within `ASK_BOUNDS`; the read tool (only `ASK_OPS`, refusals returned as its result) offered only with a grant; the suggestions layer only with the switch on; answers `{ok, task, draft, label: {kind: "machine"}, usage, calls}`, or `{ok: false, code, detail, ending, usage, calls}` (`DRAFT_BOUND_REACHED`, `MODEL_SILENT`, `MODEL_REFUSED`, `DRAFT_UNFORMED`). No write, capture request, run row or `askusage`; nothing kept. `SURFACE` and the 404 text gain `draft`; R58's sentence names drafts.
- **R60:** `askPlane` sends `Authorization: Bearer <credential>`; no `&token=`, no fallback; a call with no credential sends no header. Every test mock now reads the header.
- **R61:** judged rows open with `agent-model`'s `openRow` (facts as `read_facts`' result) and sub-sessions with `subsessionOpening` (B4); the ask's and draft's system prompts carry only the pack and this module's words, the member's words in user turns.
- **R62:** `test/t35.test.mjs` `INJECTIONS`, one document per kind (write, capture, reach, control, reveal), each driven through a mode-`check` run, a mode-`plan` run (deployed in-process only), an ask and a draft with a stub model that obeys it.
- **R63** (`src/reads.mjs`): every read result a model is handed (an ask's and a draft's reads, a sub-session's `meaningrows`, a judged row's facts) passes `textOnly`: base64, data URLs, byte arrays and binary strings dropped, never decoded; `active` and text kept; the drop named in the run's trace and told in the tool's result.
- **R64:** the nine rows: `ask.mjs`' seven with the sweep's texts; `cascade.mjs`:73 and :75 worded under the M rule ("…only while your group's Civicsmith holds it and it is on"; "…is your group's Civicsmith's to answer…").
- **R65:** `src/harness.mjs`, `src/subsession.mjs` and `test/fanout.control.mjs` deleted; the stale arms that patched the two files removed from `harness.control.mjs` (14), `wire-vocabulary.control.mjs` (2) and `versions.control.mjs` (2); `agent-worker.control.mjs`' five arms on `NAMESPACES`/`MEANING_ARM` re-pointed to `src/ops.mjs`, where they live (they had armed nothing since T33-57; N2, D1, D5 run: AS DECLARED).
- Tests re-pointed for agent-model R12 (B4): the sub-session arms in `requirements.test.mjs` and the model stubs in `ask.test.mjs`, `requirements.test.mjs`, `inprocess.mjs` skip the facts opener.

**My additions, for BOB's ruling list:** `BAD_GRANT` (400; a `grant` present, allowed, but not a non-empty string), `DRAFT_UNFORMED` (the model's draft tool input not of the task's shape), and the endings' statuses (409 for a bound, 502 otherwise) with `ending` and `usage`/`calls` beside them so the door can count a spent ending. R63's "named in the trace": an ask and a draft have no trace, so the drop is told in the tool's result.

**Deferred.** None of the entry. The relay of a member's sign-in is N708 (not here).

**Found in other modules / generated artifacts (REPORT with COMPLETE).** My committed bundle `agent-worker/dist/` is stale (red 30, BOB regenerates at L6's close; R45's three arms red until then: the third names `src/draft.mjs`, `src/reads.mjs`). `bio-plane/test/d260-resume.test.mjs` and `fence-e2e.test.mjs` (red 18) are not in the tree (`find` finds neither); red 18 may be moot.

**Waiting on merges (B1):** ai-runs (T35-44), capture-requests (T35-45), skills (T35-46), answers (T35-47), agent-runner (T35-49) are not yet merged; I merge the tranche branch when BOB says. R55's equality and R62's capture-refusal arm are the ones their merges can move.

**Tests and checks** (on the merge of `tranche/T35` with run-rules and agent-model):
- agent-worker 140/0; ask 57/0; cascade 56/0; fanout 184/0; harness 261/0; plan 55/0; requirements 290/3 (R45 ×3, red 30); t35 206/0; versions 20/0; wire-vocabulary 83/0.
- Users: control-plane `members-pin` 3/0, `r53-routes` 7/1 (:60, red 29); skills `doctrine` 11/0; run-rules `deployment` 2/0; plane `worker` 5/0, `ask` 2/6 (red 22); `system/fleetbundles` STALE agent-worker (mine, red 30), agent-runner, bio-plane.
- Controls: `agent-worker.control.mjs` N2, D1, D5: 3 run, 3 as declared.
- format: 130 modules, 129 requirements files; 0 failures. architecture: 34 product files, 120 relative imports; 0 failures. coverage: 57 of 57 live ids named; 0 failures. ownership: 25 files changed by agent-worker; 0 failures.

Size (session_015n9TPjBe1pYaYabW7hyVhC): test runs 27, module lines 2477
