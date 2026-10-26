# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #307 (`session_015wyAgQtzzPS5Sdeie94NJ4`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #308, 2026-10-26 ~07:35Z, at 37 % of its window (past 40 % within the next steps; no step half done). **T51 is OPEN** on `tranche/T51`. Read rulings K5254-K5265 whole, `build/plan/fix-round-10-T51.md` items 119, 122, 125, 127-134 whole, and `build/plan/walk-T51-alpha/BRIEF.md`.

## Bob's direction now (in `rulings-active.md`; K5257, K5258)

- **K5257:** "Deploy now. Once the deployment is done, do the live walk to learn about remaining real issues, but once the alpha deployment is done then change the focus to be development of the beta release with all of it's requirements included. Be efficient in your use of tokens, but don't defer work. Progress with a sense of urgency."
- **K5258:** "The alpha deployment must be available from the civicsmith.org website and through the installer. Tomorrow morning I'll install the alpha release under the throw-away Cloudflare account I created several days ago." and "Don't worry about fixing tests at this point if it means opening jobs just to fix the test. We need to rethink how to bring the tests up to date without spending a week doing so. That's a problem for tomorrow." So: no test-only job; the test work waits in `next.md` for that rethink.

## Open with Bob (asked by BOB #307, unanswered; ask again in one message at takeover)

1. **The stewards' contact address** (his K2799: no public release without it): (a) stewards@civicsmith.org, its forwarding verified first; (b) another address he names; (c) the alpha goes without one, civicsmith.org stays unindexed, named before the beta. BOB recommended (c).
2. **Approvals only he can type, in YOUR session** (auto mode refuses them each time; K4163, K3542): suggested text: "I approve, for release 0.87.0 in this session: the pushes to `dist/cut-0.87.0`, the release's `ssh-keygen -Y verify` signature checks, and the deploys of the installer (`newgroup`) and the site (`civicsmith-site`)." Then his one GitHub click approving the `release-sign` run (environment `release`).
3. **His morning install time** (time zone) sets the cut's deadline.
4. Start UX design #41 (U479) with `docs/development/ux-substrate/NEXT-SESSION-PROMPT.md`, on the account owning the screens page. Nothing waits on it.
5. Told: walker B printed the test copy's administrator sign-in once in its own tool output; walker A its throwaway account's recovery codes (no file, no commit); rotation is his.

## First

1. Take over (§5.1). My timers: backstop `trig_01LJz5ZPUpGMbExnhoRJdvPJ` (07:40Z), WATCH #307 `trig_01LPvAaLrunjEtEoocoPiM7m` (08:20Z into ROOT #7); delete both by id. Archive BOB #307 once idle; write its `BOB-final` row under T51.
2. `mail check` (filter `grep -v "pushed [0-9]\{3,\} min ago" | grep -v "→ nothing"`); premerge exactly as K5254-K5262 record it (ownership against `git merge-base`, one merge base; fixtures/architecture/words on a worktree of the job branch; merged tree checks; `rows.mjs` regenerated when words change). **A shallow clone makes `mail jobbranch` refuse and `merge-base` fail: `git fetch --depth=3000 origin tranche/T51 job/T51/<m>` first.** Archive each merged job with its row.

## Running (primary account; addresses in the plan's Jobs line)

