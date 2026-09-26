<!-- The extraction survey, written for BOB #42 on 2026-09-26 on tranche/T3; its §3–§5 open points are settled by BOB before layer 4's tranche opens, and superseded where they disagree with build/requirements/extraction.md. -->
# extraction — extraction map

**Status** · Measured 2026-09-26 on `tranche/T3` @ `91933d75` (after record-core's early merge) by a drafting worker for BOB #42 (P18). The line numbers are from `grep -n`/`awk` over `bio-plane/src/store.mjs` (53,685 lines), `index.mjs` (13,438), `schema.mjs` (4,180) and `bio-plane/checks/bio-checks.mjs` (16,591); the extraction job confirms them. A range runs from the comment block above a method to its closing brace. The contract is `build/requirements/extraction.md` (R1–R50). Calibration's rows moved to `build/extraction/calibration.md` (N41, K73 (7)); the drift obligations stay here. K31, K49 and K61 apply. **`from`: `["legacy-checks", "legacy-store", "legacy-index"]`**: `legacy-index` because the reading pipeline and `op=pdfstructure` are in `index.mjs` (K49), and `legacy-checks` for C-51 on K64's precedent (§5).

## 1. What moves to `extraction`

**Already on its paths** (move to `bio-plane/src/extraction/` or stay where they are, the job's call): `readingprov.mjs` (218) and `extractrun.mjs` (347).

**From `calibration.mjs`** (calibration's path): `driftObligations` and its header (369–429), R38, into `bio-plane/src/extraction/`; it calls `calibration.drifted`.

**`index.mjs`** (legacy-index)

| what | lines | R |
| --- | --- | --- |
| `ACQUIRE_TEXT_UNITS_BUDGET`, `ACQUIRE_TEXT_UNIT_ENVELOPE` and the REC-111 note | 357–418 | R16 |
| `reextractRow` | 4123–4129 | R32 |
| `needsTier2`, `LAYER_FIDELITY_*`, `NAMED_ENGINE_*`, `layerChainFor`, `needsTier3`, `tier3Pages`, `mergeTier3Text`, `tier3Note`, `OCR_INVOCATIONS_PER_REQUEST`, `OCR_SAME_PROVENANCE`, `askMemberPerPage`, `tier3LoopNote`, `withLoopNote`, `tier3Extend`, `textUnitsFor`, `readEntities`, `readingFromWire`, `ocrTextFromMember` | 4624–5803 | R4–R12, R16 |
| `op=pdfstructure`, including the `ocr=1` re-read | 7614–7957 | R31–R35 |
| `op=acquire`'s reading and text block: the content-type reader, the format wire (tiers 1–3), the container extent, text units, `readText`, the chain and Drive `convert` step, `reading.provenance`, `reading.dialect`, and the answer's `reading`, `text_units` and `text_units_over_bound` keys | 9225–9928, plus the three keys at 9950–9987 | R1–R16 |
| imports now used only by these: `readingProvenance` (316), `mergeTier2Text`, `tier2Note`, `glyphCount`, `layerChain`, `mergedChain` … (the `textchain.mjs` import near 140–146), `readText` (161), `readingDialect` (127) | | |

**`store.mjs`** (legacy-store)

| what | lines | R |
| --- | --- | --- |
| `CAPTURE_TEXT_UNIT_CAP`, `CAPTURE_TEXT_CAPTURE_BOUND`, `CAPTURE_TEXT_CAPTURE_UNIT_BOUND`, `CAPTURE_TEXT_UNIT_CONTAINERS` | 779–800 | R22 |
| `#writeReadings`, `#heldByReextraction`, `#writeOneReading`, `reextractBasis`, `reextract`, `#keepReading`, `#readingHistoryOf`, `#writeTextSource`, `#writeCaptureText` | 19969–20626 | R19–R24, R34 |
| a new `readingOf(captureSha)` (the persisted reading's facts), taken from `#persistedReading` and `#chainOfReading` (20919–20945); a new `unitsOf` with its own index state (R36) | | R30, R36 |
| `#backfillRefTerms`, `readingTermsClear`, `readingHistoryClear` (DO-only test seams), `reindexNames`, `readingFor`, `transcribedDocuments` | 24487–24645 | R19, R27, R29, R37 |
| the drift reads in the calibration region: `#calDriftFor` (its supersession half becomes `calibration.worseSupersessions`), `calibrationDrift`; a new listener registered with `calibration.onCalibration` | 24830–24937 | R38–R40 |
| `documentsByReference` | 25155–25201 | R28 |
| `static #normAlias`, `#cleanLabel`, `#labelTerms`, `#refTermSources` (the term projection's helpers; `#refTermsSql`, `#refReachSql` stay with `documentsNamingEntity`) | 25570–25629, in part | R19 |
| `static #OCCURRENCES_PER_REF` | 26016 | R19 |
| `static TEXT_SOURCE_LIMIT_DEFAULT`, `TEXT_SOURCE_LIMIT_MAX` (also read by other bounded reads: copy them) | 45037–45038 | R29 |
| dispatch arms `reading`, `reextractbasis`, `reextract`, `readingref`, `textprovenance`, `calibrationdrift`, `readingtermsclear`, `readinghistoryclear`, `reindexnames` | 52392–52479, in part | |
| migrations: `reading_ref_terms.src` (939), the `reading_refs` re-key and its copy-back (963–990, 1526–1537), additive columns `reading_text_source.calibrations`, `reading_refs.pos_kind/pos/pos_ref`, `readings.capture_format` (1247, 1280–1282, 1343), `capture_text_fts` and its three triggers (1618–1690), the boot backfill `#backfillRefTerms(500)` (1846) | | |

**Tables it owns** (`schema.mjs`, each with its indexes and the comment above): `readings` (668–687), `reading_refs` (718–733), `reading_ref_terms` (798–807), `reading_text_source` (2922–2950), `capture_text` (3526–3539) with `capture_text_fts` (store.mjs 1661), `reading_history` (4081–4092). About 140 lines of DDL, about 320 with their comments. Purge: `legacy-store` declares the reading tables, `text_attestations` (content's) and `capture_text_fts` today (store.mjs 866–872, record-core R21/R46). Extraction declares them itself (R49); the calibration tables are calibration's.

**Checks** (`bio-checks.mjs`): `REEXTRACT_CHECKS` (C-51.1–C-51.5, 12205–12272). `CALIBRATION_CHECKS` (C-42) is calibration's. `text-chain`'s C-35 family (`checkAttestation`) is used, not moved.

**Size.** The ranges above total about 4,500 lines, about 1,780 without comment-only lines: `index.mjs` 2,297 (765 code), `store.mjs` about 1,170 (about 515 code), `schema.mjs` about 320, checks 68, the files' share 626 (about 300 code). Calibration's module takes about 950 (its map).

## 2. What stays in the legacy modules or goes elsewhere, and why

| what | where | owner |
| --- | --- | --- |
| `extractPropose`, `extractProposals`, `#mintsBound`, `#posFields`, `proposed_readings` (schema 3449–3473), the `extractpropose`/`extractproposals` arms | store.mjs 23473–23847 | **`ai-runs`** (layer 6). They read `ai_runs` and `ai_run_bounds`, gate on the run's principal, and mint through `content.mintContent`, so they need layers 4–6. They use extraction's vocabulary (R41–R43), so `ai-runs` gains a use of `extraction` (§3) |
| `#observeIndexed` (20627–20742), `#observeExtraction` (45209–45301), `#observeReaderRun` (46261–46321) | store.mjs | **`observation-log`**, through `onReading` (R24) |
| `#markContentStale` (23981) | store.mjs | **`content`**, through `onReading` (REC-82) |
| `attestText`, `attestationsFor` (20743–20835), `text_attestations` (schema 2879–2892); `#pageSetForCapture`, `#containerExtentForCapture`, `contentContextFor`, `#containerKindOf` (20946–21268); `#captureForContent` (20836–20918), `mintContent`, `contentRow`, `#attestationsOver` (24138) | store.mjs | **`content`**, as its draft map claims (its §1). The context readers read the reading through R30; the page set also reads `text_attestations`, which is content's |
| `documentsNamingEntity`, `readingNamePlan` (its "oakland" default is N4), `#refTermsSql`, `#refReachSql`, `#resolveOne`, `deriveConnections`, `connectionGradeForContent`, `chooseConnectionPair` | store.mjs | `entities` and `connections`. They read `reading_refs` and `reading_ref_terms` (§3, read contract) |
| the calibration construct, its store region less the drift reads, `calibrations`, `calibration_subjects`, `calibration_signals`, C-42, the `calibrations`, `calibrate`, `calibrationsubject`, `calibrationsignal` arms | calibration.mjs, store.mjs 24646–24829 and 24938–25154, schema.mjs, bio-checks.mjs | **`calibration`** (layer 4, before this module; K73 (7), its map) |
| the `calibration-reprobe` scheduler consumer | store.mjs 3818–3872, 3975 | `scheduler`, which calls calibration's R9 |
| the `recordruntime` compute measurement (`runtime_observations`) | store.mjs 39521–39702 | not extraction's; as capture's Suggestions say |
| the OPS table rows and session sets for these ops (index.mjs 988, 1227–1278, 1360–1364, 2066–2279, 2805–2807), and the stamps of `attestor`, `viewer`, `author`, `proposedBy` | index.mjs | `control-plane` (K3) |
| the capture's intake read-back (`profileText`, `profileBytes`, 9073–9112), `identify`/`doctypeFor`/`profileRecord`, `substanceDigests` | index.mjs | `capture` (R17 there). The reading needs the same `docType`; `read` recomputes it from the document's profile or takes it from capture's answer (§5) |

## 3. Callers to rewire, and conflicts

**Callers inside `store.mjs`** (they call extraction's services once it is extracted):
- `promote` 19827 `this.#writeReadings(...)`: becomes the projection extraction registers (R20, promotion R39; K31).
- boot 1846 `#backfillRefTerms(500)`: moves into extraction's start.
- `contentContextFor` (content's) reads `readings` through R30 instead of SQL; its six callers (21302, 21459, 22401, 22544, 23648, 40383) are content's and ai-runs' to rewire.
- Direct SQL on extraction's tables from later code: `#caseCitations` (9607), `#narrowCandidateList` (14745), `#contradictionDoc` (14929), `#resolveOne` (26168), `deriveConnections` (26497), `connectionGradeForContent` (26800), `chooseConnectionPair` (27080), `earnedBasisRegistry` (27598), `#captureDateMs` (28328), `#legVersions` (39088), `#unitsOf` (40474, `capture_text`), `#missingContentCause` (45396), `#frontierMeaning` (46558), `#attestationsOver` (24138), and `query.mjs`'s `capture_text` search arm (802–859). Either extraction states these tables as a read contract (recommended, as record-core R37 does for `bundles`) or each gets a service.

**Callers in `index.mjs`**: `op=acquire` calls `extraction.read` after capture and answers both (K72 (8)). `tier3Extend`'s `op=calibrations` fetch to the store (5210–5222) becomes `calibration.liveCalibration` (calibration R10).

**`calibrationRecord`** (calibration's) echoes the obligations through R40's listener instead of calling `#calDriftFor`.

**Uses that `modules.json` lacks:**
- `extraction` → `promotion` (R20). Provenance gained the same edge in K49.
- `extraction` → `calibration` (R6, R38–R40), added with the split.
- `ai-runs` → `extraction` (§2).
- After K70's split, `extraction` still uses `pdf-worker` (tier 2 is that Worker's binding) and does not need `pdf-pixels`.

**Conflicts with other modules' rows and maps:**
1. **D-672** (routed to `retrieval`) adds the `sheets` arm to `textUnitsFor`, which is extraction's code, and D-684/D-685/D-724's built branches are stacked on it. *Recommendation:* judge D-672's text-unit arm in extraction's job and its search half in retrieval's.
2. **D-697** is half in `text-chain.mergeTier2Text` (carrying `image_unread`, text-chain R77's family), and **D-665**'s built work adds the marker in `pdfstructure.mjs` (`pdf-reader`). **D-635**'s built work edits `textchain.mjs` and `readingprov.mjs`. **D-685**'s moves the per-unit cap into `bio-checks.mjs`. A job writes only its own paths, so each needs an entry against `text-chain`, `pdf-reader` or `legacy-checks` first, or the constant stays where extraction can own it.
3. **D-724** also serves the skipped units on `op=contentaxis` (store.mjs, `retrieval`'s), and adds `capture_text_skipped` to `schema.mjs`.
4. `text-chain`'s status names D-635/D-665 as outside it, which agrees with this map. `capture.md`'s status gives the reading block as 9250–9932; its comment heading starts at 9225, and the dialect write ends at 9928.

**Code another module could also claim:**
- **`content`** (both drafts claimed these; this draft yields, pending BOB): `contentContextFor` and its readers (20946–21268), which are a reading's facts but read only by citation code; and `attestText`/`attestationsFor` with `text_attestations`, a check on a transcription (Content Framework §16) that `content`'s standing reads. Either placement satisfies the order. With them, extraction would grow by about 470 lines. Both drafts find `attestText`'s missing viewer gate (content R26).
- **`capture`**: the Drive `convert` step (R11) keys on capture's recogniser verdict; with `read` taking capture's document, extraction reads it from the chain's Google hop. The text-unit budget (357–418) exists only because the acquire answer carries the units.
- **`retrieval`**: the text index (`capture_text`, `#writeCaptureText`, `capture_text_fts`) is what search reads. It stays here because it is written in the reading's transaction and K49 routed D-724 here.

## 4. Old-battery tests that anchor on the moved source

These read or edit the moved source text rather than driving the worker. Each needs its anchor moved when the code moves:
- **`nc-*` drivers that edit `index.mjs` or `store.mjs`:** `nc-cpdf10.mjs`, `nc-cpdf19.mjs`, `nc-d536.mjs` (also `readingprov.mjs`), `nc-rec102.mjs`, `nc-rec111.mjs`, `nc-cap9.mjs`, `nc-cap12.mjs`, `nc-sk8.mjs` (`extractrun.mjs` and the store's SK-8 region, which goes to ai-runs), `nc-sk7.mjs`. The calibration suites are in calibration's map §4.
- **Suites that scan or regex source:** `capture-text-index.test.mjs` (lifts the DDL out of `store.mjs`), `bounds.test.mjs` and `derivation-bounds.test.mjs` (scan `store.mjs` for bounds), `tier3-layer-parts.test.mjs` (anchored at an indentation in `index.mjs`), `textchain.test.mjs`, `extractrun.test.mjs`.
- **Suites that drive these ops through the worker** (behaviour, no anchor; the job sorts them): `reading`, `reading-wire`, `reading-position`, `reading-dialect`, `tier2-wire`, `d606-perpage-ocr`, `reextract`, `pdfstructure-op`, `d536-reading-provenance`, `capture-pagecount`, `capture-container-extent`, `pdf-worker-binding`, `ocr-member-e2e` (and `.control`), `producer-provenance`, `provenance-marker`, `textshown`, `rec169-consume`, `rec165-production-principal`, `pipeline-e2e`. `civicos-ui/check-refusal-codes.mjs` reads C-51 from the catalogue.

## 5. Undetermined (stated, not guessed)

- **Where `read` runs, and its input.** The pipeline runs in the Worker, with `env.CAPTURES`, `PDF_WORKER` and `OCR_WORKER`; the writer runs in the Durable Object (`extractionOf(ctx)`, K61). Whether `read` takes capture's answer document or a capture digest plus a context read back from the record, and whether it re-derives `docType` or takes capture's, is for the job, after K72 (8).
- **`from` including `legacy-checks`.** Moving C-51 now follows K64. Leaving it for a `legacy-checks` entry follows the earlier N36 pattern. The refusal-code scripts (legacy-tests) read the catalogue either way.
- **The read contract** for `readings`, `reading_refs`, `reading_text_source` and `capture_text` (§3). BOB's under P17.
- **Whether `#rows`/`#one` and `#bundleRedactor` are copied** as membership's and record-core's jobs did (K57), or reached through `membership`'s viewer services.
