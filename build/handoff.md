# Handoff

**Status** · Replaced whole at each handoff; holds only where things stand and what comes next. Written by BOB #171 (`session_01Fs3ssvftv2vnzcsoCT2fzJ`, secondary account, depth 1), 2026-10-14 ~13:45 UTC, at about 52% context, right after T48's L6 started (K3253) and the L11 design fold was reviewed (K3254); no step half done. Read `build/rulings-active.md` whole first (§4 gained the direct-reach rule, K3248); K3222–K3254 are this session's rulings.

## Where things stand

- **T48 open** on `tranche/T48`. **L1–L5 closed** (L3 K3233, L4 K3241, L5 K3252). **L6 running** (K3253): twelve jobs, sessions in the plan's Jobs line; merge order in `starts-T48/*.txt`. L8–L11 not started; their STARTs are written per layer as before (script pattern: `starts-T48/` texts, `build/plan/reading-sets.py`, next session numbers from rulings/archives).
- **Release 0.84.0** is live on biosmoke7 (K3237; all members SERVING through the plane, K3238) but **not ready**: Bob found Home "a mess" (K3248). WALK-084 #2 compared 60 live screens with the design mock (`build/plan/draft-T48-live-vs-design.md`, screenshots `build/plan/walk-084/`; K3250). Root cause C1: the design page's CSS never ships. The fix is **K3254's fold** (`build/plan/draft-T48-L11-design-fold.md`, reviewed, its open points settled), to be applied before L11's START (plan, "BOB's acts"). Rule 5 (8)'s acceptance of 0.84.0 is withdrawn; the next release follows L11 and journey-check R5/R6.
- **Debugging the live instance is BOB's, never Bob's** (Bob, K3248). Reach `*.believeinoakland.workers.dev` directly (`curl --noproxy '*'`, Chromium `--no-proxy-server`, node undici with the system CA): the agent proxy replaces `Authorization`. `JOURNEY_ADMIN_HANDLE`/`PASSWORD` (Bob's `sparky`) are in the environment for new sessions (this session saw only the handle). No member credential yet: BOB creates a test member itself once an administrator session works.
- **WALK-084 #3** (`session_01SaFvJbwTk3vfU6vDvHk1VB`) is investigating, read-only, why `sparky` is a member on biosmoke7 while Bob believes it is an administrator, and why Members' counts disagree with its rows. Read its final message, archive it, write its row (role `walk`), and act: a product defect becomes an L11 entry; a missing role is one act an administrator takes (tell Bob the one act only if no session can take it).
- **Channel:** UX-DESIGN read through U217; BOB's B188–B194 unread by it (B191 N933, B192 the C1 notice, B193 duty reason keys, B194 the fold's words and two questions). Lanes unchanged (investigation H43, actions H31).
- Bob's rulings this session: K3229 (meter 48%), K3230 (N933: B, a stake per matter; requirements drafted for T49, K3231), K3236 (0.84.0 deploy approved), K3248 (debug without him).

## What comes next, in order

1. **Take over** (§5.1): archive BOB #171, write its BOB-final row in `metrics/T48.csv`; delete its backstop and `WATCH #171` (`trig_01NcjMbYAVh2f51zQHkavDe4`, into ROOT #6); arm your own.
2. **Watch L6** (§5.4); merge each job in order; close L6 (regenerate per the manifest; agent-worker's bundle changes). Then L8, L9, L10.
3. **Before L11's START:** apply K3254's fold (requirements text, T48-85/86 and the "also" lines), with WALK-084 #3's findings; measure L11's reading sets.
4. Alongside (P18): `next.md` N1058; N1060's and N933's T49 entries are written.

## Acts on main or sessions (reviewed acts, §5.8)

- T48's close merges `tranche/T48` into `main` by PR with the GitHub merge tool, method merge (§5.7 (3); CLAUDE.md standing direction; standing list `mcp__github__merge_pull_request`); no refusal recorded.
- Deploys to biosmoke7 are Bob's approval in session each time (K1715; never on the standing list). The next deploy follows L11.

## Open with Bob

- **Translations** (N670's R88 and K3190's terms): Bob asked how publications are found; BOB's answer proposed **D (publish in the group's public index; Civicsmith's library and other groups pull; a pre-filled submission to the library by the member's hand) and (a) (the same terms as Civicsmith's own words)**. Waiting for "Translation: D, (a)" or another choice.
- **civicsmith.org's DNS and email** (K3060 D14); **the records-request template's reviewer** (N858).
