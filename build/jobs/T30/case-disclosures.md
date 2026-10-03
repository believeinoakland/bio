# case-disclosures (T30)

**Status** · session_01U6qsAeYBHqtfyBmpcudgfN · depth 2 · COMPLETE · handled B1

## Completion

Commit `8e7d548c1c` on `job/T30/case-disclosures` (from `tranche/T30` @ 48aa9c64fc).

**Entries applied.** N535, from BOB's B1 START:
- `acceptedBodyLines` (`bio-plane/src/case-disclosures/document.mjs`) now closes the reason with a full stop only when it lacks one: "because: We recreated it whole. It was …", no longer "whole.. It was …". Editions written from now on; a published edition keeps its signed bytes (nothing re-renders one).
- My reading of "already ends in a full stop": the words already end a sentence, that is they end in `.`, `!`, `?` or `…`. "Did it recreate?" prints as it is, not as "recreate?.". Words ending in anything else gain the stop. No requirement's wording is involved (R13, R14 state the rows, not their punctuation).
- The same flaw in the same section, fixed in this job (step 4): the gaps ("with the gaps stated: page 3.."), a flag's issue and the owner's words on a flag were each followed by an extra stop. All four go through one helper, `sentence(words)`.
- Byte identity (K1333), re-pinned for the changed case only: `seam.test.mjs`' two `acceptedBodyLines` pins move (557eeb47… → ca07dd94…, ad9a96eb… → c4da3290…), because their fixed row's reason is "We recreated it.". A new arm proves those old pins are the new bytes with exactly that one sentence put back, so nothing else in the section moved. The other eight renderer pins and the tension-sentence pin are unchanged and pass. The fixed flag rows end in no stop, so their bytes are unchanged.

**Deferred.** None.

**Found in other modules.**
- Generated artifact made stale: `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`), whose inputs include `case-disclosures/document.mjs`. I did not regenerate it. It is yours at the layer's close. `case-checker/program.mjs` does not include this module and is not affected.
- `case-authoring` renders this section through my export (`caseDocumentText`). Its suite pins none of these bytes and passes unchanged (below). No change is needed there.

**Tests and checks** (on `8e7d548c1c`):
- `node --test bio-plane/test/m/case-disclosures/`: 48 tests, 48 pass, 0 fail (46 before, plus the N535 arm in `imported.test.mjs`, which names R13 and R14, and the re-pin arm in `seam.test.mjs`, which names R13).
- `node --test bio-plane/test/m/case-authoring/` (it uses the renderer): 122 tests, 122 pass, 0 fail.
- Layer tests: none named in `build/manifest.md`.
- `checks/format.mjs`: 97 modules, 96 requirements files; 0 failures.
- `checks/architecture.mjs … case-disclosures`: 12 product files, 64 relative imports; 0 failures.
- `checks/coverage.mjs … case-disclosures`: 23 of 23 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … case-disclosures tranche/T30`: 4 files; 0 failures.

Size (session_01U6qsAeYBHqtfyBmpcudgfN): test runs 2, module lines 1301

## J1 · COMPLETE

N535 applied on job/T30/case-disclosures (8e7d548c1c): acceptedBodyLines adds the full stop after a reason only when it lacks one (ends in . ! ? or …); the same fix for the gaps, a flag's issue and the owner's words on it, same section, same flaw. Byte identity: the two acceptedBodyLines pins re-pinned (557eeb47->ca07dd94, ad9a96eb->c4da3290), and a new arm proves the old pins differ only by that one sentence; every other pin unchanged. case-disclosures 48/48; case-authoring 122/122 (it renders through my export, pins none of it); format, architecture, coverage 23/23, ownership 4 files, all 0 failures. Stale: the plane bundle (yours at the close). Record: Completion section.
