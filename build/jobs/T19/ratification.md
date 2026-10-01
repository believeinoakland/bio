# ratification (T19)

**Status** · session_01VqW5znMDGzJqRjUUs7YWJz · depth 2 · WORKING · handled B1

## J1 · QUESTION

K790 asks my test world to register inquiry-grammar's grammar on its record (record-core R67), so `converted-c.test.mjs`:226 and `converted-d.test.mjs`:479 see C-2.8's case-key arm at op=ratify; your B1 also has `checks.test.mjs`:224 run record-grammar's `checkBundle` "with the record's grammars". The only way in is `registerInquiryGrammar(record)` (or `INQUIRY_GRAMMARS`) from `src/inquiry-grammar/index.mjs`: `inquiry` re-exports `checkInquiryExtension` but neither the registration nor the grammar object, and `inquiryOf` does not register it. ratification's `uses` in `modules.json` lacks `inquiry-grammar`, so the architecture check would refuse the import.

My best reading: `uses` gains `inquiry-grammar` (earlier, L6; your edge, like credentials and connections), used by the test fixture only (`registerInquiryGrammar(w.record)` in `world()`), and the Uses list in `build/requirements/ratification.md` names it for the tests. I am building on that reading now and will run the architecture check against it once you answer; if you prefer another route (e.g. inquiry re-exporting the registration), say which and I will re-point.
