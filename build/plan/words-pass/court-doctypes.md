# court-doctypes: the words check after the conversion (K3949)

Layer 1. 2 findings of `checks/words.mjs` (civicos-process ebcc1a3) on tranche/T51 after the pass; each line: arm, file:line, the check's excerpt, and the codemod's reason it was not converted (blank: the codemod did not take that kind). Fix every one in your job (K3919): a sentence people read is read through `word(key)` (a words.json row) or `localize(id, en)` (setup-words R14), a test asserts the key or compares with `word`/`localize`, never the text; a hand-list is assembled from each module's own declaration; a signed text changes only as a new version (K1333).

- inline `court-doctypes/common.mjs:339` "; the row added under key {} is likely this row with a key field ed..."
- inline `court-doctypes/common.mjs:348` "; it is likely the row no longer listed under key {} with a key fie..."

## Plain findings (K3957)

25 lowercase, unpunctuated strings of 5+ words that the check's `plain` arm (civicos-process 27aa50e) counts. For each, judge: a sentence a member can read is read through `localize('court-doctypes.<file stem>.<slug>', en, vars)` (or `word(key)` where a row exists), and a test that copies it compares with `localize`/`word`; text no member ever reads (a developer, diagnostic or wire string) is listed in a REPORT to BOB with why, and BOB hands it to the design's `unkeyed` list (K3944). None is left unjudged.

- plain `court-doctypes/common.mjs:142` "its address could not be read"
- plain `court-doctypes/common.mjs:171` "the page states no proceeding number"
- plain `court-doctypes/common.mjs:231` "the page states no pagination, so whether it holds every row of the register is not est..."
- plain `court-doctypes/common.mjs:247` "no register row could be read on this page"
- plain `court-doctypes/common.mjs:294` "the two readings are of different kinds of register"
- plain `court-doctypes/common.mjs:301` "no register row was read in either reading"
- plain `court-doctypes/common.mjs:311` "the proceeding's caption as written changed"
- plain `court-doctypes/courtlistener.mjs:87` "an unnumbered entry with neither a date nor a text, so it has no key"
- plain `court-doctypes/courtlistener.mjs:121` "the docket page states no status; a terminated case shows a Date Terminated field, and ..."
- plain `court-doctypes/courtlistener.mjs:143` "the page holds no CourtListener docket header"
- plain `court-doctypes/courtlistener.mjs:146` "reading by their order among themselves"
- plain `court-doctypes/cpuc.mjs:36` "the documents report (Filing Date, Document Type, Filed By, Description)"
- plain `court-doctypes/cpuc.mjs:77` "the page names no forum in its text (only its banner image does), so none is given"
- plain `court-doctypes/cpuc.mjs:81` "the documents report states only the proceeding's number; its caption, status, category..."
- plain `court-doctypes/cpuc.mjs:103` "the page holds no documents report, so it lists no register rows"
- plain `court-doctypes/cpuc.mjs:135` "the report states no pagination, so whether it holds every row of the register is not e..."
- plain `court-doctypes/cpuc.mjs:141` "the page holds neither the proceeding card nor its documents report"
- plain `court-doctypes/cpuc.mjs:145` "of these reads as one row gone and one added, reported together"
- plain `court-doctypes/ecourt.mjs:21` "an eCourt register of actions"
- plain `court-doctypes/ecourt.mjs:22` "an account-gated register is read only from a member's own capture"
- plain `court-doctypes/ecourt.mjs:54` "an eCourt register of actions"
- plain `court-doctypes/ecourt.mjs:55` "a Register of Actions table (date, description)"
- plain `court-doctypes/ecourt.mjs:139` "the page holds no Register of Actions table with a date and a description"
- plain `court-doctypes/ecourt.mjs:142` "are not yet verified on a member's capture"
- plain `court-doctypes/index.mjs:24` "no register function was given"
