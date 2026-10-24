# Review A of fix-round-9-T51.md (DRAFT): correctness of causes and citations, completeness against GAP

Read from `origin/tranche/T51` at `bab227d868` (`git show`; nothing edited). The plan (395 lines), GAP.md whole (Stage 1, section 7 whole), K4426 (`rulings-active.md` line 54), K4831-K4835 and `modules.json` (176 modules) were read. About 260 file:line citations were extracted by script and shown at their lines; roughly 70 were read at the line (the first line of each cite), about 55 hold and 12 do not (D1-D5, N1). Line references below are to the plan file.

Overall: the structure is sound. All 101 absorbed Stage 1 causes of GAP section 7 appear by id, every bullet carries fields (1) to (4), merge positions in the job table match `modules.json` exactly, and K4835 (1)-(6) are reflected in the job table. The defects are mostly wrong or unsupported citations (the plan's own warning that "each job re-reads" does not excuse a cited line that says something else) and job-to-file ownership holes.

## D: defects to fix before STARTs

**D1. G125c (l.117) cites `image-cover/png.mjs:342, 350, 364-366`; the file has 234 lines.** The width-sized buffers are at `png.mjs:158` (`stride = W * bpp`), 172-174 (`prev/cur/outPrev/out/filtered` all `new Uint8Array(stride)`). `strip.mjs:71, 105, 148` hold (the 2-byte marker `subarray` at 71). Re-cite png.mjs, or the cause (1) is unevidenced.

**D2. G125h (l.122) calls `ooxml.mjs:1533` "`readContainer`".** `readContainer` is at `ooxml.mjs:451` (`readPart` 593, `readPartPieces` 639). Line 1533 is `if (totalEntries > ARCHIVE_ENTRIES_MAX)` inside `listArchive` (1478), which G125d (l.118) itself says holds the entry check. The claim "readContainer has no entry cap" has no evidence at the cited line; cite 451+ and show the missing cap there, or the red test (SHEET X15/X16, DOCS O8) may already pass on the listArchive path.

**D3. G141 (l.290) has four wrong citations.**
- `textchain.mjs:352-360` is `pageList()`, not `mergeTier2Text` (that is at 1900; its page map at 1936-1940 is the only part of "1936-1979" that fits).
- `:659-672` is `appendStep`/`checkChain`; `describeChain` is at 979. The "prints page 0" claim is unevidenced (the grammar comment at 1490-1492 says `page` is 0-based by design, which is a requirement question, not a defect).
- `formats.mjs:122-128` is the generic content-type loop of `detect`; the `<html>` sniff is at `formats.mjs:156-165` (the HTML entry at 152).
- `textchain.mjs:1852` (`glyphCount`, defined 1843) holds.
Cause (1) must be re-evidenced before the red tests (DOCS T13 and the text-chain set) are trusted.

**D4. G124b (l.105) "acquire copies every kept part into one buffer to ask 'is it a PDF?'" is not at the cited lines.** `acquisition/index.mjs:1384` is a fetch `reader.read()` catch, `1545-1550` is `keepRenderBodies`/render put, `2339` is the subresources-skipped branch. Format is already read from a head range: `acquisition/index.mjs:1352` (`firstHead = buf.slice(0, FORMAT_HEAD)`, "so the first part is not read back") and R101 `1985-1992` (range read of `FORMAT_HEAD`). The only whole-buffer join near this is `:489` (`new Uint8Array(total)`, in the keep-whole helper, which has a `putFromParts` compose path at 483-486). So the stated red ("acquire of a 20 MiB multipart capture asks 'is it a PDF' from a head range, not a joined buffer") may be green today, which fails K4426 (3). Re-establish what `acquire` joins, or drop the claim.

**D5. G123f (l.96) cites `calculations/index.mjs:490` for "the range path stops at 20,000 cells".** Line 490 is the `catch { return false; }` of `#isCsv`. The only 20000 in the file is `INGEST_SLICE_ROWS = 20000` at 118 (a row slice per transaction, not a cell stop on a range read). The range-read fault text is at 498-499 (`cells_truncated`). Cause unevidenced.

**D6. G127c (l.145) is "Cause unknown" and `diagnosis-R9-capture-identity.md` does not exist** (confirmed: no `diagnosis-R9*` on the branch). Known and blocking by design (the `fixplan` check fails). Note for the diagnosis worker: the refusal at `provenance/index.mjs:1729` is verified, and its inputs are verified too: `shas` = `regs` plus `wholesOfFiles` (1719); the join excludes the same bundle; the upsert keys on `capture_sha` (630-646, `ON CONFLICT(capture_sha) DO UPDATE ... bundle_id=excluded.bundle_id`). H1 (a shared part digest) is therefore mechanically sufficient; what is unknown is only whether the seam fixture actually produced equal part digests. The diagnosis should state the part boundary (8 MiB, `acquisition/index.mjs:1333` `PART`) and whether two distinct PDFs "sharing a large stream" align on it; a stream shared at different offsets gives different part shas and would point to H3.

**D7. Owner/provider holes that would leave a cause unfixed or force an off-module edit (jobs table, ll.316-355).**
- **G94 (l.70).** Its provider is the scheduler (`watch` must record `ran`; `health` carries `running_since`; `scheduler/index.mjs:726-729`, 709-716). Job 33 (scheduler) lists only G91, G95, G92; plane-2 (job 37) lists G94 and would depend on a change no job makes.
- **G125a (l.115) and G132l (a) (l.210).** The raw/Flate route (`pdfstructure.mjs:177-181, 818`) and the TIFF predictor (`pdfstructure.mjs:237-238`) are in `pdf-reader`'s file (`modules.json`: `pdfstructure.mjs` -> pdf-reader). Job 7 (pdf-reader) lists neither G125a nor G132l; job 14 (pdf-pixels) is given "G125a (raw route)" and job 13 (image-codecs) "G125a (ccitt, dct, jbig2)". G132l (a) is on no job at all.
- **G133c (l.219).** `subresources.mjs:810` (the `URIError`) belongs to module `subresources`, which has no job; `reading-pipeline/index.mjs:2720-2724` (deterministic throw recorded `FAILURE_TRANSIENT`; the same lines G129b cites) is on no reading-pipeline item (job 27 lists neither G129b nor G133c).

**D8. G124f (l.109) points to the wrong place and the light-kind standard has no cause bullet.** G124f says "light kinds (CSV, TSV, text) reach the standard in G131a", but G131a is the cp1252 transport (S-4). GAP-1.8 (b) first bullet (text, CSV/TSV, JSON, XML read in byte windows with a carry to 50 MB and 1M rows, S-9) has no bullet in G131: the intro states it, nothing carries cause (1) evidence, an owner (job 27 lists no windowing item; job 4 lists G124f), or a red test that reads (G124f's red, SHEET C03-C08 and X05, asserts the refusal sentence only). JSON and XML appear nowhere as a cause. K4426 (1) and (3) fail for this GAP item; K4831 (3) says light kinds reach the standard in Stage 1 (K4834).

**D9. G133a (l.217) "the 20 MiB guard raised to the alpha's stated figure".** This raises a bound. K4831 (3)/K4834 keep the alpha at today's limits; R-SILENT (l.28) says no job raises or lowers a bound and that bounds changing what a member may do are Bob's (K1881). The same bullet's red says "the bound moves only if the capped child proves it". Reword: the guard stays; the figure change, if any, is BOB's after the capped-child measurement.

## G: gaps against GAP

**G1. S25 (GAP 7.2, "a diagnosis on corpus E3 at GAP-1.6") is excluded** (l.31 lists "S17/S23/S25" as "Stage 2/3 or other rounds"). GAP assigns S25's diagnosis to GAP-1.6; S17 and S23 are requirements/wording (placed). Add a diagnosis item to G128 or say why it is out.

**G2. GAP-1.5's pieces with no bullet.** `readRange(sha, offset, length)` hiding the parts, the whole sha as the only key (register, lookups, citations, safety, reading), the migration of part-keyed rows already in live records, and the direct-to-R2 presigned path are named in G127's header/intro only; G127a (N20) and G127b (X35) are the only bullets. No job names `readRange`; provenance's `register` still writes the part rows beside the whole (`provenance/index.mjs:630-646`). GAP-1.6's "migration of existing readings" (BOB's to schedule) is likewise unplanned. A listed owner and a red for "citation and safety lookups by that sha" are needed (GAP-1.5 Test).

**G3. G124's "every module that keeps a ceiling quotes the table" is not distributed to jobs.** Modules named by GAP-1.2 with no G124 in their job row: file-safety (job 26; `file-safety/index.mjs:72`), file-scanner, doc-clean, image-cover, ocr-worker, workbooks, pdf-reader (has G124d only; `pdfstructure.mjs:495` is its ceiling), office-readers (G124c only), acquisition (G124b only; G124a cites `acquisition:135/139/368`). The "test per quoting module" (l.102) has no owner for these.

**G4. Pieces of causes that land in a module whose job does not list the cause.**
- G131g (UTF-8 decode rule): `reading-pipeline/index.mjs:2323, 2388`, `ooxml.mjs:67`, `docx.mjs:108, 317`: jobs 27, 3 and 5 omit it.
- G131e: `formats-xlsx.mjs:1218` is office-readers' (job 5).
- G131b: the window scan mirror `reading-pipeline/index.mjs:1732` (job 27).
- G128e: the row guard in reading-pipeline (job 27).
- G128f: `control-plane/index.mjs:221, 2681` (job 38).
- G126j: the hook's call sites `reading-pipeline/index.mjs:2646, 2707` (job 27).
- G129e: `plane/unpack.mjs:83`, `plane/pending.mjs:261`, `control-plane/archive.mjs:5-8` (jobs 37, 38).
- G137c: `capture/index.mjs:2351-2364` (job 24).
- G126b: extraction's `read` passing `ocrInvocations: 0` (job 28).
- G126d: odf-reader's part predicate (job 6).
- G138: acquisition's "N pictures kept, not read" count (job 23).
- G123g: scheduler's `last_ms`/ledger stamps (`scheduler/index.mjs:573, 645-672`; job 33).
A START written from the table would omit these.

**G5. "No job's module edited by two jobs" is violated by design:** jobs 20 and 37 both edit `plane` (K4835 (6) places the harness in plane's tests with plane-1 first). Accepted, but the plan should state that plane-2 starts only after plane-1 merges (it says "half of batch A merged"), since two sessions can conflict on `bio-plane/package.json` (G123h, owner plane) and `wrangler.jsonc` (G126i). Likewise control-plane (170) is merged after plane (171), against `modules.json` order (acknowledged, K4811 exception).

**G6. P4 order.** Job 4 (csv-reader, position 15) is given "G130b (the identity function, with format-registry)", format-registry is at 19 and has no `uses` edge to csv-reader (`modules.json`). If the function lives in csv-reader, format-registry needs `uses: csv-reader` (add to 2b/BOB's edge list); if in format-registry, csv-reader would use a later module (P4 breach). The plan does not say which.

**G7. G91 (l.46) "which consumer holds the live firings" remains unknown and G92 "probable".** Acceptable per the plan's fields, but the three "certain" claims for G91's cause rest on citations I could not fully confirm: `pending-work` is not in `SCHEDULER_ORDER` (97-104); it is appended via registration order (`scheduler/index.mjs:542-546`; registered at `plane/store.mjs:508`). The conclusion "last" holds; the text should say "appended after `SCHEDULER_ORDER`".

## N: notes

**N1. Line drift (the plan says reports' lines; re-read).** `acquisition/index.mjs`: `CAPTURE_MAX` is 364 (cited 359), `MULTIPART_KEEP_MAX` 373 (368), the 8 MiB constants 135 `PROFILE_TEXT_MAX`, 139 `ODF_DIGEST_MAX` (134), `PENDING_RENDERS` 571 (2282 is `owedRun`), `supportingOf` 2015 (1985 is the R101 comment). `plane/store.mjs:508` (cited 504) registers `pending-work`. `plane/pending.mjs:348` (G91) is the end of `summary`, not an arm. `file-safety/index.mjs:810` (G136e: "the grade is at 810") is the open/refuse gate; `NOT_SCANNED` is at 807/812.

**N2. Stale text.** Section 2b (l.308 (i)) and G124's header still say the table's home is "recommended" runtime-limits; K4835 (1) rules it. The job table (job 2) already follows the ruling. K4835 (3) (S22 is pdf-worker's) and (4) (site-profiles in X22) are already in G139/G140.

**N3. Verified citations (sample, all at `bab227d868`):** `scheduler/index.mjs` 589-600, 581, 611-612, 684, 709-716, 726-729, `HEAL_EVERY_MS` 150 (and `heal` has no caller anywhere in `bio-plane/src`: G93 holds); `plane/pending.mjs` 63, 91, 195, 206, 319-321, 388; `file-safety/index.mjs` 72, 430, 973, 1032, 1035, 1090, 1106-1109; `control-plane/index.mjs` 213-221, 733-747, 2658; `reading-pipeline/index.mjs` 51, 357-362, 483, 1512, 1548-1554; `extraction/index.mjs` 100, 683, 781, 831, 849-853, 903, 976, 1982, 2194; `pdfstructure.mjs` 162, 237, 495, 707, 933, 970, 979, 1021, 1668, 4308, 4508, 4525; `provenance/index.mjs` 630-646, 1719-1729; `csv-reader/index.mjs` 478, 508, 751, 801; `ooxml.mjs` 121, 265-269, 1478-1537; `wrangler.jsonc:175`; `pdf-worker/package.json:8` (the five-file list omits `test/codecs/`, G139 holds); `workbooks/index.mjs:42-44` (50,000 cells at 44); `textchain.mjs:1843-1852`; `odf.mjs:1507, 1518, 2202`; `render.mjs:337-347`; `browserrender.mjs:125` (`LONG_LIVED_AFTER_MS = 4000`; capture-sources R26 says "The rule is off until N ...": G142 holds).

**N4. All GAP section 7 "Absorbed into Stage 1" causes appear** (checked each id; S-33 and X26 as stated by GAP; N17-N19/N24-as-read are Stage 2/3 and named). S-3 (c, d) and X33's CDP text are round 8's (G101, G110). S-25 to S-31 are placed by BOB (GAP). S-37 is a requirement edit (l.306).

**N5. Merge positions** in the jobs table all equal `modules.json` order positions (checked by script for 36 of 38 rows; rows 20 and 37 are `plane`, 171). The R-LAYER callbacks (registrar, READ_BOUNDS home) match K4835 (1) and (2). No START text contradicts K4831 (3)-(8) as read, apart from D9.
