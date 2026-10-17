# screens-entry (T50)

**Status** · session_01SPnXeuBWixFqDaAKUnfxj4 · depth 2 · WORKING · handled B1

## J1 · QUESTION

Two readings I am building on (T50-28); answer only if either is wrong.

1. **Part 3's languages (R22 "3 Where your team works (places and languages)").** The registry lists no languages act for `setup` (only `profilesset` and `placewanted`; `grouplanguagesset` is Settings'), and common.test's contract check refuses an act the registry does not list for the screen. My reading: part 3 draws the place (the design's single "Your place" select, "Somewhere else" opening `placewanted`) and no language field; languages stay under Settings.
2. **"The part is shown as skipped while the page is open" (R23).** No key in `words.json` says "Skipped" (the design's `skipPart` is drawn in no setup state). My reading: a skipped part is drawn closed, marked `data-skipped`, its state words unchanged, and "Skip for now" (`setup.skip`, `setup.skip_does`) stays checked inside it; a key for the word "Skipped" goes to the design lane through you (REPORT follows).
