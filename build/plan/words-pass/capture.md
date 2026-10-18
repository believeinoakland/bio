# capture: the words check after the conversion (K3949)

Layer 3. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- testcopy `bio-plane/test/d57selflink.test.mjs:136` [part] "its target is this very capture" — part test copy
- testcopy `bio-plane/test/m/capture/figures.test.mjs:54` [part] "nothing was created or changed" — part test copy
- testcopy `bio-plane/test/m/capture/t51.test.mjs:133` [part] "checked against the source" — part test copy

## Plain findings (K3957)

34 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('capture.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/capture/grammar.mjs:77` "verified state requires at least one file in snapshots/"
- plain `bio-plane/src/capture/index.mjs:224` "this document is already vouched for, so whether it could be vouched for in a batch is ..."
- plain `bio-plane/src/capture/index.mjs:631` "a file is brought into the record by a signed-in member, whose stamp names them; nothin..."
- plain `bio-plane/src/capture/index.mjs:652` "the upload carried no bytes; nothing was written"
- plain `bio-plane/src/capture/index.mjs:683` "the file exceeds what this surface will capture even in parts; nothing was written"
- plain `bio-plane/src/capture/index.mjs:693` "the file's bytes could not be read whole or held under their own digest, so nothing was..."
- plain `bio-plane/src/capture/index.mjs:695` "the file has no bytes; nothing was written"
- plain `bio-plane/src/capture/index.mjs:699` "the incremental hash and the block hash of the same bytes differ"
- plain `bio-plane/src/capture/index.mjs:716` "the acquisition receipt could not be written, so nothing was filed"
- plain `bio-plane/src/capture/index.mjs:779` "the upload's receipt: its digest, taken as the bytes arrived, and its instant"
- plain `bio-plane/src/capture/index.mjs:859` "the signature does not verify over this account's statement against a key of yours that..."
- plain `bio-plane/src/capture/index.mjs:897` "reattest takes the sha256 of a capture the record holds"
- plain `bio-plane/src/capture/index.mjs:1079` "looking at the source is a signed-in member's act, whose stamp names them; nothing was ..."
- plain `bio-plane/src/capture/index.mjs:1086` "the record could not be read, so whether it holds this, and whether the source has chan..."
- plain `bio-plane/src/capture/index.mjs:1090` "the record holds no copy of this that you may see, so there is nothing to compare"
- plain `bio-plane/src/capture/index.mjs:1099` "this copy has no address to look at"
- plain `bio-plane/src/capture/index.mjs:1101` "this copy did not come from a plain fetch of the address (it was uploaded, handed over ..."
- plain `bio-plane/src/capture/index.mjs:1102` "this copy is a rendered capture, which a plain look at the site cannot be compared with"
- plain `bio-plane/src/capture/index.mjs:1103` "the record cannot say how this copy was captured, so a plain look at the site is not co..."
- plain `bio-plane/src/capture/index.mjs:1104` "this copy was not fetched from its own address (an export of it was), so a plain look a..."
- plain `bio-plane/src/capture/index.mjs:1106` "this copy has no public address to look at"
- plain `bio-plane/src/capture/index.mjs:1117` "the request for the address did not complete, so the source was not looked at"
- plain `bio-plane/src/capture/index.mjs:1120` "the host is being given time between requests, so the source was not looked at"
- plain `bio-plane/src/capture/index.mjs:1125` "the site still gives the same document as this copy"
- plain `bio-plane/src/capture/index.mjs:1125` "the site now gives a different document from this copy"
- plain `bio-plane/src/capture/index.mjs:1140` "the document at the address is larger than this surface compares, so it was not looked ..."
- plain `bio-plane/src/capture/index.mjs:1143` "the document did not arrive whole, so the source was not looked at"
- plain `bio-plane/src/capture/index.mjs:1644` "name at least one document; nothing was written"
- plain `bio-plane/src/capture/index.mjs:1725` "these documents are not set aside; nothing was written"
- plain `bio-plane/src/capture/index.mjs:1765` "the set-asides recorded with this question could not be read"
- plain `bio-plane/src/capture/index.mjs:1832` "no reservation was offered, and an unreserved admission is the overrun D-492 closed"
- plain `bio-plane/src/capture/index.mjs:2390` "this earlier capture reused the old ones, which are now unverified against the source"
- plain `bio-plane/src/capture/index.mjs:2566` "a capture sha256 identifies the event; a record does not exist yet at capture time"
- plain `bio-plane/src/capture/ops.mjs:86` "body hash does not match the sha256 parameter"
