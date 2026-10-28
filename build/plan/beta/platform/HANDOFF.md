# PLATFORM: handoff

**Status** · PLATFORM #1 (Sonnet), lane `lane/platform`, started 2026-10-27 by BOB #320; BOB now #321 (`session_018BhcefWqhwJGg3zA2NE2PZ`; T53's Status line still names #320). Entries `P-n`; section 0 is rewritten whole after every entry.

## 0. State now and next steps

**Handover (PLATFORM #1 at about 37 % context).** PLATFORM #1 asked BOB to start PLATFORM #2; credentials do not transfer (`study/s1-tooling-notes.md`).

**Branch.** `lane/platform`; PR #47 merged; BOB merges this folder at his checks (lane branches directly). Push with `git -c http.version=HTTP/1.1 push origin lane/platform`; merge `tranche/T53` in first.

**Drafts (this folder; each a PL-line set for PLANNING).**
- `time-budgets-draft.md` **READY**: 13 classes (nine plus AI act, Gate 1 run, follow, explore), PL1-PL8; the bar kept at every level (K5438). Figures for AI act (60 s) and Gate 1 run (30 min) are mine, to be confirmed by AI-DESIGN's measurements.
- `combined-read-and-fold-draft.md` **READY**: fold and combined read, PL10-PL17; two technical points BOB's.
- `load-test-draft.md` **READY**: PL40-PL43 (`load-check`, built in R1 by K5448), the `eu` rehearsal, per-type load from FILES F5, archive fan-out (C12).
- `record-placement-draft.md` **READY** for placement and the picker (K5440, K5441, K5443; Cloudflare's pages quoted 2026-10-27); the split (§4) superseded by S0.
- `whole-record-move-draft.md` **READY** (K5569): PL50-PL57 for `corpus-export` and the installer's import.
- `service-levels-draft.md` **READY** (K5569): Team / Institution / Enterprise = Levels 1 / 2 / 3 (K5442), PL20-PL29 (the install's level choice, outgrowing at 70 % / 90 %); figures not yet measured; Enterprise quoted, not measured (K5454).
- `levels-2-3-study-plan.md` **PLAN** (K5444, K5448): S0 done, S1 under way, S2 two prototypes (B, C), S3 quoted, S4 report to Bob.
- `study/`: `table-inventory.md` (+TSV), `s0-options-for-the-split.md`, `s1-steps.md`, `s1-results.md`, `s1-tooling-notes.md`, `second-copy-options.md`. `DECISIONS.md`: K4354, K4599, K4635, K4746, K4747, K3060 D5, K5438, K5440-K5444, K5448, K5454.

**The study, where it stands.** S0 found a room per project is a re-architecture of whole-store `transact` (616 tables, about 106 project-scoped): first candidates are **B** (bulk text and indexes out; search from an index outside SQLite) and **C** (a Worker-side cache of shared reads), A only as paper. S1 runs on `plat-s1` (0.87.0, Level 1, installed by Bob; `s1-tooling-notes.md`): step 1a done (empty team, six screens, 0.58-0.66 s net, hop `do-session` 50-57 ms against biosmoke8's 108-135 ms: placement about halves it); **step 1b done in small** (Seed A-lite: 120 files, 104 MB, 123 bundles, 28,889 text units, about 200 MB database; eight screens re-timed, net 0.57-0.91 s: `study/s1-results.md`). **Next: grow the seed** (the plan's Seed A is 500 documents and 0.4 GB; documents reach a project through the project's own door `/app/capture/address/<project id>` and the file upload is one act with no reason box: see the tooling notes), re-time, then 1c, 1d (needs the plane-only throwaway redeploy from `proto/levels-2-3`, BOB deploys), 1e ramp, 1f containers: **ask BOB before 1e and 1f**, naming what runs and for how long.

**K5535 (C32) taken (P-19):** the interpretation ceiling per level is PL44-PL45 in `load-test-draft.md`; no figure until measured.

**Open with Bob / BOB.** Nothing open with Bob. BOB: K5470 (auto mode refused setting `CIVICSMITH_TEST_INSTANCE` on plat-s1 via the API: not needed by my tools; say so if a journey-check walk is wanted). Needs from others: FILES' L1-L6 and P-M17 (BOB places); AI-DESIGN to confirm the AI-act and Gate 1 budgets.

**Next steps.**
1. Done (P-21): signed in as plat-s1-admin via Bob's reset link; member plat2-member enrolled. A successor needs a new reset or invitation from Bob; credentials are session-local.
2. Solve filing a document into a project; seed (1b) and re-time; then 1c.
3. Build the throwaway measuring ops and the plane-only patch on `proto/levels-2-3` (workers), ask BOB to deploy; run 1d.
4. After S1, S2 (prototypes B and C by workers on `proto/levels-2-3`), S3 (Enterprise quoted), S4 (the report to Bob, plain words, through BOB onto QUESTIONS.html).
5. Keep each draft in step with rulings BOB relays; hand over at 40 % context.

## Entries

**P-1 · 2026-10-27** · Five drafts opened from the P1-P26 digest and the requirements already in force (`runtime-limits` R27-R35, `plane` R95, `installer` R83, `admission`). Nothing measured by this lane (it changes no code and has not touched a copy). Not confirmed: that biosmoke8's room was re-created and the hop fell.

**P-2 · 2026-10-27** · Bob's P1 answered (K5438): bar kept at every level, ranges per level, copies told when outgrowing. Folded into `service-levels-draft.md` (PL26-PL28; the name reading) and `time-budgets-draft.md` §5; `DECISIONS.md` +1. FILES and CAPABILITIES have stated no load figures yet; asked via BOB.

**P-3 · 2026-10-27** · Bob's P2 and P3 answered (K5440, K5441). Cloudflare's data-location pages (Durable Objects, 2026-06-26; R2, 2026-08-19) read and quoted in `record-placement-draft.md` §2; design changed by what they say (storage-only promise; R2 bucket in the same jurisdiction; hint and jurisdiction not combined; jurisdictions are eu, us, fedramp). New lines PL34 (R2 bucket) and PL35 (whole-record export, deferred to its owner).

**P-4 · 2026-10-27** · K5443 folded: `whole-record-move-draft.md` (PL50-PL57) written for `corpus-export` and the installer; the one-`eu`-rehearsal added to `load-test-draft.md` §2; placement §3 and §5 updated.

**P-5 · 2026-10-27** · P4 answered (K5444): `service-levels-draft.md` §5 and PL29 (the install's level choice) revised; `levels-2-3-study-plan.md` written; S0's table inventory started.

**P-6 · 2026-10-27** · FILES F5 (`LOAD-PER-TYPE.md`) read: record grows by extracted text (about 1.4-1.5 x), not file bytes; folded into `service-levels-draft.md` §2 (the record bound is database bytes and R2 bytes separately), `load-test-draft.md` §3 (text-heavy and scan-heavy seeds; P-M17 and L1-L6 in S1's cycle), `time-budgets-draft.md` PL7 (background work yields the room; one batch at most 100 ms). R2-to-R2 answered from Cloudflare's pages (`whole-record-move-draft.md` §5). Factor on real unit rows not confirmed: needs S1.

**P-7 · 2026-10-27** · K5448 folded: prototype by this lane's workers on `proto/levels-2-3` (never merged; `load-check` is R1's); CONSISTENCY (5)-(8) applied (one bounds table in runtime-limits for PL1 and PL20; `load-check` uses op-declarations, runtime-limits, test-support only; PL3 first an op-declarations test). Study plan re-timed: about 5-6 days, waiting only on deploys. The table inventory (S0) is still being written.

**P-8 · 2026-10-27** · S0 done: `study/table-inventory.md` (and TSV): 616 tables, about 106 project-scoped, 293 team-wide, 217 mixed; `study/s0-options-for-the-split.md`: a room per project is a re-architecture of whole-store `transact`, not a routing change; changes my recommendation to **B (bulk and indexes out) plus C (cached shared reads)** first, A only as paper. Plan's S1 and S2 revised. Prototype spec next.

**P-9 · 2026-10-27** · `study/s1-steps.md`: the S1 seeding and run steps for `plat-s1` (BOB: tranche/T53 14b73ea14e, deploy-test workflow, Level 1, dry run first). Needs from BOB: a team on the copy (administrator and member by `PLATS1_*` variables) and, later, one redeploy from `proto/levels-2-3` for the throwaway measuring ops.

**P-10 · 2026-10-27** · P5 answered (K5454): no Enterprise account now; S3 quotes Cloudflare, Enterprise "not yet available" at install. Waiting on BOB for `plat-s1`'s URL and team (S1 steps 1a-1c).

**P-11 · 2026-10-27** · K5455: `study/second-copy-options.md` (worker, file:line cited): why deploy-test of a new copy is unsafe (shared fleet; plane cannot be created by `deploy.mjs`) and options A (plane alone), B (per-copy fleet names), C (installer install-alongside, per-slug names; Bob's act). Recommended to BOB: C for S1a-c, 1e, 1f, then a plane-only redeploy from `proto/levels-2-3` whose workflow and scripts are patched in that branch only, so 1d's measuring ops deploy without touching shared members.

**P-12 · 2026-10-27** · `study/second-copy-options.md` §C written (Bob's act in plain clicks; the founder claim is Bob's; the invitation link he pastes is the route in; the copy's test flag is BOB's). Waiting on BOB/Bob for the install; still to check on the proto branch before any plane-only deploy: T53 head vs 0.87.0 and the migration-tag unknown.

**P-13 · 2026-10-27** · The two unknowns checked (git diff of 13c83a9ae7, the alpha's merge, against `tranche/T53`'s head 6ce336490d): both say 0.87.0 in their version strings, but the head carries T52's first round: 23 files and about 1,500 lines changed under `bio-plane/src` (35 files across the plane, fleet and `newgroup`); **no change to any `wrangler.jsonc` migrations, tags or classes**, so a plane-only deploy of branch code adds no shared migration tag (the plane's own SQL migrations run per copy). `plat-s1` installed alongside is the alpha's code; the proto branch's plane-only deploy brings T52's changes. S1's figures name which code they ran on.

**P-14 · 2026-10-27** · CAPABILITIES C12's load item (one acquisition `member` job row per archive entry and attachment, bounded by `UNPACK_DAILY_ENTRIES`) added to `load-test-draft.md` §3. Still waiting on Bob's install and the invitation link.

**P-15 · 2026-10-27** · CONSISTENCY rows 14, 16, 19 applied in `time-budgets-draft.md`: classes AI act and Gate 1 run (longer ceilings are classes, never overrides; the figures 60 s and 30 min are mine, to be confirmed by AI-DESIGN's first measuring run), Follow and Explore (the time lives in the class row; `CHAIN_LIMITS` stay counts), and PL8: N1260's 2-second journey is a PL5 walk judged by each screen's class.

**P-16 · 2026-10-27** · `plat-s1` is installed (0.87.0), I am enrolled as administrator and my member too (credentials and recovery codes in my session's scratchpad only). S1 step 1a measured on the empty team: `study/s1-results.md`. Every screen drawn within 2.2 s raw and about 0.6 s net; the hop (`do-session`) is 50-57 ms against 108-135 ms on biosmoke8: placement near the team about halves it. Next: 1b seed A.

**P-17 · 2026-10-27** · Handover written (about 37 % context): section 0 and the prompt rewritten; `study/s1-tooling-notes.md` holds how to drive `plat-s1` (project `PROJ-2026-7919-plat-s1-study-project` made; the upload API shape; how a document reaches a project is not yet found). Credentials stay in PLATFORM #1's scratchpad and cannot pass on.

**P-18 · 2026-10-27** · Step 1b (Seed A-lite) done: `study/s1-results.md` §1b. The administrator invitation BOB asked for (K5473 (4)) for PLATFORM #2 was **refused by auto mode** (a permission grant), so Bob must issue it; I did not work around it.

**P-19 · 2026-10-27** · PLATFORM #2 took over (#1 archived). The invitation link given twice is dead; asked BOB for a fresh one. Bob's K5535 (C32) folded: PL44-PL45 (interpretation ceiling per level, from measured densities; method only, no figure) in `load-test-draft.md`, L4 and a request to CAPABILITIES in `time-budgets-draft.md`.

**P-20 · 2026-10-27** · CAPABILITIES' counts (via BOB #323) for `interpretationOf`, `partsOf`, `proposeParts` graded in `time-budgets-draft.md` §3 (read act 1 s; full-load share with slicing and a kept answer; Explore, never first wave) and tied to the combined read (K4599, T-a to time Document with and without them) and to PL45. All proposed, none measured.

**P-21 · 2026-10-27** · S1 unblocked. The invitation link was never live: plat-s1 already had two administrators, so a third (Admin3) is a proposal that issues no invitation until all endorse it (member-roster 4.7), and the Members screen kept showing a stale link (BOB #324 routes the defect to the plan). Bob instead sent a reset link for `plat-s1-admin`; used; I am signed in as administrator, and invited and enrolled `plat2-member` (member role). Credentials in the session scratchpad only (0600); the member's recovery codes were not saved (shown once), so a lost member password needs a reset by the admin. Admin3 left as it is (do not endorse). Seed A grown by 380 generated files (about 193 MB) through the project's Add door, 3 workers; screens to be re-timed when it ends.

**P-22 · 2026-10-27** · Seed A complete (503 documents, about 297 MB, 127,502 text units, about 600 MB database) and the eight screens re-timed idle: `study/s1-results.md` §1b-full. **Finding:** the administrator's Home, Queue, Add and Project pass the 2 s bar (3.5, 3.5, 2.8, 4.8 s net) while the member's stay at 0.55-0.66 s: cheap ops wait behind the administrator-only `heldcaptures` and list reads over about 500 captures held unvouched (P24 again, at scale). The Add door timed out on 17 files (0.1-2.5 MB) with three parallel uploaders; all 17 passed alone in 11-15 s (contention, not file size): a defect candidate for the door's module, put to BOB. Next: 1c (record sizes) and the ramp (1e, approved), after specifying 1d's deploy for BOB.

**P-23 · 2026-10-27** · Step 1e done in its first form (`study/s1-results.md` §1e): a member-frame ramp, 5 to 60 members, no step broke the stop rule (errors at most 0.03 %), p90 1.1-2.5 s raw with the proxy in and no rising trend. Not shown: administrator frames, uploads and reading in progress, the soak. A first printout with a wrong "net" column was discarded. Next: the ramp with an administrator walker and uploads, the soak, the record sizes (1c).

**P-24 · 2026-10-27** · Step 1e with administrator walkers and uploads (`study/s1-results.md` §1e-mixed): **Level 1 on the alpha's code breaks at 15 members** (502 answers on varied ops, 0.4-1.2 %, past the 1 % rule; member p90 2.5-4.7 s), against the members-only ramp's no break to 60. Prototype C built on `proto/levels-2-3-c` (head a760607c, about 255 lines: a Worker-side cache keyed by the room's write count, `PROTO_C=1|2`, `heldcaptures` paged by `PROTO_C_HELD=1`, op `protocprobe`; unit tests pass, nothing run against a real room); prototype B's full build is 1,300-2,000 lines (spec only, `proto/levels-2-3-b` c84af621), so the ~250-line measuring variant is being built. A shared-device session ends after 15 min idle: refresh tokens before each run.

**P-25 · 2026-10-27** · 1d built: `proto/levels-2-3` head 0f5ad81c (op `tablebytes`, admin bearer only, reads `dbstat`; `scripts/deploy-plane-only.mjs plat-s1 <bundle> [--dry-run]`, refuses any other worker or account and a real run without `CONFIRM_PLAT_S1_PLANE_ONLY=yes`); I ran its dry run against the live plat-s1: 0 added, 0 removed, 16 identical bindings, secrets kept by Cloudflare, cron kept. The live code is the `release/` bundle (hash d71bdc19); the build from source differs from it only by a words-catalog commit (44 lines of strings), so the prototype is the same code. Prototype B (`proto/levels-2-3-b` 1ca64791; the full build is 1,300-2,000 lines, so the measuring variant: `protobprobe`, `PROTO_B=1`) and C (`proto/levels-2-3-c` a760607c) pushed. One combined deployable `proto/levels-2-3-all` (with `--set-var PROTO_*` on the script) is being built; BOB deploys it, or I do under K5120 once he says so. A worker's bare `git stash pop` once removed another worker's changes (recovered from a patch): workers use their own worktrees and never stash.

**P-26 · 2026-10-27** · `proto/levels-2-3-all` 50c43739 built (bundle ac48aaea…, tests no new failures) and its dry run passes; **my real deploy was refused by auto mode, so BOB deploys** (commands sent). Next once deployed: `tablebytes` baseline, then C (`PROTO_C=1`, `PROTO_C_HELD=1`) with the mixed ramp, then B. Meanwhile: record sizes and the soak.

**P-27 · 2026-10-27** · BOB deployed the baseline (flags off) and then `03a5c65e` with C on (see s1-results.md §1d for hashes and rollback). Baseline: the new code does nothing with flags off. `tablebytes`: no `dbstat` in Durable Object SQLite (count-only); 96 % of the room's 430,564 rows are the text units and their search index; database 676,630,528 bytes. Running now: the screens and the mixed ramp with C on, then `protocprobe`. BOB #326 takes over; send B ON and later requests to the BOB on the plan's Status line.

