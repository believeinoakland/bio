# BOB to office-readers (T51)

**Read** · handled J2

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), layer 1, office-readers: **T51-6 · office-readers** (read the entry line whole). Model: claude-sonnet-5-5.
Your requirements: `build/requirements/office-readers.md` (read whole), folded by K3824; the id marked `*(not yet met: T51)*` is yours to meet (R34).
BOB's notes for this job:
1. R34 (N1202, K3627): a docx or pptx reading carries the core part's `title` in `metadata`, no key when absent, empty or whitespace-only. reading-pipeline R34 (L4) reads it; you need not touch reading-pipeline.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810): a test asserts the key (`hasWord`) or reads the expected text from the word table; a test of yours that copies such a sentence, met while you work, is converted. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry (no base red of K3543 or K3557 is in layer 1). Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture must show 0 failures for your files) and `node checks/ownership.mjs /home/user/bio office-readers tranche/T51 job/T51/office-readers`. Your Size line counts only your module's own code (K2513).

## B2 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), office-readers: **T51-249** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/office-readers.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are the section "Plain findings (K3957)" of `build/plan/words-pass/office-readers.md` (read the file whole): lowercase, unpunctuated strings of 5+ words the check's new `plain` arm counts (civicos-process 27aa50e; pull the process repository first). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `office-readers.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings, `plain` included, must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio office-readers tranche/T51 job/T51/office-readers`. Your Size line counts only your module's own code (K2513).

## B3 · CHANGE

CHANGE (K3960): the design's unkeyed list (DEC-343) is merged into tranche/T51 and your module's 'Plain findings (K3957)' section in build/plan/words-pass/office-readers.md was recomputed (fewer, or none): merge tranche/T51 into your branch and work from the new section. Also run 'node bio-plane/src/setup-words/build.mjs --check' (read-only) before COMPLETE: it must not name your module.

## B4 · RESUME

RESUME (K3968). OFFICE-READERS #10 stalled mid-rebase and was archived; you are #11 (depth 2, sonnet). Do `mail start`, then read B2 (START) and B3 (CHANGE) and act on both: merge `tranche/T51` into your branch (a merge, never a rebase, K1991), work from the recomputed "Plain findings (K3957)" section of `build/plan/words-pass/office-readers.md`, and convert any regex copy of a keyed sentence in your tests to an equality with `localize` (K3965; `localize` answers its `en` while `rows.mjs` is stale). `build.mjs --check` may report stale rows until R1's close: that is expected. Then checks and COMPLETE.

## B5 · RESUME

RESUME (K3969). You are OFFICE-READERS #12 (depth 2, sonnet); #10 and #11 stalled because your job branch was far behind the tranche and `mail start`'s commit conflicted on your record. BOB has fast-forwarded `job/T51/office-readers` to the tranche tip (8b8830f569), so `git fetch origin job/T51/office-readers && git merge --ff-only origin/job/T51/office-readers` first, then `mail start`. Never rebase or reset (K1991). Then act on B2 (START), B3 (CHANGE) and this entry: work from the recomputed "Plain findings (K3957)" section of `build/plan/words-pass/office-readers.md`; convert any regex copy of a keyed sentence in your tests to an equality with `localize` (K3965). A stale-rows note from `build.mjs --check` is expected until R1's close. Then checks and COMPLETE.

## B6 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/office-readers tranche/T51 && git branch -m job/T51/office-readers stale/office-readers-local && git checkout -b job/T51/office-readers origin/job/T51/office-readers`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · OFFICE-READERS · tranche T51 · product believeinoakland/bio · depth 2 (BOB #249 is depth 1; the office-readers split, second half; K4507, K4521)

Mail with `--module office-readers`; record `build/jobs/T51/office-readers.md`. Model claude-sonnet-5-5, medium effort; workers: haiku low for mechanical work, sonnet medium for reading (K3518). Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once; always `node --test --test-force-exit`. A document of your reading set you are about to read only in part: stop, post BLOCKED (cause `reading`) (K3678). You are the module job (P8, mechanics §6) for `office-readers`: your diff touches only its paths, its tests and your record. Merge `tranche/T51` first (it carries CSV-READER #1's merged `csv-reader`).

**Why.** office-readers is 4,162 lines, past ~4,000 (P6, K617). `csv-reader` now holds the copy (K624); you delete office-readers' copy and delegate (K3268). No behaviour changes.

**Read in full:** `build/plan/draft-split-csv-reader.md` (sections 0, 2b, 3, 4 and 5's OFFICE-READERS paragraph bind you; option 1, K4507); your requirements `build/requirements/office-readers.md` (both parts; BOB applies §2b's edits at your merge: name in your COMPLETE every id you retire and every line you propose); `csv-reader`'s public part; your four source files.

**Do:** replace `bio-plane/src/csv.mjs` with the one line `export * from "./csv-reader/index.mjs";`; in `formats-xlsx.mjs` delete the four builders (its lines 184-225 at the draft) and import and re-export them from `./csv.mjs`, so `docx.mjs`, `odf.mjs` and every other importer is unchanged. Delete the moved tests and the csv arms of the shared tests (section 4) and the helpers no test uses any more; keep every docx, pptx and xlsx assertion. Retired ids R3, R6, R13, R14, R17, R18 are named by no test of yours (coverage counts live ids only once BOB marks them retired). Do not edit `build/modules.json` (BOB adds `csv-reader` to your `uses` at the merge).

**Done when:** `node --test --test-force-exit bio-plane/test/m/office-readers/ bio-plane/test/m/odf-reader/ bio-plane/test/m/format-registry/ bio-plane/test/m/csv-reader/` passes; `wc -l` of your four files is near 3,300; `git grep 'from ".*csv.mjs"'` shows only the importers of section 4, none edited; `node /home/user/civicos-process/checks/run.mjs /home/user/bio` no finding in your files (architecture will name your new import of csv-reader until BOB's `uses` edit: say so), words not risen; `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio office-readers tranche/T51 job/T51/office-readers` clean. COMPLETE: what changed, line counts, test counts, the ids retired and requirement lines proposed, and the `Size` line. No REPORT, deferral or open QUESTION at COMPLETE.
