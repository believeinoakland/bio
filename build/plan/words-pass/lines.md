# lines: the words check after the conversion (K3949)

Layer 5. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/lines/index.mjs:494` "an entity of kind {}"
- inline `bio-plane/src/lines/index.mjs:760` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/lines/vocab.mjs:48` [copy] "a member of"

## Plain findings (K3957)

25 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('lines.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/lines/index.mjs:174` "a line row is an object"
- plain `bio-plane/src/lines/index.mjs:266` "an event bound names the edge start or end of the event's when"
- plain `bio-plane/src/lines/index.mjs:384` "no line with that id is held"
- plain `bio-plane/src/lines/index.mjs:385` "a withdrawn line takes no current-through statement"
- plain `bio-plane/src/lines/index.mjs:386` "only a holds line is stated current through a day"
- plain `bio-plane/src/lines/index.mjs:387` "this line states its end; a current-through statement is for a line with none"
- plain `bio-plane/src/lines/index.mjs:394` "a statement is recorded by the act's stamped author"
- plain `bio-plane/src/lines/index.mjs:430` "a passage names its capture by its sha256"
- plain `bio-plane/src/lines/index.mjs:432` "the record holds no such capture, or it may not be seen"
- plain `bio-plane/src/lines/index.mjs:433` "a passage names the part of the capture it cites (an extent)"
- plain `bio-plane/src/lines/index.mjs:454` "the system rule's source is a capture the record does not hold, or it may not be seen"
- plain `bio-plane/src/lines/index.mjs:467` "a member's testimony states what they know, in their own words"
- plain `bio-plane/src/lines/index.mjs:487` "a line names both its ends (from and to), each a registered entity"
- plain `bio-plane/src/lines/index.mjs:488` "a line runs between two different entities"
- plain `bio-plane/src/lines/index.mjs:505` "only a holds line carries a capacity"
- plain `bio-plane/src/lines/index.mjs:508` "only a holds line carries a title"
- plain `bio-plane/src/lines/index.mjs:509` "a title is the post's title as the basis words it, a non-blank string"
- plain `bio-plane/src/lines/index.mjs:522` "a validity carries its zone, and no zone is stated and the active profiles give none"
- plain `bio-plane/src/lines/index.mjs:531` "the validity's from is after its to"
- plain `bio-plane/src/lines/index.mjs:539` "a line is recorded by the act's stamped author"
- plain `bio-plane/src/lines/index.mjs:570` "a withdrawal says why, in the member's own words"
- plain `bio-plane/src/lines/index.mjs:572` "no line with that id is held"
- plain `bio-plane/src/lines/index.mjs:573` "a withdrawal is made by the act's stamped author"
- plain `bio-plane/src/lines/index.mjs:631` "direction is from, to or both"
- plain `bio-plane/src/lines/index.mjs:684` "a holder is asked of an entity of kind office; a line to an organisation is a career, n..."
