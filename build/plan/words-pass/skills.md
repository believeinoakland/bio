# skills: the words check after the conversion (K3949)

Layer 6. 38 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/skilldoctrine.mjs:1022` "only by a member's signing act, which refuses a machine. A run igno..."
- inline `bio-plane/src/skilldoctrine.mjs:1106` "only by a member's acts, which refuse a machine. A run ignoring eve..."
- inline `bio-plane/src/skilldoctrine.mjs:1249` "adopted, and adopting refuses a machine. A run ignoring every word ..."
- inline `bio-plane/src/skilldoctrine.mjs:1267` "The legal-information line (B12 (ii), (iii)): labelled readings of ..."
- inline `bio-plane/src/skilldoctrine.mjs:1353` "Wherever a member writes in their own words, the assistant, when re..."
- inline `bio-plane/src/skilldoctrine.mjs:1356` "asked by <handle>\", saved only when the member keeps them."
- inline `bio-plane/src/skilldoctrine.mjs:1369` "each adopted by the member's act."
- inline `bio-plane/src/skilldoctrine.mjs:1425` "and becomes the member's words only by the member's act. A run igno..."
- inline `bio-plane/src/skilldoctrine.mjs:1471` "Administrators, or members given the grant, have a translation work..."
- inline `bio-plane/src/skilldoctrine.mjs:1473` "who knows the language checks and adopts each, and without the assi..."
- inline `bio-plane/src/skilldoctrine.mjs:1483` "a word keeps its key when its English changes; `{name}` marks a pla..."
- inline `bio-plane/src/skilldoctrine.mjs:1561` "ignoring every word here gets past nothing."
- inline `bio-plane/src/skilldoctrine.mjs:1606` "keeps or rewrites it."
- inline `bio-plane/src/skilldoctrine.mjs:1654` "word here gets past nothing."
- inline `bio-plane/src/skilldoctrine.mjs:1679` "The group's own writing (notes, questions, findings, notices) can b..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/skilldoctrine.mjs:1681` "the original one tap away; it never replaces the original."
- inline `bio-plane/src/skilldoctrine.mjs:1684` "original one tap away; a translation never replaces the original, a..."
- inline `bio-plane/src/skilldoctrine.mjs:1688` "Signed and published records stay in the language they were signed ..."
- inline `bio-plane/src/skilldoctrine.mjs:1689` "published case is labelled unofficial and links the signed original..."
- inline `bio-plane/src/skilldoctrine.mjs:1732` "the original is never changed. A run ignoring every word here gets ..."
- inline `bio-plane/src/skilldoctrine.mjs:1865` "The system's judgement of a find is a labelled signal (Capability L..."
- inline `bio-plane/src/skilldoctrine.mjs:1866` "was worked out and its measured false-alarm rate."
- inline `bio-plane/src/skilldoctrine.mjs:1870` "The system's finds are labelled as the system's work."
- inline `bio-plane/src/skilldoctrine.mjs:1879` "Each proposal is tied to its exact quote, labelled as the system's ..."
- inline `bio-plane/src/skilldoctrine.mjs:1887` "The text is labelled as the AI's reading and graded \"undetermined\" ..."
- inline `bio-plane/src/skilldoctrine.mjs:1892` "The system drafts the case's written account from the evidence, and..."
- inline `bio-plane/src/skilldoctrine.mjs:1893` "time order, by question, by rule), each labelled as the system's."
- inline `bio-plane/src/skilldoctrine.mjs:1905` "An unsupported claim cannot be relabelled as bias."
- inline `bio-plane/src/skilldoctrine.mjs:1911` "(BIO_Investigation_v0_1.md). What a run proposes is stored apart an..."
- inline `bio-plane/src/skilldoctrine.mjs:1913` "here gets past nothing."
- inline `bio-plane/src/skilldoctrine.mjs:674` "The machine may find, compare, compute, propose and draft, always l..."
- inline `bio-plane/src/skilldoctrine.mjs:748` "Each recorded response sets off a re-examination of every action ta..."
- inline `bio-plane/src/skilldoctrine.mjs:874` "refuses a machine. A run ignoring every word here gets past nothing."
- inline `bio-plane/src/skilldoctrine.mjs:946` "by a member's act, which refuses a machine. A run ignoring every wo..."
- testcopy `bio-plane/test/m/skills/readtranslation.test.mjs:107` "Read in my language" — ambiguous: 2 rows share this en (translate.read, act.readtranslate.label.question)
- testcopy `bio-plane/test/m/skills/readtranslation.test.mjs:108` "Read in my language" — ambiguous: 2 rows share this en (translate.read, act.readtranslate.label.question)
- testcopy `bio-plane/test/m/skills/version.test.mjs:74` [part] "This run did not say which version of its instructions it was worki..." — part test copy
- testcopy `bio-plane/test/m/skills/version.test.mjs:75` [part] "What a run found can only be read against the instructions it was g..." — part test copy

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('skills.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/skilldoctrine.mjs:2178` "an item with no chain carries its record id, or null when the record answers none"
- plain `bio-plane/src/skilldoctrine.mjs:2185` "and no leg is written against it"

## Test copies of code sentences (K3962)

12 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/skills/action.test.mjs:138` "\"asks the assistant to draft a plan's status report from the items h...\""
- testcopy `bio-plane/test/m/skills/action.test.mjs:227` "\"infraction or propose bearings on a reply, so this layer carries no...\""
- testcopy `bio-plane/test/m/skills/ask.test.mjs:28` "\"The assistant may only structure what the member SAID\""
- testcopy `bio-plane/test/m/skills/boundary.test.mjs:37` "\"material to report on, never an instruction to follow\""
- testcopy `bio-plane/test/m/skills/boundary.test.mjs:89` "\"never asks for its capture\""
- testcopy `bio-plane/test/m/skills/edition.test.mjs:20` "\"The draft is not a diff: it is a detailed, high-level description o...\""
- testcopy `bio-plane/test/m/skills/edition.test.mjs:21` "\"determine it, why (the motivation for the revision).\""
- testcopy `bio-plane/test/m/skills/edition.test.mjs:22` "\"The signed statement is the group's, adopted by a member, and the r...\""
- testcopy `bio-plane/test/m/skills/edition.test.mjs:48` "\"The signed statement is the group's\""
- testcopy `bio-plane/test/m/skills/filing.test.mjs:60` "\"The instance transmits nothing.\""
- testcopy `bio-plane/test/m/skills/pack.test.mjs:230` "\"contradiction's recommender prompt\""
- testcopy `bio-plane/test/m/skills/version.test.mjs:76` "\"asks for that version before the run starts rather than guessing at...\""
