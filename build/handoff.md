# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #318 (`session_018BhcecvoXTMTpRGK9c3KwB`, depth 1, parent ROOT #10 `session_01XHjMEPkzmkLycoWtxb4yn6`; Bob's primary account) for BOB #319, 2026-10-27, at 40 % of its window; no step half done, no job live. **T52 is OPEN** on `tranche/T52` (the beta, K5257), round R1 open, **layer 1 closed** (5 jobs merged and archived), layer 2 next. Read whole: K5354, K5355, K5357 (`build/rulings.md`), then `build/plan/current.md` (R1's plan, 98 entries) and `next.md`'s last section ("The alpha's live walk, placed").

## Bob's direction now

- **T52 is the beta with all of its requirements (K5257).** T51b is closed into `main` (PR #44, `13c83a9ae72`, K5355): 0.87.0 released, its live walk done, its causes placed as R1's W1-W33.
- **Merges and every repository act are BOB's, never asked of Bob; his one development act is approving a GitHub release (K5346).** Releases: K5293. Code and test deploys: K5120.
- **Every ruling of BOB's goes through `proc ruling --line-file <f> [--files …]`** (K5351). Note: `--files` commits only files already tracked; `git add` a new file first (K5354's placement files needed a second commit).

## Waiting on Bob (asked by BOB #318; do not ask again)

- **The tests' rethink, A or B** (K5258, K5313): `build/plan/tests-rethink-T52.html`, published at https://claude.ai/artifact/NxCe76s3zv5gtBJFiCReCd. A (recommended): one tooled sweep in BOB's session (English assertions to word keys; the words check refuses English in tests; each K5339/K5343 red run once and sorted), about a day, no job opened for tests; B: each job converts its own module's tests. R1's plan leaves the sweep out with this reason. When he answers A: the sweep is a §5.10 mechanical pass while no job runs (between layers), `proc tests` (R14) for its run.
- **civicsmith.org listed by search engines** (BOB #317's question; A recommended: unlisted until the beta). Do not ask again; if he answers B, the handoff of BOB #317 (in `git log -- build/handoff.md`) says how.

## Next, in order

1. **Layer 2 of R1** (`situations/layer.md`): `get_session` for `rate_limit_info.status`, then `proc layer start --tranche T52 --layer 2 --usage <status>`, then each printed `create_session` exactly (model `claude-sonnet-5-5`; haiku only for test-only, wording-only or mechanical re-points) and `proc job started`. Layer 2: member-roster (W3), membership (W4), promotion (K5339 red). Then layers 3, 5, 6, 8, 9, 10, 11 in order (4 and 7 have no entries); BOB's acts named in the plan's header before each layer's START (requirement lines the entries name, e.g. provenance's releasable-bundle helper before layer 3; entities' requirement for W6 before layer 5).
2. **On each COMPLETE:** `proc merge --module <m> --context <your %>`. A job that set its own record to WAITING after COMPLETE is refused by merge: tell it to run the complete command again (PDF-PIXELS did; K5366). Fold any requirement wording a job proposes yourself (it cannot edit `build/requirements/`), wording only, K3268.
3. **UX-DESIGN #42** (`session_018BhcedaAqFXn43yDDqk4vj`, started by BOB #318, K5356) works B541 (the walk's 35 design items and five screen questions: C-K2, C-K6, B-K19 go to Bob through it; D-K9, E-K7 it answers itself). Its answers fold into the waiting parts of W8, W27, W29, W31, W32 once on `main` or merged into the tranche from its MERGE.
4. **P18 alongside:** draft the requirements of N1259 (registers), N1260 (follow the trail), N1257 (places in layers), N1266/N1267 (file types and sizes; Bob's study first, K4632), N1273 (region picker), as R1's "Left out" names them; bring Bob only what is his (P5, P17), with options.
5. After R1's last layer: R2 from what R1 left plus anything found; then T52's redeploy and the measuring walk (R1 header, BOB's act 7).

## State worth knowing

- `/home/user/bio/w` (walker C's leftover scripts and a saved sign-in state) is excluded from git by `.git/info/exclude`; its delete was refused for walker C, so it was not deleted (never retry a refused act another way). It goes with the container.
- civicos-process `main` is `ed176c4` (R14 merged, K5355): `proc tests --modules <m1,m2> [--users]` runs a pass's suites with the memory watch; a missing result names its cause.
- Lanes: UX-DESIGN read through U489. JOURNEYS (W4), AI-DESIGN (A41), INVESTIGATION-DESIGN (H43), PERFORMANCE (P26, archive file P1-P26; new findings from P27): nothing new at 06:48Z; read each at takeover.
- The live walk's records and causes: `build/plan/walk-T51b-live/` (A-E, causes-A-E, placement-*.md). Shared-copy leftovers of the walk are listed in each record (projects "Walk 087 <A-E>", a review grant to "Dana Reviewer" live until 2026-11-10).
- `rulings-active.md` is about 11 KB of its 25 KB.
