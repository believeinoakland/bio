# actions (T21)

**Status** · session_01VFxeE784CFxt5oNsJ1nMKX · depth 2 · COMPLETE · handled B1

## Completion (ACTIONS #8, 2026-10-01)

**Entries applied.** N469 (K931), comments only; no behaviour changed.
- `src/actions/index.mjs`, the note above `#lawEntries` ("AN INSTANCE METHOD AND NOT A STATIC ONE"): the reason given was `check-refusal-codes.mjs`'s arm C, deleted in T20. Re-worded as provenance: the method was written that way for the legacy guard, and DEC-49's totality over these codes is now proven by control-plane's `test/m/control-plane/families.test.mjs` (its R22). The method's shape is unchanged.
- `src/actions/schema.mjs`:35, :159 ("hygiene.test.mjs holds that list against this file"): no module test held the claim, and it is R36. Added the requirement-named test `R36 every table this module creates is keyed by bundle_id, listed in ACTIONS_TABLES and cleared by the purge` (`test/m/actions/read.test.mjs`). It migrates the schema into an empty database and checks three things: the tables it creates are exactly `ACTIONS_TABLES`, each is keyed by `bundle_id`, and each is declared to record-core's purge. Both notes now name that test.
- The re-scan found three more live notes about deleted instruments:
  - `index.mjs` above `#badRiskTier`: "An instance method so the refusal guard's `where` can name it". Dropped.
  - `index.mjs`, `actionLawsPropose`'s header: the fence's spelling was explained by `machinefences-dec49`'s ARM B2. That suite was deleted in T20 (6280db0024). The explanation is dropped.
  - Same header: "The suite's named control arms this method …", naming a control that no longer exists. Re-worded to name the module test of R18 and R19 (`acts.test.mjs`), which holds that a proposal leaves the list unchanged.
- No other note in my paths names a deleted file or "the battery".

**Deferred.** None.

**Seen in other modules.** None. **Generated artifacts made stale:** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`), because two files under `bio-plane/src/` changed. The change is comments only. Not regenerated.

**Tests and checks.**
- `node --test bio-plane/test/m/actions/`: tests 63, pass 63, fail 0.
- `format`: 86 modules, 84 requirements files, 0 failures.
- `architecture actions`: 12 product files, 46 relative imports, 0 failures.
- `coverage actions`: 42 of 42 live requirement ids named by a test, 0 failures.
- `ownership actions tranche/T21`: 0 failures. The check was re-run after the commit.

Size (session_01VFxeE784CFxt5oNsJ1nMKX): test runs 1, module lines 25

## J1 · REPORT

Generated artifact made stale: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (owner not_product). Two files under bio-plane/src/actions/ changed, comments only; not regenerated.
