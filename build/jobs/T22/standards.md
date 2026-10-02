# standards (T22)

**Status** · session_01SaE69KFaVDqvrCUJhymv5c · depth 2 · WORKING · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 9; code at 158651d631).
- **(1) DEC-88: R1 and R10 met.** `reason` joins `DECLARE_KEYS` (so `ADOPT_KEYS`); a caller sending it is no longer refused `STANDARD_FIELD_UNKNOWN`. In `#declareRefusal`, after `STANDARD_NO_ISSUER` and before `STANDARD_NO_TEXT` (new region `is-standard-reason`), `STANDARD_NO_REASON` refuses a reason absent, not a string, blank or white space only, or over `REASON_MAX` = 2,000 characters (code points, as content's `ATTEST_NOTE_MAX`), with `check`, `translation`, `detail` and `max_chars`, nothing written. The reason is kept as given in a new `standards.reason` column (`migrateStandards` adds it to a table created before it, never filling it: an earlier standard reads `reason: null`), in the document's own `## Reason` body section, and read back by the declaration's answer, `standardRead` and `standardsIn` (R4, R5). R10: `standardAdopt` reaches the same refusal through `#declareRefusal`, after the proposal's held and adopted-once checks; the proposal's `why` never serves as the reason and is answered beside it as the proposer's (`adopted.why`, `adopted.why_by`). The ops map passes the body whole; unchanged.
- **Rows, each `awaiting stamp` (T22):**
  - C-112.20 `STANDARD_NO_REASON` arrived (new row after C-112.19): "A standard is recorded with your reason: in your own words, why the group holds its government to it, in at most 2,000 characters. None was given, or it is not words, or it is too long. Nothing was written."
  - C-112.17 `STANDARD_FIELD_UNKNOWN` changed: its translation's list "citation, kind, issuer, text and period" became "citation, kind, issuer, text, period and reason" (no longer true once a reason is held; the fewest words).
- **(3) The re-scan.** `index.mjs`'s `standardsOps` note named "Legacy-index" (deleted) as the router: now `plane` (`src/plane/store.mjs`). The fixture registered promotion's facts under the retired `"legacy-store"`: now `instance-setup` (`producingGroup`), `connections` (`citedBy`), `publication` (`caseMember`), which also meets B2 (N497). No other note in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the plane's deleted `index.mjs` as live.

**Deferred:** none.

**Other modules (REPORT J1):** reds by name (conformance, filings, escalation, affordances), `row-census` (accepted red 3), the stale plane bundle, and two findings: affordances `src/affordances.mjs`:1196 and :2651 describe `standarddeclare` (and :1198, :2653 `standardadopt`) without the now-required reason (affordances' L11, which also moves them out of `RUNG_ABSENT`); skills `src/skilldoctrine.mjs`:854 says `standardadopt` is `defined_by: "standards R9"`, which is R10 (R9 is the proposal).

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/standards/`: tests 23, pass 23, fail 0. New `reason.test.mjs`: R1 (absent, null, a number, a list, an object, `true`, empty, blank, white space only, 2,001 characters, each refused `STANDARD_NO_REASON` through C-112.20 with the whole database unchanged and the first standard then taking `STD-2026-0001`; the issuer and earlier refusals first, the text and later ones after; 2,000 plain, accented and astral characters admitted, 2,001 astral refused; read back whole by the answer, `standardRead`, `standardsIn` and the document; through `standardsOps`; a pre-reason table migrated forward, a reasonless row read as null, a second migrate a no-op); R10 (for a machine and a member proposer, every refused reason with the proposal's `why` present refused and the proposal still unadopted; a reasoned adoption lands with the adopter's reason, the proposal's `why` and its proposer beside it, read back); C-112.20's row. Mutation checks: disabling the refusal fails 4 of 5 of the new tests.
- Users' suites, against the unchanged tree: conformance 54 tests, 52 fail (its `fixture.mjs`:320 declares with no reason; base 0); filings 58, 58 fail (`fixture.mjs`:130; base 0); escalation 38, 5 fail, all `real.test.mjs` (through conformance's fixture); affordances 138, 1 fail (`backing.test.mjs` R19, through conformance's fixture); action-plans 43/0; control-plane 102, 2 fail (`catalogue-end.test.mjs`:15, `doorbell.test.mjs`:310, the same 2 on the unchanged tree, accepted K1037). Every new red fails on `STANDARD_NO_REASON`.
- `node --test "test/m/**/*.test.mjs"`: tests 4931, pass 4786, fail 127. Unchanged tree, same run: 4915 / 4883 / 14. Every red mine adds is one of the four callers above (116); the rest are the carried reds (actions `t18.test.mjs`, membership `module-order` and `t9-notice-sight-bounds`, promotion `registry`, queue-producers `proposals` 4, scheduler `plane`, control-plane 2). Only the unchanged tree also failed extraction `convert-tiers` and `staffdirectory` and test-support R2 (both trees run at once; environment).
- `test/system/row-census.test.mjs`: fails; my rows C-112.20 (arrived) and C-112.17 (changed) among the moved rows, `awaiting stamp` above (accepted red 3).
- `test/system/fleetbundles.test.mjs`: bio-plane's member stale (`src/standards/` changed behaviour); not regenerated.
- `node checks/format.mjs`: 86 modules, 85 requirements files; 0 failures
- `node checks/architecture.mjs … standards`: 9 product files, 32 relative imports; 0 failures
- `node checks/coverage.mjs … standards`: 17 of 17 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … standards tranche/T22`: 10 files changed; 0 failures

**For COMPLETE:** R1 and R10 met (their `not yet met: T22` marks are BOB's to strike); C-112.20 and C-112.17 `awaiting stamp`.

Size (session_01SaE69KFaVDqvrCUJhymv5c): test runs 14, module lines 849
