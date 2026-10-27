# Consistency across the lanes' drafts (PLANNING)

**Status** · L3 rows DECIDED by BOB as recommended, every row (K5448; the three new readers are BOB's packaging of capability Bob ruled). Kept by PLANNING; one row per overlap or collision between drafts, with the owner and the order PLANNING recommends. BOB decides each (P17: numbering, placement, `uses` and order are BOB's; a row marked Bob's goes to QUESTIONS.html). Updated at each entry; L3 first.

## 1. Requirement-id collisions (numbering is provisional until BOB writes the lines, README rule 6)

| module | draft A | draft B | recommendation |
|---|---|---|---|
| jurisdictions | PLANNING A2 R99 (`governingFiscalYear`, `withStatedFiscalYears`) | CAPABILITIES N1257 R99-R120 (layers) | N1257 keeps R99-R120; A2's line becomes R121, rewritten as a layer fact (§2 row 1) |
| local-facts | PLANNING A2 R23, R24 (stated fiscal year, its setting) | CAPABILITIES N1257 R23-R27 (team layer entries, reports, old paths) | N1257 keeps R23-R27; A2's become R28, R29, as an entry of the team layer (§2 row 1) |
| queue-producers | PLANNING A6 R56, R57 (one item per member's keys) | CAPABILITIES N1257 R56 (layer changes told once) | A6 keeps R56, R57 (Bob's answer, already decided); N1257's becomes R58 |
| money | PLANNING A2 R36-R38 (fiscal keys, the view) | CAPABILITIES N1260-a | cite draft ids (A2-R4..R7); BOB numbers at writing (K5448) |
| screens-inquiry | PLANNING A1 R140 (opening form) | CAPABILITIES N1260-b | as above (A1-R4) |
| content | PLANNING A8 R63-R64 (typed grade, labels) | CAPABILITIES N1259-a | as above (A8's content lines) |
| (general) | every lane drafts from the file's highest id | — | BOB numbers at writing, in the order the plan's entries list them; drafts cite each other by draft id (A2-R99, N1257-R99) until then |

## 2. Overlaps of subject (one owner each)

| # | subject | drafts | recommendation (owner) |
|---|---|---|---|
| 1 | A government's fiscal year stated by a member | A2 (local-facts stated fact `@team/fiscal_year/<body>`, a setting read through jurisdictions) and N1257 §J (a one-value fact of a layer; a team's own entry with "how I checked") | **One mechanism: N1257's team layer.** The place's records are the shipped layers; a member's statement is a team-layer entry for `fiscal_year` per government, with source and how checked, confirmed as N1257 C3 says. A2's money and civil-time lines stand unchanged (they read the combined view); A2's local-facts and jurisdictions lines are re-cut onto N1257's R23 and R115-R117. Same job (local-facts, layer 5; jurisdictions, layer 1). If N1257 slips, A2's own lines are the fallback. BOB's. |
| 2 | The safe picture of a photograph | A4 (file-safety R60-R64 and image-cover R12-R14: in-plane redraw of baseline JPEG and PNG) and FILES CC3, CC4 (the container decodes HEIC, AVIF, TIFF and the rest; CC4 the safe picture) | **One rule, two decoders.** file-safety owns the safe picture and its metadata table (A4 R60-R64, the one security review R64); image-cover redraws JPEG and PNG in-plane; for every other image kind the container (FILES CC3) decodes to pixels and the same redraw and the same `PHOTO_FACTS` table apply. FILES's CC4 is replaced by a pointer to A4. A4 L2-6 (Bob) is then "JPEG and PNG at once, the rest with the container". BOB's. |
| 3 | Email | FILES `mail-reader` (layer 1, EML, MSG, MBOX, attachments) and CAPABILITIES N824 (forwarding address, intake) | **mail-reader reads; N824's intake files through it** (FILES ML6 says so). N824's draft is not READY; PLANNING checks it uses `mail-reader`'s services and adds no parser. |
| 4 | Archives | FILES CC5 (the container opens ZIP, TAR, GZ, 7z) and control-plane's `archive.mjs` (T52-85 files an unpacked member through provenance) | **The container unpacks; control-plane only routes and files** (T52-85 stays a carried entry; its job reads CC5). |
| 5 | Timing checks on a deployed copy | PLATFORM PL5, PL6 (budget check in journey-check) and FILES's acceptance corpus N1268 (where kept and walked is unnamed) | **Both in journey-check** (it already walks a deployed copy over HTTP), as two of its walks; no new module for N1268. Bob's N1268 text allows "journey-check or a new acceptance module, BOB's". BOB's. |
| 6 | The load test's module | PLATFORM PL40-PL43: new `load-check` (layer 11) using `journey-check` | `journey-check` "imports no module and is imported by none" (layers.md, helper modules). **load-check uses op-declarations, runtime-limits and test-support only**; what it shares with journey-check (a session driver) moves to test-support, or load-check takes its own. A helper module carrying no product capability: BOB's (layers.md ruling 5 as amended). |
| 7 | A check that every op and screen declares a budget class | PLATFORM PL3 (a `proc check` finding) | The checks live in `civicos-process/checks/` (a process change, P3): the same route as TESTS-SWEEP's words-check change (K5425 (a)). Recommend the finding is first a test of `op-declarations` (P7, at the module's interface), the process check later. BOB's. |
| 8 | Per-level bounds | PLATFORM `service-levels-draft.md` PL20-PL28 (not READY) and FILES SIZES-N1267 (READY) | **One table in runtime-limits**: FILES's per-kind bounds are the Level 1 row; PLATFORM's levels add rows. PLANNING folds when service levels turn READY. |
| 9 | The container | FILES CC1-CC6 (`reader-container`, the heavy kinds) | Bob accepted the container line (K4831 (2)); no `reader-container` module is in `modules.json`. **A new layer-1 module** (a standalone worker, like file-scanner: bytes in, results out), its capability ruled by K4831; adding it is BOB's to report, unless BOB judges it a new capability for Bob. |
| 10 | New readers' order | FILES: `structured-text-reader`, `mail-reader` before format-registry (order 19) | Agreed: both layer 1, after ooxml (14), before format-registry (19); mail-reader after structured-text-reader. Re-pin membership R83's `MODULE_ORDER` (BOB's act before layer 2's START). |

## 3. Order in the plan that the drafts ask for

- jurisdictions R99-R108 and the four defects before the layer split and its migration test (N1257 §G); the split in the same job (layer 1).
- The new readers and the container (layer 1) before acquisition, file-safety and capture (layer 3), reading-pipeline (layer 4): R1's layer order gives it.
- PLATFORM's throwaway test T-a (a BOB act, K5434 (1)) before R1's layer 11 START, so op-declarations, admission, store-door and plane jobs start with its figures (T52-42's "first: BOB's throwaway test figures").
- The load test after R1 (R2, measure), with a short "before" run on the alpha's design first (PLATFORM §6).
