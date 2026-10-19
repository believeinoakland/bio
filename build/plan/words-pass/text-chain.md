# text-chain: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

15 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('text-chain.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/textchain.mjs:1021` "an absent confidence is not the same claim as a stated absent one"
- plain `bio-plane/src/textchain.mjs:1102` "without one, nothing in the record can be verified against the pixels it came from"
- plain `bio-plane/src/textchain.mjs:1107` "the anchor names no page (0-based integer required)"
- plain `bio-plane/src/textchain.mjs:1111` "the anchor names no rect; a page alone is not a region a reader can be pointed at"
- plain `bio-plane/src/textchain.mjs:1146` "an attestation names no member. Nobody said this, and unattributed is not the same as a..."
- plain `bio-plane/src/textchain.mjs:1148` "an attestation carries the date it was made"
- plain `bio-plane/src/textchain.mjs:1154` "a page extent names which page (0-based)"
- plain `bio-plane/src/textchain.mjs:1505` "a cell of a spreadsheet"
- plain `bio-plane/src/textchain.mjs:1506` "a shape on a slide"
- plain `bio-plane/src/textchain.mjs:1507` "a paragraph of a document"
- plain `bio-plane/src/textchain.mjs:1508` "a range of cells in a spreadsheet"
- plain `bio-plane/src/textchain.mjs:1509` "a table in a document"
- plain `bio-plane/src/textchain.mjs:1510` "an image in a document"
- plain `bio-plane/src/textchain.mjs:1759` "neither tier's whitespace policy can move the award; anything else keeps tier 1"
- plain `bio-plane/src/textchain.mjs:1922` "than allowed to replace text page by page it cannot be compared against"

## Test copies of code sentences (K3962)

6 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:26` "\"a cell of a spreadsheet\""
- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:27` "\"a shape on a slide\""
- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:28` "\"a paragraph of a document\""
- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:29` "\"a range of cells in a spreadsheet\""
- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:30` "\"a table in a document\""
- testcopy `bio-plane/test/m/text-chain/extent.test.mjs:31` "\"an image in a document\""
