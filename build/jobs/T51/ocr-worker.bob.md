# BOB to ocr-worker (T51)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), ocr-worker: **T51-260** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/ocr-worker.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are the section "Plain findings (K3957)" of `build/plan/words-pass/ocr-worker.md` (read the file whole): lowercase, unpunctuated strings of 5+ words the check's new `plain` arm counts (civicos-process 27aa50e; pull the process repository first). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `ocr-worker.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings, `plain` included, must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio ocr-worker tranche/T51 job/T51/ocr-worker`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3962, K3965): merge tranche/T51 and pull civicos-process (ea6cd83) first. The words check's testcopy arm now also counts a test string that copies the en of a product localize call (tag code). Your module's tests hold some: section 'Test copies of code sentences (K3962)' of build/plan/words-pass/ocr-worker.md (read it whole). Make each test compare with localize(id, en) / word(id) or assert the key, never the sentence's text (K3810); convert also any such copy written as a regular expression, which the check cannot read. Run your tests, the checks and 'node bio-plane/src/setup-words/build.mjs --check' (read-only); record COMPLETE again.

## B3 · START

Depth 2. Wave 2. Your entries are below (BOB records them in `build/plan/current.md` as **FR-67 · ocr-worker**): the fix round of T51 (K4194, K4218; P10), planned whole in `build/plan/fix-round-T51.md`. Model: claude-sonnet-5-5.
Your requirements: `build/requirements/ocr-worker.md` (read whole). Write each NEW or amended requirement line yourself in that file (K4210), marked *(not yet met: T51)* until a test names it; the ownership check's listing of that one file is accepted at your merge.
Why this job: L26 of the live walk (K4194): photographed pages read at 43 percent of their words. `pdf-pixels` (FR-42, merged, its R44) now prepares a picture before the engine (`renderPictureToPixels(bytes, page, {maxEdge, grey, prepare: true})`: levelling, deskew, scale-up to 40 px lines; the answer adds `prepared: {text_found, tilt_deg, scale, line_px}`); on its fixtures degraded pages go from 0–26 to 97–100 percent. The walk's photographs change only once you ask for it.
Merge order: module index 31, layer 1; after pdf-pixels (merged).

Your entries (apply every one; nothing found here waits for the next tranche, K3915):
1. **L26 (K4194)** · `ocr-worker/src/member.mjs`:98 calls `renderPicture(bytes, page, { maxEdge: PICTURE_MAX_EDGE, grey: true })`: pass `prepare: true` for a photographed page, so the engine reads the prepared pixels; a picture whose answer says `prepared.text_found: false` is not handed to the engine as text (say what the reading answers then, by the module's existing no-text path). Judge `MAX_FRAME_BYTES` on the prepared size (a 110 dpi picture grows about 2.5×; `preparePicture` keeps the long edge within `maxEdge`). Test with a fixture through the member's real path: the prepared page reads more of its words than the unprepared (control: without `prepare` the old answer); the no-text picture reads no words. The bundle `ocr-worker/dist/` is regenerated by BOB at the round's close (manifest §14): report it stale, do not edit it.
Reds you inherit: None inherited.
Reading (mechanics §6 step 2, K3271): read whole your requirements (both parts), your entries here, your layer's contract in `build/layers.md`, your own code, the used services your entries touch and the tests that name a requirement your entries change; run your other tests without reading them. A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Reading-set measure: your requirements, these entries and the tests they name: well under the 600 KB budget.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control.
Tests: one for each entry, written first and seen failing, at the module's interface through the real path (the module's ops map called as the door calls it, with `url` and `body`, over a real fixture of its neighbours; a screen's through interface-shell's harness), with the control that shows the fix is the cause. A test never hand-lists another module's ops, rows or words (K3268).
Before any test run (K4113): every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio ocr-worker tranche/T51 job/T51/ocr-worker`. Your Size line counts only your module's own code (K2513). Never edit a generated artifact (manifest §14); report one you make stale. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9); nothing found here waits for the next tranche (K3915).

## B4 · CHANGE

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/ocr-worker tranche/T51 && git branch -m job/T51/ocr-worker stale/ocr-worker-local && git checkout -b job/T51/ocr-worker origin/job/T51/ocr-worker`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

CHANGE · OCR-WORKER #9 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #238 is depth 1; K4292)

Mail with `--module ocr-worker`. Model claude-haiku-5-5, medium effort; workers haiku low. **Tests only**: no source file, no requirement line. Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once (K4272); always `node --test --test-force-exit`.

**Entry (K4292):** R23's jpeg and png tests (`ocr-worker/test/ocr-worker.test.mjs` around :947-:965: "the image is the picture renderer's own frame, by the renderer's digest" and "every region is anchored in the frame that was read") are red since 10d4c730b1 (FR-67, L26), which made `src/member.mjs:100` render pictures with `prepare: true` (levelled, deskewed, enlarged). The wire frame is correctly the prepared picture, but the test's own `direct` frame (`renderPictureToPixels(bytes, 0, {maxEdge, grey: true})`, :947) omits `prepare: true`, so it computes the unprepared frame (1800x420 against 1809x459). Bring the `direct` call to the options the member uses, as the R24 tests already do.

Read in full: ocr-worker R23 and R24 and the test around :930-:980. From `ocr-worker/`, run `node --test --test-force-exit test/` (0 fail), then `node /home/user/civicos-process/checks/run.mjs /home/user/bio`. COMPLETE with the count and the `Size` line.
