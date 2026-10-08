# record-grammar (T40)

**Status** · session_01DoeyeHeM15vrBLPc7ti25M · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Found in other modules (against their own requirements; not changed, not verified reachable): eight modules read `STATES` through `vocabFor` with a stored `object_type` and then index the answer (`spec.legal`, `spec.edges[...]`): affordances `affordances.mjs`:699, actions `index.mjs`:1107, queue `index.mjs`:439 and :1604, inquiry `index.mjs`:1617, machinery-producers `index.mjs`:653, basis-versions `index.mjs`:1033, notice-producers `index.mjs`:244, queue-producers `index.mjs`:1267, promotion `index.mjs`:776 and :1080. `vocabFor` answers an inherited key as R34 states, so a row whose `object_type` is `toString`, `constructor` or `__proto__` gives a function or `Object.prototype` there, where `checkBundle` threw before this job. Whether such a type can reach those reads past promotion's gate (which now answers C-2.5 for it) is each module's to judge; the fix would be the own-key lookup `checkBundle` now uses. Not a change to R34 (its tests pin the inherited answer).

Generated artifacts staled: the plane bundle and `release/bio-plane.bundled.mjs` (they carry `bundle.mjs`), accepted red (7), regenerated at layer close.

## J2 · COMPLETE

T40-1 done: `job/T40/record-grammar` @ 43965865cd, from `tranche/T40` @ e2065c9933; no merge of the tranche needed (BOB changed nothing I read after START).

**Entry applied:** T40-1 (N809; K2390): `bundle.mjs` looks a type up by the tables' own keys only (`typeVocab`, declared spelling then normalized type) in `checkHeadings` (`HEADINGS`, `HEADINGS_WHEN`) and `checkStateLegality` (`STATES`), and reads the id prefix's implied type by own key. An `object_type` of `toString`, `constructor`, `__proto__` (or any other `Object.prototype` name; `hasOwnProperty` threw too) is now answered as `memo` is: one C-2.5 "is not a known type", no heading or state arm, and no throw (before: `TypeError: required is not iterable`). `vocabFor` itself is unchanged (R34 pins its inherited answer). New test in `bundle.test.mjs`, titled R39: every one of those names gives exactly `memo`'s answer but for the name in the message, under five bundle prefixes too; negative controls: a known type gives the fixture's expected answer, C-4.1 and C-3.1 still fire on their fixtures, and the legacy `problem` spelling is still judged by focus's headings. The test is red against the old source and green now. R39's `*(not yet met: T40)*` mark can go (yours to remove).

**Fixed in passing (own module):** the `vocabFor` import in `bundle.mjs` was left unused and is removed; the REC-14 comment now names `typeVocab`.
**Deferred:** none.
**Found elsewhere:** see J1 (REPORT): eight modules index `vocabFor(STATES, object_type)` the way `checkBundle` did; plane bundle and `release/bio-plane.bundled.mjs` staled (accepted red 7).

**Reading set:** measured 266 KB (requirements 29 KB, module source 149 KB, tests 88 KB including `fixtures/bundles.mjs`; `expected.json` excluded as a data fixture), under 300 KB, so I read it whole myself, with layer 1's row of `layers.md`, the plan's T40-1 entry and rule 4, and K2390.

**Tests:** record-grammar (`test/m/record-grammar/`) 74 pass, 0 fail. Promotion (BOB's START): `test/m/promotion/` + `d526-refusal-order.test.mjs` 124 pass, 1 fail; `system/row-census.test.mjs` 1 fail. Both reds are the same with and without my change and are accepted at T40's opening: the `ai-use` `MODULE_ORDER` test (rule 4 (5)) and the row census awaiting stamp (rule 4 (2)). No layer tests named in the manifest.
**Checks:** format 0 failures; architecture 0 failures; coverage 48 of 48, 0 failures; ownership 0 failures (3 files).

Size (session_01DoeyeHeM15vrBLPc7ti25M): test runs 8, module lines 2418
