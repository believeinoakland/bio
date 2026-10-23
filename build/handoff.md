# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #260 (`session_01HMRjBKikcSV6AMDmUDVxMc`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~04:30 UTC, at 41 % of its window, at a clean point: every merge pushed and ruled, every job entry answered. **T51 is OPEN** on `tranche/T51`; fix round 6. Read `build/rulings-active.md` whole, then **K4684 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 3 (the job table, rows 34-45) and 7 and the entries G50 to G53 (all before `### K4597`), then the drafts named below.

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614). Bob, 04:22: "Keep going, but be smart."
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a new plan entry is used, and a short second review of each rewrite. Every review today found real defects (G50: 6, then 3; G52: 5, then 1): never skip it.
- **Nothing is open with Bob.** Bob asked how certain BOB is (04:1x); answered: known causes fixed with high confidence, the release meeting the requirements moderate until the redeploy's re-walk.
- To report to Bob when the round ends (protective bounds, K1881): those in K4683's list (CSV 17 MiB, citation 20,000 cells, reading row 1 MiB, case document 1.5 MiB, reason 2,000, portal parse 4 MiB, upload head 64 KiB, the safe view's bounds, workbooks 50,000 cells / 9 MiB / 20 MiB refusing 16 %), plus the 100,000-row ingest and the 2,000-character ingest reason (K4687), and the 2 MiB classification threshold and 1.5 MiB view (K4685).

## Running (STARTs `build/plan/starts-T51-F6k/`)

| job | for | state |
|---|---|---|
| CASE-GRAMMAR #21 `session_01AWTXz3dDga9C9mXYok9S8p` | G50 (provider, merges first) | working |
| PUBLIC-READ #31 `session_01NMAPmXtfQM81PpmWgAWnaY` | G50 | working |
| CASE-CHECKER #17 `session_01Hzwm1zycMHWjX8D2N1KFXS` | G50 | working; CHANGE B8 (`/5` as the unknown format) |
| CASE-IMPORT #16 `session_01Y65ywSzJiY7GTSetJFTW7y` | G50 | COMPLETE, red by name until the three above merge; its ownership "1 failure" is its requirements' Uses line (accept at the merge) |
| CASE-DISCLOSURES #18 `session_01XeesuXwbodLb8B9vNN8tcd` | G50 (test only) | COMPLETE, red by name until the three above merge |
| SCREENS-ACTION #16 `session_015opo2yPs5rDEGC6mU3j4mb` | G52 | built, green; holds (B30) until G53 merges, then a CHANGE |
| PLANE #52 `session_019MQdmdBDvLzCM4txninn2N` | G41, G44, G48 proofs (G48 green, K4693); G26 red until G56 | open; re-run after G56 (B57) |

Merge order: `modules.json` order (plan section 3): case-grammar, public-read, case-checker, case-import, case-disclosures; wizard-scripts (G53) before screens-action (G52). Merged today by BOB #260: docprofile #7, reading-pipeline #27, calculations #8, public-read #30, case-checker #16, case-authoring #41, affordances #44, screens-publish #19 (all archived, rows written).

## Do next, in order

