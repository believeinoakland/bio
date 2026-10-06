# action-grammar (T33)

**Status** · session_019ZPA869n1maeYjDhwTzrT3 · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied.** T33-72 (S0-10, B0.8; K1470's one id grammar): R12. `checks.mjs`' `ENTITY_ID_RE` (the one entity id this module tests, `counterparty.entity_id` in C-2.10's counterparty arm, reached by `counterpartyFindings` and `checkActionExtension`) is now `idPattern('ENT')` from `record-grammar` (its R47), no pattern of its own: `ENT-2026-10000` is accepted, `ENT-2026-999` refused as before, and the finding's sentence is unchanged, so every finding on a document written before T33 is byte-identical (the golden corpus still matches). No other arm here reads an entity id; the bundle ids it tests come from `record-grammar`'s `BUNDLE_ID_RE`, already built from `idPattern`. Uses: `record-grammar` (`idPattern` added), `jurisdictions`, `connections`, `inquiry-grammar`, unchanged otherwise; final `uses` as in `modules.json`.

**Deferred.** None. The R12 text's `*(not yet met: T33-72)*` marker in `build/requirements/action-grammar.md` is BOB's to clear (I write only my paths, tests and this record).

**Found in other modules.** None. `case-checker`'s `program.mjs` does not bundle this module, so no generated artifact is staled.

**Tests.**
- `node --test bio-plane/test/m/action-grammar/`: tests 26, pass 26, fail 0 (new: "R12: every entity id the module tests …", over four named kinds × 14 ids, at the arm and in the audit, against `idPattern('ENT')`). Negative control: with the old `/^ENT-\d{4}-\d{4}$/` restored, pass 25, fail 1 (the R12 test).
- Dependants (`modules.json` users of this module): actions 74/0, filing-templates 47/0, escalation 52/0; action-clocks 29/3, affordances 164/3, instance-setup 90/4, control-plane 155/4, each failure one of START's named inherited reds (action-clocks R10 ×3, K1519; affordances' three, K1550, K1571, K1643; instance-setup R44 ×4, K1544; control-plane's four, K1550, K1572, K1581, K1638), and the same counts with my change stashed.
- Layer tests: none named in `build/manifest.md`.

**Checks** (from `civicos-process`): `format: 126 modules, 125 requirements files; 0 failures`; `architecture: 7 product files, 13 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 12 of 12 live requirement ids named by a test; 0 failures`; `ownership: 3 files changed by action-grammar between tranche/T33 and HEAD; 0 failures` (the code, its test and this record).

Size (session_019ZPA869n1maeYjDhwTzrT3): test runs 4, module lines 1799

## J1 · COMPLETE

T33-72 applied: R12 met. ENTITY_ID_RE is record-grammar's idPattern('ENT'); ENT-2026-10000 accepted, ENT-2026-999 refused, golden corpus byte-identical. action-grammar 26/0 (negative control 25/1 on the old pattern); dependants' only reds are START's named inherited ones, same counts without my change. format, architecture, coverage (12/12), ownership: 0 failures. No generated artifact staled; nothing found in other modules. Please clear R12's not-yet-met marker. Details in the record's Completion.

## Completion of B2 (CHANGE, K1657)

Merged `tranche/T33` @ `origin/tranche/T33` first (requirements R7 and Uses changed by BOB).

**Applied.**
- (a) R9: `ACTION_CATALOGUE_CHECKS` gains, last and in this order, C-117.26 `NO_SUBJECT` (`actions` R62, `addresseeSuggest > is-addressee-subject`), C-117.27 `MACHINE_CANNOT_SET_PROCEEDING` (R65, `#heldLinks > is-machine-set-proceeding`) and C-117.28 `NOT_A_PROCEEDING` (R65, `#proceedingRefusal > is-proceeding-kind`), each `{check, where, translation}`; they join the row-census red awaiting promotion's stamp.
- (b) R7 (K1444 (iii)): `checkActionExtension` reads a pending clock entry as past its date only once the local day of `ctx.nowMs` in `ctx.zone` (`civil-time.localDay`) is after the entry's date; with no zone, an unknown zone or an unreadable time, no entry is past its date (never the UTC day). Every other C-11.1 and C-2.10 finding is unchanged. Uses: `civil-time` (`localDay`) added; final `uses`: record-grammar, civil-time, jurisdictions, connections, inquiry-grammar (as `modules.json`).

**Found in another module (`actions`, for its re-merge).**
- `actions/index.mjs:1000` calls `checkActionExtension({fm, nowMs, actionKinds})` with no `zone`, so its audit now reports no past-date C-11.1 finding: `t19.test.mjs:49` "R51 the audit's action arm is registered …" and "R51 R36 the audit reports C-2.10 and C-11.1 …" go red (the only new reds). The fix in actions: pass `zone: zoneOf(this.place())`, as its R12 reads.
- The three new rows' `where`s name regions `actions` does not yet mark (`DEC-49 REGION is-addressee-subject`, `is-machine-set-proceeding`, `is-proceeding-kind`); actions should wrap each minting site so the `where` names a real region.

**Tests.**
- `node --test bio-plane/test/m/action-grammar/`: tests 28, pass 28, fail 0. New: "R9: the rows C-117.26 NO_SUBJECT …" and "R7 (K1444 (iii)): a pending clock entry is past its date only once the office's local day …" (UTC, a zone behind, a zone ahead, the test profile's zone at the boundary instant; no, blank, unknown zone; unreadable time). The golden suite hands `zone: "UTC"`, the day it was recorded on, so every recorded finding still matches. Negative control: the old UTC-day line restored, pass 27, fail 1 (the R7 test).
- Dependants, each compared by test name with my change stashed: actions 85/2 (the two R51 reds above, new); action-clocks 29/3, escalation 51/1, affordances 161/6, filings 0/60, instance-setup 90/4, control-plane 155/4: the same tests by name before and after; filing-templates 47/0, action-plans 53/0.

**Checks:** `format: 126 modules, 125 requirements files; 0 failures`; `architecture: 7 product files, 14 relative imports (0 naming no tracked file, not judged); 0 failures`; `coverage: 1 modules, 12 of 12 live requirement ids named by a test; 0 failures`; ownership below after commit.

Ownership: `ownership: 4 files changed by action-grammar between tranche/T33 and HEAD; 0 failures`.

Size (session_019ZPA869n1maeYjDhwTzrT3): test runs 9, module lines 1839

## J2 · COMPLETE

B2 (K1657) applied. (a) C-117.26 NO_SUBJECT, C-117.27 MACHINE_CANNOT_SET_PROCEEDING, C-117.28 NOT_A_PROCEEDING in ACTION_CATALOGUE_CHECKS (wheres: addresseeSuggest > is-addressee-subject, #heldLinks > is-machine-set-proceeding, #proceedingRefusal > is-proceeding-kind). (b) R7: past date only once ctx.zone's local day (civil-time.localDay) has ended; no zone, no past-date finding. action-grammar 28/0 (negative control 27/1). Checks 0 failures (ownership 4 files). For ACTIONS #12's re-merge: actions/index.mjs:1000 passes no zone, so its two t19 R51 tests go red (the only new reds; dependants otherwise identical by name); fix: pass zone: zoneOf(this.place()). Actions should also mark DEC-49 regions for the three new wheres. Details in my record.
