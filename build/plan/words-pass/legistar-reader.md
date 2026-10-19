# legistar-reader: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

11 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('legistar-reader.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `legistar-reader/index.mjs:30` "last publication, an upper bound"
- plain `legistar-reader/index.mjs:72` "the address names a Legistar client but no endpoint"
- plain `legistar-reader/index.mjs:77` "the address names a record id but no endpoint"
- plain `legistar-reader/index.mjs:129` "no text was supplied with the address, so there is nothing to read"
- plain `legistar-reader/index.mjs:256` "the capture's own date was not given, so whether this end is still to come cannot be said"
- plain `legistar-reader/index.mjs:385` "the same row was read twice with different facts; the first reading is kept"
- plain `legistar-reader/index.mjs:389` "every page given was full, so a further page may exist"
- plain `legistar-reader/index.mjs:456` "and nothing is claimed either way"
- plain `legistar-reader/index.mjs:466` "a meeting was added to Legistar's list"
- plain `legistar-reader/index.mjs:474` "a meeting is now marked cancelled"
- plain `legistar-reader/index.mjs:479` "a meeting's date or time moved"
