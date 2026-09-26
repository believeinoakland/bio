# Plan: tranche T2, layer 1 completed

**Status** · OPEN. Opened by BOB #41, 2026-09-26 (PROCESS-MECHANICS §5), from the plan BOB #40 prepared. Branch `tranche/T2` starts at the commit that opened this plan. Bob's weekly meter at the opening: not yet given. BOB's session: `session_01JwTyEmUPSgvwiHEwzCzoxK` (BOB #41, since 2026-09-26).

T2 builds every remaining layer-1 module: 13 jobs, all concurrent. Every job writes requirement-named tests for every live id of its module, so the coverage check passes (P7). `jurisdictions` provides the profiles `id-spaces` and `docprofile` use (N1–N3, N11): its branch merges into `tranche/T2` as soon as it completes, and those two jobs are told (mechanics §4); until then they build against the profile interface in `build/requirements/jurisdictions.md`. Built work named in a row sits on the snapshot branch and is judged against the requirements at the job, never landed as it stands. A row cut short here is given whole in `docs/development/transition/old-plan/` or on the snapshot branch's plan.

## Layer 1

**jurisdictions** (30 ids)
- T2-1 · Requirement-named tests for every live id.
- N1 · 2026-09-25 · Create the module and its first profile, Oakland and Alameda County, holding every local fact now in code: identifier spaces and forms, publishing systems, coverage floors, recogniser vocabulary, default search terms, each with its measurement. Rule: `layers.md`, "No jurisdiction in the product".
- N11 · 2026-09-26 · The profile's action sections, R23–R30 (sources of standards, offices addressed, action kinds with their tiers, venues and templates, legal deadlines), built with N1 (K15).

**test-support** (9 ids)
- T2-2 · Requirement-named tests for every live id.

**bundler** (10 ids)
- T2-3 · Requirement-named tests for every live id.

**runtime-limits** (25 ids)
- T2-4 · Requirement-named tests for every live id.

**signatures** (29 ids)
- T2-5 · Requirement-named tests for every live id.
- N7 · 2026-09-25 · BOB #37 ruled: the signing page's source (`tools/sign-release.html`) and its generator (`bio-plane/scripts/embed-signpage.mjs`) move into `signatures`, which serves the page, so the module's own tests can check that the page it serves is the current render. `modules.json` gains the two paths when the files move. K33: the page's source moves to `bio-plane/src/sign-release.html` and the generator stays at `bio-plane/scripts/embed-signpage.mjs`, both now `signatures`' paths; the job leaves `tools/sign-release.html` in place and BOB removes it at the layer close.

**id-spaces** (25 ids)
- T2-6 · Requirement-named tests for every live id.
- N2 · 2026-09-25 · Take identifier spaces, systems and floors from a profile. Rename the spaces for any jurisdiction (`enactment`, `project`, `fund`, `parcel`), per `requirements/id-spaces.md`.

**office-readers** (25 ids)
- T2-7 · Requirement-named tests for every live id.
- D-415 · A WORKBOOK'S `sheet-range` UNITS ARE WHOLE SHEETS ONLY: `formats-xlsx.mjs` turns `definedNames` into anchor links and emits one `usedSheetRange` per sheet; table parts and ODF named ranges are not read. — owner COFF. Built work: `land/worker/D-415` @ 48245247, judged at the job.
- DIST-14 · THE CSV SIZE BOUND (20 MiB, reused from COFF-6) IS NOT SETTLED: node measured 254.5 MiB of heap at the bound against Cloudflare's documented 128 MiB isolate (their claim), and local workerd walked a 73.6 MB body without the production cap a

**odf-reader** (43 ids)
- T2-8 · Requirement-named tests for every live id.
- D-612 · EVERY REAL GOOGLE DOC EXPORT EMBEDS `Fonts/fontN.ttf`, REFERENCED BY `svg:font-face-uri`, AND D-351's MEMBER RULE REFUSES THOSE REFERENCES, so the .odt digest reads UNDETERMINED on ALL 8 real Docs (M-167) and the monitor's false "changed" a Built work: `land/worker/D-612` @ f2dcbc6c, judged at the job.
- D-346 · THE THREE OPENDOCUMENT ENTRIES EMIT NO `core-properties` AND NO `intra` LINK: `odf.mjs` never reads `meta.xml` or the manifest and says so with `outside_content_xml_not_read` markers, while Content Framework §16 says the formats "preserve t Built work: `land/worker/D-346` @ 96eeb2d5, judged at the job.

**format-registry** (27 ids)
- T2-9 · Requirement-named tests for every live id.

**text-chain** (86 ids)
- T2-10 · Requirement-named tests for every live id.
- D-633 · WHEN TIER 2 WINS A PAGE, `mergeTier2Text` REPLACES ITS MARKERS, SO D-627's `image_content_unread` IS LOST AND THE PAGE ROUTES NOWHERE. Reproduced through op=acquire with an answering tier-2 stub (the held INFO-2026-0301 does not escalate, s Built work: `land/worker/D-633` @ cbc5ae9b, judged at the job.
- D-723 · A PAGE TWO PARTS SHARE (D-635: folio from the text layer, OCR transcription appended) READS `ocr` — the part appended last — though BOB #35's 09:35Z rule makes a unit covered by steps of different kinds `mixed`; the record calls the text-la Built work: `land/worker/D-723` @ fe2b9a6d, judged at the job.
- D-416 · A READING POSITION CANNOT FALL INSIDE A `sheet-range` EXTENT: `readingPositionInExtent` (`textchain.mjs`) returns false whenever the reading's arm and the extent's differ, so a cell reading never earns the connection its range should. The i

