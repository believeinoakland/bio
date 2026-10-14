# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #172 (`session_01MiANWqYjrveVVJ3EzpQ39S`, secondary account, depth 1), 2026-10-14 ~14:25 UTC, at about 29% context (the new 30% threshold, K3271), right after L8's start and the effort revision; no step half done. Read `build/rulings-active.md` whole first; K3256–K3272 are this session's rulings.

## Where things stand

- **T48 open** on `tranche/T48`. **L1–L6 closed** (L6 K3267, K3270; bundles regenerated). **L7 has no job.** **L8 running** (K3270): seven jobs, sessions in the plan's Jobs line; CASE-CHECKER #12 on the default model, the other six on `claude-sonnet-5-5`, a measured trial (K3269): compare their `metrics/T48.csv` rows with L6's (185M tokens over 12 jobs, ~15M each). Each has START (B1) and the K3271 CHANGE (B2); all rung. Merge order and STARTs in `starts-T48/*.txt`. L9–L11 STARTs not yet written (pattern: the L8 script in K3270's commit; `build/plan/reading-sets.py`; next session numbers by `git grep -o "<MODULE> #[0-9]*" build/`).
- **The effort revision (Bob, K3271)** is on civicos-process `main` @ 3460207: a job reads its requirements, entries, layer contract, own code, the used services its entries touch and the tests naming a requirement its entries change (its other tests run, not read); **BOB refreshes at 30%**; a module whose only entries change no behavior may wait up to three tranches, the plan naming each wait (P19). Write every later START's reading-set line to the new rule (no digest helpers), and apply the P19 wait when writing L9–L11 STARTs and T49's plan. Bob's directive (K3269): cut tokens per tranche; report tokens per tranche and per job beside the work.
- **biosmoke7** is discarded (Bob, K3260); `bobux` too (Bob, K3263). At the release after L11: install `biosmoke8` (Bob founds it), re-point `agent-worker` and `civicos`, then remove the `biosmoke7` worker and `biosmoke7_Store`, and `bobux` with `bobux_Store` (K3262; `build/plan/draft-T48-biosmoke7-inventory.md`; shared workers, containers, R2 stay). Then `JOURNEY_ADMIN_*` must name biosmoke8's founder (Bob's one act in the environment settings, walked through then). There is no default password (credentials R1); `sparky` is a member (K3258); T48-87 fixes Members' administrator count.
- **Founder's handle (Bob, K3265, "B")**: N1072 for T49; the draft `build/plan/draft-T49-N1072-founder-handle.md` (a worker's) is to be reviewed before T49 opens; its UX doubts go to UX-DESIGN.
- **Fan-out fixes (K3268)** in rulings-active §5; N1073 (tests that hand-list others), N1074 (service index, process tooling), N1075 (all member words by key, decided A under Bob's delegation, K3269).
- **Channel:** UX-DESIGN read through U217; BOB's B188–B196 unread by it (B195 biosmoke7, B196 founder handle). Lanes unchanged (investigation H43, actions H31).

## What comes next, in order

1. **Take over** (§5.1): archive BOB #172, write its BOB-final row; delete its backstop `trig_01NTK1ryztVThkcpuvWiMTe2` and `WATCH #172` (`trig_01LfWK5kMvmBsJoiPZ58WTRv`, into ROOT #6); arm your own.
2. **Watch L8** (§5.4); merge in order; close L8 (regenerate: case-checker's `program.mjs` then bundles). Record the model trial's result as a ruling. Then L9, L10.
3. **Before L11's START:** apply K3254's fold (`draft-T48-L11-design-fold.md`), T48-87, and the "also" lines; STARTs under K3271.
4. Alongside (P18): review the N1072 draft; list N1073's hand-listing tests (a worker).

## Acts on main or sessions (reviewed acts, §5.8)

- T48's close merges `tranche/T48` into `main` by PR with the GitHub merge tool, method merge (§5.7 (3); CLAUDE.md standing direction; standing list `mcp__github__merge_pull_request`); no refusal recorded.
- Deploys and Cloudflare removals are Bob's approval in session each time (K1715; never on the standing list).

## Open with Bob

- **Translations** (N670's R88, K3190): waiting for "Translation: D, (a)" or another choice.
- **civicsmith.org's DNS and email** (K3060 D14); **the records-request template's reviewer** (N858).
