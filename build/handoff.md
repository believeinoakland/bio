# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #317 (`session_01224iDvCaoPmHYZNq2oLxtm`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #318, 2026-10-27, at 50 % of its window; no step half done, no job live. **T51b is OPEN** on `tranche/T51b`, its round R1 closed. Read whole: K5343, K5346, K5348, K5350, K5351 (`build/rulings.md`), then `next.md`'s first five sections.

## Bob's direction now

- **The alpha is out (K5350):** 0.87.0 signed, the installer (`newgroup` `ec1b82c9-9584-40da-801b-8926b0448a17`) and civicsmith.org (`civicsmith-site` `e5696abf-1554-47c0-95a2-2e3e48cc3d5a`) deployed, biosmoke8 on 0.87.0, the cut merged into the tranche (`d44c7e9d9`). Rollback: newgroup `fa4267b9-a38b-4302-8189-f7b233b1e45a`, site `97a23ece-8276-400b-9a24-3ee720abd6c2`.
- **Merges and every repository act are BOB's, never asked of Bob; his one development act is approving a GitHub release (K5346).** Releases: K5293. Code and test deploys: K5120.
- **The live walk follows the release, its findings T52's (K5348).** Test fixing waits until after the alpha, installer and site (K5343): that point is now reached.
- **Every ruling of BOB's goes through `proc ruling --line-file <f> [--files …]`** (K5351; never hand-numbered: K5349 was given twice).

## Waiting on Bob (asked by BOB #317 in its last report; P17, his: public visibility)

- Should civicsmith.org be listed by search engines yet? Today every page sends `noindex` because the site's `STEWARDS_ADDRESS` is unset (site R6); setting it to stewards@civicsmith.org (K5298) makes the site public. Options put: **A (recommended)** keep it unlisted until the beta; **B** make it public now. If he answers B: set `STEWARDS_ADDRESS` in `site/wrangler.jsonc`'s `vars`, deploy (`wrangler deploy` from `site/`, account `…7f72` only), check the header is gone and the address shows, ruling. Do not ask again.
- Bob's own install of the alpha under his throwaway account (K5258) is his to do when he chooses; a fresh install through the installer's Cloudflare consent has not been done by any session (bot protection; K4942). Nothing owed by BOB for it.

## Next, in order

1. **The live walk of 0.87.0 on biosmoke8** (`next.md` "The alpha's live walk"; `build/situations/deploy-and-walk.md`, `build/plan/walk-coverage-T51.md`): one complete pass, 5 walkers at once (sonnet, medium), every screen as administrator and member at 1280 and 390 px, re-walk 11's open rows named in `next.md`. Each defect becomes a T52 entry by cause (`fix-round.md`'s grouping); nothing of it is fixed in T51b.
2. **T51b's close** (`situations/merge-close.md`): `proc history --ref origin/main`; merge `main` into the tranche (never a rebase); the checks and the suites of modules changed since their last tested merge and their users' (K5339, never the whole suite); old reds named, never a reason to hold the close (K5343); Status `CLOSING`; PR `tranche/T51b` to `main`, merged with the GitHub tool; delete the backstop; report to Bob in plain words with `proc footprint`. The design stream's DEC-443 (K5315: held until after the alpha's deployment, now done) is asked of UX-DESIGN as its MERGE at this close.
3. **T52 opens as the beta (K5257)**, `next.md` first: adopt R14 (civicos-process PR #13 into `lane/process-redesign`, then that branch's PR to `main`) before T52's first test run; the test-fixing rethink Bob asked for (K5258) as a plan brought to him; the reds deferred at K5343 and K5350.

## State worth knowing

- `/home/user/cut` (worktree on `dist/cut-0.87.0`, its `node_modules` linked from `/home/user/bio`) and `/home/user/bob-wt` are leftovers: remove them (`git worktree remove --force`) before work that needs disk.
- The container's memory limit (about 15 GB, shared by every command) kills a test process that grows past it; run suites one at a time, never three at once (K5343). Until R14 lands, a suite with no summary is a NO RESULT to diagnose (kernel log `dmesg | grep -i killed`), never a red.
- `deploy-test.yml` cannot build a fresh copy (members deploy before the plane; a script copy has no store or secrets), and on the shared test account any copy's member run re-points the one `agent-worker` (K5350, `next.md`). Use it for biosmoke8 only.
- Lanes: PROCESS-REDESIGN ended (K5351). UX-DESIGN read through U487 (nothing unread at BOB #317's last read). JOURNEYS (W4), AI-DESIGN (A41), INVESTIGATION-DESIGN (H43), PERFORMANCE (P26): nothing new at BOB #317's takeover; read each at takeover.
- `rulings-active.md` is about 11 KB of its 25 KB.
