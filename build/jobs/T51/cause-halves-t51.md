# cause-halves-t51 (T51)

**Status** · session_013H6tZYM9trYPdt2QpsTre1 · depth 2 · WORKING · handled B1

## Completion

**Causes met**
- **C41 · basis-version-grammar R11.** `basisVersionFindings` now puts `legs` on the `VERSION_PARTITION_INCOMPLETE` finding (C-25.5): the target ids of every supporting leg of that version with no ground, in document order. A cutting leg, a placed leg and another version's legs are never named; no other finding carries `legs`. Test first, seen failing: `test/m/basis-version-grammar/unplaced-legs.test.mjs` (two legs one placed; every unplaced leg named in order with a cutting leg left out; another version's legs; controls: a concluding version carries none, other findings carry none).
- **C17 · reading-pipeline R35.** A reading that has text units carries `words_total` and `words_read`. `words_read` is the words of the units `textUnitsFor` keeps (a unit cut to its cap counts its prefix). `words_total` is the words of every unit the text has, before the wire's cap and budget, plus the words of any OCR region the confidence floor discarded: `ocrTextFromMember` counts them and carries only the count on the page (`unread_words`, set only when above zero), `mergeTier3Text` keeps it with the page, and the text itself is still dropped. New exports `textWordsFor(i2text)`, `textWordsOfText(text, {html})` and `wordsIn`; `textUnitsFor`'s and `textUnitsOfText`'s answers are unchanged. Test first, seen failing: `test/m/reading-pipeline/words.test.mjs` (a picture read whole: 8 of 8; a picture with a below-floor region: 4 read of 9; a captured page and a plain-text capture: equal; a unit over its cap: fewer read; controls: a picture all below the floor and a capture with no glyph have no units and no counts).

**Existing tests changed (R35 and R11 add a field on purpose; nothing weakened):** `reading-pipeline/pieces.test.mjs` "R2 R15 over-strictness" now peels `words_total`, `words_read` as it already peels R28's and R34's keys, asserts they are present and equal for the PDF and the docx, and keeps every other byte pinned to the same digests. `basis-version-grammar/registration.test.mjs` compares the golden catalogue findings with `legs` dropped (R6 compares check, severity, message, repairs, code) and asserts `legs` appears only on the partition finding.

**Words:** no new member-facing sentence; both causes add data fields. The "read {read} of {total} words" key `screens-inquiry` needs is theirs to list (their record, line 184).

**Deferred / limits**
- `words_total` counts a unit list's text. A sheet with no named range is no unit, so its words are in neither count (R15 says such a sheet is no unit). A re-read's kept pages (`tier3SeedFrom`) come from stored units, which hold no below-floor count, so a re-read reports those pages' unread words as zero.
- For a capture read as HTML the total is over the visible text after R32's furniture, so a nav bar or footer is never counted as unread.

**Reported to BOB (other modules, not changed here)**
- `extraction` (its re-read, `extraction/index.mjs:1310`, `:1512`, which call `textUnitsFor` to rebuild a reading) must also set `words_total` and `words_read` from `textWordsFor(text)`, and store and answer them, or a re-read reading drops the two keys. `screens-inquiry` must read `reading.words_read` / `reading.words_total` from `op=reading` (named in its record) and needs the word row; it already draws a findings list for `BASIS_VERSION_REFUSED` and can name the legs from `finding.legs`.
- `basis-versions` carries the refused version's findings out unchanged (`index.mjs:233`), so `legs` reaches the caller; its own tests do not name R11 (it is this module's id).

**Tests and checks**
- basis-version-grammar suite: 33 tests, 33 pass. reading-pipeline suite: 149 tests, 149 pass.
- Users: basis-versions 182/182, extraction 193/193, content 142/142, events 90/90. (`impact.mjs` lists 108 modules; I ran the four that list my modules in `uses`.)
- `checks/run.mjs`: format 0 failures; architecture 0 failures; words 0 failures; coverage 10 failures, all in other modules (agent-harness R17; agent-runner R37 R38 R40; contradiction R61; control-plane R116; installer-steps R26 R31; interface-shell R111; journey-check R19; screens-inquiry R123–R125; screens-intake R54; screens-publish R70–R72), none of my two modules.
- `checks/ownership.mjs`, run once per held module: each reports only the other held module's files and this record as outside its paths (the check takes one module); no file outside the two modules and this record.

Size (session_013H6tZYM9trYPdt2QpsTre1): test runs 15, module lines 2990
