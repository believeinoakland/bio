# skills (T7)

**Status** · session_01LeLpLCKuivZWf56gFwdetG · depth 2 · WORKING · handled B1

## J1 · QUESTION

Three readings I am building on; each answer can change a line or two, none stops the job.

1. **R25 and K82 (4): where C-22.7's row lives.** ai-runs (earlier) holds its own copy of `checkSkillVersion` (its R8, K82 (4)) and so must read the row, and it cannot import skills. So the row cannot leave the catalogue for skills' files without breaking that copy (and `civicos-ui/check-refusal-codes.mjs`, which walks `bio-checks.mjs`). **My reading:** as observation-log did for its seven C-22 rows (`observation-log/checks.mjs`), skills names the row as its own by key (`SKILL_CHECKS` in `skillpack.mjs`, selected from the catalogue, code, number and translation unchanged), its invariant and test live here (R25), and the row's text stays in `AI_RUN_CHECKS` until legacy-checks is emptied. `checkSkillVersion` stays implemented here until ai-runs' copy lands; then a CHANGE lets skills re-export it (K82 (4)), R12's tests unchanged.

2. **R19 against R21: meaning's absence fact.** R19 fixes meaning's `states_when_absent` as "no meaning derived"; R21 requires the four facts to be §14.3's own words, and §14.3 says "Nothing derived may only mean nothing was extracted; nothing extracted may only mean the document was never read; no document may only mean nobody looked." "no meaning derived" is not in §14.3. **My reading:** R21 (K102) wins: meaning's fact is `nothing derived`; proposed R19 text: `(meaning: "nothing derived"; content: "nothing extracted"; document: "no document"; internet: "nobody looked")`. The other three are unchanged.

3. **R21: which §14.3 sentences, and "canon".** Four-level rule: "absence at one level is not evidence of absence at the next". Search-completeness rule: "all four levels — meaning, content, documents, and the open internet — may need to be searched, in any order" (the §14.3 sentence the old CLAUDE.md line paraphrased; "A search that returns documents has not finished." is the alternative). Both cite `docs/architecture/BIO_Content_Framework_v0_10.md` Part II §14.3. R21's "that document is canon" I read as covering the resident sentences, the four facts and §14b.4's table (all canon); the prohibitions' `text`/`because` stay pinned to `PRACTICE-SURVEY.md` (reference, not canon) as R17 names, with their canon pin being `also_named_in` in INVESTIGATIVE-SESSION.md; and DEPLOYMENT_SEQUENCE's second pin in `docs/archive/IS-SWEEP-2026-08-07.md` stays as evidence, its canon pin being §2's sentence.
