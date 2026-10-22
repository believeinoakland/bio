# roster-reader (T51)

**Status** · session_01E1WAAUCdCBnpW5KTCteeWs · depth 2 · COMPLETE · handled B5

## Completion (T51-172, B1 START)

**Applied.** T51-172, the two words findings from `build/plan/words-pass/roster-reader.md`, fixed by the words rule:
- `roster-reader/org-chart.mjs` (the unlabelled-line refusal in `detect`): the sentence built from a template literal is now one `localize("roster-reader.org-chart.labelled_line_s_name_a", …)` with named variables.
- `roster-reader/org-chart.mjs` (`parse` → `pairs_why`): the `{v1}` prefix stitched onto one sentence is replaced by two keyed sentences, one for a stated relation (`reporting_relation_s_stated_in_words`) and one for none (`no_reporting_relation_is_stated`). Both carry the same wording as before, so the existing assertions hold.

No requirement, public or private, changed. No test copies a sentence: the tests were not edited.

**Deferred.** None.

**Found in another module.** None in code. `checks/run.mjs` shows whole-repository words failures (`testcopy` in `wizard-scripts`, and other `inline`/`unkeyed` findings) outside roster-reader; none names roster-reader. Those are inherited reds, not this module's, and are left for BOB.

**Checks run**
- `node checks/run.mjs /home/user/bio` (civicos-process): `format: 174 modules, 173 requirements files; 0 failures`; `architecture: 3585 product files, 11860 relative imports …; 0 failures`; `coverage: 173 modules, 5914 of 6048 live requirement ids named by a test; 33 failures` (none in roster-reader); `words: … 2819 failures` (none in roster-reader; roster-reader's two findings now read zero).
- `node checks/format.mjs /home/user/bio`: `0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 37 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `1 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures`.
- `node --test roster-reader/test/` (module tests): `tests 22, pass 22, fail 0`.

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 1, module lines 963

## J1 · COMPLETE

T51-172 done. The two words findings in roster-reader/org-chart.mjs are fixed by keyed localize calls (the unlabelled-line refusal in detect; pairs_why split into two keys, same wording). Module tests 22/22 pass; format, architecture, coverage (12/12) and ownership pass for roster-reader; the words check shows no finding in roster-reader. Whole-repo words/coverage reds are outside this module and are not mine. Record: build/jobs/T51/roster-reader.md (commit 5937ed1f34). Note: I left out the Co-Authored-By model line from the commit, since the system rules bar model identifiers in commits.

## J2 · REPORT

B2 (K3957) plain findings: 38 judged. 36 are sentences a member reads (why-reasons, labels, level text) and are now localize('roster-reader.<stem>.<slug>', en) with the same wording; their tests still pass unchanged. Two are not sentences and no member reads them: roster-reader/lines.mjs:24 (NOT_NAME_WORDS, the closed list of function words and unit/office kinds that stop a name span) and roster-reader/lines.mjs:40 (UNIT_WORDS, the kinds of unit a line can name). Both are this module's own recognition vocabulary (place-free English, read as a set, never shown), so they belong on the design's unkeyed list (K3944), not in a localized row. Each remaining finding in the words check is one of those two.

## Completion again (T51, B2 CHANGE, K3957)

**Applied.** The 38 plain findings in `build/plan/words-pass/roster-reader.md` are judged. 36 are sentences a member reads (why-reasons, the staff-roster label, the level text) and each is now a `localize('roster-reader.<file stem>.<slug>', en[, vars])` call with its wording unchanged, in `columns.mjs`, `directory-refs.mjs`, `lines.mjs` (one line), `org-chart.mjs`, `source.mjs` and `staff-roster.mjs`. Tests compare the same text and were not edited.

**Reported (REPORT, B2).** `lines.mjs:24` (NOT_NAME_WORDS) and `lines.mjs:40` (UNIT_WORDS) are recognition vocabulary, not sentences; no member reads them. They go to BOB for the design's unkeyed list (K3944). They are the only findings the words check still shows for this module.

**Deferred.** None.

**Found in another module.** None. The repository-wide `checks/run.mjs` words failures are other modules' and are not changed here.

**Checks run (after the change, module tests and checks)**
- `node --test roster-reader/test/`: `tests 22, pass 22, fail 0`.
- `node checks/words.mjs /home/user/bio roster-reader`: `891 string literals read … inline 2, plain 2, testcopy 0, … 2 failures` (both are the two REPORTed vocabulary lists).
- `node checks/format.mjs /home/user/bio`: `174 modules, 173 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 38 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `6 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures`.
- `node checks/run.mjs /home/user/bio` (civicos-process 27aa50e): `format … 0 failures`; `architecture … 0 failures`; roster-reader appears only in the two REPORTed `words` lines; the repository-wide `coverage` (33) and `words` failures are other modules'.

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 2, module lines 965

## J3 · COMPLETE

B2 done: the 38 plain findings are judged (36 localized with the same wording; lines.mjs:24 and :40, the recognition vocabulary lists, REPORTed for the unkeyed list). Module tests 22/22; format, architecture, coverage (12/12) and ownership pass; the words check shows only the two REPORTed findings in roster-reader. Record: build/jobs/T51/roster-reader.md.

## Completion again (T51, B3 CHANGE, K3962)

**Applied.** The test copies of product sentences are now compared with `localize(id, en[, vars])`, or with the exact value that `localize` gives, never with a sentence's text or a regular expression on it. The two copies the check named (`source.test.mjs`: the level text, and the no-column refusal) are converted, and so are the other copies of localized sentences in `roster-reader.test.mjs` and `source.test.mjs` that the same rule covers, including the regular-expression ones. Assertions now test exact strings (for example the `pairs_why` for a chart with no stated relation, the `dated events` and `contact point` refusals with their counts). In `source.mjs`, the held-table "no date" sentence (previously plain code text) is now a `localize` call, so its test compares with `localize` too.

Test titles and comments that mention a sentence's words are not copies a test asserts, and are unchanged.

**Deferred.** None.

**Reported earlier (B2 REPORT, still open).** `lines.mjs:24` (NOT_NAME_WORDS) and `lines.mjs:40` (UNIT_WORDS): recognition vocabulary, no member reads them; for the design's unkeyed list (K3944). They are the only words findings left in this module.

**Found in another module.** `node bio-plane/src/setup-words/build.mjs --check` exits 1 with one message: `jurisdictions.index.amount_is_amount_and_units holds a formatted argument ({name, …}); word and localize do not render these yet (R18)`. It names jurisdictions, not roster-reader; it is BOB's to settle.

**Checks run**
- `node --test roster-reader/test/`: `tests 22, pass 22, fail 0`.
- `node checks/words.mjs /home/user/bio roster-reader`: `961 string literals read … inline 2, plain 2, testcopy 0, … 2 failures` (the two REPORTed lists only).
- `node bio-plane/src/setup-words/build.mjs --check`: exit 1, the jurisdictions message above; nothing in roster-reader.
- `node checks/format.mjs /home/user/bio`: `174 modules, 173 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio roster-reader`: `15 product files, 39 relative imports (0 naming no tracked file, not judged); 0 failures`.
- `node checks/coverage.mjs /home/user/bio roster-reader`: `1 modules, 12 of 12 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader tranche/T51 job/T51/roster-reader`: `0 files changed by roster-reader between tranche/T51 and job/T51/roster-reader; 0 failures` (run before this commit; the ownership count reads committed changes).

Size (session_01PVypQMNUHxqcGtP1kD7qN2): test runs 3, module lines 965

## J4 · COMPLETE

B3 done: test copies of product sentences compare with localize(id, en) or the exact localized value, not sentence text or a regex on it (the two testcopy findings, and the other copies of localized sentences in the module's tests). source.mjs's held-table no-date sentence is now localized so its test uses localize too. Module tests 22/22; words: testcopy 0, only the two REPORTed lists (J2) remain; format, architecture, coverage (12/12) pass; ownership passes. Outside this module: setup-words build.mjs --check exits 1 on jurisdictions.index.amount_is_amount_and_units (R18), not roster-reader's. Record: build/jobs/T51/roster-reader.md.

## Completion (fix round 5, E2 reader half, B4 START)

**Root cause (confirmed).** `lines.mjs` `linesOf` (the old :178) built `{text, offset}` for every line of the text, `t.trim().replace(/\s+/g, " ")` leaving a cons-string chain per line on node 26; `staff-roster.mjs` `readRows` (:121-137) and `org-chart.mjs` `readBoxes` (:47-70) kept all of them (and `staff_roster.detect`, `org_chart.detect` then read counts from them) over the whole 20 MB text, twice per docprofile pass. `datesIn` also copied the whole text (`flatten`).

**Why the tests missed it.** Every detector test ran on a fixture text of a few KB; none ran a detector on the text of a large document, and no test ran under a heap limit. Gap closed: `test/big-text.test.mjs` (child `test/big-text-child.mjs`).

**Failing first, red.** Before the change, the child (26.6 MB, 160,000 lines, no roster in it, both detectors, the text held) under `--max-old-space-size=80`: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory` (run 1 of 5, test red). After: five of five runs pass at 80 MB, about 8 s each; 40 MB fails only because the held text alone is about 27 MB.

**What changed.**
- `roster-reader/lines.mjs`: `eachLine(text, visit)` (one line at a time, each line flattened to one piece); `selfNamingLine` (one line's self-naming kinds, `selfNamingLines` uses it); `datesIn` counts over the text as it is (the date patterns take `\s+` where the flatten left one space), no copy; `linesOf` removed (no user).
- `roster-reader/staff-roster.mjs` `readRows(raw, ctx, keep)`: with `keep` false (`detect`) it holds no line and no row, only the counts and the self-naming lines; `parse` keeps `keep` true, unchanged.
- `roster-reader/org-chart.mjs` `readBoxes(raw, ctx, keep)`: with `keep` false it holds the numbers of the box-labelling lines, a histogram of word counts (for the median), and the self-naming lines; `parse` unchanged.

**Answers unchanged.** `detect` and `parse` of both types, over every fixture under both views, serialised before and after: byte-identical (265,734 bytes). Control test: the committee roster still detects and parses over 30 rows; the Public Works chart still detects and gives over 3 units.

**Ran.** `roster-reader/test/`: `ℹ tests 24 pass 24 fail 0` (including the new file's 2). `docprofile/test/`: `tests 45, pass 45`. The plane tests impact names (45 files): `tests 299, pass 298, fail 1`; the failure is `release.test.mjs` R24 (`screen.objective.purpose is held by the words list`), which fails identically on a clean checkout of `tranche/T51`: not this module's, not caused by this change. Checks: `run.mjs`: format, architecture, coverage (6614 of 6614), channels, words, all `0 failures`; `ownership.mjs`: `0 failures`.

**Requirement lines proposed (BOB writes `build/requirements/`).**
- R1 add: `detect` reads the text one line at a time and keeps only counts and its self-naming lines, so a text of any length costs memory only for the text itself: the 26 MB, 160,000-line text of a budget volume is refused in an 80 MB heap, the text held.
- R3 add: the same for `org_chart`'s `detect`.

**Deferred / found in other modules.** None deferred. In `plane` (not mine): `release.test.mjs` R24 as above, red on the base.

Size (session_01JskisLomG4e5FjS7cp5cNH): test runs 9, module lines 1012

## J5 · COMPLETE

E2 reader half done. Root cause confirmed: linesOf/readRows/readBoxes held every line of the text (cons-string chains) in detect. detect of staff_roster and org_chart now stream one line at a time (lines.mjs eachLine, staff-roster.mjs readRows keep=false, org-chart.mjs readBoxes keep=false; datesIn no longer copies the text). Failing-first: test/big-text.test.mjs, child with a 26.6 MB, 160,000-line no-roster text held, --max-old-space-size=80: red (OOM) before, green five of five after (~8 s a run). Answers on all fixtures under both views byte-identical before/after; control roster and chart still read. Suites: roster-reader 24/24, docprofile 45/45, plane impact files 298/299 (the one red, release.test.mjs R24 'screen.objective.purpose is held by the words list', fails identically on clean tranche/T51, not this module). run.mjs and ownership: 0 failures. Proposed requirement lines (R1, R3) are in my record. Plane can now turn l77-size into a gate. Details: build/jobs/T51/roster-reader.md.

## Completion (T51, B5 START, G37 roster-reader's part)

**Root cause (file:line, on `tranche/T51` before the change).** Each `detect` calls `eachLine` once and, for every line, did work that allocates: `lines.mjs:185` a `replace(/\s+/g, " ")` copy of every line; `:112-118` `withoutContacts` ran four global replaces with a closure, two `split`s, a `join` and three `tidy` regex passes on every line (and `staff-roster.mjs` ran it twice a line: once in `readRows`, again in `readLine`); `:130-135` `titleSpans` made a cloned RegExp per pattern per line through `matchAll`; `:78-85` `nameSpans` the same through `matchAll(NAME_ALL)`, then `m[0].split(/\s+/)` and `cut` (`run.split(/(\s+)/)`) per match; `:192` `selfNamingLine` and `:266` `wordCount` built an array of words for every line; `:259-264` `isUnitLine` built three arrays per line (`words`, `map`, `filter`), and `staff-roster.mjs:112` and `org-chart.mjs:82` split the whole line to read its last word. Measured, one detector, a budget volume's text: 125-162 MB of allocation over 1 MiB (about 150 B a byte); over 24 MiB 1,835 / 1,452 collections of a 2 MB semi-space (staff_roster / org_chart), 5.7 s and 4.1 s.

**Why the tests missed it.** The detectors were tested for what they answer (fixtures, a 20 MB text under an 80 MB heap, which only fails when the heap is gone), never for what they allocate or how long they take: no test counted collections or time on a large text. Gap fixed: `test/cost.test.mjs` (below).

**What changed** (all in this module; answers identical):
- `lines.mjs`: `eachLine` (:266) copies a line only when it holds odd white space; `withoutContacts` (:165) tidies a line with no `@`, digit or NUL without a regex pass, tests each contact recogniser before replacing (`cutAll`, :186) and counts cuts with no closure per call; `tidy` returns a string with nothing to tidy as it is; `titleSpans` (:209) and `nameSpans` (:115) use `exec` on the recogniser itself, not `matchAll`; `cut` (:90) finds the words in place; `phraseWord` (:77) caches its answer per distinct word (cleared past 4,096 words); new `hasNameSpan` (:132) answers "is there a name span" without building them; `isUnitLine` (:362), `selfNamingLine` and `wordCount` count words in place (`countWords`).
- `staff-roster.mjs`: `readLine` takes the line's `withoutContacts` as a third argument (the caller already has it: one pass a line, not two), reads a line's last word with `lastIndexOf`, asks `hasNameSpan` where it needed `nameSpans(...).length`.
- `org-chart.mjs`: the last word by `lastIndexOf`.

**Failing-first** (`test/cost.test.mjs`, titles name R1 R3). Cost is counted in collections: a child with a 2 MB semi-space (the shape harness's setting) and `--trace-gc`, every collection between BEGIN and END is one 2 MB of allocation, whatever the machine. Bound, from measurement: **32 B of allocation a byte of text** (after: about 21 B a byte; before: about 150), and for 24 MiB also 4 s a detector (after 1.2-2.3 s; before 4.1-5.7 s on this machine).
- Red on the old code (the tests run against `HEAD` of `tranche/T51`'s module, the new tests copied beside it): `staff_roster: 79 collections of 2 MB = 158 B a byte over 1 MiB, bound 32`; `staff_roster: 1838 collections of 2 MB = 153 B a byte over 24 MiB, bound 32`.
- Green on the new code, five runs of five: 1 MiB: 11 / 10 collections (staff_roster / org_chart), under 0.1 s; 24 MiB: 250 / 236 collections, 1.2-2.3 s.
- Verdict control (same file): `fixtures/pinned-verdicts.json` holds `detect` (and a SHA-256 of `parse` where it matched) of both detectors taken **from the old code before the change**, on all 29 fixture documents, the text of the real budget document held here (`fixtures/budget-pages.json`, a copy of budget-doctypes' `bb23.json`: nine pages of the FY2023-25 Adopted Policy Budget), a budget volume's 1 MiB text, and the committee roster and the Public Works chart each behind 30, 400 and 6,000 preface lines (`test/shape-texts.mjs`); the new code equals all 38 cases, on the old code the control also passes (as it should). Beside it, a differential run (not committed) over 48,045 mutated lines (doubled and tab white space, quotes, NULs, non-breaking spaces, capitals, accents, appended phone/e-mail/street) comparing the old and new `withoutContacts`, `isUnitLine`, `nameSpans`, `isName`, `leadingName`, `wordCount` and `titleSpans`, and 174 whole-document `detect`/`parse` pairs, found no difference.

**Found, not changed (same verdicts were the entry).** The real budget pages (`bb23.json`, nine pages) are answered `staff_roster` (match true) by the old and the new code alike; it is pinned in the control. Whether that is right for those pages is not asked here.

**Deferred.** None.

**Found in another module.** None. The cost seen by the plane is classification once per read and twice in `readText` (`reading-pipeline/index.mjs:1918, 2125`); that is reading-pipeline's part of G37, which merges after this job.

**Requirement lines proposed (BOB writes `build/requirements/`).**
- R1 add: `detect` over a text allocates in proportion to the text and costs at most 32 bytes of allocation per byte of text: a 1 MiB text of a budget volume causes at most 16 collections of a 2 MB semi-space and a 24 MiB text at most 384, and the 24 MiB text takes under 4 s; the verdicts are those of the documents' own lines, not of how the text is walked (fix round 6, G37).
- R3 add: the same for `org_chart`'s `detect`.

**Checks run**
- `node --test --test-force-exit roster-reader/test/`: `tests 27, pass 27, fail 0` (3 new in `cost.test.mjs`).
- `node --test --test-force-exit docprofile/test/`: `tests 45, pass 45, fail 0`.
- The plane tests `node build/plan/impact.mjs origin/tranche/T51 HEAD` names (50 files): `tests 332, pass 331, fail 1`; the failure is `release.test.mjs` R24 (`screen.objective.purpose is held by the words list`), the same red as on a clean `tranche/T51`, not this module's.
- `node checks/run.mjs /home/user/bio` (civicos-process, current): `format … 0 failures`; `architecture … 0 failures`; `coverage: 176 modules, 6668 of 6668 live requirement ids named by a test; 0 failures`; `channels … 0 failures`; `words: … inline 0, plain 0, testcopy 0 … 0 failures`.
- `node checks/ownership.mjs /home/user/bio roster-reader origin/tranche/T51 job/T51/roster-reader`: `9 files changed by roster-reader between origin/tranche/T51 and job/T51/roster-reader; 0 failures`.

Size (session_01E1WAAUCdCBnpW5KTCteeWs): test runs 9, module lines 1122

## J6 · COMPLETE

G37 (roster-reader's part) done. staff_roster and org_chart detect now walk the text without per-line copies or regex allocations (lines.mjs: in-place word counts, exec not matchAll, no regex pass for a line with no contact point, one withoutContacts a line, a cached phraseWord, hasNameSpan). Cost bound 32 B allocated per byte of text, counted in 2 MB collections in a child (before ~150 B/byte, after ~21): 1 MiB 77/61 -> 11/10 collections, 24 MiB 1835/1452 -> 250/236, 5.7 s/4.1 s -> 1.2-2.3 s. Failing-first red on the old code (158 and 153 B/byte), green on the new, five of five. Verdicts pinned from the old code on 29 fixtures, the real budget pages, a 1 MiB budget text and a roster and a chart behind 30/400/6000 preface lines: all 38 equal. Module 27/27, docprofile 45/45, plane impact files 331/332 (release R24, red on the base). run.mjs, ownership: 0 failures. Proposed R1/R3 lines and the Size line are in build/jobs/T51/roster-reader.md. Merge me before READING-PIPELINE #24.
