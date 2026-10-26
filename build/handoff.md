# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #308 (`session_01JmJgPapRn7Mb6tG9Cmb7pP`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #309, 2026-10-26 ~09:30Z, at 40 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. Read rulings K5267-K5280 whole, `build/plan/fix-round-10-T51.md` items 131, 134-138 whole, and `build/plan/walk-T51-alpha/BRIEF.md`.

## Bob's direction now (in `rulings-active.md`; K5257, K5258)

- **K5257:** "Deploy now. Once the deployment is done, do the live walk to learn about remaining real issues, but once the alpha deployment is done then change the focus to be development of the beta release with all of it's requirements included. Be efficient in your use of tokens, but don't defer work. Progress with a sense of urgency."
- **K5258:** "The alpha deployment must be available from the civicsmith.org website and through the installer. Tomorrow morning I'll install the alpha release under the throw-away Cloudflare account I created several days ago." and "Don't worry about fixing tests at this point if it means opening jobs just to fix the test. We need to rethink how to bring the tests up to date without spending a week doing so. That's a problem for tomorrow." So: no test-only job; the test work waits in `next.md` for that rethink.

## Open with Bob (asked by BOB #308 at 07:52Z and repeated each turn, unanswered; ask again in one message at takeover)

1. **The stewards' contact address** (his K2799: no public release without it): (a) stewards@civicsmith.org, its forwarding verified first; (b) another address he names; (c) the alpha goes without one, civicsmith.org stays unindexed, named before the beta. BOB recommends (c).
2. **Approvals only he can type, in YOUR session** (auto mode refuses them each time; K4163, K3542): "I approve, for release 0.87.0 in this session: the pushes to `dist/cut-0.87.0`, the release's `ssh-keygen -Y verify` signature checks, and the deploys of the installer (`newgroup`) and the site (`civicsmith-site`)." Then his one GitHub click approving the `release-sign` run (environment `release`).
3. **His morning install time** (time zone) sets the cut's deadline.
4. **Start UX design #41** with `docs/development/ux-substrate/NEXT-SESSION-PROMPT.md`, on the account owning the screens page. Now matters: HANDOFFs B529, B530 (walk E C2a's last layer, the blocker: no screen sends `standardinforcethrough`, `standardadoptbody`, `standardimpose` or a benchmark comparison) and B531 (missing words) are unread by UX-DESIGN.
5. Told: walker B printed the test copy's administrator sign-in once in its own tool output; walker A its throwaway account's recovery codes (no file, no commit); rotation is his.

## First

1. Take over (§5.1). My timers: backstop `trig_01A9VbomPHrTxqvgwViRuXPq` (09:46Z), WATCH #308 `trig_01BTJnJoPucMtjVcErxJmKSw` (10:26Z into ROOT #7); delete both by id. Archive BOB #308 once idle; write its `BOB-final` row under T51.
2. `mail check` (filter `grep -v "pushed [0-9]\{3,\} min ago" | grep -v "→ nothing"`); premerge as K5267-K5280 record it: cursor at BOB's newest; `checks/ownership.mjs` against `git merge-base`; merge with `--no-ff`; `node bio-plane/src/setup-words/build.mjs` (regenerate `rows.mjs`); `checks/run.mjs` on the merged tree: format, architecture, words 0, **fixtures 89** (any more is a new hand-built answer: hold the merge, CHANGE the job, as K5279), coverage only the running jobs' new ids; strike the job's `not yet met: T51` marks; ruling; archive with its metrics row; `mail done`. **A shallow clone makes `jobbranch` refuse and `merge-base` fail: `git fetch --depth=3000 origin tranche/T51 job/T51/<m>` first.**

## Running (primary account; addresses in the plan's Jobs line)

- **SCREENS-INQUIRY #34** (CHANGE B91: its `t51-fix11-b89.test.mjs:78` hand-built `contradictionfacts` answer to contradiction's fixture; then merge, K5279). **SCREENS-INVESTIGATE #22** (CHANGE B47: `testimony:` source, `BAD_VALIDITY` before the period detail; K5276). **SCREENS-ACTION #25** (B52: draw action-plans' `ADDRESSEE_INCOMPLETE` and `start`; its H1 test waits on ACTIONS #28; send it a CHANGE when actions merges). **ACTIONS #28** (R111; RESUME B11 sent at 08:56). **LOCAL-FACTS #11** (D-B1, the team's zone `@team/time_zone`; RESUME B6 at 09:26; at its COMPLETE send SCREENS-SETTINGS #23 a CHANGE naming the op and fields, then merge both). **SCREENS-SETTINGS #23** (waits on that CHANGE; its J46 COMPLETE has A-01 only). **FILE-SAFETY #24** (R59; running its suite). **STORE-ASSEMBLY #8** (haiku; C-M8's document names into explore, K5280).
- Merged this session: retrieval, query-language, public-read, store-assembly #7, queue-producers, screens-publish, screens-intake, file-scanner, extraction, conformance, contradiction, screens-daily, citation, csv-reader, machinery-producers, explore, action-plans, interface-shell.

## Then, in order (plan item 131)

1. Merge every running job (above).
2. Regenerate the artifacts (manifest order; `program.mjs` and the plane bundle are stale from conformance), commit, `deploy-test/biosmoke8/dry-run` then `.../deploy` pushes (K5259's route, K5120); a targeted re-walk of what the fixes touched (walk C's C-M1 confirms `at: null` live; walk E C2a stays blocked on the design until UX design #41).
3. The cut (`build/plan/walk-T51-alpha/alpha-cut.md`; its two patches under `cut-patches/`; draft notes `notes-0.87.0.json`, every claim checked against the walk): version commit, images (the renderer image carries FILE-SCANNER's ZIP64 fix), `--record-image` x3, dry run, `release-sign.yml` (Bob's click), signature controls, installer rebuild, installer and site deploys, BOB's rehearsal on a FRESH test copy in `…7f72` (never Bob's throwaway account), then tell Bob it is ready. Preflight done at 07:53Z: wrangler sees only `20b533579290b9b93168345edd3b7f72`; rollback targets newgroup `fa4267b9-a38b-4302-8189-f7b233b1e45a`, civicsmith-site `97a23ece-8276-400b-9a24-3ee720abd6c2`. If the fixes run past his morning, cut from the deployed tranche; fixes follow as 0.87.1.
4. Then T52 opens as the beta with every requirement (K5257); the test rethink with Bob first (K5258). The round end's full run reads the reds jobs found on the tip (plan item 138 (3)).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first. Design commits of design files only are merged into the tranche when asked (K5224, K5260).
- `dist/cut-*` pushes: refused by auto mode every time; Bob's approval typed in the refused session (rulings-active §2; K4163, K4172 session-bound). Site and installer deploys: Bob's in-session approval (K1715) unless he gives it. biosmoke8 deploys: K5120, not refused.
- A delete of a routine into ROOT was refused by auto mode once (K5219): the WATCH above was created by me and is deleted by its id.

## Tools and limits

- Mail tool and checks: civicos-process `main` (`8be32ff`), `--product /home/user/bio --tranche T51`. START template: `build/plan/starts-T51-F10/screens-publish-k5265.txt` lines 1-9 (sed the name, item, depth line, module), then "Your job:" and a `**Done:**` line, as the k5271 files.
- `rulings-active.md` 78 lines, 24,985 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` about 50.6 KB of 51.2 KB: move finished items (100-138 as they finish) whole to `build/plan/archive/fix-round-10-T51-done-items.md` before any addition (§17).
- Channel: read through U479; B528-B531 unread by UX-DESIGN.
