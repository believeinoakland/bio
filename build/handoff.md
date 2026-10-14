# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #170 (`session_017ePgfoaM3MPJN7L57DySNv`, secondary account, depth 1), 2026-10-14 ~11:00 UTC, at about 55% context, right after T48's L2 closed (K3220), no step half done. Read `build/rulings-active.md` whole first; K3188–K3220 are this session's rulings (grep them in `build/rulings.md`).

## Where things stand

- **T47 closed** (PR #35, `main` @ 73269639e8, K3194); PR #34 (DEC-227, DEC-228, T48's words) merged (`main` @ 4664e8efd4). T47 was reported to Bob.
- **T48 open** on `tranche/T48` (K3195): 83 jobs (`build/plan/current.md`; T48-81–83 added by K3207). **Every layer's requirement text is folded** (L1 K3197, L2 K3198, L3–L5 K3203, L6 K3206, L8–L10 K3207, L11 K3214, with K3211's `lookedsince`). **L1 and L2 closed** (K3209, K3220): all merged, artifacts regenerated and verified, sessions archived, rows in `metrics/T48.csv`. No job session is live.
- **legacy-ui stays** (K3190, DEC-228): the design stream draws its 21 gaps from DEC-229; U216/U217 answered the census.
- **Release 0.84.0** cut on `dist/cut-0.84.0` @ 0f31ff9d73 (K3217; report `build/plan/draft-release-0.84.0.md`; it merged the never-merged 0.83.0 cut). **Signing run 38550200586 waits on Bob's approval** in GitHub's `release` environment.
- **Channel:** UX-DESIGN read through U217; BOB's B188 (opening asks), B189 (duty reasons), B190 (L11 words) not yet read by it. The lanes' HANDOFFs unchanged (investigation H43, actions H31).

## What comes next, in order

1. **Take over** (§5.1): archive BOB #170, write its BOB-final row in `build/metrics/T48.csv`; delete its backstop and `WATCH #170` (`trig_0146X5B6uVUazfZTbzLVaH8B`, into ROOT #6) and arm your own.
2. **Start L3** (§5.3): host-governor, provenance, acquisition, capture (T48-13…16; merge order in the plan). Write STARTs as `starts-T48/` does (reading sets by `build/plan/reading-sets.py`; next session numbers from the archives). Then L4…L11, folding nothing more unless a job's question changes a requirement. At each layer close regenerate per the manifest (K1540's order; `npm ci` in agent-runner `--ignore-scripts` and sheet-worker after a container restart).
3. **Release 0.84.0, after Bob approves run 38550200586:** the seven `ssh-keygen -Y verify` controls; step 8 rebuilds the installer embedding the signed release and **commits `newgroup/src/release.mjs` with the bundle** (it clears installer's three embed reds); merge `dist/cut-0.84.0` into `tranche/T48` (K2273, K3217); then each deploy to `biosmoke7` is Bob's approval in session (K1715, K1716): walk him through each; rollback targets in the report. Before telling Bob it is ready, sign in as administrator and as member and look at every screen (K3052).
4. Alongside (P18): `next.md` N1059 (file-scanner's split map), N1060 (a refused sign-in and run credentials), N1058. Owed by BOB between tranches: N1047's workflow step (a cut commits `release/notes/<V>.json`, signs and publishes the notice), N898.

## Acts on main or sessions (reviewed acts, §5.8)

- T48's close merges `tranche/T48` into `main` by PR with the GitHub merge tool, method merge (§5.7 (3); CLAUDE.md standing direction; standing list `mcp__github__merge_pull_request`); no refusal recorded.
- Deploys to `biosmoke7` are Bob's approval in session each time (K1715; never on the standing list).

## Open with Bob

- **Approve signing run 38550200586** (github.com/believeinoakland/bio/actions/runs/38550200586 → Review deployments → tick `release` → Approve and deploy).
- **His weekly meter reading** (the session shows a seven-day `allowed_warning`; K2341's 80% pause stands).
- **How a translation reaches Civicsmith** (N670's R88): A an address he names (recommended), B a receiving service, C not yet.
- **The terms a group's offered translation ships under** (legal exposure, K3190): (a) the same terms as Civicsmith's own words, naming Civicsmith's licence (recommended), (b) a contributor agreement per group, (c) later.
- **civicsmith.org's DNS and email** (K3060 D14); **the records-request template's reviewer** (N858); **N933** through the actions lane.
