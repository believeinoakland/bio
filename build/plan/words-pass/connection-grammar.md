# connection-grammar: the words check after the conversion (K3949)

Layer 1. 4 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/connection-grammar/reads.mjs:68` "{} is undetermined at the date asked and is not marked undetermined..."
- inline `bio-plane/src/connection-grammar/registry.mjs:79` [copy] "a read names the member reading; an absent viewer is neither an adm..."
- inline `bio-plane/src/connection-grammar/shape.mjs:10` [copy] "declared, not evidenced"
- inline `bio-plane/src/connection-grammar/shape.mjs:122` "grade is not {assertion, ends: [from_grade, to_grade]} in the lette..."

## Plain findings (K3957)

8 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('connection-grammar.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/connection-grammar/conformance.mjs:93` "next repeats a page already read"
- plain `bio-plane/src/connection-grammar/conformance.mjs:110` "two identical calls gave different answers"
- plain `bio-plane/src/connection-grammar/conformance.mjs:116` "an item is answered on two pages"
- plain `bio-plane/src/connection-grammar/conformance.mjs:142` "the other viewer's pages are not the complete set less the fenced item"
- plain `bio-plane/src/connection-grammar/conformance.mjs:157` "an owner of hunch kinds names a hunch and its working inquiry in its fixture"
- plain `bio-plane/src/connection-grammar/conformance.mjs:170` "the fixture's hub node is not answered as a hub"
- plain `bio-plane/src/connection-grammar/reads.mjs:33` "unread is a list of {what, why}, each a non-empty string"
- plain `bio-plane/src/connection-grammar/reads.mjs:47` "a hub is answered with no items, never a partial set shown as whole"