- **Ten walk-cause jobs, K5265 (plan item 134):** STORE-ASSEMBLY #7, SCREENS-SETTINGS #23 (owes a CHANGE naming LOCAL-FACTS #11's zone op at its COMPLETE), SCREENS-DAILY #25 (owes a CHANGE at RETRIEVAL #32's merge: the passage route's `widen`), QUEUE-PRODUCERS #30, MACHINERY-PRODUCERS #9, SCREENS-INQUIRY #34, PUBLIC-READ #39, SCREENS-PUBLISH #27, SCREENS-INTAKE #29, FILE-SCANNER #14 (runs the pinned renderer image; may post BLOCKED). Plus RETRIEVAL #32, QUERY-LANGUAGE #14 (K5263), LOCAL-FACTS #11 (K5264). START files `build/plan/starts-T51-F10/<module>-k526[345].txt`.
- **Walker C is DONE** (record `build/plan/walk-T51-alpha/C.md` merged, 0 of 1 journeys whole; its money BLOCKER is D-B1's time zone, LOCAL-FACTS #11; its Find MAJOR 14 is F-B8, RETRIEVAL #32): run a diagnosis worker on its other 15 MAJORs, then place them. **Walker E is DONE** (record `E.md` merged, 2 of 4 journeys; its BLOCKER: a Noncompliant determination refused "does not bind this body ... record it as a benchmark comparison" with no such control, and the act's date unplaceable for want of a place (D-B1's cause, part); 7 MAJORs). Run one diagnosis worker over C and E together (as `causes-A.md` was made), then place their causes, one job per owning module (CHANGEs where a module's job is already running).
- **The cut, prepared locally only** in BOB #307's container (lost with it): `dist/cut-0.87.0` was `e4529a641d` (version cut, the shape of 0.86.0's `2ed10afbf1`; RELEASES gains `["0.86.0", "1a1715414958c6d99ca2ecd14b320b360266149f"]`) and `0e90afc166` (notes). Its two commits are saved as `build/plan/walk-T51-alpha/cut-patches/` (`git am` onto a fresh `dist/cut-0.87.0` from the tranche tip after the fixes merge, then regenerate). Redo it: the procedure, with every step that needs Bob, is `build/plan/walk-T51-alpha/alpha-cut.md`. Draft notes text: `build/plan/walk-T51-alpha/notes-0.87.0.json` (Bob reads them before signing; check every claim against the walk).

## Then, in order (plan item 131)

1. Merge every walk-cause job; walks C and E's causes placed the same way (one job per owning module; the design's gaps in one more HANDOFF after B529).
2. Regenerate the artifacts (manifest order), commit, `deploy-test/biosmoke8/dry-run` then `.../deploy` pushes (K5259's route, not refused under K5120); a targeted re-walk of what the fixes touched.
3. The cut (alpha-cut.md): version commit, images (`container-images.yml` on the cut push), `--record-image` x3, dry run, `release-sign.yml` (Bob's click), signature controls, installer rebuild, the installer and site deploys, BOB's rehearsal on a FRESH test copy in account `…7f72` (never Bob's throwaway account), then tell Bob it is ready. If the fixes run past his morning, cut from the deployed tranche so his install is not held; fixes follow as 0.87.1.
4. Then T52 opens as the beta with every requirement (K5257); the test rethink with Bob first (K5258).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first. Design commits of design files only are merged into the tranche when asked (K5224, K5260).
- `dist/cut-*` pushes: refused by auto mode every time; Bob's approval typed in the refused session (rulings-active §2; K4163, K4172 session-bound). Site and installer deploys: Bob's in-session approval (K1715) unless he gives it. biosmoke8 deploys: K5120, not refused.
- A delete of a routine into ROOT was refused by auto mode once (K5219): the WATCH above was created by me and is deleted by its id.

## Tools and limits

- Mail tool and checks: civicos-process `main` (`8be32ff`), `--product /home/user/bio --tranche T51`. START template: `build/plan/starts-T51-F10/screens-publish-k5219.txt` lines 1-9 (sed the name, item, depth line, module), then "Your job:" and a `**Done:**` line, as the k5265 files.
- `rulings-active.md` 78 lines, 24,985 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` about 48 KB of 51.2 KB: move finished items whole to `build/plan/archive/fix-round-10-T51-done-items.md` before an addition passes it (§17).
- Channel: read through U479; B529 (HANDOFF, the walk's design gaps) and B528 (NOTICE K5257) unread by UX-DESIGN.
