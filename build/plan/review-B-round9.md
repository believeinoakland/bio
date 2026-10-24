# Review B (executability) of `build/plan/fix-round-9-T51.md` (DRAFT)

Read via `git show origin/tranche/T51:...`: the plan whole (395 lines), GAP.md section 3 and 7, fix-round-8 sections 0 and 3, modules.json (order, layers, uses, paths), rulings K4831, K4835, K4787, K4215, K4219, K2032, K3930, K4269. File sizes taken from `git ls-tree -l`. Nothing edited or run. "Line" = line of the plan file.

Counts: **D 12, G 15, N 7.**

## D: must fix before STARTs

**D1. The named corpus cases are the red tests, but their generators and the harness are not available to the jobs that must use them (lines 14, 308, 318, 337, 389+).**
- R-FOUR (3) (line 10) and nearly every bullet name a corpus case as the failing-first test: SHEET C27 (300,000 rows, 6.9 MiB), DOCS O2 (shape ladder), SCAN D1-D8, PDF A6/A7 and so on. Section 2b (vii) (line 308) says the jobs "start together, each using the repository's existing builders" and that "the generators and R path land at the round end (section 7)". Job 1 (test-support, which builds `pdfgen/imggen/sheetgen/docgen`) and job 20 (plane-1, which builds the faults `storeFailAt`/`killPage`/`restartAt`) are in the same batch A as the 18 jobs that need them.
- A job with 8 MiB and 3 MiB CSV/DOCX cases, ZIP64 or a shuffled 10,000-entry directory (G133e) and no generator will write its own ad hoc builder, so 15 different builders for 15 modules. Or it will write a red against an unmerged helper that can't be seen failing for the right reason.
- Fix, one of two:
  - (a) The test-support and plane-1 jobs run and merge first (a small batch 0), with the others starting after. Cost: a serial step, but K4835 (6) already says plane-1 merges first.
  - (b) State per bullet which builder the job writes and which case recipe the START copies, and that the round-end corpus re-proves it. Today the plan says "named case = red test" and "corpus at round end" together.
- Either way the START must carry the recipe (size, shape, seed) of each named case, since jobs do not read the family reports.

