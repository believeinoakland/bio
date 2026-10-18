# office-readers: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

9 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('office-readers.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `bio-plane/src/csv.mjs:272` "declared by the producer in the bytes"
- plain `bio-plane/src/csv.mjs:278` "us-ascii, not utf-8: every 8-bit superset decodes these bytes identically"
- plain `bio-plane/src/csv.mjs:283` "every multi-byte sequence in the signature window is valid utf-8"
- plain `bio-plane/src/csv.mjs:284` "likely, not certain: validity is evidence, not the producer's declaration"
- plain `bio-plane/src/csv.mjs:688` "likely, not certain: a declared type is a claim, and a csv has no magic bytes to check ..."
- plain `bio-plane/src/docx.mjs:727` "word/document.xml not read: over the size bound (stated in evidentiary.undetermined and..."
- plain `bio-plane/src/docx.mjs:728` "word/document.xml unreadable: element references unavailable (stated)"
- plain `bio-plane/src/formats-xlsx.mjs:1018` "likely, not certain: the declared main content type lives in a deflated part; parts() c..."
- plain `bio-plane/src/pptx.mjs:595` "slide/notes parts not read: over the size bound (stated in evidentiary.undetermined and..."