1. **Take over** (§5.1): archive BOB #260 once idle (row `BOB-final`, T51); delete its backstop (the newest "BOB #260 backstop") and WATCH #260 `trig_01T4jQcQNTpzpy31Xe5Pnyce`; arm yours; `node_modules` (K4113). Use the process repository's own `mail.mjs`; `fixplan` and `mail jobbranch` run from a worktree of civicos-process `prep/T51-close-v2` (`git -C /home/user/civicos-process fetch --depth 50 origin prep/T51-close-v2 && git -C /home/user/civicos-process worktree add /home/user/cp-close FETCH_HEAD`). **Merge in a worktree on a local branch** (BOB #260 used `/home/user/mwt`, branch `merge-T51`, pushed `merge-T51:tranche/T51` only once verified), so a mail act never pushes an unverified merge (K4683). Exclude `node_modules` symlinks in `.git/info/exclude`.
2. **G53, then its START** (`build/plan/fix-round-6-T51.md` "### G53"): its independent review may have arrived to BOB #260 unread; re-run it if no ruling records it (sonnet medium, read-only; the entry's claims against `wizard-scripts/build-data.mjs`, `interface-shell/index.mjs:197-230`, the registry diff `43379a1a44..f72b2f8a4c`, tests pinning the counts). Then a START for WIZARD-SCRIPTS #24 (sonnet), and after it merges a CHANGE to SCREENS-ACTION #16.
3. **G54, G55, G56: review, then START.** Drafts: `build/plan/draft-G54-plan.md` (+ `diagnosis-R6-g54.md`, `diagnosis-R6-g54-cause.md`), `draft-G55-plan.md` (+ `diagnosis-R6-g55-measure.md`), `draft-G56-plan.md`. Any draft missing was not finished by BOB #260's worker: re-plan from the diagnosis. For each: an independent review (sonnet medium), a short second review of the rewrite, fold into the plan before `### K4597` (one bullet; continuation lines indented two spaces, no blank lines, or `fixplan` reads only the first paragraph), `fixplan` 0, STARTs. G55 (the ingest's ~1.8 ms a row, 33 s at 18,098) may need Bob only if the fix changes what a member may do; else it is BOB's.
4. `mail check`; act on every entry; merge each COMPLETE in order. **Read each check's own failure count.**
5. **The round end** (plan §7): regenerate in the manifest's order (member-roster, setup-words rows, case-checker `program.mjs` after G50's case-checker merge, clearing case-checker R13 and R25; wizard-scripts' data after G53; bundles; newgroup last), verify `fleetbundles`, `newgroup-bundle-fresh`, case-checker `program.test.mjs`; the whole suite (G43's R124 green on the merged tranche is an open field); update `k4426-check-T51-F6.md` (G50-G56 rows); `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3, with the 18,098-row ingest timed, CASE-2026-4783 and 6227 carrying a case file after G54's repair, the 23.2 MB PDF); the final pass.
6. **T51's close** (§5.7): the design MERGEs U458 (DEC-422), U459 (DEC-423) and U460 (`6f0ef7a800`, B494's spec entry) first (K4663, K4675, K4685); then words `inline 1` clears.

## Accepted reds (by name)

plane `release` R24; plane `l77-size` R77 L (K4608, K4613); file-safety R24; promotion row-census; `fleetbundles` section 10, agent-worker `requirements`, ocr-worker, `newgroup-bundle-fresh` arms (C)/(D) (stale bundles until the round-end regeneration); newgroup R8, R11, R20, R33, R44, R55, R61, R71, `wizard.test.mjs` (K4580); case-checker R13, R25 (stale `program.mjs`); screens-action `contract.test.mjs:34` (until G53 and G52 merge); G50's red-by-name tests (case-grammar first; then public-read's (B), case-checker's seam, case-import's two, case-disclosures' `g50-acts`); plane `g26.probe.mjs` 10 s (until G56); words `inline 1` for case-checker's spec (until U460 lands at the close, K4677). screens-intake `t51-fix5` R31 was red once under load and green alone (K4686): quote its assertion if seen again. Heavy files run alone: `reading-pipeline/pdf-pieces`, `memory`, the shape probes, `control-plane` R122.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGEs first (§5.7 (1), K1177; U458, U459, U460 ask them, K4663, K4675, K4685); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` (fast-forward) or by merging the tranche into them (K4385, K4659, K4679); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G56 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U460 read (MERGEs DEC-422, DEC-423, U460 at the close); B493, B494 read by it. Owed to UX-DESIGN in one HANDOFF at the round end: the stand-in sentences named in K4685, K4687 and the C-136.9 row (B491), and SCREENS-ACTION #16's five keys for screens-action's reads list.
