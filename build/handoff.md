# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #313 (`session_018r9K5wgMTUrdGRUqami37X`, depth 1, parent ROOT #10; **Bob's primary account**) for BOB #314, 2026-10-26, at 40 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. ROOT is **ROOT #10** `session_01XHjMEPkzmkLycoWtxb4yn6`. Read rulings K5317-K5328 whole (they record today's diagnosis of why the process has been failing, and Bob's direction for fixing it), `build/plan/walk-T51-alpha/BRIEF-rewalk11.md`, `diagnosis-S1.md` and `alpha-cut.md` whole.

## Bob's direction now (all in `rulings-active.md`; run `node build/plan/bob-rulings-check.mjs` at takeover: it must print 0)

- **The alpha first (K5311, K5313, K5319):** no new job unless a member's operation fails; running jobs merge; then artifacts, redeploy, re-walk, cut, each step checked before the next. "We can try, but let's we aware that we have problems." (K5319).
- **Then the process redesign before T52 opens (K5319, K5323, K5326):** `build/plan/draft-process-redesign.md` and its inventory `draft-process-inventory.md` (140 rules classed CODE/SKILL/INDEX/PRODUCT/RETIRE). Bob: "Step that must aways happen belong in code, not instructions! Follow all of these best practices." No job cap unless usage risks running out (K5323; watch `get_session`'s `rate_limit_info.status`).
- Releases are BOB's acts, never Bob's approval (K5293). Bob's one act in the cut: approving the `release-sign` run on GitHub (alpha-cut step 9).

## Where the work stands

- Fix round 10's jobs all merged (K5318 interface-shell, K5321 screens-entry R34, K5322 screens-daily R107). Artifacts regenerated `07a3dfe6a1`; biosmoke8 redeployed (run 40379661431, K5325).
- **Re-walk 11** (`BRIEF-rewalk11.md`; records on `walk/T51-rewalk11-<A-E>`): B 2/2 fixed (one MINOR wording: the documents-count widen button reads only "Search": UX-DESIGN HANDOFF); D 3/4 (R135's unsaved line not drawn for the case editor's radios and tick: screens-publish lacks `typing: edited` at `case-editor.mjs:121,126,178`; MINOR, in `next.md`); A 2/3 and **S-1 MAJOR** (setup stays "Still loading" for a signed founder; K5327); E 14/17 (K5328: adoption MAJOR, its job running; three minors in `next.md`); C: see its record (they finished after this handoff was drafted if their branches exist; read them whole, place every NOT FIXED and new finding by K4426's four, a failing member operation as a job now, else `next.md`).
- **Running: SCREENS-ENTRY #16** (`session_01HPbxRrBFoxDBNSYkhtnFYP`, START B24, S-1) and **SCREENS-INVESTIGATE #26** (`session_01KcnPP3ksqA2VwJJfipTH1W`, START B56, a standard's adoption, K5328). At each COMPLETE: `node build/plan/premerge.mjs <module>`, push (one plain command), strike nothing (no new id), ruling, archive with row, `mail retire`. Then regenerate the artifacts (the plane bundle and `program.mjs` change), redeploy (`deploy-test/biosmoke8/dry-run` then `/deploy`, plain pushes after checking each is a fast-forward), re-walk S-1, A's setup zone row and E's adoption row at 1280 and 390.

## Then, in order (the cut: `alpha-cut.md`)

1. Merge the re-walk records (`walk/T51-rewalk11-*`) into the tranche.
2. Finalize the notes from `build/plan/walk-T51-alpha/notes-0.87.0-draft.json` with what the re-walk shows (state the zone pass's limit, K5324, and R135's missing line plainly); commit as `release/notes/0.87.0.json`.
3. The cut 0.87.0, steps 1-17 of `alpha-cut.md`, **with civicsmith.org (step 13) deployed only after the rehearsal (step 14) passes** (K5319's ordering). Rollback targets: newgroup `fa4267b9-a38b-4302-8189-f7b233b1e45a`, civicsmith-site `97a23ece-8276-400b-9a24-3ee720abd6c2`. The rehearsal runs on a fresh test copy in the project account, never Bob's throwaway (K5258). Then Bob's own install (K4935).
4. The process redesign (`draft-process-redesign.md`), certified by dry run, then T52 opens as the beta (K5257), `next.md` first: DEC-443 (K5315), the zone pass (K5324), the served-source check (K5327), the word-key test sweep (K5313).

## How to wait (K5321)

- Never rely on doorbells alone: after a CHANGE or START, run `build/plan/watch-job.sh "<module>|<module>"` as a background task (it loops `mail check` every 30 s and exits when a job has a READ entry or is COMPLETE with nothing open); the doorbell is a backup. Before telling Bob a job is "waiting", read its session's events.
- A job's COMPLETE with its cursor behind BOB's newest entry: post a one-line CHANGE asking `mail done` and ring (K5320).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first; DEC-443 is held until after the deployment (K5315).
- Release acts: K5293. biosmoke8 deploys: K5120 (never `-f`: a typed force push was refused at K5325). Branch deletion: only by `prune-branches.yml` (K5300, K5302; it starts itself once on `main`, K5317).
- Process repository edits: none yet this tranche; `premerge.mjs` and `bob-rulings-check.mjs` live in `build/plan/` (K5309, K5311); the redesign moves them into the tool.

## Tools and limits

- The mail tool with `retire`: `/home/user/cp-retire` = civicos-process `prep/retire-K5296` (`git -C /home/user/civicos-process worktree add /home/user/cp-retire origin/prep/retire-K5296` after fetching it).
- `rulings-active.md` 78 lines, about 25,585 bytes of 25,600: a new rule replaces or merges a line. `fix-round-10-T51.md` ~49.9 KB of 51.2 KB.
- Lanes: no new HANDOFF entries (W4, A41, H43 last). UX-DESIGN read through U486; it has read B539.
