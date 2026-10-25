# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #285 (`session_01ASV9NLY6Cwsx6qfQ2M3ExU`, depth 1, parent ROOT #9 `session_01GndWUi5ubGmXCVVnFqtJAi`, third account) for BOB #286, 2026-10-25 ~02:30 UTC, at 45 % context (`get_session`). **T51 is OPEN** on `tranche/T51`, fix round 9. Read rulings K5016 to the last line of `build/rulings.md` whole.

## Open with Bob

- Nothing. K5023's question is BOB's (K5036) and done (K5038).

## Superseded (K5036)

- **Approve the two process texts** (K5023, K5028, K5029): the size gate's mechanics text (§5.1, §5.4, §6, §8.4, §13, §17) and the fixtures check (§8 item 7), rendered at https://claude.ai/artifact/55ZtvQ7QC7z2AhjcYBqBdf (version 3), options A both (recommended), B the gate only, C a change. The gate is certified by dry run D17 (SG1-SG5). Read the channel before recording his ruling (§13.1 (3c)).
- **On his approval** (the ruling cites K1258 and his words): merge into civicos-process `main` the branches `prep/size-gate-K5015` (@ `5ac283a`: `tools/mail.mjs` gate, `checks/format.mjs` deferral check, tests 165/165, `checks/size-gate-mechanics-draft.md`), `prep/D17-matrix` (@ `e0d5260`), and, for A, `prep/fixtures-check-K4996` (@ `0999406888`); write the approved text into `PROCESS-MECHANICS.md` exactly as rendered; for A wire `checks/fixtures.mjs` into `checks/run.mjs` and §8's heading to "seven checks"; then post a `CHANGE` naming the tool fix to any running job (§4). With A, the fixture round (plan `fix-round-9-T51.md` §7 item 7) starts from `node checks/fixtures.mjs <product> --list`.

## Done this session (the record is K5016-K5029)

- K5012's cleanup merged and finished: `rulings-active.md` 77 lines, 24,987 bytes; every working document under `build/plan/` within 51,200 bytes; `build/plan/size-exempt.txt` names four data files with reasons. Keep it so (the gate will enforce it).
- Merged: acquisition (G154 (4)), odf-reader (R56), calculations (R47-R49), workbooks (R22, R23, R21), capture (R114), office-readers (R46-R48). Coverage 6,939 of 6,939, words 0, architecture 0. No job runs.
- CORPUS #1 merged (K5020, K5022); L26 accepted green-only.

## Running

- Sessions (K5009), each writing a results file on its branch; read it whole, merge its test files (K4297 (2)), place each product finding with a job: **LOAD-REDS #2** `session_01BhjwfEquJ5G3x14STBdhB4` (`prep/load-reds-2`; also owns LOAD-RED 5's cause, why workerd closes the queued request, K5019); **SUITE #2** `session_01UBk4hBz99SH8oVMCQ4s9RH` (`prep/suite-2`, the whole suite, K5034). VERIFY #1 placed and archived (K5032); artifacts regenerated (K5033).
- Lanes nothing past H43, A41, W4, P26 (PERFORMANCE archived P1-P26, its `HANDOFF.md` now holds none open); channel UX-DESIGN nothing past U471 (its MERGE `c752a602da` at the close). INVESTIGATION #4 (secondary) unreachable: `mail check` keeps listing it; leave it.
- Tools: worktrees `/home/user/cp-jobbranch`, `/home/user/cp-cap`, `/home/user/cp-close` of civicos-process `prep/jobbranch-K4385`, `prep/running-cap-K4976`, `prep/T51-close-v2` (recreate in a new container). Run mail and checks from `cp-cap`, not from a clone a worker may switch.

## Then (each waits on the sessions above or on Bob's answer, real dependencies)

The round end of `fix-round-9-T51.md` §7: K4426's remaining cells (G123f (4), G124f, G128i rows by CORPUS #1 are merged: fold them), regenerate every artifact in the manifest's order (stale: plane, pdf-worker bundles, setup-words `rows.mjs` with the orphan `workbooks.dropped_cells`, case-checker, newgroup), the whole suite in its own session (K4787), one redeploy with `--store-generation 2`, BOB's claim of the new room (3a), the P list, the re-walk, K4994's tracing and mutation sample, the fixture round (§7 item 7, after Bob's answer), §7 items 4a/4b, the final pass (K4781), 0.87.0, T51's close (§5.7; the design MERGE first, K1177; the civicos-process prep branches merged). AW4 waits under K3717.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded.
- civicos-process `main` changes only with Bob's approval of the exact text (K1258); no refusal recorded.
- Job branches only by `mail jobbranch`; never a force-push. biosmoke deployments: K4841 (standing list: not added); account `…7f72` only, plus the rehearsal account (K4949, K4956); the live copy only through the proxy (K4733).
- Sessions: archive each job at its merge (K4219); refused acts never taken to Bob nor rephrased (K3466, K4696).
