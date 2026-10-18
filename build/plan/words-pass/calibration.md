# calibration: the words check after the conversion (K3949)

Layer 4. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/calibration/index.mjs:385` "Nothing has ever probed it, so a probe is due immediately"
- inline `bio-plane/src/calibration/index.mjs:386` "The next probe is due at its own cadence"
- testcopy `bio-plane/test/m/calibration/words.test.mjs:44` [part] ". No module derives obligations from calibrations in your team's Ci..." — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:62` [part] "no engine is registered for calibration in your team's Civicsmith, ..." — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:63` [part] "and this consumer holds no alarm at all" — part test copy
- testcopy `bio-plane/test/m/calibration/words.test.mjs:88` [part] "its own, so the probe is OWED and not RUN — and the record says owe..." — part test copy
