# answers (T35)

**Status** · session_01ERuzqxPno5Bn9K7NpdTfH5 · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Two readings in R28, carrying on with both; neither stops the build.
(1) R21 says a standing question reads only ASK_SCOPE's reads; R28 says each standing find's run calls `retrieval.findIn` (`findin`), which is not in ASK_SCOPE or credentials' AI_GRANT_OPS. Best reading: R28 is the later, specific rule for a standing find: its run reads `findIn` under its author's sight with no grant and no model, which R21's purpose (no capture request, no fetch, no outside read, no AI run) still holds; ASK_SCOPE is not widened (that would move credentials' copy and the agent's reach). R21's test will name `findIn` as the one read a find's run makes.
(2) A `{selection}` scope expires with the selection (retrieval R18–R19, 5 minutes), so a standing find over one would fail every later run. Best reading: at set time a selection scope is kept as given (findIn validates it); later runs that findIn refuses record that the run could not read its scope (`held_back: {condition: "query_refused", reason}`, as a saved query's refusal is recorded today). If BOB prefers, a selection is frozen at set time into `{ids}` (refused SCOPE_TOO_LARGE over 200): say so and I switch.
Also, the job's choices (recorded, not asked): `STANDING_NEEDS_SEARCH` is C-135.13; a match's key is its kind, capture, extent and as-read words (two amounts in one paragraph share an extent), kept as SHA-256 keys, at most 10,000; a run reads the scope page by page (200 captures each) up to 10,000 captures, each kind at findIn's most (500).

## J2 · REPORT

Found in other modules (no change made to them):
1. retrieval: freezing a selection (K1982) needs its current members, and the only public read of them is `selectionResolve` (R19), which also extends the selection's life (writes `selections.touched`/`expires`). So a standing find refused `SCOPE_TOO_LARGE` after that read has moved those two columns of retrieval's table, against R28's "each refusal writing nothing" in letter (no row is added or removed; the selection lives 5 minutes longer). A read-only members read in retrieval (its private `#selectionMembers`, which findIn already uses without extending) would close it; for T36 or BOB's call.
2. agent-worker: `agent-worker/test/requirements.test.mjs` fails (8 pass, 1 fail) on the tranche branch after run-rules' merge (556d4cef62), with or without this job's change; it passed (9/0) before that merge. Within the inherited agent-worker reds (11, 18), I believe; not answers'.

## J3 · COMPLETE

T35-47 complete (commits on job/T35/answers; tranche/T35 merged at B2/B3, run-rules' merge included).
Entries applied:
- (N686) R1: `draftAdmits`, the draft mode's whole reach, is `askAdmits` itself (`scope.mjs`), exported; a draft's reads go through `logRead` under its grant with R2's removals and write no R13 count (nothing else changes: `logRead` is grant-keyed, so a draft grant reads as an ask's; `checkAnswer` and `countAsk` are not reached for a draft).
- (N698) R28: `standingQuestionSet` takes `find: {scope, kinds, term?}` in place of `query` (and `owner`, the control plane's stamp, through the `standingset` op). `STANDING_NEEDS_SEARCH` (C-135.13, new row, awaiting stamp) for both or neither; findIn's own refusals as given; a selection frozen at set time into the bundle ids it holds, `SCOPE_TOO_LARGE` over 200 (K1982). Each run calls `findIn` under the author's sight page by page (up to 10,000 captures), keys each match (kind, capture, extent, as-read words; SHA-256, 32 hex, at most 10,000 kept), and a match is new when its key was not the previous run's; a first run finds nothing new. No model, no account, no AI half: `held_back` null. The entry: `finds {matches ≤ 500, truncated, more, origin: "search", partial?}`, `answer` null, label "found by search, from your standing question", `origin: "search"`. Nothing else is written. New column `standing_questions.find_json` (added by `migrateAnswers` where absent).
- R29 (DEC-149 sweep, 5 rows): checks.mjs:26 (C-135.6), :30 (C-135.8), index.mjs:202, rules.mjs:60, :83 now say "your group's Civicsmith", word for word as the sweep table. C-135.6, C-135.8 and the new C-135.13 await promotion's stamp (row census, red 2).
Decisions (the job's, per B2): R21 is held for a find by `findIn` being its one record read (BOB's (1)); a find's keys and bounds as in J1. The held-back value `switch: "copy"` (R19) is a code, not a word, and stays.
Deferred: none. Other modules: see J2 (retrieval's touching selection read; agent-worker's requirements test red after run-rules' merge).
Tests: `node --test bio-plane/test/m/answers/` 43 pass, 0 fail (new: `standingfind.test.mjs` R28 ×5, R21, R1; `words.test.mjs` R29 ×2). Users of answers, same counts with and without this change: scheduler 95/0, notice-producers 45/0, affordances 201/2, op-declarations 81/3, control-plane 179/3, plane 109/6, agent-worker 8/1, migrate-released 1/0 (all inherited reds). Row census: red 2, inherited, with C-135.6, .8, .13 among the rows awaiting stamp.
Checks: format 0 failures; architecture 0 failures; coverage 29 of 29 live ids named, 0 failures; ownership 10 files, 0 failures.
Size (session_01ERuzqxPno5Bn9K7NpdTfH5): test runs 16, module lines 1551
