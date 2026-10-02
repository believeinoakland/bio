# conformance (T22)

**Status** · session_01KcWEGF25pCHJBFuv18Vqhw · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1, B2; `build/plan/current.md` L9, K1030). (1) `test/m/conformance/fixture.mjs` `standard()` declares with the declarer's `reason` (standards R1, C-112.20, DEC-88): a default, "The group holds the parks department to this rule.", the caller may override as `kind` and `issuer`; no test's own assertion changed. The grep (`standardDeclare(`, `standardAdopt(` over `bio-plane/src/conformance/`, `bio-plane/test/m/conformance/`) finds no other site. (2) N469/N471/N480 scan: the fixture's header and its `registerFact("producingGroup", "legacy-store", …)` named the deleted legacy store as the live filler of the producing group; both now name `instance-setup` (`src/setup.mjs`:1922 registers that fact). Nothing else in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the plane `index.mjs` as live; `src/conformance/index.mjs`:8 ("nothing moved here from the legacy modules") is provenance and stays. Module code and requirements unchanged; tests only, the plane bundle is not staled.

**Deferred, in my own module** (not changed: B1 keeps module code unchanged unless it must). `Conformance.basisChanged` (`src/conformance/index.mjs`:1049) reads every event whose `kind` is not `passage` as a finding's. reevaluation R8 now also tells `kind: "source"` (R28) and `kind: "attribution"` (R29). Neither is an R10 cause, and their subjects (a source id, an observation) never equal a pinned finding id, so nothing is flagged today (0 rows). A later conformance job should ignore kinds other than `finding` and `passage` so the guard does not rest on id disjointness.

**Found in other modules.** None of conformance's. In this run, `test/m/affordances/backing.test.mjs`:140, :165 are red through `test/m/action-plans/fixture.mjs`:187 (`no such table: register`), with all 43 of action-plans' own tests: B2's action-plans item (its fixture's provenance migrate against actions' merged R55), not my fixture.

**Tests and checks** (on `tranche/T22` @ dde04dba31 merged, HEAD of `job/T22/conformance`):
- `node --test bio-plane/test/m/conformance/`: 54 pass, 0 fail (before the edit on the pre-standards tranche: 54/54; after the edit, before standards' merge: 2 pass, 52 fail with `STANDARD_FIELD_UNKNOWN`, as B1 said).
- Negative control: with the helper's `reason` removed, 2 pass, 52 fail with `fixture standard refused: … STANDARD_NO_REASON`; restored.
- `node --test bio-plane/test/m/escalation/real.test.mjs bio-plane/test/m/affordances/backing.test.mjs`: 14 pass, 2 fail (backing :140, :165, through action-plans' fixture, above; none through mine).
- Users' suites: consequences 30/0; actions 66/0; action-clocks 32/0; escalation 44/0; filings 0/58 (its own fixture `test/m/filings/fixture.mjs`:131, `STANDARD_NO_REASON`, accepted until filings' merge); action-plans 0/43 (B2's item); affordances 136/2 (as above); control-plane 100/2 (`catalogue-end.test.mjs`:15, `doorbell.test.mjs`:310, accepted until L11).
- Whole `bio-plane/test/m`: 4815 pass, 113 fail, every red named: filings (58), action-plans (43), affordances backing :140 :165, control-plane (2), accepted red 4 (`membership/module-order.test.mjs`:12, `t9-notice-sight-bounds.test.mjs`:185, `promotion/registry.test.mjs`:58), queue-producers `proposals.test.mjs` (4 tests, L11), scheduler `plane.test.mjs`:85 (L10). No new red of conformance's.
- `node checks/format.mjs`: 86 modules, 85 requirements files; 0 failures. `architecture.mjs … conformance`: 9 product files, 42 relative imports; 0 failures. `coverage.mjs … conformance`: 24 of 24 live requirement ids named by a test; 0 failures. `ownership.mjs … conformance tranche/T22`: 2 files changed; 0 failures.

Size (session_01KcWEGF25pCHJBFuv18Vqhw): test runs 22, module lines 1538

## J1 · REPORT

Ready for standards' merge; nothing for BOB to decide. (1) `fixture.mjs` `standard()` now sends `reason` (default "The group holds the parks department to this rule.", overridable like `kind`/`issuer`), committed 45d02ce9bf on job/T22/conformance. The grep (`standardDeclare(`, `standardAdopt(` over my paths) finds no other site. On today's tranche it is red as you said (52 fail, STANDARD_FIELD_UNKNOWN); baseline before the edit was 54/54. (2) N469-kind scan: one note named the deleted legacy store as the live filler of the producing group (fixture header and its `registerFact("producingGroup", "legacy-store", …)`); now `instance-setup` (whose setup.mjs:1922 registers it). Nothing else in my paths names a T20-deleted file, `tools/`, `legacy-tests` or the plane `index.mjs` as live. Checks on HEAD: format 0, architecture 0, coverage 24/24, ownership 0 failures. Waiting on your CHANGE announcing standards' merge; then I merge tranche/T22, run the proof (my suite, escalation real + affordances backing, the negative control, the users' suites, the whole test/m) and post COMPLETE.
