# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #312 (`session_01SBQoo2pCXzij9QryZw5Gen`, depth 1, parent ROOT #7; **Bob's primary account**) for BOB #313, 2026-10-26 ~17:50Z, at 42 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. ROOT is now **ROOT #10** `session_01XHjMEPkzmkLycoWtxb4yn6` (K5313). Read rulings K5308-K5316 whole, plan items 149-150 of `build/plan/fix-round-10-T51.md`, and `build/plan/walk-T51-alpha/alpha-cut.md` whole.

## Bob's direction now (all in `rulings-active.md`; run `node build/plan/bob-rulings-check.mjs` at takeover: it must print 0)

- **The alpha is frozen (K5257, K5258, K5311):** no new job or worker unless a member's operation fails; no job or worker just to fix a test; a red test holds nothing. Bob (K5313): "Stay focused on getting alpha deployed (and the site and installer). There are many tasks backed up beind that release."
- **After the alpha (K5313):** tests assert the word key, never the English; the sweep is the first T52 entry in `next.md`, with DEC-443 (K5315).
- Releases are BOB's acts, never Bob's approval (K5293). Bob's one act in the cut: approving the `release-sign` run on GitHub (alpha-cut step 9).

## First

1. Take over (§5.1). My timers: backstop `trig_019QAotPKa8aGZiH34hRKAXC` (18:05Z), WATCH #312 `trig_017uUNZ6ULGM4NDgGU2mo16X` (18:42Z into ROOT #10); delete both by id. Archive BOB #312 once idle; its `BOB-final` row under T51. Your WATCH goes into ROOT #10.
2. Running: **INTERFACE-SHELL #26** (R134 four re-points incl. `queue: signerknown`, R135; B60 CHANGE). At its merge: CHANGE to **SCREENS-ENTRY #15** (merge the tranche, suite green without its local patch, COMPLETE) and **SCREENS-DAILY #28** (half 2, `signerknown`); then merge both. No CHANGE to screens-inquiry (its two through-the-page tests are test-only: not before the cut, K5311). JOURNEY-CHECK #16 was archived unmerged (K5311): leave its Jobs entry.
3. Merge with `node build/plan/premerge.mjs <module> ...` (K5309), never hand-typed steps; then push, strike, ruling, archive with row, `mail retire`.

## Then, in order (the cut: `alpha-cut.md`)

1. Artifacts regenerated in the manifest's order (the plane bundle and `program.mjs` are stale), verified, committed; deploy biosmoke8 (K5120; `redeploy-walk-T51.md`); a targeted re-walk of items 143-150's rows.
2. Finalize the notes from `build/plan/walk-T51-alpha/notes-0.87.0-draft.json` with what the re-walk shows; commit as `release/notes/0.87.0.json`.
3. The cut 0.87.0, steps 0-17 of `alpha-cut.md`. Step 0 done at 17:40Z: wrangler sees only `20b533579290b9b93168345edd3b7f72`; rollback targets newgroup `fa4267b9-a38b-4302-8189-f7b233b1e45a`, civicsmith-site `97a23ece-8276-400b-9a24-3ee720abd6c2`. The rehearsal (step 14) runs on a fresh test copy in the project account, never Bob's throwaway (K5258). Then Bob's own install (K4935).
4. T52 opens as the beta (K5257), `next.md` first: DEC-443 (K5315), the word-key test sweep (K5313).

## Open with Bob

- **Automatic branch cleanup (K5308):** making `.github/workflows/prune-branches.yml` start itself (on every push to `main` and weekly; tip held by `main`, 3+ days untouched, not `tranche/*`, `claude/*`, an open tranche's `job/*`, protected or an open PR head; its list kept as the run's artifact). Auto mode refused BOB #312's edit ("[Git Destructive]"); it is an auto-mode refusal, so only Bob's approval typed in the refused session clears it, and BOB #312 asked him there. If he has not approved in BOB #312, ask him once in your own session with the line: "I approve editing .github/workflows/prune-branches.yml so it runs itself on every push to main and weekly, deleting only branches main already holds." Never retry it unapproved (K4696).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first; DEC-443 is held until after the deployment (K5315).
- Release acts: K5293. biosmoke8 deploys: K5120. Branch deletion: only by `prune-branches.yml` (K5300, K5302).
- Process repository edits: refused (K5294); `premerge.mjs` and `bob-rulings-check.mjs` live in `build/plan/` until then (K5309, K5311).

## Tools and limits

- `rulings-active.md` 78 lines, 25,506 bytes (NEAR): a new rule replaces or merges a line. `fix-round-10-T51.md` ~49.9 KB of 51.2 KB: move finished items whole to `archive/fix-round-10-T51-done-items.md` before additions.
- A wait loop never uses `pgrep -f` on a string in its own command line (it matches itself; K5309).
- Lanes: no new HANDOFF entries (W4, A41, H43 last). UX-DESIGN read through U486 (B539 ACK).
