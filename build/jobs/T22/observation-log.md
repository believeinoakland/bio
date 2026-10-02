# observation-log (T22)

**Status** · session_01V6n4Sam5rH4aTsVsmXRRHM · depth 2 · RUNNING until 2026-10-02T01:27:45Z (node --test bio-plane/test/m/) · handled B2

## J1 · QUESTION

R29 vs R16. R16 records a share's reason "with the share (a new column of `lead_shares`)", but R29's read contract lists `lead_shares`' columns as `lead_id`, `bundle_id`, `sharer`, `at` and says this module changes none of their names, types or meanings without a change to R29. My best reading, which I am building on: adding a column changes none of the four, so R16 licenses it; the new column is `reason` (TEXT, nullable only for shares recorded before DEC-88, migrated forward with `ALTER TABLE lead_shares ADD COLUMN reason TEXT` where absent; every new share writes it), and R29 should list it as a fifth column ("`reason`, the sharer's words, null on a share recorded before DEC-88"). My R29 test will name the five columns. Please confirm, and amend R29's words if you agree; no other change hangs on it. Also stated readings, no answer needed unless you disagree: "over 2,000 characters" counts Unicode code points; "blank" is empty after trim; the reason is stored as written (not trimmed), as a lead's words are; a pre-DEC-88 share's repeat answers `reason: null`.
