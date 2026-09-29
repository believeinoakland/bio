# filings (T14)

**Status** · session_01QEMxsybb9kSQtmW1ZhLQSx · depth 2 · WORKING · handled B1

## Completion (FILINGS #4)

**Entries applied.** N331 (R3 and the Uses line). `filingsOf`/`Filings` gain a `promotion` dep (default `promotionOf(host)`, edge filings → promotion in `modules.json` since K452) and, when no `producingGroup` is handed in, read the group as `promotion.fact("producingGroup")` (promotion R40). `#group()` fills `group` from the fact's value (source `fact:producingGroup`, was `setting:producing_group`); a provider answering no value is "no producing group is recorded"; `FACT_UNAVAILABLE`, `FACT_FAILED` or a reader that throws leave `group` unfilled as **undetermined**, never unrecorded (`src/filings/index.mjs`). A handed-in `producingGroup` (legacy-store's, `store.mjs`:585, until layer 10) still works, answering a value, null or the fact's own answer.

**`not yet met` marks my work meets:** filings R3 *(not yet met: N331)*, for BOB to strike.

**Rows awaiting stamp.** None: no check row added, moved or retired.

**Found elsewhere (REPORT).**
- legacy-store (`store.mjs`:585) hands filings `() => f.ok ? f.value : null`, collapsing `FACT_UNAVAILABLE`/`FACT_FAILED` into null, which filings must read as "unrecorded". Until legacy-store drops the argument at layer 10 (as B1 says), a store with no provider would still say "no producing group is recorded" rather than undetermined. Passing the fact's answer through (`() => promotion.fact("producingGroup")`) would meet R3 now; filings already accepts that shape. On the plane instance-setup registers the provider, so the gap arises only if it is absent.
- Generated artifacts made stale: `bio-plane/dist/bio-plane.bundled.mjs` (holds filings' old `#values` group line, 87769); not rebuilt.
- `civicos-ui/` and affordances' lists: no hit for the group source string or the new code (`producingGroup`/`producing_group` appear only in two civicos-ui test comments about instance-setup's registration).

**Deferred.** Nothing.

**Tests and checks.**
- `node --test test/m/filings/`: tests 35, pass 35, fail 0 (new: "R3 the producing group is read through promotion's fact producingGroup (N331)…": registered → filled from the fact; provider null → unrecorded; `FACT_FAILED` → undetermined; a real promotion with no provider (`FACT_UNAVAILABLE`) → undetermined; handed-in readers). The fixture no longer hands filings a group stand-in: it reads through the real promotion, whose provider publication's world registers.
- Users of filings, re-run: `test/m/escalation/` tests 29, pass 29; `test/m/affordances/catalogue.test.mjs` tests 27, pass 27.
- Layer tests: none named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture filings`: 11 product files, 41 relative imports; 0 failures. `coverage filings`: 21 of 21 live requirement ids named by a test; 0 failures. `ownership filings tranche/T14`: 0 failures.

Size (session_01QEMxsybb9kSQtmW1ZhLQSx): test runs 7, module lines 1407
