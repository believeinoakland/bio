# case-inputs: the words check after the conversion (K3949)

Layer 8. 30 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/case-inputs/checks.mjs:23` "An outcome carried into a case needs its kind (a success, a correct..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:25` "it cites, and the date it happened. {field} is missing or isn't in ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:29` "{whom} was asked for comment on {asked_at}. The window for a reply ..."
- inline `bio-plane/src/case-inputs/checks.mjs:30` "{window_closes}; the reply answers {answered} of the {claims} claim..."
- inline `bio-plane/src/case-inputs/checks.mjs:31` "{whom} was asked for comment on {asked_at}. The window for a reply ..."
- inline `bio-plane/src/case-inputs/checks.mjs:32` "{window_closes}; no reply is recorded." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:33` "{whom} was asked for comment on {asked_at}. The window for a reply ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:34` "{window_closes}; no reply laid out claim by claim is recorded." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:35` "{whom} was asked for comment on {asked_at}, with no date given for ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:36` "close; the reply answers {answered} of the {claims} claims the requ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:37` "{whom} was asked for comment on {asked_at}, with no date given for ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:38` "close; no reply is recorded." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:39` "{whom} was asked for comment on {asked_at}, with no date given for ..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:40` "to close; no reply laid out claim by claim is recorded." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/checks.mjs:42` "{whom}'s reply asks not to be quoted, so the case says what it says..." — text holds a literal {name}, filled by its caller
- inline `bio-plane/src/case-inputs/document.mjs:67` "- the recipient of review grant {}, addressed by its issuer as '{}',"
- inline `bio-plane/src/case-inputs/document.mjs:69` "- {}, a participant of {}, on {}"
- inline `bio-plane/src/case-inputs/document.mjs:70` "— given on draft {}"
- inline `bio-plane/src/case-inputs/index.mjs:260` "what the outcome rests on is a list of cites in case-account R5's s..."
- inline `bio-plane/src/case-inputs/index.mjs:399` "the words given are {} characters"
- inline `bio-plane/src/case-inputs/index.mjs:567` "team's Civicsmith stamped one, and who wrote the sentence that now ..."
- inline `bio-plane/src/case-inputs/index.mjs:572` "which records who wrote its current bytes; acknowledge it then."
- inline `bio-plane/src/case-inputs/index.mjs:573` "Publish this edition again from a draft whose statement carries an ..."
- inline `bio-plane/src/case-inputs/index.mjs:659` "That edition is already SIGNED, and its list is what the signature ..."
- inline `bio-plane/src/case-inputs/index.mjs:660` "can appear in no signed document of it, and is recorded as the act ..."
- inline `bio-plane/src/case-inputs/index.mjs:661` "Its case document is authored and unsigned, so it now lists this re..."
- inline `bio-plane/src/case-inputs/index.mjs:662` "re-authored; its owner signs the new bytes."
- testcopy `bio-plane/test/m/case-inputs/t46-words.test.mjs:154` "is missing or isn't in that form" — partial test copy (template not matched to a row)
- testcopy `bio-plane/test/m/case-inputs/t46-words.test.mjs:76` [part] "An acknowledgement of a statement is recorded" — part test copy
- testcopy `bio-plane/test/m/case-inputs/t46-words.test.mjs:77` [part] "with your own words on it, and none were given, or they are longer ..." — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-inputs.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-inputs/index.mjs:398` "the words given were blank"
- plain `bio-plane/src/case-inputs/index.mjs:411` "until then it is a draft and never the team's statement"
- plain `bio-plane/src/case-inputs/index.mjs:688` "to add to; it is left exactly as it was signed-for-review"
