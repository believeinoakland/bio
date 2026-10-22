# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #255 (`session_01B5ahFwA2XPBSAc3qyhDvFM`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-22 ~21:25 UTC, at 51 % of its window (late: K4617), at a clean point: every merge pushed, every entry answered. **T51 is OPEN** on `tranche/T51`; fix round 6 ends with two jobs running. Read `build/rulings-active.md` whole (new lines: K4614 no 80 % pause; K4617 the refresh point read at every backstop and merge ruling), then **K4606 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 7 and "G37-G38" and G39, and `build/plan/k4426-check-T51-F6.md` (the K4426 table, written before G37-G39: update it at the round end). Diagnoses: `diagnosis-R6-shape.md`, `diagnosis-R6-idle.md` (both sections): read one whole when a job cites it.

## Bob's direction today (in force)

- Alpha release as quickly and efficiently as possible; token efficiency (K3269, restated K4614).
- No pause at 80 % (K4614): a third Max account is set up (Bob, not yet used); Bob says when to switch (rulings-active account-switch line; he starts a ROOT there; BOB gives him the prompt then).
- K4426 enforced at planning (K4597): `fixplan` 0 before any START (now 0, 43 causes); an independent reviewer before a new plan entry is used.

## Running (2 jobs)

- **READING-PIPELINE #24** (`session_01EihK7Mkuc9VE8VdK74jysx`, G37): once-per-read classification built (`classify-once.test.mjs`), `PDF_RANGE_PAGES` 100 (g26 tick 1 12.4 to 5.7 s). CHANGE B17 (21:21): roster-reader merged; re-run g15 at 127, g13 at 24 MiB, g26 at 112, alone; then COMPLETE. If one still fails, it reports the profile and owner.
- **BUNDLER #27** (`session_01NANNZMQSbXHCM7pPgtTGrC`, G39): every fleet bundle pure ASCII (the plane's idle 86 to 50 MB in workerd); answered J13 (B13, K4617): exported `asciiOutput`/`asciiOptions` in `buildMember`; case checker opts out. After it merges: an **INSTALLER** job for newgroup's own build to call the pass (newgroup 346 non-ASCII bytes), START to write (`starts-T51-F6f/` pattern; plan G39 names it).
- Merge each at its COMPLETE: ownership, its suite + users ALONE for heavy files (pdf-pieces, the probes), requirement lines from its record (BOB writes; each new id named by a test, K874), archive + row. Use `/home/user/cp-close/tools/mail.mjs` (it has `jobbranch`).

## Do next, in order

1. **Take over** (§5.1): archive BOB #255 once idle (row `BOB-final`, T51); delete its backstop `trig_01KDb155hgFLvmQot21FhQVa` and WATCH #255 `trig_01ETpYsi61szetvz1ZcCNn6H`; arm yours (backstop while the two jobs run); `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git worktree add --detach`).
2. `mail check`; act on READING-PIPELINE and BUNDLER entries; merge each; then INSTALLER.
3. Re-run the E3 probes after both merge, alone: `g13` (24 MiB), `g15` at 127, `g26` at 112 (now pages the reading by `next` too), `keep40`, with the plane bundle rebuilt for G39's figure in workerd (the bisect in `diagnosis-R6-idle.md`). Every failure is a cause of this round (P10), planned with four fields and reviewed.
4. **The round end** (plan §7): the design stream's files at DEC-419 (`c7f61f61cb` on `claude/gallant-brown-zg0wc1`; DEC-413 to DEC-419, design files only: `git checkout c7f61f61cb -- docs/development/ux-substrate docs/development/DECISIONS.md`, as K4393 did) before regenerating; regenerate in the manifest's order; the whole suite; update `k4426-check-T51-F6.md` for G37-G39 and every row; `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3; add 0111's Document screen paged, the 1 MB CSV, the 24 MiB text, `last_mem` on the first heavy row for G39); the final pass.
5. **T51's close** (§5.7).

## Accepted reds (by name)

plane `release` R24 (stale words, regenerated at the round end); plane `l77-size` R77 L gate (wrong gate, replaced by E3's probes; K4608, K4613); file-safety R24; promotion row-census (old). Heavy files run alone: `reading-pipeline/pdf-pieces`, memory tests, the shape probes.

## Lesson (this session)

The platform-shape run found three causes no test had seen (G37-G39), and the independent review corrected two plans before a job read them (a head-bound classification would have broken budget and roster detection; the case checker would have been rewritten). Run the shape probes on every large-file cause before calling it ready, and never skip the review.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` (K4385); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause passes K4426's check and fixplan reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

## Open with Bob

- None. (His third account is set up; he switches when he says.)

Lanes: AI-DESIGN A41 (beta), JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15. UX-DESIGN through U455, read; B487 ours, read by it.
