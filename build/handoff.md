# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #261 (`session_01WknmGiwDnRL9QYWMTaayvc`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~05:15 UTC, at about 40 % of its window (estimated; `get_session` reads 0), at a clean point: every merge pushed and ruled, every job entry answered. **T51 is OPEN** on `tranche/T51`; fix round 6. Read `build/rulings-active.md` whole, then **K4696 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 3 (rows 39-57) and 7 and the entries G50 to G56 (all before `### K4597`).

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614). Bob, 04:22: "Keep going, but be smart."
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a plan entry is used, and a short second review of each rewrite. Every review today found real defects: never skip it.
- **Nothing is open with Bob.**
- To report to Bob when the round ends (protective bounds, K1881): K4683's list, the 100,000-row ingest and 2,000-character reason (K4687), the 2 MiB classification threshold and 1.5 MiB view (K4685), G56's 100 pages / 1.3 MB a PDF piece, G55's `INGEST_CACHE_MAX` 10,000 and the inline threshold (set from check L), G54's sweep bounds (measured by its L check); and that `limits.cpu_ms` is unset (the platform default governs).

## Running (STARTs `build/plan/starts-T51-F6k/`)

| job | for | state |
|---|---|---|
| PUBLIC-READ #31 | G50 (B), then G54 (CHANGE B23 + addendum B24: the 13 stand-in rows, English in SCREENS-PUBLISH #20's record) | running its impact run |
| CASE-CHECKER #17 | G50 | waits for public-read's merge (B9); BOB writes its R2, R8, R14, R19 from its record at the merge |
| CASE-IMPORT #16, CASE-DISCLOSURES #18 | G50 | COMPLETE, red by name until public-read and case-checker merge |
| SCREENS-ACTION #16 | G52 | built; holds until G53 merges, then a CHANGE |
| WIZARD-SCRIPTS #24, OP-DECLARATIONS #36, INTERFACE-SHELL #19 | G53 (merge in that order) | op-declarations COMPLETE (G53 and its G55 part, `moneyingestread`); its `t50` R73 red until wizard-scripts, `t33:290` until calculations |
| BUNDLER #28, PUBLICATION #37, RATIFICATION #31, PLANE #52 (B58) | G54 | working; ratification's step 0 found 4783 repairable (K4704) |
| PUBLISH-SCHEDULE #4 | G54 | COMPLETE; merges after publication; BOB writes its R2 from its record |
| SCREENS-PUBLISH #20 | G54 | COMPLETE; merges after public-read (three reds by name until then) |
| INSTALLER-STEPS #7, INSTALLER #24 | G54 observability | installer-steps sent back (B16: R17 K1541 red when merged; refuse only when settings are read and not enabled); INSTALLER COMPLETE, merges after it |
| MONEY #8 | G55 tier 2 (B9) | tier 1 merged |
| CALCULATIONS #9 | G55 tier 1 done, tier 2 confirmed (B17) | working; constants from check L |
| SCHEDULER #41, OP-GRADES #25, NOTICE-PRODUCERS #16 | G55 tier 2 | started 05:14, unconfirmed |
| PLANE #52 | G41/G44/G48 proofs, G26 re-run now due (B59, G56 merged), G54 seam (B58) | open |

Merged today by BOB #261: case-grammar (G50), entities, money tier 1 (G55), pdf-reader, reading-pipeline (G56). Merge order is `modules.json` order: section 3's table.

## Do next, in order

1. **Take over** (§5.1): archive BOB #261 once idle (row `BOB-final`, T51); delete its backstop (the newest "BOB #261 backstop") and WATCH #261 `trig_01WNS91sX794G3n9Ru6v3t5v`; arm yours; `node_modules` (K4113); `cp-close` worktree of civicos-process `prep/T51-close-v2` (`git -C /home/user/civicos-process fetch --depth 50 origin prep/T51-close-v2 && git -C /home/user/civicos-process worktree add /home/user/cp-close FETCH_HEAD`) for `fixplan` and `mail jobbranch`; **merge in a worktree on a local branch** (`/home/user/mwt`, `merge-T51`), push `merge-T51:tranche/T51` only once verified (K4683). A predecessor may keep working for a minute after your Status line: renumber your rulings if K numbers collide (K4697).
2. `mail check`; act on every entry; merge each COMPLETE in order, reading each check's own failure count. Old archived jobs still in the plan's Jobs line show `RING`: ignore any whose session is archived.
3. Write each merged job's proposed requirement lines from its record (jobs cannot write `build/requirements/`).
4. **The round end** (plan §7): regenerate in the manifest's order (member-roster, setup-words rows, case-checker `program.mjs` after G50's case-checker merge, wizard-scripts' data after G53, bundles, newgroup last), verify; the whole suite; update `k4426-check-T51-F6.md` (G50-G56 rows); `fixplan` 0; **one redeploy** (K4296 route, carrying G54's logging); the targeted re-walk (plan §7.3 plus 4783 and 6227 built by the sweep, the 18,098-row ingest timed, the 23.2 MB PDF's first tick); the final pass.
5. **T51's close** (§5.7): the design MERGEs U458, U459, U460 first (K4663, K4675, K4685); then words `inline 1` clears. Owed to UX-DESIGN in one HANDOFF at the round end: the stand-ins of K4685, K4687, K4697 (case-grammar's `format-accepted` and five departures), K4702 (the 13 case-file sentences), installer-steps' refusal row, C-136.9 (B491), SCREENS-ACTION #16's five keys.

## Accepted reds (by name)

As BOB #260's list (K4695), less case-grammar's, plus: op-declarations `t50` R73 (until wizard-scripts) and `t33:290` (until calculations); screens-publish `g54-page` two and `common.test` R24 (until public-read); installer `t51` observability (until installer-steps); calculations `g55-ingest` (a) (until money's tier 2 settles). newgroup's inherited reds: R8, R11, R20, R44, R55, R61, R71, `wizard.test.mjs`.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` or by merging the tranche into them; never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G56 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; money stays open for its tier 2; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U460 read.
