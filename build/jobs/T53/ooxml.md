# ooxml (T53)

**Status** · session_018BhcedTff8SmCMqu2EScxc · depth 2 · WORKING
**Sessions** · 2

## Completion (2026-10-28)

## ooxml · T53 · report

**Entry T53-503 applied** (R37, K5624: the readers' rows to the beta). The module's source needed no change: every figure it bounds by was already taken through `boundOf` (R6, R30, R31, R35), and the two tied rows stay tied (`ARCHIVE_TOTAL_MAX` and `ARCHIVE_TREE_TOTAL_MAX` to `archive.unpacked_bytes`, `MEMBER_MAX` to `archive.member_bytes`). The change is in the tests.

- **Pins removed.** `ooxml.test`, `archive.test`, `round9.test`, `pieces.test` and `startup.test` no longer pin 20 MiB, 32 MiB, 256 MiB, 16 MiB, 4096, 100000 or 10001. Each reads its figure from `boundOf(kind, row)`, and each fixture sized by a bound (a docx over the text bound, the declared 20 MiB+1 parts) is sized from the exported bound.
- **New `standard.test.mjs`** (5 tests, R6, R29-R31, R35). The module is evaluated once more against a `boundOf` that answers the `standard` column of the real `READ_BOUNDS`, whether or not that column is active. No figure is written in the test. It shows:
  - the figures and ties at standard (`MEMBER_MAX` and `ARCHIVE_TOTAL_MAX` 2 GiB, text and streamed text 100 MiB);
  - `textPlan` partitions correctly at standard;
  - refusals by declared size at the standard figures, before any read;
  - a member above the alpha figure (320 MiB) is listed and cut verified, held well under half its size;
  - a text part of the streamed ceiling (100 MiB) is read in pieces, peak under a Worker's 128 MB.

**Measurements at the standard figures** (node 26, heap plus buffers sampled, fixtures from a prebuilt file in a fresh process):

| read | declared | peak |
| --- | --- | --- |
| `readPartPieces`, text | 100 MiB | 54 MB |
| `readPart` whole, then decoded | 100 MiB | 139 MB |
| `streamMember`, one member | 2 GiB | 21 MB, 30 s of node CPU |
| `streamMember`, one member | 300 MiB | 18 MB, 4.5 s |

**A figure the module cannot hold (for BOB and runtime-limits).**
1. `office.text_bytes` standard (100 MB) is a *whole-read* bound (R6, `textPlan`'s `whole`). A whole read of a 100 MiB text part peaks at 139 MB for `readPart` and the decode alone, before any reader parses it, over a Worker's 128 MB. At 30 MiB a docx reader was measured at 96 MB (R35). The module cannot hold that figure whole. Pieces holds the same size in 54 MB.
2. With `text_bytes` and `streamed_text_bytes` both 100 MB at standard, `textPlan`'s pieces band is empty, so nothing between 20 and 100 MiB is read in pieces. Recommendation: keep `text_bytes`' standard at the whole-read figure a Worker holds (its alpha, 20 MiB), and `streamed_text_bytes` at 100 MB. The standard figures are the row's, not mine to change.
3. A 2 GiB member is cut in 21 MB but takes 30 s of node CPU, mostly the module's own SHA-256 (no host `DigestStream` in node). A Worker's CPU budget for that is not measured here.

**Found in other modules.** R34's test, `startup.test.mjs` "R34 evaluating the module builds none of its derived tables", is red on the tranche before my change and after it. The iterations it counts are in runtime-limits' `read-bounds.mjs`: `deepFreeze` at load (172 iterations) and `boundOf`'s `BETA_STANDARD_ROWS.some(([k, n]) => ...)` destructuring (84, from ooxml's own `boundOf` calls at evaluation). That is the runtime-limits module's evaluation cost, not a table ooxml builds. A fix there (no iteration at load or per call) clears it. It is inherited, not mine.

**Not done.** None of the entry. T53-524 (export the MS-CFB reader, `build/plan/T53-R1/ooxml.md`) arrived in the tranche after my START and is not among my entries: not applied, BOB places it.

**Met** · R6, R29, R30, R31, R35

Tests: 104/105. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Inherited reds: ["R34 evaluating the module builds none of its derived tables, and its fresh import is measured as bundler R31 measures a global scope"]
Size (session_018BhcedTff8SmCMqu2EScxc): test runs 1, module lines 2609
