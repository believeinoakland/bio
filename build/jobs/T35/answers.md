# answers (T35)

**Status** · session_01ERuzqxPno5Bn9K7NpdTfH5 · depth 2 · WORKING · handled B3

## J1 · QUESTION

Two readings in R28, carrying on with both; neither stops the build.
(1) R21 says a standing question reads only ASK_SCOPE's reads; R28 says each standing find's run calls `retrieval.findIn` (`findin`), which is not in ASK_SCOPE or credentials' AI_GRANT_OPS. Best reading: R28 is the later, specific rule for a standing find: its run reads `findIn` under its author's sight with no grant and no model, which R21's purpose (no capture request, no fetch, no outside read, no AI run) still holds; ASK_SCOPE is not widened (that would move credentials' copy and the agent's reach). R21's test will name `findIn` as the one read a find's run makes.
(2) A `{selection}` scope expires with the selection (retrieval R18–R19, 5 minutes), so a standing find over one would fail every later run. Best reading: at set time a selection scope is kept as given (findIn validates it); later runs that findIn refuses record that the run could not read its scope (`held_back: {condition: "query_refused", reason}`, as a saved query's refusal is recorded today). If BOB prefers, a selection is frozen at set time into `{ids}` (refused SCOPE_TOO_LARGE over 200): say so and I switch.
Also, the job's choices (recorded, not asked): `STANDING_NEEDS_SEARCH` is C-135.13; a match's key is its kind, capture, extent and as-read words (two amounts in one paragraph share an extent), kept as SHA-256 keys, at most 10,000; a run reads the scope page by page (200 captures each) up to 10,000 captures, each kind at findIn's most (500).

## J2 · REPORT

Found in other modules (no change made to them):
1. retrieval: freezing a selection (K1982) needs its current members, and the only public read of them is `selectionResolve` (R19), which also extends the selection's life (writes `selections.touched`/`expires`). So a standing find refused `SCOPE_TOO_LARGE` after that read has moved those two columns of retrieval's table, against R28's "each refusal writing nothing" in letter (no row is added or removed; the selection lives 5 minutes longer). A read-only members read in retrieval (its private `#selectionMembers`, which findIn already uses without extending) would close it; for T36 or BOB's call.
2. agent-worker: `agent-worker/test/requirements.test.mjs` fails (8 pass, 1 fail) on the tranche branch after run-rules' merge (556d4cef62), with or without this job's change; it passed (9/0) before that merge. Within the inherited agent-worker reds (11, 18), I believe; not answers'.