**docprofile** (35 ids)
- T2-11 · Requirement-named tests for every live id.
- N3 · 2026-09-25 · Move the Oakland council headers, municipal-code citation patterns and other local vocabulary (12 files) into the profile. The recognisers match whatever the active profiles supply.

**ocr-worker** (21 ids)
- T2-12 · Requirement-named tests for every live id.

**pdf-worker**
- D-622 · 2026-09-26 · Decoders for JBIG2 and JPX image-only pages (old-plan row D-622), held out of T1 as too large for the certification run. (N9 moved to T1.)

## Job sessions (layer 1, started 2026-09-26 16:52 UTC)

| module | session | title |
| --- | --- | --- |
| jurisdictions | `session_014szwz88Jt9EWztKH5wfE1v` | JURISDICTIONS #1 |
| test-support | `session_01ASkdafQGFCeqoncTyWGLPC` | TEST-SUPPORT #1 |
| bundler | `session_015mpX96po6BkGDjNJ5AVwMB` | BUNDLER #1 |
| runtime-limits | `session_019P3M1pLBD1XzdjzkJULhF6` | RUNTIME-LIMITS #1 |
| signatures | `session_01GJC6ytwQrBRdr2Y8KdcybF` | SIGNATURES #1 |
| id-spaces | `session_01JxBcyrvDmhXth7LevtRM2H` | ID-SPACES #1 |
| office-readers | `session_01Evj8HyEdBGojZqKJhpkumU` | OFFICE-READERS #1 |
| odf-reader | `session_0191Ek5BuDhcVCoPJoHo62Ge` | ODF-READER #1 |
| format-registry | `session_019LnvZG7rvC4fK35bUVv3MW` | FORMAT-REGISTRY #1 |
| text-chain | `session_011N1d8x7gArcfWDvLkY3fC5` | TEXT-CHAIN #1 |
| docprofile | `session_01QLCYkFnXjtMweB8KWin4FT` | DOCPROFILE #1 |
| ocr-worker | `session_01LumujCtUSN1WBLyoke2Hz2` | OCR-WORKER #1 |
| pdf-worker | `session_01SSonB7dLsY8mZoHgBAoHT6` | PDF-WORKER #2 |

## Completions verified by BOB (ownership, coverage, module tests on the job branch)

- format-registry · `job/T2/format-registry` @ de542e00 · 27/27 ids, 27 pass · 2026-09-26 17:03
- test-support · `job/T2/test-support` @ 381fbc11 · 9/9 ids, 22 pass · 2026-09-26 17:04; N22 deferred to next.md
- runtime-limits · `job/T2/runtime-limits` @ 3303a511 · 25/25 ids, 25 pass; four flaws fixed in `cpu.mjs`; REPORT: pdf-worker and ocr-worker bundles stale (input `cpu.mjs`), regenerated at the close · 2026-09-26 17:05
- id-spaces · `job/T2/id-spaces` @ 165a608e · COMPLETE reported 17:07; verified after `jurisdictions` merges (its adapter imports it); REPORT: plane bundle stale; N23 to next.md; K45
- signatures · `job/T2/signatures` @ 886fc4e6 · 32/32 ids, 42 pass; REPORT: plane and newgroup bundles stale (regenerated at the close; newgroup added to the manifest, K46); N24; bundler comment forwarded · 2026-09-26 17:10
- ocr-worker · `job/T2/ocr-worker` @ cc8f7103 · 21/21 ids, 195 pass (K40 merged); three flaws fixed; own bundle rebuilt · 2026-09-26 17:13
- jurisdictions · `job/T2/jurisdictions` @ ca7ec6e6 · 30/30 ids, 35 pass · MERGED into `tranche/T2` @ 332aff0c at 17:12 (early, mechanics §4); CHANGE sent to id-spaces and docprofile
- office-readers · `job/T2/office-readers` @ 9c5b4866 · 25/25 ids, 57 pass; nine flaws fixed; DIST-14 deferred (needs a deployed plane); N26, N27; plane bundle stale · 2026-09-26 17:13
- text-chain · `job/T2/text-chain` @ 51a38ec0 · 86/86 ids, 86 pass; K50; N28; plane bundle stale · 2026-09-26 17:13
- odf-reader · `job/T2/odf-reader` @ 8e5e530e · 43/43 ids, 45 pass; D-612, D-346 met; K52; N29 (formats-odf legacy test red by design) · 2026-09-26 17:15
- id-spaces · `job/T2/id-spaces` @ 27b7c4ba · 26/26 ids, 32 pass (against the merged profile); rec203-idspaces 45/0 and bounds 206/0 load the plane · 2026-09-26 17:19
