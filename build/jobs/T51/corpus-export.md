# corpus-export (T51)

**Status** · session_013RNXx78ApicHuNgHCy5nx7 · depth 2 · WORKING · handled B1

## J1 · COMPLETE

T51-230 done (corpus-export, layer 8, re-run R8). Commit 03b15db936 on job/T51/corpus-export, after merging tranche/T51 (merge of origin/tranche/T51 @ 6c98dc6386).

Applied: all 13 findings of the words check, each through localize with a fixed id, the English unchanged:
- index.mjs: corpus-export.index.table_not_declared (142); table_rebuilt_by_rule and table_never_travels (145); page_named_by_index (148); manifest_object_listing_records (239); snapshot_filed_under_key (312); promotion_filed_under_key (319); declared_tables_list (349, 353); never_table_no_row (366); canonical_page_of_rows (389); declared_table_carried_or_named (407).
- tables.mjs: corpus-export.tables.stored_tables_not_stated (138).
Judgement: I read the verifier's `expected` strings (a refusal's list, which an importing administrator reads) as member-read, so they are keyed, not listed in a REPORT. If Bob reads them as diagnostics, they move to the unkeyed list.
Deferred: none. Flaws found in other modules: none from this module's code. Observed, not touched: checks/run.mjs reports 2252 failures across other modules (testcopy, inline, handlist, missingkey), none in corpus-export.
No test holds a sentence: the module's tests hold no flagged text, so no test changed. No requirement changed.

Checks:
- node --test bio-plane/test/m/corpus-export/*.test.mjs: tests 25, pass 25, fail 0.
- node checks/format.mjs /home/user/bio: 176 modules, 175 requirements files; 0 failures.
- node checks/architecture.mjs /home/user/bio corpus-export: 12 product files, 35 relative imports; 0 failures.
- node checks/coverage.mjs /home/user/bio corpus-export: 10 of 10 live requirement ids named by a test; 0 failures.
- node checks/words.mjs /home/user/bio corpus-export: 1046 string literals; 0 failures.
- node checks/ownership.mjs /home/user/bio corpus-export tranche/T51 job/T51/corpus-export: 3 files changed by corpus-export; 0 failures.
- node checks/run.mjs /home/user/bio: the words findings for corpus-export are 0; the run's other 2252 failures are in other modules (above).
- node bio-plane/src/setup-words/build.mjs --check: the stale-rows note names the new corpus-export ids (expected: rows.mjs is BOB's to regenerate at the layer close); no refusal naming this module.

Size (session_014TTSTRZBy424fto64QGN3J): test runs 1, module lines 1035
