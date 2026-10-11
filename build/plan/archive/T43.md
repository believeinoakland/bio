# Plan T43

**Status** · OPEN · BOB #154 · session_01EVm8g7mziJQi1eQQrAtbNW · depth 1

**Jobs** · record-grammar: RECORD-GRAMMAR #14 session_012hin3suQbyht8NAUmKGuMq; bundler: BUNDLER #15 session_0176Gs2ArDkbAyfHKBHEdKdd; format-registry: FORMAT-REGISTRY #3 session_012CR9FjettQwdGvBEvk8MPR; image-codecs: IMAGE-CODECS #4 session_01EmjAtfa4SNhFFjZAmrA9eZ; pdf-pixels: PDF-PIXELS #4 session_019UE5f9dE91LZQFBmRUVev4; promotion: PROMOTION #41 session_01FkEawkkBapPx1hxUZQnZ2M; doorbell: DOORBELL #2 session_01SeTaW1cz4FqJ1wHpmaFkGf; capture: CAPTURE #27 session_012qi9yvQTQeqGH156Kzdsx8; reading-pipeline: READING-PIPELINE #11 session_019yQjhXavJgJ8jeJUx1hSuj; extraction: EXTRACTION #20 session_01PpDwes3iUurs4FGnAcYgt6; ai-use: AI-USE #4 session_01PGo386JSs5puaX7h4qsnRV; case-carriage: CASE-CARRIAGE #8 session_01PxDxPr7SJLCkDhtDDmxDB8; ratification: RATIFICATION #24 session_012ngwe4Kgzm9pxD9KFXVVr7; case-disclosures: CASE-DISCLOSURES #10 session_018GVoxZK3C1A3DkJm7htB9G; case-authoring: CASE-AUTHORING #25 session_0115vgTqhQQu4wvo26nopLhu; action-clocks: ACTION-CLOCKS #10 session_014tjdf4yFn78qjmuSy3i49E; affordances: AFFORDANCES #28 session_01S81AeYUiK3j4br2K1UYVmu; notice-producers: NOTICE-PRODUCERS #7 session_0185KLN8pZrLcZSM86tkn1wY; op-declarations: OP-DECLARATIONS #18 session_0126JHqriJqLtHSVj8Cj7oxW; admission: ADMISSION #9 session_012MAkFR3nxswi8gLq5bSoFY; answer-envelope: ANSWER-ENVELOPE #8 session_01NrTsqzXz9Abjh9zWaPQcvE; control-plane: CONTROL-PLANE #30 session_01DfugQdQ5JweBPDomQkf9rS; plane: PLANE #31 session_01V89kk4XDE4kvMKxapFk858

**At T43's opening (K2697):** opened 2026-10-11 from `main` @ 0b28d3b32d (T42 closed, K2696; PR #23, DEC-189 and DEC-190, on `main`). Development runs (Bob, K2605); the 80% pause (K2341) and the account-switch rule stand. Bob's meter: 26% weekly during T42's L9 (K2677); asked again at this opening.

**Sources** · `next.md` N751…N866 (each re-tested today); `archive/T42.md` Outcome (its carried reds); the drafts adopted for this tranche, `draft-T43-cleanup.md`, `draft-T43-words.md`, `draft-T43-n853b.md` (K2689, K2691); the design lanes' `HANDOFF.md` (investigation to H43, done; actions to H15, nothing handed off as requirements); the channel (UX-DESIGN to U152; B133, B134 asked for word keys); `rulings-active.md`.

## Legacy census (§5.2 (2))

| legacy module | in T43 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens (N672, N559). N794 and N865 (its reds) left out for the same reason. |

It is the only module marked `legacy` in `modules.json`.

## Rules at the opening

