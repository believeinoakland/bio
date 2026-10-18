# following: the words check after the conversion (K3949)

Layer 10.

## Plain findings (K3957)

45 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('following.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/following/index.mjs:254` "a follow is a member's own act; the machine follows nothing of its own accord"
- plain `bio-plane/src/following/index.mjs:256` "the follow's home is a bundle you may see, whose project it lives in"
- plain `bio-plane/src/following/index.mjs:316` "no body by that id is registered that you may see"
- plain `bio-plane/src/following/index.mjs:318` "the body holds no identifier in a scheme the active profiles name for Legistar"
- plain `bio-plane/src/following/index.mjs:320` "a follow names the days it covers: from (a day), and until (a day not before it) or none"
- plain `bio-plane/src/following/index.mjs:337` "no follow by that id is held"
- plain `bio-plane/src/following/index.mjs:338` "a follow is ended only by the member who made it"
- plain `bio-plane/src/following/index.mjs:350` "a follow's end date is set by a member's own act"
- plain `bio-plane/src/following/index.mjs:353` "no follow by that id you may see is held"
- plain `bio-plane/src/following/index.mjs:355` "a policy's watch is the team's standing watch: it takes no end date and ends only with ..."
- plain `bio-plane/src/following/index.mjs:356` "a follow's end date is set by the member who made it"
- plain `bio-plane/src/following/index.mjs:357` "the follow has already ended"
- plain `bio-plane/src/following/index.mjs:382` "a register is followed at a public https locator"
- plain `bio-plane/src/following/index.mjs:383` "render is true or false"
- plain `bio-plane/src/following/index.mjs:464` "a portal is followed at a public https locator"
- plain `bio-plane/src/following/index.mjs:466` "a portal is followed at a public https locator"
- plain `bio-plane/src/following/index.mjs:467` "a portal follow declares the field that keys its rows"
- plain `bio-plane/src/following/index.mjs:481` "naming a watch's body is a member's own act"
- plain `bio-plane/src/following/index.mjs:484` "no address you may see is watched per meeting"
- plain `bio-plane/src/following/index.mjs:485` "no body by that id is registered that you may see"
- plain `bio-plane/src/following/index.mjs:796` "no live register follow by that id is held"
- plain `bio-plane/src/following/index.mjs:798` "a public register is read on the tick; a member's refresh is for one behind an account ..."
- plain `bio-plane/src/following/index.mjs:800` "only the member who follows this register refreshes it, with their own credential"
- plain `bio-plane/src/following/index.mjs:804` "an account-gated register is read with the member's own credential"
- plain `bio-plane/src/following/index.mjs:1086` "linking a watch to a plan is a member's own act"
- plain `bio-plane/src/following/index.mjs:1093` "no watch of that kind that you may see is held under that id"
- plain `bio-plane/src/following/index.mjs:1095` "no watch of that kind that you may see is held under that id"
- plain `bio-plane/src/following/index.mjs:1113` "that watch has already ended"
- plain `bio-plane/src/following/index.mjs:1220` "answering whether to keep a watch is a member's own act"
- plain `bio-plane/src/following/index.mjs:1223` "no link of a watch you may see is held under that id"
- plain `bio-plane/src/following/index.mjs:1229` "there is no question about this watch that is yours to answer now"
- plain `bio-plane/src/following/index.mjs:1230` "something else still relies on this watch, so it is not offered for keeping or stopping"
- plain `bio-plane/src/following/index.mjs:1232` "an answer either keeps the watch until a day, or stops it now"
- plain `bio-plane/src/following/index.mjs:1236` "keeping a watch names the day it is kept until"
- plain `bio-plane/src/following/index.mjs:1258` "the follow is no longer held"
- plain `bio-plane/src/following/index.mjs:1359` "watching and flagging are a member's own acts; the machine marks nothing"
- plain `bio-plane/src/following/index.mjs:1360` "an act on an item names the item"
- plain `bio-plane/src/following/index.mjs:1362` "no item by that id is one you may see"
- plain `bio-plane/src/following/index.mjs:1418` "the item has no open second look to clear"
- plain `bio-plane/src/following/index.mjs:1426` "a read of an item's second looks names the item"
- plain `bio-plane/src/following/index.mjs:1427` "no item by that id is one you may see"
- plain `bio-plane/src/following/index.mjs:1497` "no item by that id is one the marks list"
- plain `bio-plane/src/following/index.mjs:1607` "no portal follow by that id you may see"
- plain `bio-plane/src/following/index.mjs:1610` "both snapshots are of this follow, by their sequence numbers"
- plain `bio-plane/src/following/index.mjs:1623` "no portal follow by that id you may see"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/following/fixture.mjs:143` "\"these bytes were served for\""
- testcopy `bio-plane/test/m/following/fixture.mjs:279` "\"the plan is not about that matter. Nothing was written.\""
