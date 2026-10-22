# BOB to odf-reader (T51)

**Read** · handled J4

## B1 · START

Depth 2. Your entry: `build/plan/current.md` (T51), the re-run of layer 1 (R1), odf-reader: **T51-250** (read the entry line whole, and the plan's Sequence and rule 11). Model: claude-haiku-5-5.
Your requirements: `build/requirements/odf-reader.md` (read whole). Your entry changes no requirement's meaning; BOB added `setup-words` (`word`, `localize`) to your requirements' Uses at this START where the pass added the import.
BOB's notes for this job:
1. Your findings are the section "Plain findings (K3957)" of `build/plan/words-pass/odf-reader.md` (read the file whole): lowercase, unpunctuated strings of 5+ words the check's new `plain` arm counts (civicos-process 27aa50e; pull the process repository first). Fix every one by the words rule below; a string you judge no member ever reads (a diagnostic, wire grammar) is not hidden: list it in a REPORT with why, and BOB settles it with the design stream (K3944).
2. The ids you assign are `odf-reader.<file stem>.<slug>`, fixed once.
Reading (plan rule 2, K3271, mechanics §6 step 2): read whole your requirements (both parts), your entry, your layer's contract in `build/layers.md`, your own code, the used services your entry touches, and the tests that name a requirement your entry changes, or that hold a finding; run your other tests without reading them. Your set is under the 600 KB budget (`reading-sets.py`). A job that scans stops (K3678): if you would read a document of your reading set only in part, stop at once, post `BLOCKED` with cause `reading`, and wait for BOB.
The words rule (K3930, K3943, K3949; setup-words R13, R14): a sentence people read is read through `word(key[, vars])` (a `words.json` row) or `localize('<module>.<area>.<name>', en[, vars])`, both arguments string literals at the call; the list always wins. A test never holds a sentence's text (K3810): it asserts the key (`hasWord`) or compares with `word`/`localize`. A hand-list of another module's ops, codes or words is assembled from that module's own declaration (K3268). `rows.mjs` and `words-unreviewed.json` are setup-words' generated artifacts: never edit or regenerate them; `localize` answers `en` until BOB regenerates them at the layer close. Your words file's findings, `plain` included, must all read zero in `node checks/run.mjs` before COMPLETE.
Tests never copy a sentence people read; every new id needs an explicit test naming it (K874); every refusal a control. Deal with any flaw you find in your module in this job (P8); report flaws in other modules to BOB (P9).
Inherited reds: the plan's rule 5 as it stands at your START; none is yours unless named here or in your entry. Coverage on your own not-yet-met ids is expected until you meet them.
Model and effort: you run at medium effort; any worker you spawn names its model and effort (haiku low for mechanical work, sonnet medium for reading and diagnosis; never opus, never above your own model) (K3518).
Not part of any reading set: generated artifacts, vendored code and large data fixtures (K2053, K2083). Never edit a generated artifact (manifest §14); report one you make stale.
Before COMPLETE run `node checks/run.mjs /home/user/bio` from the process repository (format and architecture 0 failures; the words check shows no finding in your module) and `node checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`. Your Size line counts only your module's own code (K2513).

## B2 · CHANGE

CHANGE (K3960): the design's unkeyed list (DEC-343) is merged into tranche/T51 and your module's 'Plain findings (K3957)' section in build/plan/words-pass/odf-reader.md was recomputed (fewer, or none): merge tranche/T51 into your branch and work from the new section. Also run 'node bio-plane/src/setup-words/build.mjs --check' (read-only) before COMPLETE: it must not name your module.

## B3 · CHANGE

CHANGE (K3968; K3965, setup-words R13). Your J2 question: convert now, do not wait for the rows. `localize(id, en)` answers its `en` while `rows.mjs` is stale, so the two regex assertions in `bio-plane/test/m/odf-reader/digest.test.mjs` (the "not an OpenDocument package" refusal and the ".odp export has been measured" refusal) compare with `localize("odf-reader.odf.<id>", en)` by equality. The ooxml strings are settled (DEC-343 lists them unkeyed; nothing to route). Merge `tranche/T51` first; then tests, checks, `build.mjs --check` (a stale-rows note is expected until R1's close), COMPLETE.

## B4 · START

FIRST, if `mail start` cannot push because your container's copy of your branch is behind origin: do not reset or force anything; run `cd /home/user/bio && git fetch origin job/T51/odf-reader tranche/T51 && git branch -m job/T51/odf-reader stale/odf-reader-local && git checkout -b job/T51/odf-reader origin/job/T51/odf-reader`, then re-run `mail start`. If a step is refused, post BLOCKED naming it and wait.

START · ODF-READER #8 · tranche T51 · product believeinoakland/bio · depth 2 (BOB #253 is depth 1; fix round 6, wave 2; K4571, K4578, K4579)

Mail with `--module odf-reader`; record `build/jobs/T51/odf-reader.md` (append a new section; earlier sections are history). Model claude-sonnet-5-5, medium effort; workers: haiku low for mechanical work, sonnet medium for reading and diagnosis (K3518). Before tests: every lockfile directory has `node_modules` (K4113). At most two suites at once; always `node --test --test-force-exit`. A document of your reading set you are about to read only in part: stop, post BLOCKED (cause `reading`) (K3678). You are the module job (P8, mechanics §6) for `odf-reader`: your diff touches only that module's paths, tests and your record. Merge `tranche/T51` first.

**Read in full:** `build/plan/fix-round-6-T51.md` section 0 (its rules bind you) and the section "G14-G25" (your cause, with its four fields), `build/plan/audit-silent-partial-reads-K4571.md` row S2 (G15) (the audit's evidence), your requirements (both parts), the used services your entry touches, and your code. The file:line evidence is your starting point, never a substitute for reading the code.

**Bob (K4571):** "silent scanning is death! CS should never set a member's expectation that documents are fully read but just scan those documents that are larger than some metric." Nothing a member supplies, captures, searches or publishes is read, searched, listed or exported in part without saying so; a chosen bound is continued by cursor or stated; a platform limit stays and is stated.

**Rules** (plan section 0; K4426-K4428): (1) root cause with file:line; (2) why the tests missed it, and the gap fixed; (3) a failing-first test past the bound, through the module's real entry (the op or the provided service, never an inner helper), seen red in your record, then green; (4) the platform check named in the cause (most are N). R-NOTMET: no "not met", deferred, REPORT or open QUESTION at COMPLETE: name the smallest thing you need and ask BOB now. R-OLD: stored data: "new data only" or a repair. A new sentence a member reads uses a stand-in (a drawn-screen module uses the nearest held row; any other module `localize(id, en)`), the row owed named in your record (BOB's HANDOFF B485 asks the design). Declare every census op you own whose accepted keys change (K4208). Bob's focus: an alpha release deployed as efficiently as possible: do what the entry needs, nothing more.

**Your entry.** **G15, `lineRows` (provider; owner reading-pipeline).** Every sheet `odf.mjs` emits (~:1858) carries `lineRows`: one 1-based row number per line of `sheet.text`, the same length as its lines (empty and repeated rows considered: the number is the sheet row as a spreadsheet shows it). READING-PIPELINE #22 splits a sheet into row-range units from it (K4579). Failing-first: an ODS sheet with empty and repeated rows: `lineRows[i]` is the true row of line i (red now: absent).

Run: your suite(s), then the users `node build/plan/impact.mjs tranche/T51 HEAD` names (the users of what you changed; when it names hundreds because of a shared table, run the modules that call your changed service); `node /home/user/civicos-process/checks/run.mjs /home/user/bio` (no finding in your files; the words count must not rise); `node /home/user/civicos-process/checks/ownership.mjs /home/user/bio odf-reader tranche/T51 job/T51/odf-reader`. COMPLETE: what changed (file:line), each failing-first test red then green, suite counts, the requirement lines you propose (BOB writes `build/requirements/`), and the `Size` line.
