# monitoring (T51)

**Status** · session_01S5nkn1saHjBBMrx7Keep3c · depth 2 · WORKING · handled B1

## J1 · COMPLETE

COMPLETE for T51 monitoring (session session_01QHLkmebmN4o1yN2ZJJmKBE), head 18a9f3808d on job/T51/monitoring (tranche/T51 merged in as c95c43efd0; no rebase).

**Entry applied: T51-243 (words, K3949).** Every finding in build/plan/words-pass/monitoring.md is fixed (the list's line numbers had moved after the merge; the live check's list is the one I worked from).

- Copies of existing words.json rows now read through `word(key)`: `monitoring.content_type`, `monitoring.reason_given`, `monitoring.says.objective_published_finding`, `monitoring.says.published_finding`, `monitoring.time_zone_held`, `monitoring.says.recorded_frequency_governs`, `monitoring.document_served_gathered` (vars locator, id, bundle; the same en).
- Sentences held only in code now read through `localize`: `monitoring.index.fetched_the_opendocument_export` (the stitched Session Log fragment), and `monitoring.says.an_objective` (the fragment the project-rests sentence takes as its `has` var).
- Test copies fixed, each compared by key or by equality with `word`/`localize`, never held as text: voice.test.mjs (C-48.8 by `word("refusal.DRIVE_TICK_EXPORT_IS_THE_SHELL")`; C-48.9 and the shape suffix by `localize` with the product's id and en), watch.test.mjs (fixture why by `word("intent.objective_states_condition")`), docket.test.mjs (stub detail by `localize("case-import.index.no_watch_in_force", ...)`), fixture.mjs (link-sweep's uniqueness sentence by `localize("link-sweep.checks.id_is_not_unique_within", ...)`; the literal `id ` prefix stays so the seam test's expected text is unchanged).

**Deferred:** none. **Judged as no member reading:** none. **Found in another module:** none.

**Tests run**
- `node --test test/m/monitoring/` (bio-plane): tests 145, pass 145, fail 0 (run twice; the second after the last test edit).

**Checks run**
- `checks/words.mjs /home/user/bio monitoring`: inline 0, plain 0, testcopy 0, missingkey 0, handlist 0; 0 failures.
- `checks/words.mjs /home/user/bio monitoring following link-sweep scheduler`: no line naming monitoring.
- `checks/run.mjs /home/user/bio` (before my last test fix, then the words check on its own after it): format 176 modules, 0 failures; architecture 3648 files, 0 failures; coverage 175 modules, 5955 of 6092 live ids named, 24 failures (none names monitoring; the module's own coverage is 61 of 61, 0 failures); channels 2 participants, 0 failures; words 1163 failures, of which 1 named monitoring (docket.test.mjs:128), now fixed; the whole-repo words run after the fix shows 1162 and none names monitoring.
- `checks/format.mjs /home/user/bio`: 176 modules, 175 requirements files, 0 failures.
- `checks/architecture.mjs /home/user/bio monitoring`: 20 product files, 100 relative imports, 0 failures.
- `checks/coverage.mjs /home/user/bio monitoring`: 61 of 61 live requirement ids named by a test, 0 failures.
- `bio-plane/src/setup-words/build.mjs --check`: stale-rows note only, as expected. The two new ids above (monitoring.index.fetched_the_opendocument_export, monitoring.says.an_objective) are not yet in rows.mjs; rows are regenerated at the layer close.
- `checks/ownership.mjs /home/user/bio monitoring tranche/T51 job/T51/monitoring`: 6 files changed by monitoring, 0 failures.

**Size (session_01QHLkmebmN4o1yN2ZJJmKBE):** test runs 2, module lines 2820 (an approximate count: non-blank, non-comment lines in src/monitoring/*.mjs; 3789 lines in all).
