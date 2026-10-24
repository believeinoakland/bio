# site-profiles (T51)

**Status** · session_015KRmXt7cbEfmR33Lj1GWYb · depth 2 · COMPLETE · handled B5

## J1 · COMPLETE

T51-253 is applied. The 17 `plain` findings (K3957) are now read through `localize`, and the module's tests compare its output with `localize` instead of holding the sentences. Commit 61ad603580 is on `job/T51/site-profiles`.

**Entries applied**
- T51-253: each of the 17 findings judged as member-facing and read by key. Ids are `site-profiles.<file stem>.<slug>`:
  - aspnet-webforms: `page_state_this_site_rebuilds` (rule label), `an_advertising_or_analytics` (rule label)
  - client-rendered: `an_application_that_builds_its` (label), `no_links_and_no_prose_in_the` (signal, read once into `NO_PROSE`, which both the push and the includes-check use)
  - wordpress: `a_page_published_with_wordpress` (label), `a_version_stamp_on_a_design` (rule label), `an_advertising_or_analytics` (rule label)
  - index.mjs: `everything_around_the_document_itself`, `the_source_served_exactly_the_same`, `the_document_differs_and_this_kind`, `the_substance_of_the_document`, `the_substance_is_the_same`, `the_substance_and_the_appearance`, `a_file_the_page_needs`, `everything_the_page_needs_to`, `no_handler_recognised_this_document`
- No text is a REPORT: every one of the 17 is a sentence a member reads, as a label, signal or reason, so none goes to the design's `unkeyed` list.

**Tests**
- Existing tests that quoted these sentences (or fragments of them) now compare with `localize(id, en)`, as the words rule specifies (K3810). That covers the `identify`, `profileRecord`, `compare` and `artifacts` assertions.
- New `site-profiles/test/words.test.mjs`: one test per new id (K874), named by the id, each comparing the module's output with `localize`.

**Deferred:** nothing.

**Found in other modules (for BOB; not touched)**
- The repository-wide words check (`node checks/run.mjs`) reports 4844 failures, almost all in other modules (for example `testcopy` in `wizard-scripts` tests, and `handlist`). Coverage reports 33 failures across other modules. These are not from this job.

**Checks, run from the process repository**
- `node checks/format.mjs /home/user/bio`: 174 modules, 0 failures.
- `node checks/architecture.mjs /home/user/bio site-profiles`: 0 failures.
- `node checks/coverage.mjs /home/user/bio site-profiles`: 19 of 19 live ids named, 0 failures.
- `node checks/words.mjs /home/user/bio site-profiles`: 0 failures (`plain` 0, `testcopy` 0, `missingkey` 0, `inline` 0).
- `node checks/ownership.mjs /home/user/bio site-profiles tranche/T51 job/T51/site-profiles`: 0 failures.
- `node --test site-profiles/test/`: 35 pass, 0 fail (19 before, 16 new).

**Size (session_01Vx6mozLj24u5RtmqPLSGFL):** test runs 3, module lines 1642 (source 925, tests 717)

## Fix round 7 (session_01A2MMvEgG7LXVhZmak6geHZ, depth 2, handled B2) · G76

**Cause (R-FOUR 1).** `site-profiles/handlers/client-rendered.mjs`: the `NO_PROSE` signal (body over 2000 characters, no anchors, at most one `<p`) fired on any non-HTML text, and one signal returns POSSIBLE, so a CSV or plain text was profiled a client-rendered shell with the "empty frame" warning.
**Fix.** `NO_PROSE` is pushed only where `hasMarkup(text)`: an `<html` or `<body`, or at least ten tags. No handler claims plain text.
**Why tests missed it (2) and the gap fixed.** Handler tests used HTML shells only; new `site-profiles/test/r7-plain-text.test.mjs` hands CSV and prose at 20 KB, 1 MB and 9 MB, with `text/csv`, `text/plain` and no type, through `identify` and `profileRecord`, plus a control that HTML shells and dense tag runs without prose still match at CERTAIN.
**Failing first (3).** Seen red (`size 20480 type text/csv`: handler `client_rendered`) before the fix; green after.
**Platform check (4).** N for the handler.
**Not mine, for extraction.** The re-profile migration of held CSV/text records is extraction's (profile-only pass).

**Found in another module (docprofile; for BOB).** Three docprofile tests encode the old shell answer for text without markup and now fail on the fix, being the same defect pinned as expected output; docprofile's job should re-record them (expected stack: conservative, confidence none, no `kind`):
- `R38 R19 readText of every fixture reading equals the answer recorded on the tip, with no classified_over`
- `R38 the stack is read from the whole text, and a matched type's parse is handed the whole text`
- `R38 readText over a 13.6 M character text adds under 16 MB, hands the type its pages, and answers as it did`
Their recorded `stack` is `{confidence: 'possible', kind: 'shell', ...}`; with the fix it is `{handler: conservative, confidence: 'none', why: 'no handler recognised...'}`. doctypes: 60 pass, 0 fail.

