# action-grammar (T34)

**Status** · session_011LdfEUD6g1FefQ4rnxSpxd · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T34-87 (DEC-149's L9 share; K1784, K1811), BOB's three rows, each re-checked: `checks.mjs`:629 `requestLifecycleOf`'s `says` now reads "… Your group's Civicsmith derives only the days between entries …" (was "The plane"); :721 C-2.10's kind finding "action_kind '…' is not a kind your group's Civicsmith offers" (was "this instance"); :1147 C-101.1 `ACTION_KIND_UNKNOWN`'s translation "An action is one of the kinds your group's Civicsmith offers: …" (was "this instance"). The comments at :66 and :716 (now :68, :718) stay. `actions/index.mjs`:578 untouched (actions' own job). No other string in the module names the instance, copy, plane or server (the new test walks every row, finding, repair and reading over the corpus). No requirement's meaning changes.

**Row, `awaiting stamp`** (T34, changed translation; T35's promotion stamp moves `CATALOG_VERSION`, plan Rules (5) 4): C-101.1 ACTION_KIND_UNKNOWN (marked in its comment).

**Tests.** `fixture.mjs`' `REWORDED` gains the three old phrases with their new ones (the golden file stays as recorded; 119, 8 and 1 occurrences re-worded on read). `grammar.test.mjs`: the two pinned kind findings (R7, R11 tests) re-pinned; the K899 test asks every `REWORDED` phrase was recorded; new test "R7, R8, R9 (T34-87; DEC-149, K1811)" checks the `says`, the finding and C-101.1's row whole, and that no corpus text says "this/the instance|copy|plane" or "this server". Negative control: with the old `checks.mjs`, 22 pass, 7 fail.

**Deferred.** None.

**Found in other modules.**
- `control-plane` `test/m/control-plane/catalogue-end.test.mjs` (inside K1789's named red) now also differs at C-101.1 (pinned digest `fc995f7eabc91073` in `rows-before-r43.json`, now `b5d984ea75086267`): re-pinned by control-plane's T34-60, as K1836 routes the other DEC-149 re-wordings.
- `promotion` `test/system/row-census.test.mjs` now also lists C-101.1 as changed with no record (T35's stamp; Rules (5) 4).
- Generated artifacts made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` (and the `newgroup`/release copies) hold the old three strings; regenerated at the layer close.

**Ran.** `node --test test/m/action-grammar/`: tests 29, pass 29, fail 0. Users: actions 88/0; action-clocks 51/0; filing-templates 47/0; escalation 61/0; action-plans 61/0; instance-setup 112/0; filings 63/1 (chronology.test.mjs:63, K1795's named red); affordances 189/3 (t33-backing, K1805/K1807's named reds; affordances reads none of these strings); control-plane 166/2 (catalogue-end K1789, r53-routes K1807; see above). promotion row-census: red (Rules (5) 4; C-101.1 now among its changed rows). No layer tests are named in `build/manifest.md`. Checks: format "127 modules, 126 requirements files; 0 failures"; architecture "7 product files, 14 relative imports (0 naming no tracked file, not judged); 0 failures"; coverage "1 modules, 12 of 12 live requirement ids named by a test; 0 failures"; ownership: see below.

**P6.** 1,843 lines (`checks.mjs` 1,369, `grammar.mjs` 469, `index.mjs` 5); under 4,000.

Size (session_011LdfEUD6g1FefQ4rnxSpxd): test runs 16, module lines 1843
