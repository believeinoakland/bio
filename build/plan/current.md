# Plan T44

**Status** · OPEN · BOB #155 · session_017fXJJy4Fp2h84wRcexJoGg · depth 1

**Jobs** · image-codecs: IMAGE-CODECS #5 session_0192ECShmFQefWJ5mQLg6Ptw; pdf-pixels: PDF-PIXELS #5 session_01HryQFWAv5MrBMYBBygXxEJ; promotion: PROMOTION #42 session_015sXXurg5etajFj626NU7kC; capture: CAPTURE #28 session_01K31cLKkb342PaC6HHChFmE; extraction: EXTRACTION #21 session_018BewFdRoHKTRNejfX4TPW9; steps: STEPS #3 session_01DFB5ozwU2VhpMC9hsjyxyD; ai-use: AI-USE #5 session_01H1R4ztdXafotE4yLeiGxhV

**At T44's opening (K2735):** opened 2026-10-11 from `main` @ b9ec6c6eb5 (T43 closed, K2733; PR #25, DEC-191 and DEC-192, on `main`), with `tranche/T43`'s handoff commit merged in. Development runs (Bob, K2605); the 80% pause (K2341) and the account-switch rule stand. Bob's meter: not given for T43; 35% weekly during T44's L2 (K2741).

**Sources** · `next.md` N751…N878 (each re-tested today); `archive/T43.md` Outcome (its carried reds); `draft-T44.md` (adopted, K2719), re-worded at this opening for DEC-192 (N876, K2729) as each layer's fold states; the design lanes' `HANDOFF.md` (investigation to H43, done; actions to H15, nothing handed off as requirements); the channel (UX-DESIGN to U158, nothing unread); `rulings-active.md`.

## Legacy census (§5.2 (2))

