# docprofile: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

19 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('docprofile.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `docprofile/doctypes/registry.mjs:44` "no content type is registered"
- plain `docprofile/doctypes/registry.mjs:54` "a content type is registered by its key, and this one carries no key"
- plain `docprofile/doctypes/registry.mjs:95` "nothing is read from it and what changes in it is not described"
- plain `docprofile/doctypes/registry.mjs:98` "recognised type: any substantive difference is reported and not described"
- plain `docprofile/pipeline.mjs:92` "the two captures could not be compared"
- plain `docprofile/pipeline.mjs:104` "the source served exactly the bytes the record holds"
- plain `docprofile/pipeline.mjs:105` "the source is still serving exactly what the record holds"
- plain `docprofile/pipeline.mjs:110` "cannot say: the stack is not recognised confidently enough"
- plain `docprofile/pipeline.mjs:113` "enough to say whether the difference matters"
- plain `docprofile/pipeline.mjs:124` "the substance is the same; only machinery this site rebuilds on every visit differs"
- plain `docprofile/pipeline.mjs:125` "the document is unchanged; only machinery this site rebuilds differs"
- plain `docprofile/pipeline.mjs:132` "the document itself is unchanged; the site around it changed"
- plain `docprofile/pipeline.mjs:133` "the document itself is unchanged; something around it moved, such as navigation"
- plain `docprofile/pipeline.mjs:142` "no content type could be decided"
- plain `docprofile/readtext.mjs:145` "where in the document a reference was read cannot be said"
- plain `docprofile/readtext.mjs:172` "was read on cannot be established from it and is not guessed"
- plain `docprofile/readtext.mjs:179` "reference was read in cannot be established from it and is not guessed"
- plain `docprofile/readtext.mjs:182` "so where in the document a reference was read cannot be said"
- plain `docprofile/readtext.mjs:263` "no text was supplied, so no reading was attempted"