**Checks.** `node --test --test-force-exit site-profiles/test/`: 37 pass, 0 fail. format 0 failures; architecture 0; coverage 19 of 19 ids, 0; words 0 (plain 0, testcopy 0, missingkey 0, inline 0); ownership 0 failures (3 files).

Size (session_01A2MMvEgG7LXVhZmak6geHZ): test runs 4, module lines 1720

## J2 · COMPLETE

G76 applied: NO_PROSE counts only where markup exists (site-profiles/handlers/client-rendered.mjs), so CSV and plain text are never client_rendered; failing-first test r7-plain-text.test.mjs seen red then green; site-profiles 37 pass, checks all 0. For docprofile's job: three docprofile R38 tests pin the old shell answer for markup-free text and now fail (named in my record); they need re-recording as conservative/none. Extraction owns the held-record re-profile. Details in build/jobs/T51/site-profiles.md.

## J3 · BLOCKED

BLOCKED (cause: needs Bob). NEEDS BOB: approve, in this session, the one refused shell act: creating a scratch directory under my scratchpad, clearing it, and extracting the HEAD copy of site-profiles/ and bio-plane/src/setup-words/ into it with git archive (to run the old detects as a test oracle against my linear ones). The permission check refused it. I have not retried or rephrased it. It blocks nothing else: I carry on with the job (scan.mjs, the handlers, identify, digests, the tests) and will build the oracle table by other means in my own tests only if you or Bob clear it.

## Fix round 9 (session_015KRmXt7cbEfmR33Lj1GWYb, depth 2, handled B3) · G140, G131g · R2, R20, R21, R22

**Entries applied.**
- **G140, `client-rendered.mjs`.** (1) Cause: `client-rendered.mjs:50-66` ran `<div[^>]+\bid=…[^>]*>`, `/<a\b[^>]*\bhref=/`, `<p\b` counts and a greedy body match over the whole text; `[^>]+` from every `<div` re-scans to the end when no `>` follows (the old mount pattern on 240 KB of `<div`: 5.8 s here). The same shape was in `aspnet-webforms.mjs:42-43` (`<input[^>]*`) and `wordpress.mjs:39` and `:67-69` (`<meta[^>]+…`). (2) Missed: G76 fixed text with no markup only; no test gave a detect a hostile shape or counted its work. (3) Failing-first: `site-profiles/test/r9-bounded.test.mjs`, "R20 each stack detect adds at most 4 times its window…". Seen red before the change on the old patterns (the 240 KB `<div` run takes seconds and the count is not kept); green after (all shapes at 2.0 to 3.0 times the text, tens of milliseconds). (4) Platform check **N** for the verdict rule, **L** by the count (no clock in the test).
- **R20.** New `site-profiles/scan.mjs`: one forward tag walk (quote-aware, abandons a candidate at an inner `<`, one failed quote search at most) plus one alternation pass for every literal marker; facts memoised per `ctx` (WeakMap) so the four recognisers of one `identify` share one reading; characters examined added to `ctx.work.chars` once, at most 4 times the text; no copy larger than a tag view. The three handlers' `detect` read the facts. `wordpress.kind` (also reached by `identify`) was folded in too (og:type from the meta pass; the `class="…single…"` test is its own counted pass).
- **R2 / R21.** `identify` answers `shell: true` and `kind: "shell"` only for `client_rendered` at CERTAIN; `kind(ctx, confidence)` is given the confidence; a LIKELY or POSSIBLE match ranks by R1 and has neither, and `profileRecord` gives `document_kind: "unknown"`. The verdict is metadata only (R21): nothing in `identify` touches the text, and a digest under any handler reads the whole text.
- **R22.** `digests` decodes through `ooxml.decodeText(bytes, {declared, name, kind: "html"})`, `declared` from `ctx.charset` or the `charset` of `ctx.content_type` / the `content-type` header. `ENCODING_UNSUPPORTED` gives `textual: false`, rendition and evidentiary equal to identity, `undecodable: {why, name}` and a `why` sentence; a decoded result carries `encoding: {name, assumed, replaced, replaced_ratio, disagree}`.
- Existing R2 test updated to pass the confidence to `kind`.