| legacy module | in T44 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens (N672, N559). N794 and N865 (its reds) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; promotion's stamp merges last in its layer (K425, K1680). Each layer's requirement text is folded into its modules' files before that layer's START (BOB's wording, P5): from `draft-T44.md`, re-worded for DEC-192 (N876).
2. **Every job reads its own code and tests whole** (P20, mechanics §6 step 2): two T43 jobs skipped it and a whole read then found three flaws (K2726, K2727, K2730). Each START says so.
3. A job that adds a file outside its module's listed `paths` names it in its COMPLETE, and BOB adds it before the ownership check (K1043).
4. **Accepted reds at the opening** (from T43's Outcome, K2732; re-confirmed against `node checks/run.mjs` at the close: format, architecture, coverage, channels 0 failures):
   1. coverage: every id marked `*(not yet met: T44)*` until its module's merge;
   2. row census: rows T43's L3+ jobs added or changed, until T44-3's stamp; rows T44's L3+ jobs add or change, until T45's;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865, K2688);
   5. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   6. PR #25's words and registry (K2732): ai-use `reads.test.mjs`:144, `t43.test.mjs`:24, 79 until T44-7; notice-producers `accounts.test.mjs`:95, 121, `words.test.mjs`:22 until T44-10; affordances `t36.test.mjs`:54, 93 until T44-9; op-declarations `t34.test.mjs`:148 until T44-11.

## Entries

### L1
- **T44-1 · image-codecs** · (N868, K2701, K2702) R1: colour converted row by row from the subsampled planes, output unchanged, live set measured; new R11 `decodeBaselineJpegRows`, strip-wise, rows equal to R1's · req: R1, R11 (`draft-T44.md` N868).
- **T44-2 · pdf-pixels** · (N868) R42: a JPEG decoded while reduced (through `image-codecs` R11), Pillow-exact; `PICTURE_FRAME_MAX` on the reduced frame; new `PICTURE_SOURCE_MAX` measured, admitting 48 MP phone frames; PNG unchanged · req: R42 · after T44-1.

**L1 merge order:** image-codecs, then pdf-pixels. pdf-worker's and ocr-worker's bundles regenerate at the close.

### L2
- **T44-3 · promotion** · (K1680) stamps the rows T43's L3–L11 jobs added or changed (C-51.7 re-worded, K2717, among them) and any of T44's L1–L2 · clears rule 4 (2)'s first half.

### L3
- **T44-4 · capture** · (N870, K2708) the held `sourceFingerprint` and `#knockKey` deleted; R87: no source fingerprint, no doorbell table; Status re-worded · req: R87.

### L4
- **T44-5 · extraction** · (N869, N876; DEC-191 (4), (5), DEC-192 (1), (2), (6)) R71: `says` read by key for nothing sent (`transcribe.notsent`), a photo not prepared (`transcribe.picture.unprepared`), a relayed or worker refusal (`transcribe.refused`, envelope unchanged, K2713), a post with no reading back (`transcribe.failed`); R27: `capture.picture.unread` for a picture's unread page · req: R27, R71.

### L6
- **T44-6 · steps** · (N873, K2726) R23: `laterFound`'s entry answers `looked_at`, the instant of the look · req: R23.
- **T44-7 · ai-use** · (N869, N859, N876; DEC-191 (1), (2), DEC-192 (4)) R8: `EXPLORE_OUT_OF_SCOPE`, `EXPLORE_ASK_INVALID` rows; R13: read by key, all nine uses; `AI_USE_WORDS` equal to `words.json` (`ai.when.month` "on 1 {month}"); (N871, K2720) `LIMIT_PERIOD_FILL`, `LIMIT_WHEN_FILL`, `MONTH_NAMES` deleted · req: R8, R13 · clears rule 4 (6)'s ai-use reds.

**L6 merge order:** independent; `modules.json` order (steps, ai-use).

### L8
- **T44-8 · case-carriage** · (N872, K2722) `index.mjs`'s two `membership/index.mjs` imports merged into one; no requirement changes.

### L11
- **T44-9 · affordances** · (N874, K2726) its roster's read of `by` checked against plane R6's `class:ai/<tokenId>` before plane's change; (N877, K2730) test titles naming op-grades' retired ids re-titled, duplicated pins dropped; (N878, K2732) R48: `owed_pagetranscribe` re-keyed `pagetranscribe` (`act.pagetranscribe.does`) · req: R48 · merges first in L11 · clears rule 4 (6)'s affordances reds.
- **T44-10 · notice-producers** · (N869, N876; DEC-191 (3), DEC-192 (3), (4), (5)) R16, R17: `{date}` by `date.daymonth`, or `date.daymonthyear` outside the current year; `{when}` in `ai.queue.limitreached*` from `ai.until.*`; `NOTICE_WORDS` equal to `words.json` · req: R16, R17 · clears rule 4 (6)'s notice-producers reds.
- **T44-11 · op-declarations** · (N878) R47: `pagetranscribe` leaves the owed set (served), its clause re-worded; `t34.test.mjs`:148 · req: R47 · after T44-9 · clears rule 4 (6)'s op-declarations red.
- **T44-12 · store-door** · (N875, K2726) `pull.test.mjs`:15, 45 re-worded (C-118.7 is doorbell's alone, doorbell R21), the row read from doorbell's family; the edge `store-door` → `capture` dropped if nothing else uses it.
- **T44-13 · plane** · (N869; DEC-191 (4), (5)) R36: `NO_PAGE_RENDERED` carries `refused` per page; (N874, K2726) R6: the gated hook's `by` for an `ai` caller aligned with control-plane R17 (`class:ai/<tokenId>`) · req: R6, R36 · merges last in L11.

**L11 merge order:** affordances, notice-producers, op-declarations, store-door, plane last.

## Left out of T44 (one hard reason each, re-tested today)

| entry | hard reason |
|---|---|
| N751 | a measurement: no fresh policies beyond the 74 read (K2079) |
| N780 | a deployment: the next release cut (K1501) |
| N794, N865 | Bob's: legacy-ui stays frozen until the new screens replace it (K633, K1849) |
| N824 | Bob's: "D42 - email: A" (K2425), after upload is in use; and a deployment |
| N828, N855, N858, N861 | a dependency not yet built: the actions lane's requirements hand-off (its step 5) is not written; D12–D16, D18, D19 open with Bob |
| N829 | a measurement: the test set's matters and answers are written by people (D11, D14 C) |
| N842 | a dependency not yet built: the interactive AI paths and N829's test set |
| N847 | a dependency not yet built: the pointer's content is the UX design stream's (N821); no provider named |
| N852 | a dependency not yet built: the runner passes text only; images published where Containers pull (N780) |
| N853c | a measurement: OCR's accuracy on members' photos |
| T41's carried rows (N821's runner, screens and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747) | unchanged from `archive/T41.md` "Left out", re-tested: the new screens (N672), Bob's rulings, measurements and deployments still hold |
