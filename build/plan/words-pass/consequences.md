# consequences: the words check after the conversion (K3949)

Layer 9. 14 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/consequences/checks.mjs:32` [copy] "Your reason is longer than 2,000 characters. Shorten it. Nothing wa..." — ambiguous: 2 rows share this en (refusal.ADDRESSED_BAD_REASON, refusal.SUCCESS_BAD_REASON)
- inline `bio-plane/src/consequences/checks.mjs:44` [copy] "Your reason is longer than 2,000 characters. Shorten it. Nothing wa..."
- inline `bio-plane/src/consequences/index.mjs:1178` "figure {} is {label, basis: {op, operands}}, its label words of at ..."
- inline `bio-plane/src/consequences/index.mjs:1182` "figure {} ({}) is computed from cited"
- inline `bio-plane/src/consequences/index.mjs:1183` "sources, never stated: give its computation {op, operands}.{}"
- inline `bio-plane/src/consequences/index.mjs:1377` "a carry names one of {success}, {addressed} or {cure}"
- inline `bio-plane/src/consequences/index.mjs:216` "{}: kind one of {}, with a" — text holds braces (ICU syntax in t)
- inline `bio-plane/src/consequences/index.mjs:217` "description; an office is {role, body}, and a person {entity, named..." — text holds braces (ICU syntax in t)
- inline `bio-plane/src/consequences/index.mjs:419` [copy] "in no state"
- inline `bio-plane/src/consequences/index.mjs:455` "{} is not a person this record holds"
- inline `bio-plane/src/consequences/measures.mjs:97` [copy] "at least one"
- testcopy `bio-plane/test/m/consequences/addressed.test.mjs:116` [part] "the team judges the breach had no consequence"
- testcopy `bio-plane/test/m/consequences/reads.test.mjs:253` [part] "could not be read for you"
- testcopy `bio-plane/test/m/consequences/t46.test.mjs:62` [part] "2,000 characters. Nothing was written." — part test copy

## Plain findings (K3957)

3 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('consequences.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/consequences/index.mjs:456` "an affected person names the person entity"
- plain `bio-plane/src/consequences/index.mjs:965` "into one figure, and nothing ranks it"
- plain `bio-plane/src/consequences/index.mjs:1175` "a success record's figures are a list, each {label, basis: {op, operands}}"
