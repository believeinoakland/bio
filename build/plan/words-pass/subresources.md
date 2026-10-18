# subresources: the words check after the conversion (K3949)

Layer 1. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/subresources.mjs:1367` "Every <a> the page carried, characterised. `intra` resolves inside ..."
- inline `bio-plane/src/subresources.mjs:1373` "unconfirmed, and unconfirmed is a third answer rather than a synony..."
- inline `bio-plane/src/subresources.mjs:407` "at {}. The raw bytes as served are the evidence and are stored"

## Plain findings (K3957)

13 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('subresources.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/subresources.mjs:402` "object-src 'none'; form-action 'none'; base-uri 'none'"
- plain `bio-plane/src/subresources.mjs:719` "the capturing Worker's clock, stamped as this capture issued the request"
- plain `bio-plane/src/subresources.mjs:761` "cross-origin script, image, or media: advertising, analytics, and social widgets are no..."
- plain `bio-plane/src/subresources.mjs:996` "the address is not public https, and the fence that guards the primary locator guards t..."
- plain `bio-plane/src/subresources.mjs:1032` "this invocation reached the runtime's outbound request limit; the reference is outstand..."
- plain `bio-plane/src/subresources.mjs:1033` "held back from a previously observed runtime limit so the invocation ends on our terms ..."
- plain `bio-plane/src/subresources.mjs:1039` "the fanout cap was reached before this reference; it is recorded rather than dropped so..."
- plain `bio-plane/src/subresources.mjs:1076` "whose page the record does not name, counted as undetermined)"
- plain `bio-plane/src/subresources.mjs:1120` "and this says nothing about whether it would have answered"
- plain `bio-plane/src/subresources.mjs:1324` "the runtime refused an outbound request at this count; record it and pass it back as pl..."
- plain `bio-plane/src/subresources.mjs:1393` "the raw capture is the evidence and is never rewritten, so showing the page as it was n..."
- plain `bio-plane/src/subresources.mjs:1396` "index of the render companion's placeholders to the content-addressed captures they res..."
- plain `bio-plane/src/subresources.mjs:1397` "a viewer must be able to verify every byte it substitutes against the record before sho..."
