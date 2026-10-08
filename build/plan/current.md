# Plan T39

**Status** · OPEN · BOB #144 · session_017eYwzMF5vwqLhpqcuC3iU8 · depth 1

**Jobs** · bundler: BUNDLER #13 session_01Gr94vczwdnNrPgdvnxrCWd; pdf-reader: PDF-READER #5 session_01TmZK6qZWMuPDraW8kWN2cb; image-cover: IMAGE-COVER #2 session_01713tY2AEJZPTinfdxFZjHr; doc-clean: DOC-CLEAN #1 session_01RzWTiZh7mVWEYFtHXN4VP5; membership: MEMBERSHIP #30 session_01BHB26L3trKhKn9LPYbpK5d; promotion: PROMOTION #37 session_01D4tF1JLHNsN3tZR6mHerE1; acquisition: ACQUISITION #15 session_01KoNcJWSwALaZQ9B5mKBcnH; provenance: PROVENANCE #19 session_01Cwa88YYi7hCLFZzpdk7gAE; file-safety: FILE-SAFETY #4 session_01TJ4PTCM3iSyJeRYmdDY3L3; answers: ANSWERS #6 session_01V8KJuWEPKX3WrBN7Ff1rdT; agent-runner: AGENT-RUNNER #1 session_01NpUoSSKhpotLhikWUwzPRL; case-grammar: CASE-GRAMMAR #12 session_015c5pkGR6f8FDqbTSrFjvzi; case-carriage: CASE-CARRIAGE #6 session_01LmwYYcJzTZXw2vJWwsENHv; publication: PUBLICATION #26 session_01WbD8jksEcAKJZvuvR4ohT8; public-read: PUBLIC-READ #17 session_01Djbnfgfma73t1Qd5xWboXx; ratification: RATIFICATION #22 session_01Ky2nmjoLmrWwGBPjKWFCBF; case-checker: CASE-CHECKER #9 session_013nDuZWRyji4rYH9ax6JrLQ; case-disclosures: CASE-DISCLOSURES #7 session_017U4puvgg5SbVfxAghkjSpV; case-authoring: CASE-AUTHORING #1 session_01KsXLvmNX6T1sjWsVXjcN7x; scheduler: SCHEDULER #33 session_01D563oouGGZLMyLRRFhNngN; queue: QUEUE #21 session_01BUk7szvsRmbWApiCReZVmt; setup-words: SETUP-WORDS #1 session_01A2AS5brGMcep6rEBjmj3fa; instance-setup: INSTANCE-SETUP #18 session_01LAKZqntsHmW1zsfg2HmycE; answer-envelope: ANSWER-ENVELOPE #5 session_01VJ9zkzA3SixCM3jpN9ut6b; plane: PLANE #28 session_01FHJ4WgvZK4SkDMHVE5W2mn

**At T39's opening (K2339):** T38 closed by PR #17 (`main` @ `147f356dfe`, K2339); `tranche/T39` from it. Drafted during T38 (P18) by BOB #143 and re-checked at the opening: no design-stream `MERGE` came, so rule 4 leaves N797–N799 out; N806 Q1 answered A (K2334); N807 joins L11.

**Sources** · `next.md` N748, N751, N780, N794, N796–N806; T38's `current.md` rule 6 (reds still open at its close); `plan/draft-T39-N806.md` (K2333); rulings K2302, K2304, K2307, K2308, K2309, K2315, K2329–K2333; the terms register re-read (K2332).

## Legacy census (§5.2 (2))

| legacy module | in T39 | hard reason |
|---|---|---|
| **legacy-ui** (`civicos-ui/`) | stays | Bob's (UX), K633, K1849: it stays until the new interface replaces it; a dependency not yet built: the new member screens and their shell (N672, N559). N794 (its red) left out for the same reason. |

## Rules at the opening

