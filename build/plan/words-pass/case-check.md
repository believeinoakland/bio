# case-check: the words check after the conversion (K3949)

Layer 8.

## Plain findings (K3957)

2 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('case-check.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/case-check/index.mjs:123` "the pre-flight gave no answer"
- plain `bio-plane/src/case-check/index.mjs:146` "the preparation was not found where publication stores it, so no check was recorded"