1. **Merge order** within a layer is `modules.json` order unless the layer says otherwise; a provider merges before its users; promotion's stamp merges last in its layer (K425, K1680). Each layer's requirement text is folded into its modules' files from the adopted drafts before that layer's START (BOB's wording, P5).
2. **The opening's act (K2697):** `modules.json` gains the edge `answer-envelope` → `doorbell` (N851). A job that adds a file outside its module's listed `paths` (image-codecs' `pngdecode.mjs`, pdf-pixels' `picturepixels.mjs`) names it in its COMPLETE, and BOB adds it before the ownership check (K1043).
3. **Layer 3's three merges (K2689):** doorbell first (its rows its own, N851), then capture's delete (N849, N863, N864), then doorbell re-opened by `CHANGE` to drop `capture.declareTables()` and the held arm (N864), merged again.
4. **Accepted reds at the opening** (from T42's Outcome; re-confirmed against `node checks/run.mjs` at the close: format, architecture, coverage, channels 0 failures):
   1. coverage: every id marked `*(not yet met: T43)*` until its module's merge;
   2. row census: rows T42's L3+ jobs added or changed, until T43-6's stamp; rows T43's L3+ jobs add or change, until T44's;
   3. the UI's DEC-88 tests (Bob's), carried;
   4. legacy-ui `statement-ack.test.mjs` (N794, K633), `progression-revision.test.mjs` and `queue-recipients.test.mjs` (N865, K2688);
   5. doorbell R25's ownership arm until T43-8 and doorbell's second merge (N849, N864);
   6. the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close;
   7. `fleetbundles` agent-worker's 25-input pin until T43-2;
   8. action-clocks `overdue.test.mjs`:151 and action-plans `invariants.test.mjs`:50 until T43-8 (N864);
   9. from T43-7's first merge (K2709): answer-envelope R7's totality and pinned-row tests miss doorbell's family until T43-14 (N851).
   10. (found at T43's L1, K2704; red on `main` since T42's close) DEC-189's words merged at T42's close (2bfa372ccc): ai-use `counting`:167, `limits`:198, `reads`:144 until T43-11; notice-producers `accounts`:36, 47, 88 until T43-13; affordances `t36`:55 until T43-17; op-declarations `t34`:68, 145, 307, `t37`:105, 177, 218, `t38`:76, 87 until T43-18; and from T42-8 (636f27bb74), case-carriage `invariants`:66, `rereads`:149, 167, 195, 212 until T43-16.
   11. (from T43-6's merge, K2706: the write door's stricter C-2.1, N854) action-clocks `calendar.test.mjs`:60, 132, 201, 247, 278 and `factreader.test.mjs`:39, 72, 80, 119, 138 (`fixture.mjs`:162 prepends a second `counterparty` key) until T43-20; ratification `converted-b.test.mjs`:166 (:180 prepends `edition` twice) until T43-19.
   12. (from T43-8's merge, K2710: capture no longer creates doorbell's tables) admission `harness.mjs`:189 (5 R21 tests) until T43-21; case-disclosures `fixture.mjs`:260 (4 tests) until T43-22; case-authoring's fixture (4 tests) until T43-12; control-plane `envelope.test.mjs`:391 (`NO_SUCH_KNOCK` pinned in capture's table) until T43-23.

## Entries

### L1
- **T43-1 · record-grammar** · (N857, K2643) R29: C-33.40's `where` names all five `NO_BASIS` sites (money's `setFundType`, lines' `noBasis` added); (N854, K2625) new R56 `idDisagrees(fm, folderName)`, the one C-1.1 judgment `checkBundle` and the write door share · req: R29, R56 (`draft-T43-cleanup.md`).
- **T43-2 · bundler** · (N860, K2650) `fleetbundles.test.mjs`:248–261 re-pinned to agent-worker's 26 inputs (`src/transcribe.mjs`); tests only · clears rule 4 (7).
- **T43-3 · format-registry** · (N853b, K2691) R29 `jpeg`, R30 `png`: one picture page, no text layer; R23 lists twelve entries · req: `draft-T43-n853b.md` §3.
- **T43-4 · image-codecs** · (N853b) R10 `decodePng` (pixel-exact against Pillow over PngSuite); Purpose, R6, R7 · req: `draft-T43-n853b.md` §3.
- **T43-5 · pdf-pixels** · (N853b) R42 `renderPictureToPixels` (orientation, grey, integer reduction to `maxEdge`, PNG; `PICTURE_FRAME_MAX` measured by the job), R43 EXIF orientation; R39's keys · req: `draft-T43-n853b.md` §3 · uses image-codecs' R10 (merge after T43-4).

