# Handoff

**Status** · Replaced whole at each handoff. Written by BOB #257 (`session_01NjhB8vcBrUPioHRiLAUTMu`, depth 1, parent ROOT #8 `session_01R3hvN64bYHG3vPQmYmaeLR`, secondary account), 2026-10-23 ~01:20 UTC, at 46 % of its window, at a clean point: every merge pushed and ruled, every job entry answered. **T51 is OPEN** on `tranche/T51`; fix round 6: G1-G40 merged; G42 merged (closes at the re-walk); G41 and G43 in jobs; G44 to diagnose. Read `build/rulings-active.md` whole (new lines: K4635 the record's size and architecture; K4636 in "Adding is not interpreting"), then **K4635 to the last line** of `build/rulings.md` whole, then `build/plan/fix-round-6-T51.md` sections 0, 7 and G41 to G44.

## Bob's direction today (in force)

- Alpha as quickly and efficiently as possible; token efficiency (K3269, K4614). No pause at 80 % (K4614).
- K4426 at planning (K4597): `fixplan` 0 before any START; an independent reviewer before a new plan entry is used. Every review this session found real defects (G41: 14, G42: 7, G43: 7): never skip it.
- Bob answered both open questions (K4635: one object per team with a gauge now, split across objects for the beta, the four factors; K4636: every document read whole and searchable, interpretation selective). **Nothing is open with Bob.**
- To report to Bob when the round ends (protective bounds, K1881, already told him): a CSV over 17 MiB stated refused for the alpha (K4652); one citation of a held sheet at most 20,000 cells (K4642 (6)); a stored reading row over 1 MiB stated refused (K4639).

## Running (8 sessions)

| job | state | waits on |
|---|---|---|
| TEST-SUPPORT #9 `session_01NsoiLyHMoVNrYC5YG4oMt4` | RUNNING (baseline of the red modules without the preload, to 01:45) | itself; at its COMPLETE: merge, add `bio-plane/test/platform-sqlite.mjs` to test-support's `paths` (K1043), wire the preload into `.github/scripts/module-tests.mjs` and the E3 harness child (BOB's tooling); each red it lists is a G41 item; its `calc_ingests`/`portal_snapshots` measures decide whether CALCULATIONS/FOLLOWING jobs open (K4631 (7)) |
| EXTRACTION #38 `session_01Nfh71Ec7eH1J684odphSrb` | building (row guard, `too_large`, `cellsOf`) | its providers are now all merged (K4657): its seam can go green; merge next in order |
| CONTENT #19 `session_01KzzQvxzJFF2TeRz3VbyabJ` | code done, seam red by name | extraction |
| RETRIEVAL-BROWSE #4 `session_01DRhBLuRPVD8G3hWpq1rxBR` | code done | extraction |
| CALCULATIONS #8 `session_015P7YZfAbM7iah2fh9UyBGM` | code done (engine mark stored, K4650) | content, extraction, the preload |
| SCREENS-INQUIRY #24 `session_0173JDLUmEUBw56aUupWGyQE` | code done (held-cells line, `too_large` field) | extraction |
| PLANE #52 `session_019MQdmdBDvLzCM4txninn2N` | the full-size proofs (4 MB, 17 MiB CSV, 200,000-row xlsx at cap 128+39-N) | everything above; judge csv-reader's 14.8 s first tick (K4654) at its merge against G37's 10 s bar |
| SCREENS-INTAKE #19 `session_01MRSaAxXVfHeRnbMzyYWfCF` | **merged once; re-opened** (CHANGE B39, K4657) | diagnosing why, after an uploaded 1 MB CSV is filed, `op=reading` does not find its last row (suspected: the door's truncated `text_units` projected by `projectPromotion` as if whole: a silent partial read, K4571). G43 does not close until the last row is found after filing. Route the cause to its owner (extraction may own it). |

Merge order (K1965, modules.json): extraction, content, retrieval-browse, calculations, screens-inquiry, plane; screens-intake whenever it re-completes. After each provider merge post a CHANGE to the users and ring them. Ring every job `mail check` lists RING.

## Do next, in order

1. **Take over** (§5.1): archive BOB #257 once idle (row `BOB-final`, T51); delete its backstop `trig_01LZJtQxJEUSuKdpEiAhDB4R` and WATCH #257 `trig_017ngvgD4SX2TWWPb1xCwBie`; arm yours; `node_modules` (K4113); `/home/user/cp-close` at civicos-process `prep/T51-close-v2` (`git fetch origin +refs/heads/prep/T51-close-v2:refs/remotes/origin/prep/T51-close-v2`, then `git worktree add --detach`). Use `node /home/user/cp-close/tools/mail.mjs` (it has `jobbranch`; the main checkout's does not).
2. `mail check`; act on every entry; merge each COMPLETE in order (requirements written from each record's proposed lines; `/tmp/.../addreq.py`-style insertion, or by hand).
3. **G44** (K4655): a diagnosis worker (sonnet medium) on `workbooks` addWorkbook and file-safety's safe view listing every cell of a large workbook (`diagnosis-R6-g44.md`, a reproduction at the real shape), plan it, independent review, STARTs.
4. **The round end** (plan §7): regenerate in the manifest's order (setup-words rows already current at K4644; bundles all stale; newgroup last), verify `fleetbundles` and `newgroup-bundle-fresh`; the whole suite under the preload; update `k4426-check-T51-F6.md` (G41-G44 rows); `fixplan` 0; **one redeploy** (K4296 route); the targeted re-walk (plan §7.3, now with the 1 MB CSV, the largest CSV that fits, a 400 KB workbook, an administering member's storage gauge); the final pass.
5. **T51's close** (§5.7).

## Accepted reds (by name)

plane `release` R24; plane `l77-size` R77 L (K4608, K4613); file-safety R24; promotion row-census; `fleetbundles` section 10, agent-worker `requirements`, ocr-worker, `newgroup-bundle-fresh` arms (C)/(D) (stale bundles until the round-end regeneration); newgroup R8, R11, R20, R33, R44, R55, R61, R71, `wizard.test.mjs` (K4580); screens-inquiry R96 G6 x2, G8, G14 (identical on the tranche's capture.mjs; the inquiry job's). Heavy files run alone: `reading-pipeline/pdf-pieces`, `memory`, the shape probes, `control-plane` R122.

## Lesson (this session)

The G41 STARTs said every provider was merged while all nine jobs started together; six jobs blocked on it (K4645). A START for jobs started at once says the providers are not merged and seam tests stay red by name. Also: a drawn screen reads words by key only, and a module's tests cannot import a later module (K4640, K4648): check both before writing a START.

## Acts on main or sessions (reviewed acts, §5.8)

- `main` moves only by T51's close PR (§5.7 (3)), the design MERGE first (§5.7 (1), K1177); no refusal recorded. The process repository's `main` by PR at the close (K4275), carrying `prep/T51-close-v2`.
- Job branches only by `mail jobbranch` (K4385); never a force-push.
- Deploys to biosmoke8 by push to `deploy-test/biosmoke8/{dry-run,deploy}` (K4296); none until every round-6 cause, G41-G44 included, passes K4426's check and `fixplan` reads 0.
- Sessions: archive each job at its merge; lanes' sessions are not BOB's to archive.

Lanes: AI-DESIGN A41, JOURNEYS W4, INVESTIGATION-DESIGN H43, PERFORMANCE P15 (unchanged). UX-DESIGN through U457 read; B489-B491 ours, unread by it (B490 NOTICE K4635/K4636; B491 HANDOFF: the gauge's rows, the document page's held-cells line).
