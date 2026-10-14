# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #168 (`session_01VTXBipr6EdECyKwXqrQgLV`, secondary account, depth 1), 2026-10-14 ~00:55 UTC, at about 52% context, mid-L11 with no step half done. Read `build/rulings-active.md` whole first; K3131–K3153 are this session's rulings (grep them in `build/rulings.md`).

## Where things stand

- **T47 open** (`tranche/T47`, plan `build/plan/current.md`, now 93 entries with T47-93). Closed: L1–L3, L5, L6, L8, L9 (K3132), L10 (K3140). L4, L7 have no entries.
- **L11 running** (started K3141, after PR #33's head f90b187c7b was merged into the tranche at 6f0d88d8d5, K3127). 29 jobs plus **T47-93 project-roster out of layer** (Bob's K3142 "A"). Addresses in the plan's Jobs line. START bodies: `build/plan/starts-T47/` (written by `starts-T47-l11.py`, K3134).
- **Merged in L11** (each a ruling): wizard-scripts, op-grades (K3147–K3148), setup-words, instance-setup (K3149), notice-producers, project-roster (K3150), installer (K3151, again K3153), affordances, tasks, op-declarations, admission (K3152).
- **Re-opened after merging** (CHANGE B-entries posted, K3152): op-declarations (7 reds against affordances' merged `ACT_HELP`, R6/R19, R59), affordances (R19's reasoned drive), admission (R12, R19). Merge each again when COMPLETE.
- **Complete, waiting on providers** (merge in this order once their L11 uses are merged; K1965): answer-envelope (needs queue, action-producers), store-door (needs queue, answer-envelope), signin-door (needs answer-envelope; then CHANGE control-plane to delete its copy and plane to spread `signinDoorOps`, plane R49), screens-action (needs interface-shell), plane (last before journey-check).
- **Still building:** queue, action-producers, interface-shell (the kit R27–R50 for every screen job: build of R49/R50 may still be running), screens-entry, -wizards, -settings, -intake, -daily, -inquiry, -investigate, -publish, control-plane, setup-page (deletes only on BOB's CHANGE after interface-shell, screens-entry, instance-setup, control-plane merge), journey-check (waits for the screens; then its CHANGE).
- **Order of what remains:** queue, action-producers → answer-envelope → store-door, signin-door → interface-shell → the nine screen modules → control-plane → setup-page's delete (CHANGE) and instance-setup's R83 removal (CHANGE re-opens it: `setupPage` export goes) → plane → journey-check (CHANGE once the screens are merged). After each provider merges, post a CHANGE to its unmerged users (K3148's pattern: list users from `modules.json`, never post to a module with no T47 job: two stray mailboxes were made and removed, queue-producers and stewards).
- **Accepted reds** (by name, each with its clearing merge): rule 5 of the plan; K3141 (nine design-file tests until T47-49, -53, -54, -61); K3147, K3148, K3150, K3152's lists; control-plane's re-pins (C-69.6 ×2, test 57, doorbell R2) until T47-65; membership's 6 (N1014, T48); the plane bundle and `program.mjs` (regenerated at L11's close).
- **Timers:** backstop `trig_018FwrhFvztdn3EyKDjBSYXS` (into this session), `WATCH #168` `trig_01VKdg91VpX8f1dSB29FiKtr` (into ROOT #6). Delete both at takeover (§5.1) and arm your own. Many one-time doorbells into job sessions fire and lapse by themselves.
- **Doorbells:** about 13 jobs were not rung after K3152/K3153's CHANGEs (routine rate limit): run `mail check` at takeover and ring every `RING`. Ring through a helper agent (one `create_trigger` each, a minute apart on a rate-limit refusal), which keeps the trigger JSON out of BOB's context.
- **Channel:** UX-DESIGN (`session_01DyYKz1UJZVqVzz1E8F4Cyk`, secondary) read through B176; BOB read through U206. Unread by it: B177 (`help-records` purpose names places), B178 (ACK of U205/U206; escalation stage names to confirm). DEC-218 (Bob's S20 "A": one home, arrangement C) and DEC-219 (no member email ever; four areas; no zero readings) are folded into N1036 for T48. PR #33's head is now past f90b187c7b (DEC-218–DEC-220): merge it at T47's close (§5.7 (1)); its new words (DEC-220) land then.
- **Bob's meter:** the session showed a seven-day usage warning; Bob was asked for his reading (K2341's 80% pause rule). Not yet answered.

## What comes next, in order

1. **Take over** (§5.1), archive BOB #168, write its BOB-final row in `build/metrics/T47.csv`.
2. **Watch L11** (§5.4): answer, merge in the order above, CHANGE the users after each merge, re-merge re-opened jobs.
3. **Close L11** (§5.6): regenerate artifacts in the manifest's order (`npm ci` in agent-runner `--ignore-scripts`, sheet-worker, agent-worker, file-scanner, and now `bio-plane/src/journey-check/`, K3146); verify; `run.mjs`; archive the 30 sessions with rows (module lines by the most-specific-path rule, K2513; scratchpad script pattern in K3132).
4. **T47's close and release** (§5.7): merge PR #33's head (the design stream's MERGE when asked, or at close per K1177), merge `main`, every module's tests (K2704), checks, archive the plan, PR to `main` with the merge tool; move `build/channels.md`'s `BOB` row to secondary. Before the release: BOB's census of what legacy-ui offers that `/app` does not (plan "BOB's acts", K3137), N1004's journey check passing (journey-check's live arm, run with Bob's credentials at the release), each deploy Bob's approval in session.
5. **T48:** `build/plan/draft-T48-plan.md` (K3136) is the draft; re-test it against T47's outcome and add N1026–N1045 (this session's) before opening.

## Open with Bob

- His weekly meter reading on the secondary (a seven-day usage warning showed).
- The stewards' contact address (K2799; civicsmith.org's email, K3060 D14).
- The reviewer for the records-request template (N858, K3081).
- The installer's Cloudflare dashboard act (K2164, N1003): walk him through it now that INSTALLER #12 is merged.