**L1 merge order:** record-grammar, bundler, format-registry, image-codecs, pdf-pixels (pdf-pixels after image-codecs; the rest independent). pdf-worker's and ocr-worker's bundles regenerate at the close.

### L2
- **T43-6 · promotion** · (N854, K2625) R38: C-1.1 and C-2.1 judged at the door by record-grammar's arms (R56, `parseFrontmatter`); the job first reports which held records the stricter door would refuse on their next revision; then stamps T42's L3–L11 rows and T43's L1–L2 rows (K1680) · req: R38 (`draft-T43-cleanup.md`).

### L3
- **T43-7 · doorbell** · (N851, K2609) R21: C-85 and C-118.2/.3/.4/.7 defined in `src/doorbell/checks.mjs` alone; R25's tests written to its own ownership · merges first.
- **T43-8 · capture** · (N849, K625, K2607) the doorbell copy deleted, R37's rows gone; (N863, K2672) R58: a repeat `captureOf` supplying nothing creates no table; (N864, K2680) R87: `declareTables` declares only when its tables exist · after T43-7 · clears rule 4 (5), (8).
- **T43-7 again · doorbell** · (N864) R25: no `capture.declareTables()` call, no held arm · by `CHANGE` after T43-8's merge.

**L3 merge order:** doorbell, capture, doorbell again.

### L4
- **T43-9 · reading-pipeline** · (N853a, K2611) R29: an account or limit refusal answered as `aiRefusal`, beside `aiNote` · req: `draft-T43-cleanup.md`.
- **T43-10 · extraction** · (N853a) R71: a relayed refusal answered as that refusal, nothing written; (N853b) R73: the format read from the stored bytes, R71 names a picture's one page; (N862, DEC-190) R47 `transcribe.refused.notdeployed`, R71 `transcribe.label` and `says` (`transcribe.done` | `transcribe.none`, the latter only when agent-worker was asked and filled nothing), R27 `unread_pages` and `unread_says` (`document.unread.pages`) · req: the three drafts · after T43-9.

