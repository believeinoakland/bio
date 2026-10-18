# reevaluation: the words check after the conversion (K3949)

Layer 7. 7 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/reevaluation/index.mjs:2864` "case {}'s cited part {}"
- inline `bio-plane/src/reevaluation/index.mjs:289` "The entry's signing key is not among the keys the imported case fil..."
- inline `bio-plane/src/reevaluation/index.mjs:289` "The publisher has since taken this entry back (entry {}"
- inline `bio-plane/src/reevaluation/index.mjs:290` "{}); the cause still stands."
- testcopy `bio-plane/test/m/reevaluation/attribution.test.mjs:206` "the member attesting capture" — regex
- testcopy `bio-plane/test/m/reevaluation/checks.test.mjs:109` [part] "Only a named member can move a reference to a newer version of a do..." — part test copy
- testcopy `bio-plane/test/m/reevaluation/checks.test.mjs:110` [part] "the record's own machine credentials may say a newer version exists..." — part test copy

## Plain findings (K3957)

19 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('reevaluation.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/reevaluation/index.mjs:141` "write and was not kept; that is not the same as no change"
- plain `bio-plane/src/reevaluation/index.mjs:145` "passage with it, so whether the change touches this passage is undetermined; that is no..."
- plain `bio-plane/src/reevaluation/index.mjs:164` "was named wrong was not read and no corrected cause could be derived; that is not the s..."
- plain `bio-plane/src/reevaluation/index.mjs:167` "notice of a newer version at another address may be missing; that is not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:173` "cause may be missing; that is not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:190` "not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:195` "that is not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:1092` "no instant for this mark, and none is invented here"
- plain `bio-plane/src/reevaluation/index.mjs:1416` "what rests on it directly is named"
- plain `bio-plane/src/reevaluation/index.mjs:1416` "nothing live here rests on it"
- plain `bio-plane/src/reevaluation/index.mjs:1695` "and no edition cause could be derived; that is not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:1955` "says it was corrected, nothing resting on it was moved, and a recorded re-evaluation cl..."
- plain `bio-plane/src/reevaluation/index.mjs:2004` "evidence, and a recorded re-evaluation closes the cause"
- plain `bio-plane/src/reevaluation/index.mjs:2073` "nothing here rests on it"
- plain `bio-plane/src/reevaluation/index.mjs:2131` "and a recorded re-evaluation closes the cause"
- plain `bio-plane/src/reevaluation/index.mjs:2223` "holds no bytes of), so there is no capture whose newer versions could be asked about"
- plain `bio-plane/src/reevaluation/index.mjs:2231` "were not invited to is not in them"
- plain `bio-plane/src/reevaluation/index.mjs:2393` "that is not the same as none"
- plain `bio-plane/src/reevaluation/index.mjs:2396` "it does is undetermined; nothing was moved, and only a member's act moves a reference"
