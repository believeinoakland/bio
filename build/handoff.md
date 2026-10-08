# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #141 (`session_01MG1srQ83USpRDFURbfVuBa`), 2026-10-08 ~16:15 UTC, for BOB #142. Read `build/rulings-active.md` first; this BOB's rulings are K2253–K2283 (and K2284, this handoff).

## Open with Bob

None. Answered today: the close's refusals (K2273: mechanics §5.7 (3), §16, §11 changed, civicos-process `ead818c`); key custody (K2277, Distribution §10); meter 60% at ~15:05 (K2274). Coming to him later: N796 (a sign-in serving unattended standing questions: terms, his), brought rendered with the register's entries when T39's plan is drafted.

## Where things stand

- **T37 closed** (K2261, `main` @ `0a2aa79231`). **T38** on `tranche/T38` (opened K2262 from `plan/current.md`, 28 jobs after K2270–K2283).
- **L1 closed** (K2269). **L2 running**: project-roster (K2278, K2280), membership both halves (K2276, K2281) and credentials (K2283) merged; **PROMOTION #36** got CHANGE B3 (stamp after L2's merges); merge it when COMPLETE (fix its `modules.json` `tests` fixture swap `row-census-1.64.0.jsonl` → its new version at the merge), then close L2 (§5.6: regenerate in the manifest's order; `program.mjs` embeds the catalogue version), archive the four L2 sessions with rows, start L3 (§5.3).
- **Requirements still to write before their layer's START** (each plan entry says `req:`): L3 file-safety R39, R28 (N789, N791; START names rule 6 item 9's 29 reds); L4 extraction R66; L5 bias (test only); L6 agent-model R2, agent-worker R6, ai-runs (test only); L8 case-grammar R12, case-carriage R1/R8/R11/R12/R9 + new R (N779, N790, N788), public-read R23, case-disclosures R6/R22, case-authoring R34; L11 op-grades, tasks, setup-page, instance-setup, answer-envelope, op-declarations, admission, control-plane (check first whether case-carriage's ops map already routes `obscuremarkwithdraw`), plane (spread project-roster's ops and register its R15/R16/R17: clears rule 6 item 11). Plan rule 8 (N779: no L1 change; uncoverable photo refuses publication) and rule 9 (N793) govern.
- **Reds:** plan rule 6 items 1–13 (item 4, 5, 10, 12 cleared).
- **T38's close (§5.7, as changed by K2273):** step (3) is now a pull request from `tranche/T38` to `main` merged with the GitHub merge tool, never a direct push; it is certification row V6's proof (record it). Design PR: the UX session keeps committing to `claude/gallant-brown-zg0wc1` after PR #15 merged; merge a new PR only on its `MERGE`.
- **Channel:** UX-DESIGN U133–U136 read and ACKed (B111–B114): N797–N799 in `next.md`. INVESTIGATION-DESIGN `HANDOFF.md` unchanged at `f53cd6ffbe`.
- **Timers** (delete mine by id at takeover): backstop `trig_01RH691euepGG8tnKK2Y6Cr9` (16:09, fired; re-arm while my successor starts), WATCH #141 `trig_0145DBKKEpPUW6Y5usasPSab` (16:50, into ROOT). Artifacts watched: close-refusals page (resolved) and key custody page (answered).

## Next steps, in order

1. Take over (§5.1): archive BOB #141, its `BOB-final` row under T38; arm backstop and WATCH.
2. Merge promotion, close L2, write L3's requirements and STARTs, start L3. Keep going layer by layer.

## Process notes

- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- Check a row id across all of `bio-plane/src` before naming one (K2279).
- Edit `modules.json` as text, never by re-serialising it (it reformats the file).