### L6
- **T43-11 · ai-use** · (N856, DEC-189) R3's unjudged refusal (`ai.refused.limit.unjudged`), R13's fills read by key (`ai.period.*`, `ai.when.*`, `date.month.*`, `ai.use.*`, `ai.limitfield.*`), `AI_USE_WORDS` equal to `words.json` (today its copy of `ai.refused.explorenotenabled` predates DEC-189: clears rule 4 (10)'s ai-use reds, K2704); (N862, DEC-190) Terms (nine use kinds), R13 `ai.use.transcribe.*` · req: `draft-T43-words.md` (a key `words.json` lacks for a use with no T43 AI path, `enquire`, `read`, `account`, is not tested until named, B133).

### L8
- **T43-16 · case-carriage** · (K2704) `test/m/case-carriage/fixture.mjs`:33 hands `sources` `doorbell` (`{pulledKnocksOf}`), not `capture`, since T42-8; tests only · clears rule 4 (10)'s case-carriage reds · merges in L8 before case-authoring.
- **T43-19 · ratification** · (K2706) `converted-b.test.mjs`:180 writes one `edition` key, not two (the write door refuses a duplicate key since T43-6, R38); tests only · clears rule 4 (11)'s ratification red.
- **T43-22 · case-disclosures** · (K2710) `fixture.mjs`:260 builds doorbell's tables (`doorbellOf`) before inserting into `inbox`, which capture no longer creates since T43-8; tests only · clears rule 4 (12)'s case-disclosures reds.
- **T43-12 · case-authoring** · (N850, K2608) R69: `accountPropose`, `accountDrafts`, `registerReviewComments` deleted, `case-account`'s alone; Uses struck; `account.test.mjs` re-pointed; its fixture builds doorbell's tables before inserting into `inbox` (K2710, rule 4 (12)) · req: `draft-T43-cleanup.md`. case-account's two wording lines are BOB's, folded before L8's START (no job).

### L9
- **T43-20 · action-clocks** · (K2706) `fixture.mjs`:162 writes one `counterparty` key, not a second one prepended (the write door refuses a duplicate key since T43-6, R38); tests only · clears rule 4 (11)'s action-clocks reds.

### L11
- **T43-21 · admission** · (K2708; CAPTURE #27 J1) `src/admission/window.mjs`:82 builds the door window's fingerprint through `doorbellOf(ctx).sourceFingerprint` (doorbell R12), not capture's held copy; `modules.json` edge `admission` → `doorbell` (BOB's, at the job's COMPLETE); `harness.mjs`:189 takes `knock_key`'s DDL from doorbell's schema (K2710, rule 4 (12)) · then capture's held `sourceFingerprint` is deleted in T44 (N870).
- **T43-17 · affordances** · (K2704; DEC-189, DEC-190) `t36.test.mjs`:55 re-pinned to the design's 213 texts (37 acts re-keyed from `owed_<op>`, four retired); `ACT_HELP` gains the design's texts for `pagetranscribe` and `transcribe` (both ops declared) · clears rule 4 (10)'s affordances red.
- **T43-18 · op-declarations** · (K2704; DEC-189) `t34`, `t37`, `t38` re-pinned to the design's registry (37 acts now served functions; four still owed) and `mock-acts.js`'s re-keyed names; tests only · clears rule 4 (10)'s op-declarations reds.
- **T43-23 · control-plane** · (K2710) `envelope.test.mjs`:391 reads `NO_SUCH_KNOCK` from doorbell's family, not capture's table; tests only · clears rule 4 (12)'s control-plane red · after T43-14.
- **T43-13 · notice-producers** · (N856, DEC-189) R16's limit-reached item by scope and its fills by key; R17's ten kinds' `summary` and `detail` by key, `ai.label.explored.member` for members who do not own the account; `NOTICE_WORDS` re-read from `words.json` (its `{for_use}`/`{Uses}` fills and the retired key `act.owed_exploreapprove.label.queue` predate DEC-189; clears rule 4 (10)'s notice-producers reds, K2704) · req: `draft-T43-words.md` (`{date}`: the local day, month by `date.month.*`, until B133 is answered).
- **T43-14 · answer-envelope** · (N851) new R12: `CHECK_FAMILY_FILES` lists `src/doorbell/checks.mjs` after capture's; `families.test.mjs`:353 · clears rule 4 (9).
- **T43-15 · plane** · (N862, DEC-190) R24: the `bundle` screen's acts gain `reading`, `pagetranscribe`, `transcribe`; (N853b) R36: a `NOT_A_PDF` page rendered by `renderPictureToPixels` (grey, `TRANSCRIBE_PICTURE_EDGE` 1,568 px, checked against the provider's documentation at the START); (N866) R6's gated hook's `ai` author aligned with control-plane R17 or the op's recorded D-311 form · req: the drafts; N866's text before L11's START.

**L11 merge order:** `modules.json` order (affordances, notice-producers, op-declarations, answer-envelope), plane last.

## Left out of T43 (one hard reason each, re-tested today)

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
| N859 | the design stream's: its word keys are asked (B133), not yet given |
| T41's carried rows (N821's runner, screens and shortcuts; T38's screen rows; N757; N563, N579, N632, N641, N643, N645, N652, N698 parts; N703 part; N647; N650; N666; N747) | unchanged from `archive/T41.md` "Left out", re-tested: the new screens (N672), Bob's rulings, measurements and deployments still hold |
