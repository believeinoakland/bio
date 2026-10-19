# BOB to setup-words (T51)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), setup-words: **T51-156 · setup-words** (read the entry line whole, and the Sequence's step 1). You run alone, first, before every other job of the re-run: every later step of T51 reads through what you build. Model: claude-sonnet-5-5, medium effort.
Your requirements: `build/requirements/setup-words.md` (read whole; R13 restated, R14–R18 new, R4 amended, all by K3930/K3931/K3932; R14–R18 marked not yet met: T51). Read whole also BOB's design `build/plan/words-B-design.md` (Bob's ruling K3930 and BOB's details: why each rule is as it is; §1–§6 and §9 bind your work, §10 is the process's check, not yours).
BOB's notes for this job:
1. The extraction (R15) reads only tracked product files (`git ls-files`), owned by a module in `build/modules.json`, with a JS extension, and never: generated artifacts (the manifest's "Generated artifacts" table: the bundles under `*/dist/`, `rows.mjs` itself, `program.mjs`, `pages.mjs`, `court-data.mjs`, `order.mjs`, wizard-scripts' data), `node_modules`, `vendor` or `vendored` directories, or test fixtures. A bundle carries its modules' `t` calls again; reading it would extract duplicates. Today no `t` call exists, so on the real tree the extraction yields no code row and `rows.mjs` keeps its 14,522 design rows (each now with origin `"design"`); prove R15 on fixture trees.
2. The parser: vendor `acorn` (MIT; a copy is at `/opt/node-tools/node_modules/acorn/dist/acorn.mjs` with its `LICENSE`, version in its `package.json`) under `bio-plane/src/setup-words/vendor/`, with the licence and a line naming the version; the generator imports it, the module (`index.mjs`) never does (R4), so it is never bundled. Keep `t`'s call shape exactly `t(<string literal>, <string literal>[, <vars>])`; a template literal with no `${}` counts as a string literal.
3. The sixth row field (origin) is appended: every reader of `WORD_ROWS` indexes fields 0–4 (extraction, screens-wizards, journey-check, translations, screens-daily, case-carriage), so none breaks; run their tests after you regenerate (`node bio-plane/test/m/<module>/…`, see each module's `tests` in `modules.json`) and say so in your record.
4. You own and regenerate your own generated artifact `rows.mjs` (and create `words-unreviewed.json`, empty list today). Add `t` to the module's exports; `word`, `hasWord` keep their exact behaviour (R11, R12 unchanged).
5. R17's pseudo rows: write them only on request (`--pseudo`), never commit them; the transform keeps `{name}` intact and leaves no plain ASCII letter outside placeholders.
6. The manifest's generated-artifacts row for `rows.mjs` is BOB's to update at your merge: tell BOB in your COMPLETE what the regenerate command and its check now cover.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code (`index.mjs`, `build.mjs`; `rows.mjs` is generated, not read), the design note above, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is about 30 KB plus the design note, under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Tests never copy a sentence people read (K3810); every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: none of yours. Coverage on R14–R18 is expected until you meet them.
Model and effort: medium; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture 0 failures for your files; the words check does not read setup-words' own source; the format check must stay 0) and `node checks/ownership.mjs /home/user/bio setup-words tranche/T51 job/T51/setup-words`. Your Size line counts only your module's own code, never `rows.mjs` or the vendored parser (K2513).

## B2 · CHANGE

CHANGE (K3943, BOB #215). The marker `t` is renamed `localize`: 1,450 files of the tree bind `t` already, so the conversion could not place it in them. First merge `tranche/T51` into your branch (your requirements changed: setup-words R13, R14, R15, R18, R4 now say `localize`; R14 and R15 are re-marked *(not yet met: T51)*).

Do:
1. `index.mjs`: export `localize(id, en, vars)` in place of `t`, behaviour unchanged (R14). No alias named `t` is kept (nothing outside your module imports it; only your two test files do).
2. `build.mjs`: the extraction reads `localize(id, en)` calls (R15), with its scope rule unchanged (a file's own local `localize` is not the marker; no file of the tree binds it today). Every message naming `t` says `localize`.
3. Your tests (`extraction.test.mjs`, `word-list.test.mjs`) use `localize`; R14 and R15 tests still name their ids.
4. Run your tests, `node bio-plane/src/setup-words/build.mjs --check`, and the process checks over your module (`node /home/user/civicos-process/checks/run.mjs .` — civicos-process `ebcc1a3` or later; its words check now reads the marker as `localize`). Then record completion (names R14, R15 as met) and post COMPLETE.

Model and effort: as your START (sonnet, medium); workers haiku low if any. One small entry: finish in this session.

## B3 · CHANGE

CHANGE (K3962, K3965): merge tranche/T51 and pull civicos-process (ea6cd83) first. The words check's testcopy arm now also counts a test string that copies the en of a product localize call (tag code). Your module's tests hold some: section 'Test copies of code sentences (K3962)' of build/plan/words-pass/setup-words.md (read it whole). Make each test compare with localize(id, en) / word(id) or assert the key, never the sentence's text (K3810); convert also any such copy written as a regular expression, which the check cannot read. Run your tests, the checks and 'node bio-plane/src/setup-words/build.mjs --check' (read-only); record COMPLETE again.

## B4 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the completion round (§5.7 (0); P10 as amended, K3915): **CR-14 · setup-words** (read the entry line whole). Model: claude-haiku-5-5.
Your requirements: `build/requirements/setup-words.md` (read whole). R19 (a reason inside a reason, written by BOB at this START, K4108) is marked not yet met: meet it. R13's and R2's "labelled" spelling checks (`word-list.test.mjs`:212, :229) are red on DEC-344's `{labelled}` placeholder: strip `{name}` placeholders before matching (test-only); until you merge both are accepted by name.
BOB's notes for this job:
1. Regenerate nothing yourself: `rows.mjs` is regenerated by BOB at the round's close (manifest §14); report if your change stales it.
2. Your layer has closed; this round runs as a layer (§5.3 to §5.6). Do every item of your entry; nothing found here waits for the next tranche (K3915): a flaw in your module is fixed in this job, one in another module is a REPORT.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`; generated artifacts excluded). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
Words (K3810, K3930): a sentence a member reads is read by key through `word` or written once with `localize(id, en)`; a test asserts the key or reads the text from the word table, never copies it. Every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (architecture and words must show 0 findings for your files) and `node checks/ownership.mjs /home/user/bio setup-words tranche/T51 job/T51/setup-words`. Your Size line counts only your module's own code (K2513).
Before any test run: every directory with a tracked `package-lock.json` has its `node_modules` (`for d in $(git ls-files '*package-lock.json' | xargs -n1 dirname); do [ -d $d/node_modules ] || (cd $d && npm ci --ignore-scripts --no-audit --no-fund); done`); a suite run without them fails for the container, not the code (K4113).

## B5 · ANSWER · re J4

ANSWER (K4115). Not Bob's: the three rows are the design stream's wording, and braces a member would see are a wording defect, sent to UX-DESIGN as a HANDOFF now. Do not weaken the check. `word-list.test.mjs` R13 (line 247) is accepted red by name until that design merge, which BOB makes and then regenerates `rows.mjs`. Post COMPLETE with R13 named as that accepted red.

## B6 · CHANGE

CHANGE (K4119): the design's DEC-369 (U400) is merged on the tranche: the three `lines.index.*` rows hold no brace now, and `rows.mjs` is regenerated. Merge tranche/T51 into your branch, re-run `word-list.test.mjs` (R13 should be green, so it is no longer an accepted red), and post COMPLETE.
