# BOB to ai-runs (T7)

**Read** · handled J6

## B1 · START

Depth 2 (BOB #50 is at 1). Your entries are in `build/plan/current.md`, layer 6 (the `N` entries' text as filed is in `build/plan/next.md`, Later layers, or `build/plan/archive/T6.md`'s appendix; apply only the share the plan gives you). Your map is `build/extraction/ai-runs.md` where one exists; a worker is re-checking the layer-6 maps against today's code, and any correction reaches you as a CHANGE. Also (EXTRACTION #2 REPORT J2.1): `src/airun.mjs` 330 and 475 say a workbook has no indexing unit; D-672 is whole since K179, so correct them. All ten layer-6 jobs run concurrently: a user builds against its provider's Provides; a provided service you change goes to BOB first (a QUESTION with the proposed text).

## B2 · ANSWER · re J1

Both adopted (K181): keep `searchedSection` and its companions untouched (case-authoring takes them: N138); D-375 is not yours (N139). Your J2 is folded into N134. And: capture-requests registers its wait source with you as `registerWaitSource(module, {waits, markWoken})`: build it and state it in your Provides (propose the text in a QUESTION or your COMPLETE). Merge tranche/T7 into your branch now: your map was re-checked against the code (K181, MAPS67; line numbers corrected, and what earlier tranches already moved is marked), and build/modules.json and requirements changed as below.

## B3 · ANSWER · re J3

Ruled (K182): (1) register your work products with bias; leave `bias/interim.mjs`, its re-export and its test to bias (N143). (2) your R41 `registerWaitSource` folded as you wrote it; capture-requests is told to fill that shape. (3) contradiction precedes you, so its R21 now offers `registerRunGate(module, gate)` with your `gate(run, viewer, caller) → {found, running, refusal}`: register there. (4a) as you read it. (4b) not C-22.17 (observation-log's): your family is **C-109** `AI_RUN_OPEN_CHECKS`. (4c) no: a run opened with no `mode` opens in the deployed mode and records it; a blank or undeployed mode is refused. Merge tranche/T7 into your branch (K182).

## B4 · ANSWER · re J4

Restarted as AI-RUNS #2 (K184). `runtime-limits` is in your uses (tranche/T7 @ 7876e0bd6e): merge the tranche branch. Your two ownership lines (store.mjs 768–769 and the interim wait source 1354–1384) are accepted as rewiring and a K31 interim; I review them at the layer close. Read B2 and B3 (answers to J1 and J3) and continue from J4's list. The mail tool now accepts a write that changes nothing (civicos-process main @ 5c397bd, K183).

## B5 · CHANGE

contradiction is merged into tranche/T7 (K185): its `registerRunGate(module, gate)` is built (R21). Merge the tranche branch; when you register `registerRunGate("ai-runs", runGate)`, remove legacy-store's interim registration (`store.mjs` ~796–801, act text "proposing contradictions under a run") in the same change, since one gate is held and a second answers RUN_GATE_DECLARED.

## B6 · CHANGE

Forwarded from AGENT-WORKER #1 (P9; its record on `job/T7/agent-worker`, REPORT 1–3). (1) agent-worker R48 refuses every model segment whose run did not record the rendered pack's version (409 `SKILL_VERSION_MISMATCH`); the opener must record `skills.renderPack(...).version` as the run's skill version, not a bare `investigative-session@1` (`d260-resume` INSTANCE ARM 3 and COUNT ARM are red on the merged pair until then). (2) The wake dispatch (`#aiRunDispatch`) waits `AI_RUN_DISPATCH_WAIT_MS` (30 s) and reads a longer answer as SILENT; a model segment can run longer and now spends real turns under the instance account on each wake: make the dispatch not treat a running segment as silent. (3) `op=airun` does not publish the run's `state` (your R12 stores it), so a resumed segment restarts the table; publish it if you can in this job, and propose the Provides line; otherwise say so and it stays N153. Deal with each in this job where you can; say which you defer.

## B7 · CHANGE

inquiry and capture-requests are merged into `tranche/T7` (K190, @ a21d88b177); basis-versions follows shortly. Merge `tranche/T7` into your branch. Forwarded (P9): (1) capture-requests offers the K182 wait source: `captureRequestsOf(ctx, {aiRuns})` calls `aiRuns.registerWaitSource('capture-requests', source)`, or call it with `captureRequestsOf(ctx).waitSource()`; the store's run wake (`#aiRunWakeHolds`, `#aiRunWakeRuns`, the completion read) still reads `capture_requests` directly and counts only `captured` and `refused`: make it read the wait source, so D-583 (`expired` a completion) holds. (2) Two interim registrations the store answers for you until your extraction; take them over: capture-requests' `runs.runFor` (the store's SELECT over `ai_runs` in its constructor), and basis-versions' `onCandidates('legacy-store', …)` over `proposed_readings` (when basis-versions merges). Both are yours to own (their callers' ownership allows only your rewiring).

## B8 · ANSWER · re J5

J5 answered (K194, @ 1e614665b7): all four readings adopted, and folded into `build/requirements/ai-runs.md` on `tranche/T7`; merge it.
1. R28: `runFor` answers `{run, status, mode, context_type, context_id, principal_plane, principal_claude}`, as you proposed.
2. R18: your replacement text, as proposed (`RUNNING` past the bound, counted as dispatched).
3. R19: `session` adds `state`, as proposed; N153's ai-runs side is done in T7.
4. C-22.7 is skills' row (skills R25): R35 no longer lists it; you hold the predicate `checkSkillVersion` (R8) and name that row, never a copy; the row stays in the catalogue for now. Skills' own copy in `skillpack.mjs` is N156 (skills'), not yours.
Name the changed ids in your tests, and post COMPLETE when done. Note: basis-versions and run-productions are merged or merging; B7's two interim registrations (capture-requests' `runFor`, basis-versions' `proposed_readings` source, now registered in the store after basis-versions' construction) are yours to take over.

## B9 · CHANGE

Your J6 is read and the work is accepted (K196): the ten flagged ownership lines are re-pointed catalogue `where`s and the store's `#surfacedIn` reduced to inquiry's migration arm, none adding behaviour. One more merge: basis-versions and skills were merged into `tranche/T7` after your last merge (K195, @ fd703fbf0a), and your branch now conflicts with it in `bio-plane/src/store.mjs`. Merge `tranche/T7`, keep every module's removals, and then take over what you deferred: basis-versions' `proposed_readings` candidates source (R40), which the store now registers as `basisVersionsOf(ctx).onCandidates("legacy-store", (a) => runProductionsOf(ctx).candidates(a))`; RUN-PRODUCTIONS #1 has a CHANGE to register its own source and delete that line, so leave that line to it unless your map gives the source to you; say which. Run your module tests with the users you listed, your checks, and post COMPLETE; I merge you at once. Your REPORTs are routed (legacy-tests at the plan's foot, promotion's census with N147, skills' `DEPLOYMENT_SEQUENCE` a CHANGE to SKILLS #1 after you merge, agent-worker's `MODES` noted, legacy-store's SQL reads with queue and retrieval).
