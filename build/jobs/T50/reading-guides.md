# reading-guides (T50)

**Status** · session_01TrmwWaBaigUmvekFR4BdGC · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

T50-42 (N1132): words.json now holds every refusal row of reading-guides (19, not the two R14 names) and the procedure label. My best reading of R14: the rows words.json holds read it by key, so all 19 take their design wording, verbatim (team, not group; 'labeled'), and the table holds the 19 keys and the label. R14's 'other rows keep theirs' applies only to rows words.json does not hold, and now none. Numbers and wheres are unmoved (pinned). If you meant the two-row reading, say so and I will restore the 17 rows' own copies. Carrying on on this reading; COMPLETE follows.

## J2 · COMPLETE

Entries applied: T50-42 (N1132), its words check by key. src/reading-guides/checks.mjs: READING_GUIDES_WORDS holds the 19 refusal rows and the label, each en verbatim from words.json; each row's translation reads its key. Commit b2d7fee57f. test/m/reading-guides/t46-words.test.mjs: the 'words.json holds none of them' pins replaced by a by-key check; the numbers-and-wheres pin (sha 96c05f88…) is unchanged. Rule 6: item 2 (labeled) already met in member-facing words (no 'labelled' left in src); item 3 found nothing to change (my tests hand-list only my own rows and words). Deferred: none. Not mine by rule 6: item 1 (word() via setup-words) and the team/group bullet beyond words.json's held rows.
Found in another module: none.
Tests: node --test test/m/reading-guides/: 58 pass, 0 fail.
Checks (from civicos-process, product /home/user/bio): format 0 failures; architecture reading-guides 0 failures; coverage reading-guides 14 of 14 live ids named, 0 failures; ownership tranche/T50 0 failures; node checks/run.mjs: format 0, architecture 0 (3446 files), channels 0, coverage 38 failures, all in other modules (accepted reds, rule 5.1 and the modules' own T50 jobs); none in reading-guides.
Size (session_01TrmwWaBaigUmvekFR4BdGC): test runs 2, module lines 1177
