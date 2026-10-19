# standards: the words check after the conversion (K3949)

Layer 5. 6 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/standards/checks.mjs:77` "This proposal carries nobody. A proposal is labelled with who made ..."
- inline `bio-plane/src/standards/checks.mjs:78` "for could say nothing. Nothing was written."
- inline `bio-plane/src/standards/index.mjs:2391` "It is stored with no captured text, and cannot be adopted until a m..."
- inline `bio-plane/src/standards/index.mjs:2392` "names the captured passages that hold the standard's words (R9)."
- inline `bio-plane/src/standards/index.mjs:450` "extent}, a passage of a held capture you may see. Nothing was written."
- inline `bio-plane/src/standards/index.mjs:970` "'s {} is a held passage {passage: content id} or an enactment event"

## Plain findings (K3957)

4 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('standards.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/standards/index.mjs:303` "the standard is held all the same, and where it comes from is undetermined"
- plain `bio-plane/src/standards/index.mjs:309` "it, and none is chosen between them, so where it comes from is undetermined"
- plain `bio-plane/src/standards/index.mjs:745` "the captures, never on an enactment date"
- plain `bio-plane/src/standards/index.mjs:1541` "see is neither answered nor counted"
