# people (T35)

**Status** · session_01FSeSN6nLRsFEECUy7671eK · depth 2 · WORKING · handled B1

## Completion (PEOPLE #4)

**Entries applied (T35-35):**
- R9 amended (N698; DEC-164 (4), (5); K1865, K1941): `recordPersonFact`'s citation may be retrieval R73's match `{kind, words, capture_sha, extent, origin}`; it is read as its capture and extent only (the document resolved from the capture through provenance, as any citation), so the refusals, the grade (the capture's) and the sight (the capture's) are those of any other extent, and nothing of the find is stored. New optional `question`: refused `QUESTION_NOT_HELD` after `BAD_VALIDITY` unless it names a bundle the record holds whose `object_type` is `inquiry` (record-core R37, via `bundleInfo`) and the actor (the stamp, read as `member:<id>` or the machine's credential) may see (`membership.inSight`); absent and unseen answered alike. Held in a new `question` column on `person_facts` and `person_contacts` (added in place to an older store by `migrate`), never changed by a later act, answered as `question` by `personAt` and by `samePersonCandidates`' life rows to a viewer who may see the inquiry, `null` otherwise and when none; `recordPersonFact` answers it.
- R24 amended (N694, K1863; DEC-131): every result view (`op=interestchecks` and what R25's listeners are told, one view) carries `mark: "Hint · machine work"` beside `label: "Noticed"`, and `detail` is exactly R24's sentence beginning with the mark ("hint", never "signal"); exported as `HINT_MARK`, `HINT_DETAIL`. The old `detail` sentence is gone; every other key unchanged.
- DEC-149 sweep: people has no rows (`draft-T35-dec149-l1-l7.md`, "Modules with nothing to change").

**Readings (no QUESTION posted; each is the requirement's plain text):** a found extent is accepted with R73's key spelling `capture_sha` beside the existing `captureSha`; an empty-string `question` is none; a non-string `question` is `QUESTION_NOT_HELD`; with no stamp and a question, the refusal is `QUESTION_NOT_HELD` (the unstamped actor sees nothing), and nothing is written either way.

**Deferred:** nothing.

**Other modules:** none found wrong. Generated artifact made stale: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (it embeds `people`), for BOB's regeneration at L5's close (§14). retrieval R73's match is followed as worded; a CHANGE with its merged signature re-opens this job if the shape differs.

**Tests and checks:**
- `node --test bio-plane/test/m/people/`: tests 40, pass 40, fail 0 (new: R9 ×2 "(T35)", R24 "(T35; DEC-131)").
- Users of the service (`uses` people): calculations 38/0, strength 143/0, answers 34/0, corpus-export 25/0, ratification 212/0, case-disclosures 59/0, case-authoring 145/0, consequences 41/0, scheduler 95/0, affordances 203/0, notice-producers 45/0, `system/migrate-released` 1/0; op-declarations 81 pass, 3 fail (accepted reds 9 ×2 and 23); plane 109 pass, 6 fail (`ask.test.mjs` ×6, accepted red 22).
- `checks/format.mjs`: 2 failures, both accepted red 24 (law-relations paths/tests). `checks/architecture.mjs … people`: 0 failures. `checks/coverage.mjs … people`: 35 of 35 live ids named; 0 failures. `checks/ownership.mjs … people tranche/T35`: 0 failures.

Size (session_01FSeSN6nLRsFEECUy7671eK): test runs 20, module lines 1956
