# acquisition: the words check after the conversion (K3949)

Layer 3. 3 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `bio-plane/src/acquisition/index.mjs:1178` "; {}, so they are not asserted to be the whole page"
- testcopy `bio-plane/test/m/acquisition/acquire.test.mjs:415` [part] "a continuation files no new document"
- testcopy `bio-plane/test/m/acquisition/memento-at.test.mjs:50` "); it is not the page at" — partial test copy (template not matched to a row)

## Plain findings (K3957)

33 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('acquisition.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/acquisition/index.mjs:243` "archive.org is a backup source and this document has not been unreachable long enough t..."
- plain `bio-plane/src/acquisition/index.mjs:349` "the archive has no endpoint for this address"
- plain `bio-plane/src/acquisition/index.mjs:361` "the archive is rate-limiting us; the governor will hold this host"
- plain `bio-plane/src/acquisition/index.mjs:458` "the document address must be https on a public host"
- plain `bio-plane/src/acquisition/index.mjs:469` "the memento exceeds what this surface will capture even in parts"
- plain `bio-plane/src/acquisition/index.mjs:619` "an archive-sourced capture names the document address, not a replay locator"
- plain `bio-plane/src/acquisition/index.mjs:652` "this one named none, so nothing was fetched"
- plain `bio-plane/src/acquisition/index.mjs:706` "a locator must be https on a public host: no bare IP address, no localhost, no credenti..."
- plain `bio-plane/src/acquisition/index.mjs:858` "the fetch did not complete; its error is not carried because a supplied credential rode it"
- plain `bio-plane/src/acquisition/index.mjs:947` "the body broke off while it was read; its error is not carried because a supplied crede..."
- plain `bio-plane/src/acquisition/index.mjs:981` "the document exceeds what this surface will capture even in parts"
- plain `bio-plane/src/acquisition/index.mjs:1000` "the incremental hash and the block hash of the same bytes differ"
- plain `bio-plane/src/acquisition/index.mjs:1039` "too large to be a single page"
- plain `bio-plane/src/acquisition/index.mjs:1062` "bio-plane acquire, https fetch, hashed at receipt"
- plain `bio-plane/src/acquisition/index.mjs:1181` "first-party https fetch of the shell, hashed at receipt; the rendered document hashed a..."
- plain `bio-plane/src/acquisition/index.mjs:1182` "first-party https fetch, hashed at receipt, transport record on this document"
- plain `bio-plane/src/acquisition/index.mjs:1188` "bio-plane acquire, https fetch, hashed at receipt"
- plain `bio-plane/src/acquisition/index.mjs:1370` "listed whole over the stored parts"
- plain `bio-plane/src/acquisition/index.mjs:1413` "the primary capture did not read back"
- plain `bio-plane/src/acquisition/keyed.mjs:71` "machine credential or the daemon; nothing was fetched"
- plain `bio-plane/src/acquisition/keyed.mjs:93` "the team's key for this service is off or not held; the caller goes on without it"
- plain `bio-plane/src/acquisition/keyed.mjs:111` "the request to the service did not complete; its error is not carried because the team'..."
- plain `bio-plane/src/acquisition/keyed.mjs:118` "the service's answer broke off while it was read"
- plain `bio-plane/src/acquisition/keyed.mjs:156` "a citation lookup is a member's or an operator's act, and none was named; nothing was sent"
- plain `bio-plane/src/acquisition/keyed.mjs:158` "there is no text to look citations up in; nothing was sent"
- plain `bio-plane/src/acquisition/keyed.mjs:177` "the service's answer is not the list of citations its documentation describes"
- plain `bio-plane/src/acquisition/unpack.mjs:356` "set whether your team's captures ask a public archive for a copy"
- plain `bio-plane/src/acquisition/unpack.mjs:360` "the setting is true (on) or false (off); nothing was recorded"
- plain `bio-plane/src/acquisition/unpack.mjs:497` "that brought it in; nothing was opened"
- plain `bio-plane/src/acquisition/unpack.mjs:501` "the store handed in carries no acquisition instance, so no archive's outcomes can be re..."
- plain `bio-plane/src/acquisition/unpack.mjs:509` "no acquisition receipt or register row names this archive; nothing was opened"
- plain `bio-plane/src/acquisition/unpack.mjs:786` "no acquisition instance holds this storage's archive records"
- plain `bio-plane/src/acquisition/unpack.mjs:788` "no archive your team holds and you may see answers to that digest"
