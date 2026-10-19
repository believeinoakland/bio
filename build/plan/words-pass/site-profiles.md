# site-profiles: the words check after the conversion (K3949)

Layer 1.

## Plain findings (K3957)

17 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('site-profiles.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `site-profiles/handlers/aspnet-webforms.mjs:76` "page state this site rebuilds on every visit"
- plain `site-profiles/handlers/aspnet-webforms.mjs:95` "an advertising or analytics slot"
- plain `site-profiles/handlers/client-rendered.mjs:26` "an application that builds its pages in the browser"
- plain `site-profiles/handlers/client-rendered.mjs:52` "no links and no prose in the body"
- plain `site-profiles/handlers/client-rendered.mjs:54` "no links and no prose in the body"
- plain `site-profiles/handlers/wordpress.mjs:25` "a page published with WordPress"
- plain `site-profiles/handlers/wordpress.mjs:86` "a version stamp on a design file"
- plain `site-profiles/handlers/wordpress.mjs:88` "an advertising or analytics slot"
- plain `site-profiles/index.mjs:142` "everything around the document itself, such as navigation and footers"
- plain `site-profiles/index.mjs:213` "the source served exactly the same document"
- plain `site-profiles/index.mjs:219` "the document differs and this kind of document is not recognised well enough to say whe..."
- plain `site-profiles/index.mjs:222` "the substance of the document differs"
- plain `site-profiles/index.mjs:225` "the substance is the same; something around it changed, such as navigation or related l..."
- plain `site-profiles/index.mjs:227` "the substance and the appearance are both the same; only machinery this site rebuilds o..."
- plain `site-profiles/index.mjs:257` "a file the page needs in order to look the way the source published it has not been col..."
- plain `site-profiles/index.mjs:259` "everything the page needs to read correctly is held; some decoration is not"
- plain `site-profiles/index.mjs:298` "no handler recognised this document, so it is treated conservatively: nothing is assume..."
