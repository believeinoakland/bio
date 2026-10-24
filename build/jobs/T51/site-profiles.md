# site-profiles (T51)

**Status** · session_015KRmXt7cbEfmR33Lj1GWYb · depth 2 · NEEDS BOB · handled B1

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
