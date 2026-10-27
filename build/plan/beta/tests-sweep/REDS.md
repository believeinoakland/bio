# The reds, sorted — S9 (2026-10-27)

Source: BOB #324's `build/plan/beta/reds-T53.md` (23 reds in 8 modules) and K5339/K5343's list. Each file was run alone on `lane/tests-sweep` with `tranche/T53` merged in; the cause is the first assertion it gives.

## Proved stale and fixed in the sweep

| red | cause | fix |
|---|---|---|
| following R1 C-137.1–C-137.20 (`m/following/checks.test.mjs`) | imported `bio-plane/src/plane/register.mjs`, which moved to `store-assembly/register.mjs` (K5200 item 99) | path changed; the file is 33/33, the module 128/128 |
| answer-envelope (K5343: 18 reds; `m/answer-envelope/families.test.mjs`) | the same import | path changed; the module is 48/52 (4 inherited reds, one listed below) |
| interface-shell `page-contention.probe.mjs` | the same import, in the probe's template | path changed (a probe, not in the suite's run) |

## Not stale: the cause is in the product or a stamp; entries for the module's T53 job (settle first: is the test or the product right?)

| module | red | cause found |
|---|---|---|
| screens-inquiry | R44 `words.test.mjs`, R19 `t48.test.mjs` | the screen reads `screen.question.leggrade.act`, a key `words.json` does not hold (UNKNOWN_WORD). DEC-443 (held, K5315) gives it; the words or the screen is wrong, not the test |
| screens-intake | R23 `held.test.mjs` | the refusals drawn are `[CRUCIAL_IN_BATCH, undefined, CONTESTED_IN_BATCH]`; the second row's code is missing (product) |
| screens-daily | R46 `browse.test.mjs`, R83 `fix2.test.mjs` | the match is not emphasised in the excerpt (`[]` for `sewer`): the plane's excerpt or the draw changed (product) |
| ratification | R4,R9 `converted-c.test.mjs`, `converted-d.test.mjs` | C-2.8 is refused but the finding's keys / detail differ from what the test expects (detail text moved; product) |
| case-checker | R2 R8 R19 `g50-path.test.mjs` | the recorded verdicts (`g50-old-verdicts.json`, made by `make-g50-goldens.mjs`) carry `checks_version` 1.79.0, the checker now says 1.80.0; a golden re-recorded is a decision on what the golden pins |
| promotion | `system/row-census.test.mjs` | CENSUS MOVED: rows changed or arrived with no record (C-2.8, C-33.65, C-115.40 ...); promotion's stamp is due |
| answer-envelope | R15 R7 R2 `families.test.mjs` | `CHECK_FAMILY_FILES` order: expected row C-107.2, got C-33.61; the catalogue order changed with case-inputs' file |
| installer | R33 (4 tests) | same red at the tranche tip (inherited); the Worker size bound |
| journey-check | 22 tests | same 22 at the tranche tip (inherited) |

## Not examined by the sweep (entries as BOB listed)

screens-daily R7; screens-inquiry R5..R41 (acts by registry), R101, R10, R114, R2 state a, `document.test.mjs`, `fr28-document.test.mjs`, `t51-document.test.mjs`; control-plane R100, R105, R9 seam §5. A red needing the product's reading is not a sweep act (P7).
