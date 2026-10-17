# promotion (T50)

**Status** · session_01EYfi6HexhiJUBBmLxaSMur · depth 2 · WAITING ON BOB (J2) · handled B1

## J1 · QUESTION

QUESTION J1. Plan rule 6 (N1116) applies to me though my entry says "Text: none". My best reading: promotion's member-facing English is its refusal rows' `translation` (and the `detail`s that say "your group's Civicsmith"), which `words-reads.json` lists as 38 `refusal.<CODE>` keys plus `promotion.says.document_request_stated` and `..._revision`. I will read each by `word(key)` from setup-words (rows in checks.mjs, the two `says` in index.mjs), drop the tests that compare the old English (wording.test.mjs and similar), and leave the 165 `unkeyed` builder-facing strings as they are. These rows move the census; I stamp them in my one stamp.
What I need from you: `build/modules.json` promotion `uses` has no `setup-words`, so the architecture check will refuse the import. Please add it (modules.json is yours). Also: promotion's own tests that compare English, and other modules' tests that quote promotion's old English ("your group's Civicsmith"), will go red; I will fix mine and list the others in my record for their jobs.
If you read the rule differently (rows keep their stub English, no change), say so and I revert. Meanwhile I carry on; the stamp waits for your CHANGE.

## J2 · REPORT

REPORT J2. Done on my best reading of J1 (pushed): the 38 refusal rows read `word("refusal.<CODE>")` (checks.mjs), the two carried-forward `says` read `promotion.says.*` (index.mjs), the gate's PLANE_HELD_IN_PARTS finding says "team's"; wording.test.mjs reads the keys instead of comparing English (+ a test for the two `says`). Promotion suite 140 tests, 139 pass; the 1 red is R39/R45/R46, which fails only on membership's hand-listed `MODULE_ORDER` (the test already reads build/modules.json, so it goes green when T50-2 merges). Architecture shows 3 failures, all "imports setup-words, which promotion does not declare in uses": please add `setup-words` to promotion's `uses` in modules.json. The stamp (1.76.0 -> next) waits for your CHANGE once membership, project-roster, ai-accounts and credentials have merged. I am idle until then.
