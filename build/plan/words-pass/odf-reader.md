# odf-reader: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

5 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('odf-reader.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/odf.mjs:713` "this package carries no meta.xml, so NO core-properties item is emitted; the absence of..."
- plain `bio-plane/src/odf.mjs:1048` "content.xml not read: over the size bound (stated in evidentiary.undetermined and by te..."
- plain `bio-plane/src/odf.mjs:2265` "content.xml with text:list xml:id relabelled is byte-identical across two Google export..."
- plain `bio-plane/src/odf.mjs:2268` "no .odp export has been measured for content.xml stability on a census target: M-167 re..."
- plain `bio-plane/src/odf.mjs:2382` "the bytes are not an OpenDocument package detected with certainty, so no container dige..."
