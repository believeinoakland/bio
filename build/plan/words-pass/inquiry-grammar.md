# inquiry-grammar: the words check after the conversion (K3949)

Layer 6. 11 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:223` [?] codes: NOT_INQUIRIES, SELF_BASIS, BASIS_CYCLE, ... (5 of 12 not the module's own) — handlist
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:147` "add a references[] entry {rel: supersedes, target: {}} with its reason"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1782` "{} is not a list: it lists each bias statement applied here, one {s..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1783` "make {} a list of {statement, effect} items, or drop it — where no ..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1790` "{} is not an object: an application names the statement applied and..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:1791` "state {} as {statement, effect}, with from and to when the effect i..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:463` "(including {} that cut{} AGAINST this inquiry)"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:756` "Testimony is a member's account of a connection"
- inline `bio-plane/src/inquiry-grammar/grammar.mjs:941` "{} basis leg{} carr{} no ground while {} do: a basis is grouped WHO..."
- testcopy `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:233` [part] "A leg on another team's finding names that finding and one edition,..." — part test copy
- testcopy `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:234` [part] "its grades are that edition's. Correct the leg. Nothing was written." — part test copy

## Plain findings (K3957)

44 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('inquiry-grammar.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/inquiry-grammar/grammar.mjs:85` "author the reason this supersedes its target"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:143` "or sever the supersedes edge"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:170` "every Problem, in every disposition including dismissed, carries at least one recheck t..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:170` "author a trigger, dual-audience shape, dated when time-bound"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:246` "concluded state requires a non-empty conclusion"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:275` "concluded state requires a non-empty falsifier: a conclusion that names nothing which w..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:276` "state what evidence would falsify this conclusion"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:284` "or clear the falsifier if the absence is what the member meant to record"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:287` "concluded state requires at least one basis leg: an open inquiry may rest on nothing (a..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:288` "add a basis[] leg naming what the conclusion rests on, and the same target in references[]"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:325` "the case states these facts once, in its own signed document"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:391` "divided state requires a division block: a question recorded as divided with no account..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:404` "otherwise raise it: the repair here is not a state move, and C-4.2 refuses any transiti..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:410` "name every child the question was divided into"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:416` "division.into names the same child twice: a leg apportioned to a child named twice has ..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:420` "author the reason the question was two questions"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:438` "author one apportionment row per basis leg, naming the child it went to"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:464` "apportion the remaining leg(s) to a child"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:464` "or sever them with a reason, which is the act that removes material"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:574` "copy the content id from the part as this record answers for it"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:602` "basis is not an array"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:724` "grade this leg on the connection axis — a leg to another inquiry is a connection"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:736` "or grade this leg on the connection axis — a leg to another inquiry is a connection"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:758` "or move this grade onto the connection axis, where testimony and hunches belong"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:788` "state the grade this source produced"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:881` "author a grounds[] row per label, naming the member who asserts that ground is independ..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:882` "or drop the ground labels — an unstructured basis is no stronger than its weakest leg, ..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:887` "grounds is not an array"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:930` "name the member asserting that this ground is independently sufficient"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:942` "give every leg a ground — a leg that is needed whatever else holds belongs in every gro..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:943` "or remove the grounds and let the basis read as its weakest leg"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1114` "or state the grade as testimony (grade D, with an author and a date) if it is a member'..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1124` "a resolution IS the framework's §8.1 connection grade and grades nothing else"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1183` "or state this leg as testimony (grade D, with an author and a date) if it is a member's..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1192` "or state this leg as testimony (grade D, with an author and a date)"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1273` "is not a published case"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1273` "cannot be checked against the published record here"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1274` "cite a published case and name its edition"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1274` "or state where this grade actually came from"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1310` "nothing on that axis was ever established there, so a grade taken from it would be inve..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1310` "what lies beneath is unknown rather than absent, so a grade taken from it would be a cl..."
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1338` "follow the lead and cite the document the look captured instead"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1339` "or, if you saw the thing yourself, author it as your own observation and cite that"
- plain `bio-plane/src/inquiry-grammar/grammar.mjs:1833` "or name another effect — a statement that changed no letter did not lower one"

## Test copies of code sentences (K3962)

2 test strings that copy the `en` of a product `localize` call (the check's testcopy arm, tag `code`, civicos-process ea6cd83). Each test compares with `localize(id, en)` or `word(id)` instead, or asserts the key (K3810). A copy of another module's sentence is fixed in this module's own test.

- testcopy `bio-plane/test/m/inquiry-grammar/grammar.test.mjs:138` "\"add a references[] entry for '\""
- testcopy `bio-plane/test/m/inquiry-grammar/imported.test.mjs:128` "\"' is not a canonical record id\""
