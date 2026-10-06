# standards (T34)

**Status** · session_01XE4Db8KTzHZSG8kemteGy9 · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied (T34-21).**
- N568 (R23 amended): `lawPropose` labels a proposed law relation, court link or treatment through `record-grammar`'s `proposalLabel(proposer, "law_relation")` (its R49), never `standard`; the proposal answer also carries the subject's sentence as `label` (`law.mjs`).
- N583 (R31): `isPortionPath(value)` (with `PORTION_PATH_MAX` = 200), pure and never throwing, in `instrument.mjs` and exported from the module's index. R18's portion check now reads it. Characters are counted as code points, as R1's reason is.
- N590 (R32): `standardsAt({key, portion?, viewer})` and `standardsWithPortion({contentId, viewer})` answer `{ok, items, truncated}`, in id order, at most 200, with `truncated` found by reading one past the cap. Each item gives id, instrument key, portion `{path, content_id}`, period and both supersession links. They are gated by membership's `viewerPredicate` (R8's gate), so a viewer naming no member reads none, and a blank key or content id answers none. They write nothing. Two indexes support them: `standards(instrument, portion_path, standard_id)` and `standards(portion_content, standard_id)`. No op is added, because reevaluation reads them in process.

**Deferred.** None.

**Found in other modules.**
- calculations: `registrations.test.mjs:46` (R19, the withheld evidence) fails intermittently, 3 of 6 runs on this branch. It looks like an order assumption over `CALC` ids, which are opaque since K1732. It has nothing to do with standards: the failing assertion is about which calculation is withheld. R4 is red as K1732 names it.
- Generated artifact made stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (standards source changed); it is regenerated at the layer's close.

**Tests and checks.**
- standards: `node --test test/m/standards/*.test.mjs`: 51 pass, 0 fail (new `t34.test.mjs`: R23, R31, R32 ×2).
- Users run because the `lawPropose` answer changed: progressions 61/0, conformance 64/0, leg-earning 45/0, inquiry 158/0, reevaluation 135/0, duties 30/0, actions 88/0, filings 64/0, action-plans 61/0, action-clocks 51/0, plane 110/0, affordances 192/0, record-grammar 72/0. calculations 30/1 (R4, K1732) and intermittently 29/2 (R19 above). On the tranche without this change, calculations was 30/1 in 5 runs.
- No layer tests are named in the manifest.
- `format`: 0 failures. `architecture standards`: 0 failures. `coverage standards`: 32 of 32, 0 failures. `ownership standards tranche/T34`: 6 files, 0 failures.

Size (session_01XE4Db8KTzHZSG8kemteGy9): test runs 22, module lines 2339