1. T38's rules hold. Merge order within a layer is `modules.json` order unless a layer says otherwise.
2. **N806's packaging is K2333** (`plan/draft-T39-N806.md` §2–§3): at the opening `doc-clean` enters `modules.json` in layer 1 directly after `image-cover` (uses `image-cover`, `pdf-reader`, `ooxml`), empty `paths` and `tests` (K1043), with a membership `MODULE_ORDER` (R83) entry in the same act (K657) — so membership takes a T39 job (L2). Its requirements file is written at the opening from §3. Q1 answered A (K2334): doc-clean R6 removes a member-supplied file's own metadata as well.
3. **Accepted reds at the opening (confirmed at T38's close, K2337, K2338):** (1) coverage: every id marked `*(not yet met: T39)*` until its module's merge; acquisition R45 until T39-4 (N804). (2) row census: rows T38's L3–L11 jobs added or re-worded stay `awaiting stamp` until T39-3 (promotion); rows T39's L3+ jobs add, until T40's stamp. (3) the UI's DEC-88 tests (Bob's), carried. (4) legacy-ui `statement-ack.test.mjs` (N794, K633). (5) bundler `fleetbundles.test.mjs`:237 until T39-1 (N802). (6) membership R83's `MODULE_ORDER` tests from the opening's addition of `doc-clean` until T39-M. (7) the plane bundle and `program.mjs`, staled by any merge, regenerated at each layer's close.
4. **N797–N799 enter only if DEC-184–DEC-186 are on `main` at the opening** (B117 asked UX-DESIGN for a MERGE at T38's close). If they land, BOB writes their entries at the opening (membership or project-roster `handlecheck`, `handlechange`; publication's fact; case-carriage, case-disclosures, public-read labels; op-declarations, op-grades, control-plane, affordances shares) into the layers below.

## Entries

### L1
- **T39-1 · bundler** · (N802) `fleetbundles.test.mjs`:237 re-pins agent-worker's 23 inputs from the committed manifest (`signin.mjs`), test only · K2302 · req: none.
- **T39-2a · image-cover** · (N806) R8 `stripMetadata`, R9 (test) · K2315, K2333 · req: draft §3.
- **T39-2b · pdf-reader** · (N806) R37 `PdfDoc.objects()` · K2333 · req: draft §3. **P6:** 3,108 + ~60.
- **T39-2c · doc-clean (new)** · (N806) R1–R6 `cleanDocument` (R6: the document's own metadata, K2334) · K2315, K2333 · req: draft §3 · depends T39-2a, T39-2b (merge after both).

**L1 merge order:** bundler, pdf-reader, image-cover, doc-clean (copy-free; doc-clean uses the other two).

### L2
- **T39-M · membership** · R83's `MODULE_ORDER` names `doc-clean` (L1) and `setup-words` (L11, tolerated until its job) · K657, K1185, K2343 · req: R83 (`plan/draft-T39-reqs.md`).
- **T39-3 · promotion** · (N800) C-18.8 verifies over the released bytes, C-4.2 refuses a prototype-key type, with tests; stamps every row awaiting stamp at T38's close and T39's L1–L2 rows; (N808, joined at its START, K279) C-18.8 reads `bundle.md`'s bytes as bytes, not `latin1` (`release.mjs`:30) · K2285, K1542, K2343 · req: the rows' behaviour, BOB's wording. Merges last in L2.

### L3
- **T39-4 · acquisition** · (N804) a test naming R45 · K2307 · req: none.
- **T39-5 · provenance** · (N806) R62 `fetchedByThisCopy` (file-safety R6's source condition lifted) · K2333.
- **T39-6 · file-safety** · (N806) R6 reads provenance R62 · K2333 · depends T39-5.

### L6
- **T39-7 · answers** · (N803) the `uses` edge to ai-runs and its Uses line (`aiUseCheck`, `countAskUsage`), the sign-in arm on an ask or a draft, with a test · K2304.
- **T39-8 · agent-runner** · (N801) R2 names `signin` alone; any path taking a `subscription` token removed; a test that one is refused · K2290.

### L8
- **T39-9 · case-grammar** · (N806) R12/R14 wording: `obscured` names a member document's cleaned copy · K2333.
- **T39-10 · case-carriage** · (N806) R15 member documents, R16 `documentCopy`, R1/R8/R13 amended, C-141 rows · K2333 · depends T39-2c, T39-5. **P6:** 984 + ~350.
- **T39-11 · publication** · (N806) R57's C-122.7 `DOCUMENT_COPY_CHANGED_SINCE` · K2333 · **P6:** 3,799 (small change only).
- **T39-12 · public-read** · (N806) R23 wording · K2333.
- **T39-13 · ratification** · (N805) R67's scheduled stop carries `PHOTO_MARKS_CHANGED_SINCE` and its translation, with a test · K2308.
- **T39-14 · case-disclosures** · (N806) R6's member-document arm, R7's copy row, C-120 rows with BOB's translations · K2333.

- **T39-17 · case-checker** · (N806) its readable `/3` specification (`spec.mjs`:179–220, its R14) names a member document's cleaned copy beside a photo's for the `obscured` kind; words only, no format change · K2333, K2343 · req: R14's wording.
- **T39-18 · case-authoring** · (N806; a provided service changed in this tranche, P10's exception, mechanics §7) its tests compose the real case-disclosures over the real case-carriage: give the fixture (`test/m/case-authoring/fixture.mjs`:278–280) and `photos.test.mjs`:35's stand-in a `documentCopy` answer (case-carriage R16), so a load-bearing document reads as its real state, and test that a chain refused `DOCUMENT_COPY_PENDING`, `DOCUMENT_COPY_UNDETERMINED` or `DOCUMENT_NOT_CLEANABLE` (case-disclosures R6, R22) is answered by `publishCase` as case-disclosures answers it, writing nothing (R18) · K2374 · req: none changed; if its requirements do not state that relay, the job asks BOB (QUESTION) · merges after case-disclosures.

### L10
- **T39-15 · scheduler** · (N806) calls `case-carriage.copyBatch` on `copyWake`, the edge · K2333.

### L11
- **T39-16a · setup-words (new)** · (N807) R1–R4: the word list copied to `bio-plane/src/setup-words/index.mjs`, rows frozen · K2337, K2343, K2375 · START `starts-T39/setup-words.txt`.
- **T39-16b · instance-setup** · (N807) R68 split: re-points to setup-words, deletes its copy · K2375 · START `starts-T39/instance-setup.txt` · after T39-16a.
- **T39-19 · answer-envelope** (tests only) · `families.test.mjs`:250's C-120 pin gains C-120.20–.22, .21 and .22 decorated with `DOCUMENT_WORDS` verbatim · K2378, K2383.
- **T39-20 · plane** · `docket.test.mjs`:54's purge list gains `CASE_CARRIAGE_DOCUMENT_TABLES` (K2377); (N810) `pdfjs-dist` 4.10.38 exact in `devDependencies` with its lock, R7's clause and test; R18's T39 clause (case-carriage's receipt listener and the scheduler's reach) with two tests: a non-fetch receipt queues and a `direct` one does not; one `onAlarm` with `CAPTURES` bound copies a queued member PDF under `<namespace>/obscured/<sha>` · K2346, K2377, K2383 · merges last.
- **T39-21 · queue** (tests only) · `bio-plane/test/conclude-project.test.mjs`: `GET`/`POST` lift `token` into `Authorization` as `scheduler/plane.test.mjs`:42–51 does (admission R20, C-38.10) · K2381, K2383.
- No other L11 module owes T39 anything (`plan/draft-T39-L11-shares.md` §4; K2383).

**L11 merge order:** queue, setup-words, instance-setup, answer-envelope, plane last.

**Requirement text for L2–L10:** `plan/draft-T39-reqs.md` (reviewed, K2343), applied to each module's file before its layer's START.

## Left out of T39 (one hard reason each)

| entry | hard reason |
|---|---|
| N748 | Bob's (P17): the investigation design lane; H2/H3 narrowed K2075 (K2329) |
| N751 | a measurement: no fresh policies |
| N780 | a deployment: the next release cut (K1501) |
| N794 | Bob's (K633, K1849) |
| N796 | Bob's (P17): held with the investigation design lane's related question (K2334); sign-in members' standing questions stay refused meanwhile |
| N797–N799 | DEC-184–DEC-186 not on `main` (rule 4), unless merged at T38's close |
| T38's carried rows (`current.md` "Left out of T38") | their reasons unchanged; re-read at the opening |
