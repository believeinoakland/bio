# ai-accounts (T50)

**Status** · session_019NEZYSTq2NQLrei2eoFATs · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Three things, all on my best reading; I carry on with them.

1. **modules.json (yours).** ai-accounts now reads its words through setup-words' `word` (plan rule 6; L1, so allowed), and `checks/architecture.mjs` fails my two files with "imports setup-words, which ai-accounts does not declare in uses". Please add `setup-words` to ai-accounts' `uses` on `tranche/T50` (I may not write modules.json). Until then architecture shows these 2 failures and nothing else.
2. **R30 wording.** R30 says every member-facing string calls the installation "your group's Civicsmith". words.json (DEC-260, K3472: "team", never "group") now says "your team's Civicsmith" in every refusal row this module reads (e.g. refusal.ACCOUNT_SEAL_UNAVAILABLE). My reading: R30 means "your team's Civicsmith"; I changed R30's tests to that (translations only; unkeyed `detail`s, which no member reads, still say "your group's Civicsmith", as words-reads.json's `unkeyed` leaves them). Please re-word R30.
3. **Design lane (REPORT).** words-reads.json maps `ACCOUNT_MEMBER_NOT_ACTIVE` to `refusal.ACCOUNT_MEMBER_NOT_ACTIVE`, whose sentence is "The run can't start: your membership isn't active in your team's Civicsmith just now…". This module also refuses a *connect* with it (R1, R18, R19) where "the run" is wrong. I read the key as designed; the sentence is for the design lane.
