# record-grammar (T19)

**Status** · session_01JcZMYUrkQxoEUnoX3a9Ssz · depth 2 · WORKING · handled B0

## J1 · QUESTION

`build/requirements/record-grammar.md` (tranche @ bc5a6b3c50) words only R28 and R29 for T19. Its "T19 layer 1's additions" says the rest of the stage (`STATES`, `HEADINGS`, `HEADINGS_WHEN`, `vocabFor`, `sectionText`, `isCaseMemberBytes`, the machine-work labels, `INQUIRY_TITLE_MAX`/`deriveInquiryTitle`/`inquiryQuestionOf`, `checkBundle` and its structural arms) "is worded by the same fold", but no R for any of them is in the file. A job writes no requirements, and coverage needs an R id per live requirement.

My best reading, which I am working on now: move every name draft-T19's entry lists, whole and unchanged in behaviour, with the catalogue re-exporting each one (`===`, R26), and `checkBundle` returning identical findings, in content and order, to the catalogue's before the move (over the catalogue's own fixtures and a bundle with an information extension, capture's grammar registered: B1). I test each moved name by name, at the interface. When you word R30 onward, I tag those tests with the ids and add any test a wording asks for. C-6.1's call (`supersedesEdgeFindings`, `divisionDisclosureFindings`) leaves `checkReferences` as a separate type arm that the catalogue keeps (for `LEGACY_GRAMMARS`, legacy-checks' share). It is not in record-grammar's `EXTENSION_ARMS` (R28 lists only C-18.6/.7, C-2.8, C-2.9/C-9.1). Please confirm, or word the Rs.
