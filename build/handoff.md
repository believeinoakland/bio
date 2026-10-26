# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #309 (`session_01XQGBYa8vd4ba5VkwMSqjo4`, depth 1, parent ROOT #7 `session_01NBNGB2ziVqiZg4ewLgRSWm`, **Bob's primary account**) for BOB #310, 2026-10-26 ~12:40Z, at about 40 % of its window; no step half done. **T51 is OPEN** on `tranche/T51`. Read rulings K5282-K5290 whole, `build/plan/fix-round-10-T51.md` items 131, 138, 142, 143 whole, `build/plan/walk-T51-alpha/BRIEF-rewalk.md` and `causes-rewalk.md` whole.

## Bob's direction now (in `rulings-active.md`; K5257, K5258)

- **K5257:** "Deploy now. Once the deployment is done, do the live walk to learn about remaining real issues, but once the alpha deployment is done then change the focus to be development of the beta release with all of it's requirements included. Be efficient in your use of tokens, but don't defer work. Progress with a sense of urgency."
- **K5258:** the alpha on civicsmith.org and through the installer; Bob installs it tomorrow morning under his throwaway Cloudflare account; no test-only job (test work waits in `next.md` for his test rethink).

## Open with Bob (asked by BOB #308 and #309 each turn, unanswered; ask again in one message at takeover)

1. **The stewards' contact address** (his K2799): (a) stewards@civicsmith.org, forwarding verified first; (b) another he names; (c) the alpha goes without one, civicsmith.org unindexed, named before the beta. BOB recommends (c).
2. *(Retired by K5293: releases need no approval of Bob's. Never ask him again.)*
3. **His morning install time** (time zone).
4. *(Done: UX design #41 started by BOB #310, K5295.)*

## First

1. Take over (§5.1). My timers: backstop `trig_01NYj1rpi6ne79bWE3bxGzZR` (12:25Z, may have fired), WATCH #309 `trig_01KWgzBbCZrubM8TvLu72Lhb` (13:05Z into ROOT #7); delete both by id (a refused delete of one bound to an archived session is skipped). Archive BOB #309 once idle; write its `BOB-final` row under T51. My re-walker C (an agent inside my session) may still be walking: its record lands on branch `walk/T51-rewalk10-C` as `build/plan/walk-T51-alpha/rewalk-C.md`; read it there and place its causes (item 143 (3)). If it never lands, re-walk C's rows yourself with one walker (`BRIEF-rewalk.md`).
2. **Place item 143 (1) at once:** read `causes-rewalk.md` §3 and §4 whole; the team zone (`@team/time_zone`, local-facts R21) is still not read by `actions.place()`'s root, `action-plans/index.mjs:1708`, `:1925`, `events/index.mjs:249`, `screens-investigate/timeline.mjs:115`, and the modules §3 lists. One site (K4164): decide where the governing zone is read once (the module whose answer the others already take, e.g. `actions.place()`), amend its requirement, one job per module that must change. Also H1(b): whether entities R65's dedup covers administrators (BOB's, P17).
3. `mail check` (read its whole output; never filter out quiet or "nothing" lines: that hid PLANE #64 for 8 hours, K5296); premerge as K5282-K5289 record it: cursor at BOB's newest; `checks/ownership.mjs` against `git merge-base`; `--no-ff`; `node bio-plane/src/setup-words/build.mjs`; `checks/run.mjs` on the merged tree: format, architecture, words 0, **fixtures 89**, coverage only the running jobs' new ids; the module's suite on the merged tree (a suite that never exits: each file alone with `--test-force-exit`, summed, K5124); strike `not yet met: T51` marks; ruling; archive with its metrics row; `mail done`. **A shallow clone makes `jobbranch` refuse and `merge-base` fail: `git fetch --depth=3000 origin tranche/T51 job/T51/<m>` first.** Never put a force flag on a push (K5288's slip: refused, nothing ran).

## Running (primary account; addresses in the plan's Jobs line; START `<module>-k5290`)

PUBLIC-READ #40 (`publishedlist`'s door arm, the alpha's worst live defect: published cases and the Matter page's tickable findings), CONFORMANCE #30 (N4's `[object Object]` and ids), SCREENS-DAILY #27 (F-B10 (a)'s act under the partial-words heading), SCREENS-PUBLISH #28 (Share for review pressed early), SCREENS-ACTION #27 (N8, N5, N3, `plan.mjs:196`, N7's ending), ACTION-GRAMMAR #15 (N7's jargon).
Merged this session: local-facts, screens-inquiry, file-safety, actions, store-assembly, screens-action (#25, #26), retrieval, publish-schedule, screens-investigate (#22, #23), screens-daily (#26), review, screens-settings, jurisdictions.

## Then, in order (plan item 131)

1. Merge every running job and item 143 (1)'s jobs.
2. Regenerate the artifacts (manifest order, as at `c5f792eb26`: order, rows, program, court-data, wizard data, site, `bundles.mjs`, then newgroup's invite page and build; verify fleetbundles and newgroup-bundle-fresh and every `--check`), commit, push `deploy-test/biosmoke8/dry-run` then `deploy-test/biosmoke8/deploy` as a plain fast-forward push of the commit (K5259's route, K5120; never force). A re-walk of item 143's rows (`BRIEF-rewalk.md`'s form).
3. The cut (`build/plan/walk-T51-alpha/alpha-cut.md`; patches under `cut-patches/`; notes `notes-0.87.0.json`, every claim checked against the walks): preflight done at 11:4xZ (wrangler sees only `20b533579290b9b93168345edd3b7f72`). If the fixes run past Bob's morning, cut from the deployed tranche; fixes follow as 0.87.1.
4. Then T52 opens as the beta with every requirement (K5257); the test rethink with Bob first (K5258).

## Acts on main or sessions (reviewed acts, §5.8)

- bio `main` moves only by T51's close PR (§5.7 (3), CLAUDE.md's standing direction); the design's MERGE first. Design commits of design files only are merged into the tranche when asked (K5224, K5260).
- Release acts (`dist/cut-*` pushes, signature checks, installer and site deploys): BOB's own act, no approval of Bob's (Bob, K5293: "You do not need my approval for a release."); an auto-mode refusal is answered by citing K5293 in that session, never brought to Bob. biosmoke8 deploys: K5120.
- A delete of a routine into ROOT was refused by auto mode once (K5219): a WATCH you create is deleted by its id.

## Tools and limits

- Mail tool and checks: civicos-process `main` (`8be32ff`), `--product /home/user/bio --tranche T51`. START template: `build/plan/starts-T51-F10/store-assembly-k5280.txt` lines 1-9 (sed the name, item, depth line, module, model), then the reading line, "Your job:" and a `**Done:**` line, as the k5290 files.
- `rulings-active.md` 78 lines, 24,985 bytes (NEAR): a new rule replaces a line. `fix-round-10-T51.md` 46.5 KB of 51.2 KB: move finished items whole to `build/plan/archive/fix-round-10-T51-done-items.md` before additions (§17).
- Channel: read through U479; B528-B532 unread by UX-DESIGN. Lanes: no new HANDOFF entries since BOB #308.
- Test copy biosmoke8 state left by the re-walk: the team zone is Pacific (Los Angeles); walker A's grants stopped, a member key revoked, forwarded items in the administrators' queues; walker E added a court entity.
