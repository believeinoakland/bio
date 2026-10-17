# ai-accounts (T50)

**Status** · session_019NEZYSTq2NQLrei2eoFATs · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Three things, all on my best reading; I carry on with them.

1. **modules.json (yours).** ai-accounts now reads its words through setup-words' `word` (plan rule 6; L1, so allowed), and `checks/architecture.mjs` fails my two files with "imports setup-words, which ai-accounts does not declare in uses". Please add `setup-words` to ai-accounts' `uses` on `tranche/T50` (I may not write modules.json). Until then architecture shows these 2 failures and nothing else.
2. **R30 wording.** R30 says every member-facing string calls the installation "your group's Civicsmith". words.json (DEC-260, K3472: "team", never "group") now says "your team's Civicsmith" in every refusal row this module reads (e.g. refusal.ACCOUNT_SEAL_UNAVAILABLE). My reading: R30 means "your team's Civicsmith"; I changed R30's tests to that (translations only; unkeyed `detail`s, which no member reads, still say "your group's Civicsmith", as words-reads.json's `unkeyed` leaves them). Please re-word R30.
3. **Design lane (REPORT).** words-reads.json maps `ACCOUNT_MEMBER_NOT_ACTIVE` to `refusal.ACCOUNT_MEMBER_NOT_ACTIVE`, whose sentence is "The run can't start: your membership isn't active in your team's Civicsmith just now…". This module also refuses a *connect* with it (R1, R18, R19) where "the run" is wrong. I read the key as designed; the sentence is for the design lane.

## J2 · COMPLETE

**Entries applied (T50-4).** R26 met: `subscriptionTokenRefused` tells `onAccountCleared` listeners once inside the act (`account: "signin"`, `by: null`, `why: "refused"`, `reference_held`); a call with none held tells no one (2 new tests, with controls). N1132/N1171: no member-facing English held; the 21 rows' translations, the group-key notice, the project disclosure and the uses fault are read by key through setup-words' `word` (keys = `reads` in words-reads.json, checked by new `words.test.mjs`); the 4 stale English-comparing tests updated (R8, R30 x2, t41's control).

**Deferred / for BOB.**
- modules.json: ai-accounts needs `setup-words` in `uses` (J1 item 1); architecture shows exactly 2 failures until then, both that edge.
- R30 requirement wording "group's" → "team's" (J1 item 2). Tests now follow words.json.
- Design lane: `refusal.ACCOUNT_MEMBER_NOT_ACTIVE` says "The run can't start", wrong for connects (J1 item 3).
- Row census: 21 C-29 translations changed ("team", words by key): promotion's stamp (T50-6).

**Found in another module.** credentials' own test "R48 the 17 sweep rows" hard-codes "your group's Civicsmith" in translations and now fails against ai-accounts' team wording; credentials' T50-5 should read the words by key. Other credentials tests: 154 pass.

**Ran.** `node --test bio-plane/test/m/ai-accounts/`: 112 pass, 0 fail (after the words test). `checks/coverage`: 34 of 34, 0 failures. `checks/ownership`: 0 failures. `checks/architecture`: 2 failures (the uses edge above). `checks/format`: 2 failures, both in build/rulings.md (K3441, K3597), not mine.

Size (session_019NEZYSTq2NQLrei2eoFATs): test runs 6, module lines 2,060
