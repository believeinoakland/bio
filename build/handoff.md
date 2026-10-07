# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #132, 2026-10-07 ~21:22, for BOB #133. Read `build/rulings-active.md` first (K2034).

**Open with Bob:** approval of three small wording edits, shown at https://claude.ai/artifact/KgQXffuVNBydhDibWHfyK6 (version 3: edits to the existing text, not a rewrite, with his own wording of the first sentence: "high-level architecture (like the definition of layers)" stays his, "details about layers, modules and their boundaries and order" are BOB's): (1) `roles/BOB.md` "Working with Bob" in civicos-process; (2) bio `CLAUDE.md`'s "Working with Bob" paragraph; (3) `PROCESS-MECHANICS.md` §2 and §7. Start watching the page at takeover (`ArtifactComments`, action `watch`, its url), so a comment from him wakes you; he may also answer in your session, or BOB #132 may record his answer as a ruling before it is archived (search `build/rulings.md` for "KgQXffuVNBydhDibWHfyK6" at takeover). When he approves (in any words naming them): make exactly those edits, record a ruling of his approval citing the page's version, add the sentence on what is his to `build/rulings-active.md` §1 if it changed, push both repositories, then tell him in one line that they are done. He asked to be told when **all** of the record work is approved and complete: also finish N737's second half (trim each requirements file's Status line to its approval and current state, by a worker, reviewed) and N739 (set and record a size limit per reading set, K2028, K2032), then tell him.

**Working with Bob:** as `build/rulings-active.md` §1 states. Nothing else is open with him.

## Where things stand

- T35 on `tranche/T35`. L1–L10 closed. **L11 runs** (K2036): 15 jobs, addresses in the plan's Jobs line.
- **Merged:** wizard-scripts, notice-producers, tasks, op-grades (twice), affordances.
- **Re-opened by CHANGE (K2049):** OP-GRADES #1 (`standardrelease` into `IRREVERSIBLE_WEIGHT`), AFFORDANCES #22 (extend the op lists its tests pin: clears reds 29, 36). Merge each again when complete.
- **Complete, held for same-layer dependencies (merge in this order as they clear):** admission (after op-declarations) → answer-envelope (after instance-setup, admission) → store-door (after answer-envelope; then tell it to merge tranche/T35 and re-run, K2041) → installer (after instance-setup) → legacy-ui (after admission, control-plane, plane). Before each split module's ownership check, fill its `modules.json` row from its COMPLETE (K1043): answer-envelope `bio-plane/src/answer-envelope/`, `bio-plane/test/m/answer-envelope/`; store-door `bio-plane/src/store-door/`, `bio-plane/test/m/store-door/`.
- **Working:** setup-page, instance-setup, op-declarations; plane (answered B8, K2046; tell it when admission merges so it composes `admissionOps`); control-plane (waits on merges). **Merge control-plane and plane back to back** (K2038), after plane completes. After both merge, send affordances a CHANGE to drop K2038's temporary re-export, and merge it again.
- **Accepted reds:** 1, 2, 3, 7, 9, 10, 11, 12, 14, 19, 21, 22, 23, 25, 26, 29 and 36 (until affordances' re-merge, K2049), 31 (sweep arm, until T35-73), 32 (N733), 33 (T35-72), 34 (N738), 35 (until control-plane's merge, K2044), 37 (affordances' merge until op-declarations'), 38 (admission's merge until store-door's).
- ROOT #6 is `session_01FXbdTJZyPp3Bhcv7pfVSR1`. Channel: read through U120; PR #13 waits for T35's close.

## Next steps, in order

1. Take over (§5.1): archive BOB #132 (`session_01H8GMxDQsvRaEP3VDujeQFt`) and write its `BOB-final` row under T35; delete its backstop and `WATCH #132` (`trig_01RKsby8HXsdTx2PZWmwPMgE`); arm your own.
2. Watch L11 and merge as above. Close L11 (§5.6): regenerate in the manifest's order (newgroup is stale, INSTALLER #9), checks, archive the 15 sessions with rows (Size lines in their records).
3. Close T35 (§5.7): merge PR #13 on UX-DESIGN's MERGE (K1177). The fast-forward of `main` was refused before and approved by Bob in that session (K1906, K1909; not on the standing list): ask Bob in your session at the close.
4. Release 0.81.0, held until T35 completes (K1922): re-cut from T35's tip; each deploy approved by Bob (K1716). The installer is deployed only with an embedded release carrying admission R20 (INSTALLER #9 J1, K2041). Duplicate check ids C-137 (N738): weigh holding the release until it lands.
5. Bob's environment clean-ups N711–N713 (K1936), each walked through when its work lands.
6. Open T36 from `plan/draft-T36.md`, adding N737–N745: settle its "Questions for BOB" first (all BOB's), then §5.2.

## Process notes

- Doorbell creation is rate-limited (about 10 a minute): create rings in batches of six or fewer.
- Post long mail bodies with `--body-file`; backticks in `--body` break the shell.
- Mark a job read (`mail done`) only through entries you have read: re-read its inbox first.
