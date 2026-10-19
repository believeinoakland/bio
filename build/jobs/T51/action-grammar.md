# action-grammar (T51)

**Status** · session_01Wkof3P16pbHsMX1b882161 · depth 2 · WORKING · handled B0

## J1 · REPORT

Decisions I made in this job, each for you to record once (P17). None changes a requirement's meaning; each is listed so you can redirect.

1. **golden.json holds the current words.** The five recorded re-wordings (K899 (1), T34-87) were applied to golden.json's data once, plus two recorded wordings that follow the design's rows: lawProposalLabel's "labeled" (record-grammar's current label, K3964) and C-94.12's "lowercase" (words.json's `refusal.LIFECYCLE_TOKEN_MALFORMED`). The fixture no longer applies them at load. Reason: the "now" sentences were test copies of product sentences (K3810). The golden stays a recorded answer otherwise; GROWN (the none_exists list) still applies at load. The rewording test now asserts the recorded answer holds none of the old phrases. This changes the K899 (1) mechanism, so please confirm.
2. **C-94.12 LIFECYCLE_TOKEN_MALFORMED reads its translation by key** (R26's "a row it has come to hold since is read by key likewise"). Its words.json text differs from the old code text ("lowercase" for "lower-case"), so the translation changes by the design's wording.
3. **FEE_ESTIMATE_WITHOUT_QUOTE and PRESSURE_REFUSED read by key** (their text equalled words.json exactly).
4. **The four kept rows (C-117.32, .41, .55, .57)** keep their T46 text, now as localize(id, en) with the same ids the product uses; t45-rows.mjs pins them that way.
5. **Hand-lists of other modules' codes (t45.test.mjs, t47.test.mjs) are replaced by checks on each row's where.** Architecture forbids tests importing action-holds or action-replies, so the t45 check is now: every row held here names this module's files or actions'/action-records'. The t47 check is now: the rows naming action-records are the R28 set plus six, and no other row names it. The six are pinned by code in t48.test.mjs, which I left alone.
6. **Stale comment (entry T51-87, checks.mjs:524).** Line 524 on the branch as it stood before my edits reads "another document asserts a correspondence that never happened", which I checked against the code and found accurate. The stale phrase I could find is "until this item deleted it" at checks.mjs:510–513 (a process reference); I reworded it to "until it was deleted from both". If you meant another line, please name it and I will look again.
7. **Cross-module messages I converted.** Two sentences in this module were not flagged by the check but were copied by other modules' tests: the basis-leg target finding (grammar.mjs) and the counterparty entity-id finding (checks.mjs), each now localize with its own id.

Findings in other modules (not changed here):
- The full suite (`node checks/run.mjs /home/user/bio`) is red in many other modules: coverage of live ids not named by a test (installer-steps, interface-shell, screens-*, queue, and others), and words testcopy/inline/handlist findings (wizard-scripts t47 and t48, writing-help.test.mjs:204–205, and more). Counts: 1380 words failures and the coverage list. None names action-grammar after my changes.
- The cross-module words check (the layer 9 set you named, K3986) lists 192 failures, none on action-grammar.
- `setup-words/build.mjs --check` reports rows.mjs stale, naming my new keys (e.g. action-grammar.checks.claims_i_is_not_a). That is the expected stale note; the rows are regenerated at the layer close.
