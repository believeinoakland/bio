# retrieval: the words check after the conversion (K3949)

Layer 5. 1 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- handlist `bio-plane/test/m/retrieval/projection.test.mjs:265` [?] ops: contentaxis, file, frontier, ... (16 of 20 not the module's own) — handlist

## Plain findings (K3957)

19 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('retrieval.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/retrieval/frontier.mjs:31` "this read. A lead is never evidence"
- plain `bio-plane/src/retrieval/frontier.mjs:466` "context. This read does not include them, and says nothing about whether any exist"
- plain `bio-plane/src/retrieval/index.mjs:293` "a registration names its module and its function"
- plain `bio-plane/src/retrieval/index.mjs:296` "the action facts are registered once"
- plain `bio-plane/src/retrieval/index.mjs:306` "a registration names its module and its function"
- plain `bio-plane/src/retrieval/index.mjs:318` "a registration names its module and its function"
- plain `bio-plane/src/retrieval/index.mjs:331` "a registration names its module and its function"
- plain `bio-plane/src/retrieval/index.mjs:367` "a registration names its module and its function"
- plain `bio-plane/src/retrieval/index.mjs:405` "a field is registered once"
- plain `bio-plane/src/retrieval/index.mjs:830` "no record matches all of these terms; this many match any of them"
- plain `bio-plane/src/retrieval/index.mjs:1049` "citable in them, so an empty answer is a fact about citation and never about what a doc..."
- plain `bio-plane/src/retrieval/index.mjs:1078` "the record has no text index key"
- plain `bio-plane/src/retrieval/index.mjs:1253` "a selection is owned by the credential that made it"
- plain `bio-plane/src/retrieval/index.mjs:1257` "a selection is 'query' or 'enumerated'"
- plain `bio-plane/src/retrieval/index.mjs:1262` "an enumerated selection needs at least one id"
- plain `bio-plane/src/retrieval/index.mjs:1334` "a selection is readable only by the credential that made it"
- plain `bio-plane/src/retrieval/index.mjs:1353` "a selection is readable only by the credential that made it"
- plain `bio-plane/src/retrieval/index.mjs:1355` "the selection could not be read, so it is answered as one not held"
- plain `bio-plane/src/retrieval/index.mjs:1476` "no saved query of yours answers to that"
