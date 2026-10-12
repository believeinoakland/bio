# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #162 (`session_0195piYo1V91AiqTGTwsgsv2`, primary account, depth 1), 2026-10-12 ~08:50 UTC, refreshing near 55% of its window with no step half done: every job entry read up to now is answered, folded and rung. Read `build/rulings-active.md` first; this BOB's rulings are K2971–K3000.

## Where things stand

- **T46 is open, in L11, its last layer.** L8 (K2972), L9 (K2989) and L10 (K2994) closed. L11 started at K2995 with nineteen jobs (T46-61 stewards not started: it joins only with the stewards' address, K2799). Addresses are in the plan's Jobs line.
- **L11 merged so far:** interface-assets (K2997, paths filled per K1043), action-producers (K2998; **re-opened** by B3, K3000: SCREENS-DAILY #1 J3's `set_by` form, to verify and fix), setup-words (K2998), installer (K3000; R48's address part carried to T47, its mark `not yet met: T47`).
- **Complete, waiting on providers (merge order, plan "L11 merge order"):** answer-envelope (after wizard-scripts and instance-setup), setup-page (after instance-setup). **op-grades** was complete (J3) and is **re-opened** by B3 (K2998: `clockadopt`); merge it as soon as it completes again, then post a CHANGE to affordances (which waits on it).
- **Running:** wizard-scripts, affordances, notice-producers, instance-setup, op-declarations, interface-shell, the four screens, control-plane, plane.
- **Settled this BOB, folded into requirements (read before answering more):**
  - The dock's member run (K2976, then K2999): the dock mints her a one-day member credential (`aicredentialmint`) whose `writes` name `airunopen` and `airundispatch`, opens the run under it, and the door hands it to ai-runs as an in-process argument of a new Store RPC `dispatchMemberRun` (plane R40). The full design (a segment credential minted inside ai-runs) is N955, T47.
  - The screen contract (K2996, K2998, K2999): interface-shell R21's sub-bullets are the one text the shell and the four screens build to. Further kit questions are the shell's to answer with BOB; relay each.
  - Store RPCs `dispatchMemberRun` and `groupFields` (plane R40; control-plane R20, R77).
  - New op rows folded: `clockproposals` (op-declarations R51, op-grades R33), `clockadopt` (op-grades R33), `airundispatch` `{classes: [admin, member]}` (control-plane R77), C-69.6 `DISCLOSURE_DUE` (answer-envelope R8), C-64.28/29 (instance-setup R79).
  - action-holds R14 retired (K2981): it reversed DEC-113's "or never needed to".
- **Reds named during L11** (in addition to the plan's rule 5): control-plane's R32 "every row raised" from answer-envelope's merge until T46-59 (K2998); affordances' two escalation-ACTS tests from op-grades' merge until affordances' (K2998); affordances' plane R17 mode test from its merge until T46-51 (K3000); op-declarations' R34 partition tests until affordances' merge (K2999); action-plans' affordances op map naming `clockproposals` (K2987).
- **Prepared for T47 (P18):** split maps `build/extraction/case-authoring-split-2.md` (`case-inputs`) and `actions-split.md` (`action-records`), K2982; N909 closed (publication is 3,633 lines). New next.md entries N952–N972.
- **Channel:** BOB's Writer line on `mail/BOB` is this session's (K2991); T46's HANDOFF posted as B154 (plan "BOB's acts" marked done). UX-DESIGN read to U174, nothing new; lanes investigation H43, actions H31, nothing new.
- **Container:** `npm ci` done in agent-runner (`--ignore-scripts`), sheet-worker, newgroup, file-scanner (the container restarted once; they survived).
- **Timers:** backstop `trig_01EdPfyrEoYpnFiiWpotEGea` (09:05) and WATCH #162 `trig_013XnAVwAZfQxPyqXBc9u2Ui` (into ROOT #5, 09:45): delete both at takeover and arm your own.

## ROOT

ROOT #5 (`session_0187SrKsqhqzSTqwDk2hzcXy`) read about 40% at BOB #162's takeover (Bob's threshold 55%, K2679). ROOT #5 told BOB #161 that Bob would start a ROOT #7; Bob has not named it. Until he does, ring ROOT #5. When he names it, record its id in `build/manifest.md` ("Starting a session") with a ruling, and archive ROOT #5 once ROOT #7 runs (ROOT is replaced only by Bob, mechanics §2).

## Bob's rulings since the last handoff

None.

## Next steps, in order

1. Take over (§5.1): archive BOB #162 once idle, its `BOB-final` row under T46; delete its backstop and WATCH; write your Writer line on `mail/BOB` (`mail.mjs xwriter`).
2. Run L11 (§5.4, §5.5): answer and route each entry; merge each job in L11's order (a provider before its users; one using no unmerged L11 job as soon as complete). New modules' `paths` and `tests` go into `modules.json` from their COMPLETE before the ownership check, as a one-line edit (never a reformat of the file). plane merges last.
3. If Bob names the stewards' address while installer's R48 can still join: a new installer entry is T47's now (installer merged), so start T46-61 only with a fresh plan entry for both; otherwise both are T47's.
4. Close L11 (§5.6), then close T46 (§5.7): merge DEC-198's PR #30 (UX-DESIGN's MERGE U172) into `main` first, then merge `main` into the tranche, run every module's tests (K2704), archive the plan, then the tranche PR to `main`; release 0.83.0 (plan "BOB's acts"; each deploy act is Bob's in session).

## Open with Bob

- ROOT #7's session id (ring ROOT #5 until he names it).
- The stewards' contact address (K2799): installer's R48 part and T46-61 are T47's without it.
