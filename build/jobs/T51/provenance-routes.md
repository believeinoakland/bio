# provenance-routes (T51)

**Status** · session_019f42SKkqVGHjB6qhASjtVD · depth 2 · WORKING · handled B3

## Completion (PROVENANCE-ROUTES #3)

**Entries applied.** T51-18 (BOB's START note 1): the `op=list` line of the comment at `index.mjs`:256 named the retired interface (`14 call sites in app.html`; `app.html` is in `civicos-ui/`, deleted at T51-126). Restated for the code as it is: every row carries `route`, read through `routeFinding` in `retrieval`'s own statement (R8). No other mention of the old interface in the module or its tests (grep of `bio-plane/src/provenance-routes` and `bio-plane/test/m/provenance-routes` for `app.html`, `civicos-ui`, `legacy-ui`, `ui`, `app`). The remaining "store" and "legacy" words name the retired store, not the interface, and are left as they are. No behaviour changed.

**Deferred.** None.

**Found in other modules (REPORT to BOB).** `checks/run.mjs` coverage names 10 modules with live ids no test names: agent-harness R17; agent-runner R36 R37 R38 R40; capture R96; entities R57–R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse R1–R18; retrieval R87 R89 R90. None is in provenance-routes. Not touched.

**Tests and checks.**
- `node --test bio-plane/test/m/provenance-routes/`: 40 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 5846 of 5883 live ids named, 10 failures (listed above, none in this module); channels 0 failures.
- `node checks/ownership.mjs /home/user/bio provenance-routes tranche/T51 job/T51/provenance-routes`: 0 failures (1 file changed, `bio-plane/src/provenance-routes/index.mjs`).

Size (session_01BrNh4dMAAcmVMwQjAe5j7i): test runs 1, module lines 1239

## J1 · REPORT

Found in other modules while running checks/run.mjs for T51-18. Not this module's; not touched. The coverage check names 10 modules with live ids that no test names: agent-harness R17; agent-runner R36 R37 R38 R40; capture R96; entities R57-R61; explore R26; journey-check R19; people R40 R41; progressions R46; retrieval-browse R1-R18 (all 18); retrieval R87 R89 R90. provenance-routes is not among them.

## J2 · COMPLETE

T51-18 done. Restated the op=list line of the comment at index.mjs:256, which named the retired app.html (civicos-ui, deleted at T51-126), as the current read (retrieval's op=list, R8). No other old-interface mention in the module or its tests; no behaviour change. Commit ea094b8bdc on job/T51/provenance-routes.
Tests: provenance-routes 40 pass, 0 fail. checks/run: format 0, architecture 0, channels 0; coverage has 10 failures in other modules (see REPORT J1), none here. ownership: 0 failures.
Note: the commit trailer has a stray "Co-Authored-By: none" line that I added in error; it stays unless BOB decides otherwise.

## J3 · COMPLETE

T51-185 (words, provenance-routes) applied. Commit d62254574b on job/T51/provenance-routes (tranche/T51 merged in at 17beaf9b90; pushed).

**Entries applied.** The words check on this module read 20 findings (2 part test copies, 12 plain, 6 test copies of code sentences); it reads 0 now.
- `index.mjs`: the five observation meanings (`OBSERVATION_MEANS`, `partial` included, a member's sentence the check does not count) read through `localize('provenance-routes.index.*')`. The four route-marked causes (`ROUTE_MARKED_CAUSES`) read through `word('provenance-routes.<cause>')`, the rows that already exist. The completeness sentence reads `word('provenance-routes.completeness.captured_document_viewer')`, its existing row. The refusal details, the missing lists, the two assess/rebuild `detail` branches and the evidence fragments read through `localize` with new ids; the wording is unchanged there.
- Tests: `marked.test.mjs` compares the NEVER_LOOKED note with `word`. `audit.test.mjs` compares `ROUTE_TALLY_NOTE` with `localize` and `OBSERVATION_MEANS` with `localize` pairs. `chain.test.mjs` and `rebuild.test.mjs` compare the upload receipt with `localize` and the missing lists with `localize`. Each `localize` in a test has the same id and en as the product's, so none holds a sentence its own module does not hold.

**Deferred.** None. Left as they are on purpose: the `op=` and `by` labels, the `who` labels and the identifier-shaped `where` strings in `checks.mjs`; none is read as a sentence.

**For BOB (a choice, not made by this job):**
1. The four route-marked causes and the completeness sentence now show the design's wording from their rows, so the member-visible text of those five changes: for example, the never-assessed cause reads "never looked" where the code read "NEVER_LOOKED". This follows the rule that the list wins; say if you want the code's wording kept.
2. The five observation meanings are now localized under new ids, with their existing text. The design already has rows for the same meanings, capitalized differently, in observation-log: `refusal.NEVER_LOOKED`, `refusal.LOOKED_ABSENT`, `refusal.LOOKED_INDETERMINATE`, and `observation-log.partial.looked_got_part`. One vocabulary would have this module read those rows; that changes the audit's `means` text. I left the meanings as they were.

**Found in other modules.** None by this job. The full `checks/run.mjs` run shows failures in other modules (coverage 30; words 4107, across 174 modules); none names provenance-routes, and this job did not read them.

**Tests and checks** (process repo pulled before the run):
- `node --test bio-plane/test/m/provenance-routes/`: 40 pass, 0 fail, run after the source edits and again after the test fixes.
- `node checks/words.mjs /home/user/bio provenance-routes`: 0 failures (was 20).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; coverage and words failures only in other modules (above).
- `node checks/architecture.mjs /home/user/bio provenance-routes`: 0 failures.
- `node checks/coverage.mjs /home/user/bio provenance-routes`: 13 of 13 live ids named, 0 failures.
- `node checks/ownership.mjs /home/user/bio provenance-routes tranche/T51 job/T51/provenance-routes`: 0 failures (the five module files and the job record).
- `node bio-plane/src/setup-words/build.mjs --check`: rows.mjs is stale for the new `provenance-routes.index.*` ids. That is the expected note; no refusal names this module. BOB regenerates rows at the layer close.

Size (session_01UjdYc5ECwMjd18DbJT7WbE): test runs 2, module lines 1204

## J4 · COMPLETE

CHANGE B3 done. Commit 42264efb4b on job/T51/provenance-routes (tranche/T51 merged in, pushed).

**Applied.** The one flagged test copy, `chain.test.mjs` (the doorbell knock fixture's capture method, "doorbell knock, received, hashed at receipt"), now carries the neutral fixture string "knock fixture method". The method is never asserted, only passed through, so no test depends on its text.

**Checks** (process repo pulled first):
- `node checks/words.mjs /home/user/bio provenance-routes`: 0 failures.
- `node --test bio-plane/test/m/provenance-routes/`: 40 pass, 0 fail.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; channels 0 failures; coverage 30 failures and words failures only in other modules; none names provenance-routes.
- `node checks/architecture.mjs /home/user/bio provenance-routes`: 0 failures.
- `node checks/coverage.mjs /home/user/bio provenance-routes`: 13 of 13 live ids named, 0 failures.
- `node checks/ownership.mjs /home/user/bio provenance-routes tranche/T51 job/T51/provenance-routes`: 0 failures.
- `node bio-plane/src/setup-words/build.mjs --check`: no note naming this module.

**Deferred.** None. The earlier For-BOB items in J3 stand unchanged.

Size (session_01UjdYc5ECwMjd18DbJT7WbE): test runs 4, module lines 1204
