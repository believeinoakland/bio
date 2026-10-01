# record-grammar (T19)

**Status** · session_01JcZMYUrkQxoEUnoX3a9Ssz · depth 2 · WORKING · handled B5

## J1 · QUESTION

`build/requirements/record-grammar.md` (tranche @ bc5a6b3c50) words only R28 and R29 for T19. Its "T19 layer 1's additions" says the rest of the stage (`STATES`, `HEADINGS`, `HEADINGS_WHEN`, `vocabFor`, `sectionText`, `isCaseMemberBytes`, the machine-work labels, `INQUIRY_TITLE_MAX`/`deriveInquiryTitle`/`inquiryQuestionOf`, `checkBundle` and its structural arms) "is worded by the same fold", but no R for any of them is in the file. A job writes no requirements, and coverage needs an R id per live requirement.

My best reading, which I am working on now: move every name draft-T19's entry lists, whole and unchanged in behaviour, with the catalogue re-exporting each one (`===`, R26), and `checkBundle` returning identical findings, in content and order, to the catalogue's before the move (over the catalogue's own fixtures and a bundle with an information extension, capture's grammar registered: B1). I test each moved name by name, at the interface. When you word R30 onward, I tag those tests with the ids and add any test a wording asks for. C-6.1's call (`supersedesEdgeFindings`, `divisionDisclosureFindings`) leaves `checkReferences` as a separate type arm that the catalogue keeps (for `LEGACY_GRAMMARS`, legacy-checks' share). It is not in record-grammar's `EXTENSION_ARMS` (R28 lists only C-18.6/.7, C-2.8, C-2.9/C-9.1). Please confirm, or word the Rs.

## J2 · QUESTION

Replaces J1. Three points. I am carrying on with my best reading of each.

**(1) No R ids for most of the T19 stage.** `build/requirements/record-grammar.md` words R28 and R29 only. The rest of the stage is "worded by the same fold", but no R exists for `STATES`, `HEADINGS`, `HEADINGS_WHEN`, `vocabFor`, `sectionText`, `isCaseMemberBytes`, the machine-work labels, the title helpers, or `checkBundle` and its structural arms. Best reading: I move each one whole, with unchanged behaviour. The catalogue re-exports the plain names (`===`, R26). Each name is tested by name at the interface. I tag the tests with R ids once you word them.

**(2) B1's test fails, as B1 anticipated: the order of findings changes on information bundles.** Without a C-2.7 entry in `EXTENSION_ARMS` (R28), capture's registered grammar (`ids: ['C-2.7']`) no longer runs in its arm's place. It runs with the unclaimed grammars, after the project arm. The content of the findings is identical, but the order is not. Example: an information bundle with a bad `criticality` (C-2.7) and a bad `references[].rel` (C-6.1). Today the order is C-2.7 then C-6.1; under R28 it is C-6.1 then C-2.7. The same happens with C-18.6/.7 on information@2, and with C-6.2/.3. Options:
 (a) Keep an entry `{name: 'checkInformationExtension', ids: ['C-2.7']}` that no built-in arm fills, so capture's grammar keeps its place. Findings stay identical in order too. **Recommended**, because rule 2 promises unchanged findings. R28's sentence "C-2.7's entry is not here" would need re-wording.
 (b) Accept the reorder (R28 as worded).
I am building (b), as worded. Switching to (a) is one line.

**(3) Separating C-6.1 adds two arms to R28's list.** `checkReferences` ends with inquiry's `supersedesEdgeFindings` and `divisionDisclosureFindings` (C-6.1, the separation draft-T19 asks for). Directly after it, `checkBundle` runs `checkRecheckCoverage` (C-15.1, inquiry's; not structural, and in no list today). To keep the order, both stay where they run, as two arms a grammar takes the place of. My `EXTENSION_ARMS`, in run order:
 `checkInfo2Contract [C-18.6, C-18.7]`, `checkSupersession [C-6.1]`, `checkRecheckCoverage [C-15.1]`, `checkInquiryExtension [C-2.8]`, `checkProjectExtension [C-2.9, C-9.1]`.
An arm that no grammar claims does nothing in record-grammar. legacy-checks' `LEGACY_GRAMMARS` (its job, rule 2) then claims the four inquiry and project arms plus C-18. R28 would gain the two inquiry arms, or name a different cut.

**Hand-off (no question):** I copy `checkBundle` and its structural arms into record-grammar, and leave the catalogue's `checkBundle`, its arms and its `EXTENSION_ARMS` untouched. Rule 2 makes legacy-checks write the wrapper and delete them (its (1)). Re-exporting my list now, while the catalogue's `checkBundle` still runs its own, would let record-core and the catalogue judge grammars against two different lists. The catalogue's re-export of `EXTENSION_ARMS` goes in with the wrapper.
