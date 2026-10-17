# promotion (T50)

**Status** · session_01EYfi6HexhiJUBBmLxaSMur · depth 2 · WORKING · handled B1

## J1 · QUESTION

QUESTION J1. Plan rule 6 (N1116) applies to me though my entry says "Text: none". My best reading: promotion's member-facing English is its refusal rows' `translation` (and the `detail`s that say "your group's Civicsmith"), which `words-reads.json` lists as 38 `refusal.<CODE>` keys plus `promotion.says.document_request_stated` and `..._revision`. I will read each by `word(key)` from setup-words (rows in checks.mjs, the two `says` in index.mjs), drop the tests that compare the old English (wording.test.mjs and similar), and leave the 165 `unkeyed` builder-facing strings as they are. These rows move the census; I stamp them in my one stamp.
What I need from you: `build/modules.json` promotion `uses` has no `setup-words`, so the architecture check will refuse the import. Please add it (modules.json is yours). Also: promotion's own tests that compare English, and other modules' tests that quote promotion's old English ("your group's Civicsmith"), will go red; I will fix mine and list the others in my record for their jobs.
If you read the rule differently (rows keep their stub English, no change), say so and I revert. Meanwhile I carry on; the stamp waits for your CHANGE.
