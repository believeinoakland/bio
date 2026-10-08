# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #140 (`session_01YMzxtfn4tJD7REiG3cRbrQ`), 2026-10-08 ~13:50 UTC, for BOB #141. Read `build/rulings-active.md` first; this BOB's rulings are K2226–K2250 (and K2251, this handoff).

## Open with Bob

1. **Key custody**, three questions on https://claude.ai/artifact/TB55RCpWXtBEWUanVnCA3A (no comments as of 13:50). Re-watch it (`ArtifactComments` watch) and point Bob at it.
2. **T37's close, step (3)** (§5.7 (3), §16), when L11 closes: fast-forwarding `main` to `tranche/T37`'s closing commit is refused as "Merge Without Review" (K1454, K1906), approved once per close (K1909, K2069, K2137, K2240); not on the standing list. Ask Bob in **your** session for: "Approved: at T37's close, fast-forward main to tranche/T37's closing commit. Standing list: not added." Record it (§16 form), then act.
3. Everything else is answered: T36 closed (K2240, `main` @ `096424f11f`); wizard scripts are BOB's (K2241, version 2 adopted); photo metadata B (K2248: the group keeps it, published photos do not; N779 in T38; K2243/K2246 (1) superseded); sign-in persistence A (K2246 (2)); meter 57% at ~13:20 (K2240). The questions page https://claude.ai/artifact/TuYfyFijT6SayH1mBqSM21 is now stale (all four answered): republish it or leave it.

## Where things stand

- **T37** on `tranche/T37`. L1–L10 closed (L8 K2229, L9 K2234, L10 K2237). `main` moved at T36's close (K2240): at T37's close merge `main` into the tranche first (never a rebase) and run the checks (§5.7 (1)).
- **L11 running** (K2237), eleven jobs (addresses in the plan's Jobs line). Merged: op-grades (K2242, K2245), notice-producers (K2244), setup-page (K2245), wizard-scripts, instance-setup, op-declarations, answer-envelope (K2249), affordances (re-merged K2250). Open:
  - STORE-DOOR #3: merged (K2252).
  - CONTROL-PLANE #26: RESUME B3 sent (K2252); merge when COMPLETE.
  - PLANE #26: CHANGE B3 (merge tranche, re-pin `door.test.mjs`:111 to 33 routes, ask.test reds should clear); merges last; strike its R29 mark at the merge (it made the todo a test).
  - L11 order: … → store-door → control-plane → plane.
- **Reds:** plan rule 6 items 1–26 (7, 19, 25 cleared). At L11's close check item 22 (legacy-ui `statement-ack.test.mjs`, its M0-107 timeout) and send it to `next.md` if it stands; items 21, 16, 15 and rule 4's (item 8) should clear with T37-33.
- **L11 close (§5.6):** regenerate in the manifest's order (`program.mjs`, `court-data.mjs`, `node bio-plane/scripts/bundles.mjs`, newgroup); `fleetbundles` expects red 20 only; `checks/run.mjs`; archive the eleven sessions, rows from their `Size` lines.
- **T37's close (§5.7):** (1) PR #15 (UX-DESIGN U132 MERGE) into `main` with `mcp__github__merge_pull_request` (standing list, K1177), then merge `main` into the tranche; (2) archive the plan `CLOSING` with outcomes and usage; (3) fast-forward `main` (Open with Bob 2); (4)–(6) timers, report, open T38.
- **T38 prepared:** `build/plan/draft-T38.md` (a helper's draft, reviewed; BOB #140's notes at its end: N789–N793, N779 back in, T38-16's route question) and `next.md` (N779, N782–N793). Open T38 from it at once after the close.
- **Channel:** UX-DESIGN has not read B106–B110 (B106 setpassword help-text question; B107 K2241 notice; B108–B110 photo metadata notices, B110 the final: B). INVESTIGATION-DESIGN `HANDOFF.md` unchanged at `f53cd6ffbe`.
- **Timers** (delete mine by id at takeover): backstop `trig_014RCwQkDorpkEpj75EhBftE` (14:08; re-arm while your start is pending), WATCH #140 `trig_018eqJcxWoGe1QhK7NZdRumz` (14:49, into ROOT). Artifacts watched by my session: the two pages above.

## Next steps, in order

1. Take over (§5.1): archive BOB #140, its `BOB-final` row under T37; arm your backstop and WATCH; re-watch the key-custody page.
2. Watch L11 (§5.4): merge store-door, RESUME control-plane, merge it, then plane.
3. Close L11 (§5.6), then close T37 (§5.7), asking Bob for step (3) in your session.
4. Open T38 from `draft-T38.md` (§5.2).

## Process notes

- `mail.mjs addjob --name` needs the name with its space ("PLANE #26").
- After a container restart: `npm ci --ignore-scripts` in agent-runner, `npm ci` in sheet-worker and file-scanner before `fleetbundles`.
- Merges on `main` go through a worktree (`/home/user/bio-merge`, detached; reset it to the branch you need).
