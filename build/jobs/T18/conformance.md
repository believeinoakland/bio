# conformance (T18)

**Status** · session_01Api7vqXVAc7EyWoQRiM9r9 · depth 2 · WORKING · handled B2

## J1 · QUESTION

N249's clause: `determination_questions.opened` vs the case field `opened`. My reading: **they are distinct; keep the name, no migration.**
- Case `opened` (`cases.opened`, `published_cases.opened`; publication's answers `opened`) is TEXT, the instant a case identity or edition came into being.
- Conformance's `opened` (`determination_questions.opened`, and `questions[].opened` in R9's read) is INTEGER 0/1: whether this determination's own act opened that question's inquiry (R6), as against naming an existing one.
- Different object, type and meaning; nothing in `bio-plane/src` reads both, and no later module (consequences, actions, filings, escalation) reads conformance's `opened`. The only cost is the two legacy suites that set it aside by line and shape (`bio-plane/test/case-opened.test.mjs`; `civicos-ui/test/publishedcase.test.mjs`:2918), which are not run and are deleted at the release (K619).
- I add a module test naming R6 that pins the field's shape (a boolean on each question, true only for an inquiry this act opened), so the distinction is stated at the interface.
Alternative, if you rule a rename (N71: an interface name changes only with a migration you schedule): column and answer key `opened` → `opened_here`, by an idempotent `ALTER TABLE determination_questions RENAME COLUMN` in `migrateConformance` (run only when the old column exists), the R9 shape and its tests re-worded; ~15 lines; the two legacy set-asides then go stale (legacy-tests', reported).
I carry on with the rest on my reading; the answer changes only these ~15 lines.