**Provider not merged (R-SEAM).** `ooxml.decodeText` is not on `tranche/T51` at the time of writing (no `export function decodeText` in `bio-plane/src/ooxml.mjs`; ooxml's job has a QUESTION open). As committed, 19 of 46 tests are red, all of them reaching `digests` (R6, R8-R10, R16-R19, the 7 `words` tests that call `compare`/`digests`, and the three R22 tests, R21), and `R22 seam: ooxml's decodeText is merged…` is red by name. With a local stand-in of the contract (plan 2c item 5; appended to `ooxml.mjs` in my working tree for the run and never committed) all 46 pass. They turn green on their own when ooxml's job merges; nothing in the module changes then. I need nothing else from BOB for this.

**Words owed (T52, later-ux.md).** `site-profiles.index.the_document_is_written_in` ("the document is written in an encoding this system cannot read, so it is compared byte for byte"); the assumed encoding and a disagreeing window (G131g) are in the result as data (`encoding`) for the reading screens to word.

**Found in other modules (REPORT).**
- `docprofile/pipeline.mjs:77` and `bio-plane/src/monitoring/index.mjs:635-636` read `id.handler.shell`, the handler's class flag, which I kept `true` on `client_rendered` so nothing changes until they move; they must read `id.shell` (true only at CERTAIN) for G140 to take effect. Their tests that pin a POSSIBLE or LIKELY match as unwatchable will change with them.
- `docprofile` calls `digests` with `ctx.content_type`; a `charset` there now decides the decode (R22).
- Not mine: `applyRules`' patterns in `aspnet-webforms.mjs` and `wordpress.mjs` (`<input[^>]*…`, `<nav>…`) are still pattern-shaped; the plan and R20 name `detect` only.

**Refused act (withdrawn).** One scratch-directory command (a copy of the old code to use as an oracle) was refused by the permission check (J3 BLOCKED, NEEDS BOB). It was not retried; the job did not depend on it. Please treat J3 as withdrawn: no approval is needed. The module's behaviour on ordinary pages is pinned instead by `R20 the bounded detects give the signals…` in the new test file.

**Created files:** `site-profiles/scan.mjs`, `site-profiles/test/r9-bounded.test.mjs` (both inside the module's paths and tests).

**Checks** (from the process repository, after the commit): format 176 modules, 0 failures; architecture 0; coverage 22 of 22 live ids, 0; words 0 (plain 0, testcopy 0, missingkey 0, inline 0); ownership 0 failures (9 files). `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit site-profiles/test/`: 46 pass with the stand-in, 27 pass and 19 fail as committed (see above). Impact set not run: `build/plan/impact.mjs` errored on this checkout and its users (docprofile, doctypes) are red on `digests` until ooxml merges.

Size (session_015KRmXt7cbEfmR33Lj1GWYb): test runs 6, module lines 2094

## J4 · COMPLETE

COMPLETE: fix round 9, G140 and G131g (R2, R20, R21, R22) applied; details in build/jobs/T51/site-profiles.md. 46 module tests pass against a local stand-in of ooxml's decodeText; as committed 19 are red by name until ooxml's job merges decodeText (R-SEAM; nothing to change then). The J3 BLOCKED is withdrawn, no approval needed. REPORT: docprofile/pipeline.mjs:77 and monitoring/index.mjs:635-636 must read id.shell (CERTAIN only) instead of id.handler.shell. New file site-profiles/scan.mjs and test r9-bounded.test.mjs are inside my paths. Words owed: site-profiles.index.the_document_is_written_in. Checks: format, architecture, coverage 22/22, words, ownership all 0 failures.

## J5 · after CHANGE B5 (ooxml merged)

Merged `tranche/T51`; `ooxml.decodeText` is the real one. The R22 seam test and all the tests I had kept red by name are green. One change: the real function echoes `name` back (null when none given), so `digests` now passes `ctx.name || ctx.locator || declared`, and the refusal always names the source or the encoding. `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit site-profiles/test/`: 46 pass, 0 fail. format 0 (176 modules); architecture 0; coverage 22 of 22 ids, 0; words 0 (plain 0, testcopy 0, missingkey 0, inline 0); ownership below. Nothing deferred. The REPORT of J4 (docprofile/pipeline.mjs:77 and monitoring/index.mjs:635-636 read `id.shell`) stands.

Size (session_015KRmXt7cbEfmR33Lj1GWYb): test runs 9, module lines 2095

## J5 · COMPLETE

COMPLETE (again) after CHANGE B5: merged tranche/T51 with the real ooxml decodeText; the 19 tests kept red by name are green; one fix (the refusal names the declared encoding when no name is given). site-profiles 46 pass, 0 fail; format, architecture, coverage 22/22, words, ownership 0 failures. J4's REPORT stands (docprofile pipeline.mjs:77 and monitoring index.mjs:635-636 read id.shell).
