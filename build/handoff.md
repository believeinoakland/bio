# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #175 (`session_01VJdBoqbxFGdpKcKeGRqzKp`, secondary account, depth 1), 2026-10-14 ~17:40 UTC, at about 34% context, with L11 closed and no step half done. Read `build/rulings-active.md` whole first; K3301–K3316 are this session's rulings. L11 tokens 704.3M (29 jobs; K3316).

## Where things stand

- **T48 open** on `tranche/T48`. **L1–L11 closed.** L11's close (K3316): all 29 jobs merged (K3297–K3299, K3301–K3315, marks struck), artifacts regenerated in the manifest's order and verified (fleetbundles and newgroup-bundle-fresh 0 fail, no skip), `checks/run.mjs` 0 failures in format, architecture, coverage (5,393 of 5,393 ids) and channels; the 29 sessions archived with rows (see K3316 for any refused archive).
- **Accepted reds still in force:** C-137.26 `BAD_PROCEEDING_DATES` until T49's stamp (K3290); the rule-5 reds of K3280–K3283. All L11 reds named in K3297–K3313 are cleared.
- **journey-check:** R1 (a) walks the composed product end to end, 92 steps, 0 failures (JOURNEY-CHECK #3 J5). Its tests need `npm ci` in `bio-plane/src/journey-check` (playwright-core) in a fresh container. For the release: the ASSETS_COMMIT note and a member credential in the environment (J2).
- **Channel:** UX-DESIGN read through U232 (design #14, `session_01Mbk3ejwX9p2JnHFTA6C8mh`); B205 ACK posted. DEC-235–DEC-238 owed work is next.md N1089–N1092, folded once PR #36 is on `main`. Lanes unchanged (investigation H43, actions H31).
- **PR #36** (design stream, `claude/gallant-brown-zg0wc1`, draft, mergeable clean at 16:45): MERGE asked in U220; its head has moved since (DEC-235–238). Precedent K3194: mark it ready, then merge at its current head.
- **T49:** `build/plan/draft-T49-plan.md` settled (K3292) plus K3296–K3298's additions; next.md gained N1084–N1092 this session (instance-setup's split, P6; standards R57 `project`; exploregraph fields and labels; imported list; Home's DEC-218 readings; DEC-235–238).
- **Timers:** backstop `trig_01V6UZPANbtgraP94TFLkLK1` fired 17:30 (re-armed by me only if L11 still ran: delete any `BOB #175 backstop` you find); `WATCH #175` `trig_01QSJwGG8xnPUPbz6Sr5pAkw` into ROOT #6 at 18:10. Delete both at takeover.

## What comes next, in order

1. **Take over** (§5.1): archive BOB #175, write its BOB-final row; delete its timers (above); arm your own `WATCH` (no backstop needed: no layer runs).
2. **Close T48** (§5.7): (1) mark PR #36 ready and merge it into `main` (method merge), then merge `main` into `tranche/T48` (never a rebase; keep the stream's text in any conflict); run `checks/run.mjs` and every module's tests (`module-tests.mjs`, K1708, K2704), with `npm ci` where a suite needs it (bio-plane, agent-runner `--ignore-scripts`, sheet-worker, file-scanner, journey-check); (2) move `current.md` to `archive/T48.md`, Status `CLOSING`, each entry's outcome and the tranche's measured usage (`build/metrics/T48.csv`); (3) PR `tranche/T48` → `main`, merged with the GitHub merge tool, method merge; (4) delete the `WATCH`; (5) report T48 to Bob and ask his meter reading.
3. **Fold DEC-235–DEC-238** (N1089–N1092) into requirements once PR #36 is on `main`.
4. **The release to biosmoke8** (K3260, K3262) and the walk as administrator and member (K3052); Bob is told it is ready only after that walk passes on every screen (K3296). Each deploy and removal is Bob's approval in session (K1715).
5. **Open T49** from the settled draft at once (§5.2), re-tested against T48's Outcome.

## Acts on main or sessions (reviewed acts, §5.8)

- PR #36's merge into `main`: §5.7 (1), §13.1 item 5, the design stream's MERGE (U220); authority is Bob's standing direction in CLAUDE.md (K1177); standing list `mcp__github__merge_pull_request`; marking it ready follows K3194's precedent. No refusal recorded.
- `tranche/T48` → `main` by PR with the GitHub merge tool, method merge (§5.7 (3); K2273); no refusal recorded.
- Deploys and Cloudflare removals (biosmoke8 install, biosmoke7 removal, the site's Worker) are Bob's approval in session each time (K1715; never on the standing list).

## Open with Bob

- **The stewards' contact address** (N923; civicsmith.org and any public release wait on it, K2799, K3296).
- **Translations** (N670's R88, K3190): waiting for "Translation: D, (a)" or another choice.
- **civicsmith.org's DNS and email** (K3060 D14): walked with Bob after T49-23 is proven (K3296).
- **The records-request template's reviewer** (N858).
- (The design stream's own S23 to Bob: who sees a watch and a flag, DEC-238; provisional answer stands.)
