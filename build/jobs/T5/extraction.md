# T5 · extraction — job record

**Session** EXTRACTION #1, `session_014jiwG7P66ao1PbMJXwqhSF`, on `job/T5/extraction` (from `tranche/T5` @ `1e75fac6b2`). Process: civicos-process `roles/JOB.md`, mechanics §6, §12.2, §13, §14, §16. BOB: read from the Status line of `build/plan/current.md` on `origin/tranche/T5`.

**Status** · WORKING. QUESTION 1 sent; carrying on with everything it does not decide.

**Read whole:** `roles/JOB.md`, `PROCESS-MECHANICS.md`, `build/manifest.md`, `build/layers.md`, `build/requirements/extraction.md`, `build/extraction/extraction.md`, `build/requirements/calibration.md` (public part), my entry T5-2 in `build/plan/current.md`, rulings K23, K31, K49, K57, K61, K64, K72, K73, K104, K126, K133; `build/jobs/T4/capture.md` (the extraction pattern); record-core's and promotion's factories; the legacy code the map names, measured again (below).

## The legacy ranges, measured again (`1e75fac6b2`)

- `index.mjs` (11,256 lines): the text-unit budget and REC-111 note 217–286; `reextractRow` 3755–3761; the tier ladder `needsTier2` … `ocrTextFromMember` 4227–5414; `op=pdfstructure` 7008–7327; `op=acquire`'s reading block 7360–8080.
- `store.mjs` (46,657 lines): the text-index constants 733–788; `#writeReadings` … `#observeIndexed` 17983–18757 (`#observeIndexed` stays, observation-log's); `#persistedReading`, `#chainOfReading` 18932–18957; `#backfillRefTerms` … `transcribedDocuments` 22038–22202; `#calDriftFor`, `calibrationDrift` 22387–22493; `documentsByReference` 22713–22758; the term helpers 23127–23186; dispatch arms 45553–45640 (in part).
- `schema.mjs` (3,428 lines): `readings` 228, `reading_refs` 278, `reading_ref_terms` 358, `reading_text_source` 2309, `capture_text` 2913, `reading_history` 3354.

## Questions

**QUESTION 1** (sent 2026-09-27; open). Three points; I carry on with my best reading of each and stop on none of them except (1).
1. **N48 is defined nowhere.** My entry names "N48 (REC-206's derivation)", but no N48 line exists in `build/plan/next.md`, `build/rulings.md` or the archive. Connections' map §5.4 proposes REC-206's derivation (agenda item membership in a file by containment, `land/worker/REC-206`, 173 lines) lands in `extraction` or `docprofile`, served on `op=pdfstructure`, its address shapes taken from the jurisdiction profile; connections R30/R49 hold the stored and served membership. No extraction requirement states the derivation, so no test of mine can name it. *Best reading:* land it as a pure function in `bio-plane/src/extraction/`, served additively on `op=pdfstructure`'s answer, shapes from the active profiles; this needs a requirement id in `build/requirements/extraction.md` (or the derivation re-routed to `docprofile` or `connections`). I leave N48 unbuilt until you answer.
2. **Calibration's factory.** I build against calibration R10–R12 as `calibrationOf(ctx)` from `bio-plane/src/calibration/index.mjs` (K61's pattern), with `drifted` from `calibration.mjs`; until CALIBRATION #1 is merged my factory takes the provider as an option, and the legacy store keeps `op=calibrate`'s echo. Please confirm the name when you merge it.
3. **R21 (K104), "a reading this instance did not compose".** *Best reading:* `read` runs in the Durable Object and records the digest of every reading it composes; a reading carried in `data/provenance.json` whose digest this instance did not record is written as an assertion: the `readings` row and its history carry `origin: "asserted"`, `asserted_by` (the promotion's author stamp), its standing (member, machine or plane, by the author stamp) and the caller's justification (`doc.reading_justification`, kept verbatim, or null). Rows written before this change read `origin` null (undetermined).
