# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #311 (`session_01QwRgD5rX4QnhHzLBGGoUuo`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #312, 2026-10-26 ~16:20Z, at 43 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. Read rulings K5302-K5306 whole, plan items 144-148 of `build/plan/fix-round-10-T51.md` whole, and `build/plan/pass-zone-K5292.md`.

## Bob's direction now (in `rulings-active.md`)

- **K5257:** deploy now, walk live, then every effort to the beta with all its requirements; efficient, no deferrals, urgency.
- **K5293 (releases):** every release act is BOB's; never ask Bob.
- **K5298:** stewards' address `stewards@civicsmith.org`.
- **K5300:** branches are deleted only by `.github/workflows/prune-branches.yml`.

## Open with Bob

None. Bob himself started the K5300 deletion at 16:14Z (run 40357122765, branch `prune/k5300-all` made in GitHub's web editor with `build/plan/prune-request.json`), walked through it by BOB #311 after PRUNE-BRANCHES #1's push was refused by auto mode and its own walkthrough failed (it had him commit and then delete `.claude/settings.local.json` on `main`: two commits, net diff zero, left as history, never rewritten; three earlier `prune/k5300-all` branches each deleted by the workflow itself, nothing lost: 2,469 heads before the run).

## First

1. Take over (§5.1). My timers: backstop `trig_01DrTzv8XkbspcTzP2oNVxNE` (16:30Z), WATCH #311 `trig_01N9Mr4E7TwK4yK9AHXEWNiH` (17:10Z into ROOT #7); delete both by id. Archive BOB #311 once idle; write its `BOB-final` row under T51.
2. **The deletion run:** read run 40357122765's `RESULT:` line (`mcp__github__get_job_logs`), count `git ls-remote --heads origin`, and confirm present: `main`, `tranche/T51`, `snapshot/pre-refactor-2026-09-25`, `study/constructs`, `claude/gallant-brown-zg0wc1`, every `job/T51/*`, `mail/*`, `dist/*`. Tell Bob the result in two plain lines. Close any pull request from `prune/k5300-all` if one was opened. Then archive PRUNE-BRANCHES #1 (`session_013Eud5TsXrNTmDpMqgrcvCj`, its row), write a ruling, and `mail retire --module prune-branches`.
3. `mail check` from civicos-process `prep/retire-K5296` (`f70c1a2`; read access only: auto mode refused this session push access to the process repository). Read its whole output. Four long-merged jobs remain on the Jobs line: retire each its `MERGED` line names (all their sessions already have metrics rows).

## Running (addresses in the plan's Jobs line)

SCREENS-INVESTIGATE #25 (R64 Standard's four acts, R65; CHANGEs B51-B54: J44 answered, registry merged, `fix4.test.mjs` intermittent), INQUIRY-GRAMMAR #15 (R69; CHANGE B12: re-pin to connections' words, plain labels), BASIS-VERSION-GRAMMAR #3 (R12; its COMPLETE rang 15:54Z, unread), CREDENTIALS #33 (R83 `signerknown`), QUEUE #40 (R96, waits on credentials), QUEUE-PRODUCERS #31 (R55, waits on credentials), AFFORDANCES #52 (R71; CHANGE B31 `leggrade`), SCREENS-DAILY #28 (R107; half 2 waits on credentials), SCREENS-INQUIRY #36 (R139; CHANGE B94 `leggrade`), SCREENS-PUBLISH #29 (R81; its COMPLETE rang 15:51Z, unread), SCREENS-INTAKE #30 (R71; COMPLETE rang 15:56Z, unread), SCREENS-ENTRY #15 (R34). UX design #41 `session_01FfxzNZtq7F8arhiJhGFggR` (read through U484; B536 ACK, B537 HANDOFF: binding-row words).

**Accepted red, by name:** inquiry-grammar's six (connections' old sentence; INQUIRY-GRAMMAR #15), basis-version-grammar `registration.test.mjs` R6 (BASIS-VERSION-GRAMMAR #3), op-declarations `t36.test.mjs:306`, `t42.test.mjs:129` (`leggrade` act help; AFFORDANCES #52).

## Then, in order

1. Merge every running job as each completes (premerge as K5304 records it). At CREDENTIALS #33's merge: CHANGE to QUEUE, QUEUE-PRODUCERS, SCREENS-DAILY, AFFORDANCES (`signerknown`); then op-grades and op-declarations rows for `leggrade` and `signerknown` if their suites ask (citation J28 (3)). At STANDARDS' merge already done (K5304): SCREENS-INVESTIGATE draws `bindings`.
2. Item 144 (1): the team-zone pass, `build/plan/pass-zone-K5292.md`, once no job runs (§5.10).
3. Regenerate every artifact in the manifest's order (the plane bundle is stale since wizard-scripts R53), verify, commit; deploy biosmoke8 (K5120); a targeted re-walk of items 143-148's rows.
4. The cut 0.87.0 (`build/plan/walk-T51-alpha/alpha-cut.md`; K5293), its deployment, installer and site, the rehearsal; then Bob's install (K4935).
5. T52 opens as the beta (K5257); the test rethink with Bob first (K5258).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first. Design commits of design files only are merged into the tranche when asked (K5224, K5302).
- Release acts: K5293. biosmoke8 deploys: K5120.
- Branch deletion: only by `prune-branches.yml` (K5300); PRUNE-BRANCHES #1's push was refused by auto mode ("[Git Destructive]", K5302) and is not retried by any session; Bob starts it himself in GitHub's editor as on 2026-10-26 (K5302).
- Process repository edits: refused (K5294); this session had read access only.

## Tools and limits

- `mail done` never moves a cursor back: pass the job's real last entry (K5304 fixed five set to J99 by hand, recorded).
- A long background `mail retire` loop races BOB's own pushes: stop it before any merge (an interrupted retire leaves `current.md` staged: `git checkout HEAD -- build/plan/current.md`).
- `rulings-active.md` 78 lines, ~25.2 KB (NEAR): a new rule replaces a line. `fix-round-10-T51.md` ~48.5 KB of 51.2 KB: move finished items whole to `archive/fix-round-10-T51-done-items.md` before additions.
- Lanes: no new HANDOFF entries (W4, A41, H43 last).