**D2. The registrar callback and the job row are not specified, so the providers (acquisition, capture, doorbell, extraction) cannot be coded or tested before plane-2 (lines 124-126, 340-342, 345, 354).**
- K4835 (2) is reflected only as a sentence: "a callback injected by the composition root". What is not stated:
  - the callback's name, arguments and return (G126a only gives `owe({kind:"ocr", sha, cursor, pages_left})`; kinds fetch, unpack, scan, safe view, grade and ingest have no shape);
  - what "in the filing transaction" means across modules (capture files through record-core, the job table is plane's `keeps_pending`);
  - which module is the composition root that wires it (plane? control-plane? both are named elsewhere);
  - the job row's columns. GAP-1.4 lists the contents (bound verdict, state, cursor, counters written/skipped/owed/failed with cause, per-unit attempt stamps, `started_at`, `last_progress_at`, rate, carrier reference, reader version). The plan carries none of them, yet G135f's "about" estimate and the states draw from them.
- Jobs 23, 24, 25 and 28 (batch B, lower order) merge before plane-2 (171). They write "a kill between the put and the transaction finds one job row" with nothing to count rows in.
- Fix: BOB fixes one interface text (`registerJob(db, {sha, kind, cursor, owed, carrier})`, idempotence key, the transaction rule) and copies it into the five STARTs. Name the module that wires it, and who writes the through-the-door test (control-plane's seam, after plane-2).

**D3. The scheduler's platform-shaped double is placed where the scheduler cannot use it (lines 93, 337, 350, G91 (2)/(3) at 47-48).**
- G123c puts the double in plane-1's harness (`bio-plane/test/m/plane/shape/`, line 337). G91 (3) and G95 (3) need it in `scheduler/r8-budget.test.mjs` and `r8-stale.test.mjs`. Scheduler (141, L10) does not `use` plane (171) or `test-support`; `scheduler/fixture.mjs` is the scheduler's own test path.
- `r8-headofline.test.mjs`, `r8-heal-door`, `r8-lag`, `r8-wave` are in plane's test dir. G91's owner is scheduler (job 33). Plane-1 is "test-only" and G93/G94 belong to plane-2.
- Nobody is named to write `r8-headofline` (the G91 head-of-line proof). Round 8 listed it as "held with the reading work" and gave it no job.
- Fix: say the double lives in test-support (job 1) or in `scheduler/fixture.mjs` (scheduler's job writes it from G123c's text), add `uses` test-support for scheduler, and assign `r8-headofline`/`r8-heal-door` to a named job.

**D4. G131g has no owner and the jobs listed cannot make its red pass (lines 192, 322-323, 325-327, 340, 344).**
- G131g ("one decode rule for upload, fetch and parts") cites `reading-pipeline/index.mjs:2323, 2388`, `ooxml.mjs:67`, `docx.mjs:108,317` (office-readers), `acquisition/index.mjs:153,240,1902,2066`, `odf.mjs:187`, `site-profiles/index.mjs:158`, `textchain.mjs:1852`. The heading names no owner.
- The table gives it to odf-reader (6), format-registry (8), text-chain (9), site-profiles (10) and acquisition (23). Not ooxml (3), office-readers (5) or reading-pipeline (27), which hold most of the sites.
- Its red, DOCS T7/H5/D5 "as upload and fetch", cannot pass without those.
- There is also no lower module that all of csv-reader (15), office-readers (16), odf (17), ooxml (14), acquisition and reading-pipeline can quote (format-registry 19 and text-chain 20 are above the office readers). The rule's home is undecided.
- Fix: a ruling for the one decode function's home (ooxml, 14, or runtime-limits), an owner, and add it to jobs 3, 5, 27.

**D5. The "light kinds to the standard" work has no bullet, and G124f points at the wrong one (lines 109, 183-190, 321).**
- G124f: "light kinds (CSV, TSV, text) reach the standard in G131a". G131a is the UTF-8/cp1252 transport bug, not the size lift.
- GAP-1.8 (b) requires text, CSV/TSV, JSON and XML read in byte windows with carry to 50 MB and 1M rows (S-9). The plan has no bullet for it. The CSV 17 MiB (`csv-reader/index.mjs:270`), `WHOLE_READ_MAX` 24 MiB and the 1M-row refusals are only mentioned as a G131 corpus line and as G124f's "alpha = today's figures".
- Its red tests (SHEET C03-C08 "24 MiB + 1", "1,048,577 rows refused") test the refusals as they stand.
- Result: a job reading its entries finds either "keep today's 17 MiB, state it" (G124f) or "bring to 50 MB" (G131 intro), and the 50 MB path (window carry, text/JSON/XML) has no test or owner.
- Fix: add a bullet (owner csv-reader plus reading-pipeline) with its four fields, or say in G124f/G131 that the lift is Stage 3 only; correct the cross-reference.

**D6. The unit-kind chain for G134 has two unowned links (lines 226-232, 345-347, 353).**
- G134 (every part marked with its kind, searchable, citation names the kind) needs: office-readers emit the parts (job 5, listed), `allUnitsOf` in `reading-pipeline/index.mjs:865-872,1127-1131,1187-1204` accept new unit kinds, extraction's unit schema (`extraction/schema.mjs`) store a `kind`, retrieval return it, content cite it.
- G134 is listed in jobs 5, 6, 29, 30, 36. Reading-pipeline (27) and extraction (28), the two places that decide what becomes a unit, do not list it. G134a's own citation of `reading-pipeline/index.mjs:865-872` is the evidence.
- No through-the-door test is assigned (DOCS O4/P3/D1/H6 found "as a footnote" through `op=search`).
- Fix: add G134 to jobs 27 and 28, and name a seam section (see D7).

**D7. The seam list is far shorter than the through-the-door tests the bullets demand (lines 357-360 vs 14, 128-137, 160-166, 228-246, 265-275).**
- Seam sections named: G91/G95, G96-G98, 20 MB ODS, comma CSV, two PDFs sharing a stream, uploaded ZIP, encrypted PDF.
- Bullets whose red is through the door with several modules and no section or owner: G128a/b/h (completeness and search by extent), G129b/c/d (fault at tick 2, kill, standalone image OCR), G134 (kind through search to the Document page), G135a-f (screen walk of each state), G131a-g (encodings upload/fetch), G126e/f/h, G130a-e, G136 (X17 etc.), G137c.
- R-SEAM says the door tests live in ONE file written by control-plane. It also says the corpus R set (section 7.3) runs at round end. So the entry-path reds have neither a job nor a merge point where they turn green.
- Job 38's text lists "sections G91, G95, G96, G97, G98, B2, C, K4833, B, E4 counts"; the seam paragraph lists ZIP and encrypted PDF too. The two lists disagree.
- Fix: list every through-the-door section with providers and the job that writes it. For the G135 screens: screens-intake (164) and screens-inquiry (166) merge BEFORE control-plane (170) and plane-2 (171), whose `op=reading`/`owedwork` they draw from (line 352 names control-plane as provider). Say who turns that test green after those merge (control-plane, last).

**D8. Requirement edits (2b) are not among BOB's acts before the STARTs, but jobs read their own requirements (lines 303-309, 383-387).**
- Section 2b lists a dozen modules' requirement changes (office R30 dates reversed, csv-reader R9 "no listing cap", pdf-reader R8/R9/R22/R41/R42, scheduler R28, reading-pipeline contract, plane job table, file-safety gating...). "A job never writes a requirement."
- Section 6's list of acts "before the STARTs" has: diagnosis, `red.mjs`, generator paths and `uses`, rulings, PLATFORM figures, HANDOFF. No requirement edits, and no time for them (the same-entry rule of GAP 0).
- A job that reads the old R9 (no list cap), R30 (dates raw) or R8 (the modules' 20 MiB) will contradict its own entry.
- Fix: add "BOB writes the 2b requirement changes before the STARTs" with the order (providers' first), or state the entry-to-requirement mapping the START copies.

**D9. K4835 rulings (1), (3), (4), (5), (6) are not fully reflected; the draft still reads "recommended / BOB settles" (lines 100, 305-309, 305 "(i)-(ix)", 36, 331, 334, 387).**
- (1) READ_BOUNDS in runtime-limits: the table row 2 is right (line 319). But G124's heading (line 100) still says "owner reading-pipeline ... the TABLE'S HOME is a layering ruling (section 2b ... recommended)", and 2b (i) "Recommended". GAP-1.2's owner under K4835 is runtime-limits. Job 27 does the "quoting and grep test" (G6 below).
- (1) The `uses` edges from each quoting module to runtime-limits are required by the ruling, yet section 6 (line 387) lists only the test-support edges (csv-reader, office-readers, odf-reader). Modules that quote and do not use runtime-limits today: ooxml, csv-reader, office-readers, odf-reader, pdf-reader, image-codecs, pdf-pixels, image-cover, doc-clean, pdf-worker, acquisition, capture, file-safety, reading-pipeline, workbooks, calculations (ocr-worker, file-scanner and control-plane already do). Also needed and not listed: format-registry and csv-reader as in G130b, control-plane -> ooxml (G126d, mentioned), scheduler -> test-support.
- (3) S22 is pdf-worker's (job 17, correct). But job 13 (image-codecs, line 330) still lists "G139's tests". Both sessions would edit `pdf-worker/package.json` or the codecs tests (image-codecs' test path `pdf-worker/test/codecs/` overlaps pdf-worker's `pdf-worker/`).
- (4) X22 includes site-profiles (job 10, correct), but G140 (line 273) still has `client-rendered.mjs` flagged in "section 2b" as a conflict.
- (5)/(vi) reflected in G129a (line 164). 2b (vi) still lists it as to be settled.
- (6) matches (viii).
- Fix: rewrite 2b "Not for the jobs" as "Ruled (K4835)", remove "Recommended", and fix jobs 13/27.

**D10. Pre-built bundles are not regenerated until the round end, but later jobs' reds run against the real renderer and member (lines 361-363, 115, 205-210, 221).**
- G125a ("through the real renderer"), G132i ("against the committed member"), G132j, G125g, G132k ("R2 bytes read per OCR page") need the pdf-worker and ocr-worker bundles rebuilt after jobs 13, 14, 17, 18 merge. Section 4 says the bundles are regenerated "after their jobs merge", and 7.1 "regenerate in the manifest's order ... at the end".
- Batch B jobs (reading-pipeline 27, extraction 28, control-plane 38) run their tests with those bundles in between, and cannot get green.
- Fix: say who rebuilds after each provider merges (BOB, via the bundler module, before the dependent STARTs), or mark those reds "L against the source, bundle at round end".

**D11. Gated upload half of G127: the job cannot know whether to build it (lines 139-143, 341).**
- If P-M1 shows the zone caps the body, the plan builds "the presigned direct-to-R2 upload" (Worker signs, then registers on completion, per-part signing). That is a new feature with no entry detail, no test, and no module/job split: capture's job (24) also carries G127b/c, the identity, a migration of part-keyed rows, and G126f/G124b.
- "Starts without the figure" holds only for the identity part. The upload half is either a second capture job after the figure or out of the round.
- The migration of part-keyed rows ("A migration ... is BOB's to schedule", GAP-1.5) has no bullet or job although G127's red includes "the migration replays on a copy".
- Fix: say G127 upload half is not in the capture job (its own later job on the figure), give the migration an owner and a bullet.

**D12. Some jobs are too large for one session at about 600 KB (K2032, P6) (lines 344-345, 354-355).**
- Sizes from `git ls-tree -l`: reading-pipeline src 203 K, req 52 K, tests 3,039 K (the subset that names changed requirements is not small), extraction src 282 K, req 75 K, tests 604 K, plane src 320 K, req 95 K, tests 1,389 K, control-plane src 351 K, req 115 K, tests 1,095 K.
- Reading-pipeline (job 27) carries about 30 causes: the whole reader contract rewrite (`plan`/`read` over `{size,readRange}`, three read modes retired, six new ids), G128b-d/g/h, G129a/c, G130, G131f/h, G132 contract, G133f, G135a/b/d/e, G124 quoting, G126b. It reads docprofile (252 K), text-chain (117 K), csv-reader, office-readers, acquisition (287 K) as used services, plus a START of about 80 KB.
- Extraction (job 28) carries about 16 causes: the registrar, migrations, batch landing idempotent by (job,batch), completeness, poison rule, chunking, plus provider reading of reading-pipeline, plane `pending.mjs` and record-core.
- Plane-2 is the job table, ledger, heal, watchdog (about 12 causes and a new table). Control-plane has a 10-section seam file plus G126a-d/G124a/G123.
- The plan counts new ids but never estimates a reading set.
- Fix: BOB estimates each START's reading set (START + requirement + own code + the touched provider files + tests naming changed requirements), and splits the two default-model jobs: reading-pipeline into contract/units (G128*, G129*, G132, G130) and sheets/HTML/screens-facing (G131f/h, G133f, G135*); extraction into registrar/migrations (G126a/e, G127a, G129*) and batch landing/completeness (G128*). Two sessions on one module is already the pattern (plane-1/2); the plan's own limit still holds at 40 jobs (batches of 20).

## G: gaps

**G1. Words: no "keyed via `localize`" rule in the rules for every START, and section 5 is not complete (lines 9-24, 365-381).**
- Section 0 does not carry a rule that every sentence a member reads is keyed through `localize` (K3930) with the owed row to UX-DESIGN (K4269). The only mention is section 5's first sentence ("stand-in sentences are in code, keyed (K3930)"), which the jobs (told to read their START) will not see unless it is copied. The `words` check will fail a job that hard-codes text.
- Member-facing statements in bullets and missing from section 5's rows: G138 ("N pictures kept, not read" with count and size), G132l (wrong-pixel `undetermined` with reason), G125a-h refusals (`IMAGE_TOO_LARGE`, `TOO_MANY_OBJECTS {n}`, `over_cell_bound`, column refusal with count), G131b/c (unterminated quote with row and size; dialect disagreement), G133c ("deterministic failure final with its reason"), G136a/b (`encrypted`, `unknown LIMIT`, `TIME_LIMIT`/`NOT_RENDERABLE` classes), G137e ("refused with its count"), G128e ("omitted with a statement"), G124e/G124c.
- `setup-words/rows.mjs:2404` (G135d) is edited, but setup-words has no job.
- Fix: add R-WORDS to section 0 and to the "Every job" paragraph (line 312); extend section 5.

**G2. Wall-time assertions remain against K4787 / R-CLOCK (lines 115, 129, 130, 120, 47-48, 48).**
- G125a red "a 200 `ok:false`, under 1 s" (PDF D10); G126b `captureupload` "`< 15000` ms" with an OCR stub at 1,650 ms a call; G125f "answered within the stretch bound"; G124d "no tick over the work budget"; G92 "returns within the bound"; G91 "per-consumer line ... over 1 s".
- R-CLOCK allows a wall time "only where a bullet says so"; the bullets do say so for G126b, but each is replaceable by a count (zero OCR calls, bytes allocated, calls made) or a same-run control, as K4787 (1) wants.
- For G91/G92 the bound (10 s, 8 s) should be an injectable constant so the test sets 50 ms and asserts order and counts; the plan's 40 s scanner test (line 47) is real wall time and would be the slowest test of the suite (run alone, five times).
- Fix: state per such bullet the count that replaces the time, and the injectable bound.

**G3. G131e: the XLSX half has no owner (line 190, 321-322).** `formats-xlsx.mjs:1218` is office-readers' file (modules.json), but job 5 does not list G131e, and job 4 (csv-reader) cannot touch it.

**G4. G131d: the calculations half has no owner (line 189, 348).** The fix is "`calculations/index.mjs:506-515` table seam" and the red goes through `tabledeclare`; job 31 (calculations, haiku, "mechanical re-point") lists only G124. A haiku job given a real change restarts one model up (line 314), so make it sonnet or move the change.

**G5. Parts of causes whose files belong to modules with no matching job entry:**
- G133c: `reading-pipeline/index.mjs:2720-2724` (throw recorded as transient, job 27 does not list it) and `subresources.mjs:810` (`subresources` has no job).
- G129b: the "no `more` on transient failure" is in `reading-pipeline/index.mjs:2263-2268,2369,2434,2720-2724` and `pending.mjs:179`; only extraction (28) lists it.
- G125a: "the plane counts the kill as `transient`" (`reading-pipeline/index.mjs:620-650`); job 27 does not list G125a; raw route is `pdfstructure.mjs:177-180,818` (pdf-reader), job 14 lists it as pdf-pixels'.
- G128f: `control-plane/index.mjs:221,2681` `READING_FOLLOWED_MAX`; control-plane's job does not list it.
- G129e: `control-plane/archive.mjs:5-8`, `plane/unpack.mjs:83`, `pending.mjs:261` (plane-2, control-plane); only acquisition (23) listed.
- G126d: odf-reader must supply its part predicate for `declaredTextBytes`; job 6 does not list it.
- G137d: storing/stating illegible pages is reading-pipeline's (GAP-1.12 (d) names it); only ocr-worker (18) listed.
- G138: "N pictures kept, not read" is `acquisition/index.mjs:1985` (`supportingOf`); job 23 does not list it.
- G132l (a) TIFF predictor is `pdfstructure.mjs:237-238` (pdf-reader); job 7 does not list it. The plan's letters "(b, c, e)" on job 14 and "(a), (b), (d)" in the bullet disagree.
- G126e `plane/transcribe.mjs:64` is plane's.
- Fix: a pass through the table so every file:line of a bullet has a job.

**G6. Tests that name a module that merges after the test's owner, with no one to finish them (lines 100-102, 344, 348-349).** G124's grep test (reading-pipeline, merges 54) reads the ceilings of control-plane (170), calculations (75), workbooks (76), which merge later, so the test stays red when its owner is done. Name the final owner (control-plane, last) or have the grep test live in control-plane's seam file.

**G7. G126 intro "a plan step refuses above either limit" and K4831 (4)'s 500 MB / 2 GB archive limits have no bullet or red (lines 126, 101, 133, 218-222).** G124 intro states them; G126f (an uploaded ZIP opened), G133e (directory) and G125h (entries) do not test 500 MB as uploaded and 2 GB unpacked, each member within its kind. Those two figures are K4831's answer and need a bullet and a corpus boundary case either side.

**G8. Protective figures BOB cannot supply before the STARTs (lines 305-307).** "The pixels-a-page and the zip-entries figures are BOB's from the capped child" and G124c/d "BOB re-measures inside the object", "BOB sets, smaller if the capped child says so". Those are measurements that need the harness (job 20) or the jobs' own capped child. They are gated like Stage 0 but not marked GATED. Fix: give each a proposed constant the job uses with a comment (as R-GATE does for platform figures) and say the job reports what the capped child showed.

**G9. G133a "the 20 MiB guard raised to the alpha's stated figure" (line 217) against R-SILENT and K4831 (3) ("alpha ships with its current limits").** The same bullet says the bound moves only if the capped child proves it. A job must not raise a bound alone (R-SILENT, K1881). State the figure, or say it stays 20 MiB and only the heap path changes. Similarly G124f says the workbook-add bound stays 50,000 cells (line 109) while G137e builds 250,000 (line 260).

**G10. Scheduler's G123g ledger clock (X26) has no scheduler owner and plane-1 is called "test-only" (lines 97, 337, 350).** `scheduler/index.mjs:90,573,645-672` (`last_ms` stamped at alarm start) and `last_mem` are scheduler code; the lag meter, `rows_read/written` per tick and Server-Timing object-call counts are product code. Job 33 lists G91/G92/G95 only; job 20 says test-only but lists G123g; job 37 lists "ledger fields". Split G123g and name owners.

**G11. A haiku sized job: calculations (job 31) plus workbooks (job 32) quote the table (G124f), but job 32 lists only G137e (lines 109, 348-349).** Workbooks' `workbooks/index.mjs:42-44` ceiling is a G124 item; add it.

**G12. G126b's "the job lists every other inline path with a member call in a loop (tier 2, tier 4) and bounds it" (line 129)** leaves discovery to the job with no red. Name the paths or give a test that walks all calls to the member in a request.

**G13. R-GATE's "named constant read from PLATFORM.md" has no mechanism (line 22).** How does a job "read" a figure from a Markdown file in product code or a test? Say the constant is in `READ_BOUNDS`/a named module constant that BOB edits when the row is recorded, and what the test of "still the K4616 50 MB" is.

**G14. Seam owner and order exception (lines 357-358).** "control-plane merges after plane-2 where plane provides (round 8's exception)" is stated, but screens-intake (164) and screens-inquiry (166), which draw from control-plane's ops, and notice-producers (149), which needs a finish/stop notice from the job row, merge before both. G135f's test (line 245) needs providers that are later in the order; K1965 "providers first" is broken here by design. State the exception as round 8 did, with who finishes.

**G15. Batch boundaries and counts (lines 310, 357).**
- Batch A is exactly 20 including the three jobs with the heaviest dependencies (test-support, plane-1, runtime-limits); the diagnosis worker, the reviewers and any round-8 re-opened job (screens-intake, ratification, line 334 of round 8) are not counted. "Peak 20" holds only if round 8's jobs have all merged and been archived (K4219) before batch A opens; K4835 says STARTs follow round 8's merges, so state it here.
- The plan says plane-2 "starts when batch A is half merged"; K4219 refills slots in provider-first order, which would start batch B's lower-order jobs first (provenance 44, acquisition 48...). Say the exceptional order for plane-1/plane-2.

## N: notes

**N1.** The counts are right: 98 lettered bullets a-j plus G132k/l/m and others give 101 absorbed; plus 10 kept = 111; 25 headings. Models: 33 sonnet, 4 default (1, 27, 28, 37), 1 haiku (31) match the table. Positions and layers in the table match `modules.json` for all 38 jobs.

**N2.** Gated entries (G123 idle figure, G126 `cpu_ms`, G128 batch size) can start without the figure: each has a named constant or `test.todo`/unset with a comment (lines 22, 123, 138, 150). Only the upload half of G127 cannot (D11).

**N3.** K4831 (3)-(8), (10) are carried by an identifiable bullet: G124a (sentence with size and limit), G126b/G135f (no promised time), G136e (scan), G129a (password stated, nothing typed), G134a/c (every part, dates typed), G137a-e (the five choices). Two exceptions are D5 and G7 above. K4831 (9) (TAR/GZ/7z, Spanish OCR) is Stage 3 and correctly out.

**N4.** The six rulings of K4835: (2), (5), (6) are reflected; (1), (3), (4) are reflected in the job table but still contradicted in prose (D9).

**N5.** G127c cannot be started until `diagnosis-R9-capture-identity.md` exists (line 144, 386). Jobs 21 and 24 depend on it; the plan says so. Batch A is not blocked by it.

**N6.** Reading-set sizes for the large source modules in the pdf-worker, ocr-worker directories include generated bundles (6.6 MB and 7.5 MB under `pdf-worker/` and `ocr-worker/` by `git ls-tree`); START must tell those jobs not to read them.

**N7.** Section 4 (whole-suite reds) is a placeholder; section 7's P list names about 20 probes. Nothing to fix before STARTs, but the "bundles regenerated" step there ties to D10.
