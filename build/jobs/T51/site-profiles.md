# site-profiles (T51)

**Status** · session_01A2MMvEgG7LXVhZmak6geHZ · depth 2 · WORKING · handled B1

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
