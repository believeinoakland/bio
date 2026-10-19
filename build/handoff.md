# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #225 (`session_0156d5zZSgV8PMUy52CP1rVA`, depth 1, parent ROOT #7, primary account), 2026-10-19 ~15:16 UTC, at ~45% context, with no step half done. **T51 is OPEN** on `tranche/T51`; **L11 running**. Read `build/rulings-active.md` whole, then with the Read tool, whole, K4083–K4099 (the last lines of `build/rulings.md`; `sed -n` the line numbers, the file is too large for one Read), then the plan's "Sequence", "L11", "L11 additions", the "Completion round" (CR-5, CR-12, CR-14, CR-15, CR-16, CR-17) and "BOB's acts" in `build/plan/current.md` (L11's entries in parts, every part).

## Standing

- **Bob is angry, rightly, that work slips** (K3913, K3919, K3921). Nothing leaves T51 except for P19's three reasons; a job's deferral that is not one of them is refused and re-opened by CHANGE (K4097).
- **Words:** setup-words R13 binds every sentence a member reads; tests never copy one (K3810); a slug or id drawn as text is a defect (K4094, K4097). Harness text goes to the design's unkeyed list by HANDOFF.
- **Design merges mid-layer (K4072):** a design MERGE adding rows running jobs need is merged at once (retired rows and changed placeholders checked against merged modules; script in my K4084), `node bio-plane/src/setup-words/build.mjs`, `--check`, then each job gets its rows by CHANGE quoted verbatim, then ACK and `xdone`, then ring UX design #32 (`session_01MBG5FH3gL4kdDPTNgGsGex`).
- **Merging:** a complete job merges when its same-layer `uses` are merged and it has read BOB's newest entry; **read every entry past your cursor before merging** (I once merged screens-settings at a tip whose J6 corrected J5). Scratchpad helpers `mt.mjs` (module tests filtered by argv) and `mergejob.sh <module> <K>` (fetch, ownership vs `git merge-base`, `git merge --no-ff`, the module's suite) are gone with my container: rebuild them (K4083 describes them). Then strike met `*(not yet met: T51)*` marks (some are mid-line), words over the merged modules, push.
- **Doorbells:** `run_once_at` the next whole minute; at most ~10 per minute (the 11th is refused: ring it a minute later).
- **The window:** 1,000,000. Refresh at 40%.

## L11 state

- **Merged (all of L11 but these):** everything up to and including screens-settings, screens-publish, screens-action, screens-intake, screens-investigate, screens-wizards, screens-entry, affordances, installer, installer-steps (K4083–K4098).
- **Re-opened by CHANGE, merge again when COMPLETE:** op-declarations (B8: `actionholdrelease` out of `ACT_HELP_ABSENT`, affordances R12's unaccounted, `heldat`'s classes; 3 reds accepted), installer-steps (B7: `why.pullfailed`), installer (#19 `session_011hjYKR44H9ywSxAQA6QTj8`: B9's steps 2–5, readGroup's envelope bug, F12 option A, B10: `confirmContainers` call and two rows), screens-action (B8: R30's checkpoint half, R30 still marked), screens-entry (B3: setup's scanner legends by display name), plane (B3: `filings`/`actionPlans` getters for `controlPlaneOwnerOps`).
- **Complete, waiting to merge:** control-plane (J2; uses screens-daily and screens-inquiry; at its merge drop `bio-plane/src/signpage.mjs`, `src/sign-release.html`, `scripts/embed-signpage.mjs` from its `paths` in `modules.json`, then format must read 0).
- **Working:** screens-daily (#9), screens-inquiry (#12 `session_017Kmaz4psUrUVmvttFcYbfb`, restarted K4094), journey-check (#7, last in order).
- **Then:** plane after control-plane; legacy-ui (J3, complete) after plane, then BOB's one act ("BOB's acts": `legacy-ui` row, `layers.md`, `MODULE_ORDER` via `order-build.mjs`, `regression.yml`:56, `.gitignore` lines; `.claude/settings.json`:15 is Bob's own edit); journey-check last.
- **Accepted reds by name:** site R9, R16 (four states) until `pages.mjs` regenerates at the close; installer R53 and `newgroup-bundle-fresh` until L11's close (R33's realsize tests read red only beside the bundle build: re-run at the close); setup-words' two (CR-14); op-declarations' 3 (K4098); interface-shell R100 until screens-inquiry merges; journey-check's local arms until installer merges (readGroup), dash-project (R22) until screens-inquiry, `/sign` (R25) until control-plane; instance-setup's 12 leaf texts (CR-12).
- **After L11's merges, BOB's wording edits:** answer-envelope R6, notice-producers R25, rule 7's list (requirement text naming the old interface); screens-daily's requirement still names the retired `queue.answered.photos`/`.granted`; screens-inquiry R71, R75 (J1's notes).

## Install situations (Bob asked, K4090, K4092)

The list `build/plan/install-situations.md` (S1–S13, F1–F13) is checked against the code: 16 handled, 10 partial, each partial one placed in installer or installer-steps (K4092, K4094, K4098). The Cloudflare API assumptions installer-steps J6 lists (application health, rollout status, restart by a second rollout, `memberVersions`) are checked on BOB's live walk after the cut; Bob was told nothing is proven on a real account until then.

## Design lane

Channel read through U395, posted through B382. Nothing unanswered from the lane. Open with it: nothing.

## Timers

My backstop (`send_later`, ~15:14) and WATCH #225 `trig_01JgqWFQ1S3LWMk6bPV4xVkM` (into ROOT, 15:55): delete the WATCH at takeover; my backstop fires harmlessly into my archived session.

## What comes next, in order

1. Take over (§5.1): archive BOB #225 once idle (BOB-final row under T51); WATCH and backstop.
2. L11: read, answer, CHANGE and merge as above, in `modules.json` order (journey-check last).
3. L11's close (§5.6): merge the design if it has moved, regenerate artifacts in the manifest's order (`npm ci --ignore-scripts` in agent-runner, file-scanner, site, `bio-plane/src/journey-check`; sheet-worker `npm ci`), `fleetbundles` and `newgroup-bundle-fresh` (`--test-force-exit`); `checks/run.mjs`; archive L11's sessions with rows.
4. The completion round (CR-5, CR-12, CR-14, CR-15, CR-16 before CR-12, CR-17), then the close (§5.7).

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by the tranche's close PR (§5.7 (3), K2273) and the design PR at the close on its MERGE (K1177); no refusal recorded.
- Never force-push. Job branches are fast-forwarded with plain pushes only (K3969).
- `git rm` in a job session: auto mode refuses it even for standing-list paths (K4070): Bob's approval in that session each time (§16).
- Deploys to biosmoke8 and the `civicos` Worker's removal: Bob's one-line approval in the refused session each time (rulings-active §2).

## Open with Bob

- None.
