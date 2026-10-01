# filings (T18)

**Status** · session_01VKxymxaNpmDPoVYbMyJ7no · depth 2 · WORKING · handled B0

## J1 · QUESTION

Three points, my best reading of each in brackets; I carry on with it.

1. **R22's floors.** `inbandQuartet` takes a `bar`; a filing, a packet and a communication are not a published case, so no frozen case bar exists. [The floors are the bar of the project the draft or packet draws on (its determination's project), read through `strength.projectBar` (strength R14), as `review` and `case-authoring` read it; with no determination (an override, a communication) `floorsOf(null)`'s "no floor is declared". This needs `strength` (layer 6) in filings' `uses` in `modules.json`: BOB's edit. Until it lands my architecture check fails on that one import.]

2. **R26's codes** (the job names, BOB confirms). `templateSave`: `MACHINE_CANNOT_SAVE_TEMPLATE`, `TEMPLATE_NAME_REFUSED` (empty, over 200 characters, or a line break), `TEMPLATE_KIND_REFUSED` (not a kind token), then `NO_SUCH_FILING` (the draft absent or unseen, R6's row), `TEMPLATE_FROM_UNAPPROVED`, `TEMPLATE_TEXT_REFUSED` (a member's derivative text empty, over R6's bound, not UTF-8), `TEMPLATE_KIND_TIER3` (the view gives the kind tier 3: R17), `TEMPLATE_NAME_TAKEN`. `filingPrepare({…, template?})` after `TIER3_COUNSEL_PACKET`: `NO_SUCH_TEMPLATE` (named, absent or unseen), `TEMPLATE_KIND_MISMATCH` (a template saved for another kind); and, where the profile holds no template for the kind but the group holds one the viewer may see, `TEMPLATE_NOT_NAMED`, listing them, so `KIND_NO_TEMPLATE` is answered only when neither exists. All C-115.28 onward, `awaiting stamp`.

3. **A template list.** R26 gives no read of the library, so a member cannot find a template to name. [I add `templatesFor({kind?, viewer})` (`op=templates`): the group's templates the viewer may see (a template is seen by whoever may see the project its approved draft drew on, K316), newest first, at most 200, `truncated`. It needs a sentence in R26 and op specs in control-plane (`communicationprepare`, `templatesave`, `templates`; layer 11). If you would rather not add it, I drop it and `TEMPLATE_NOT_NAMED`'s list is the only way to find one.]

Also, for the record (decided, not asked): `filingApprove` and `counselPacketExport` become async, because `inbandQuartet` is (crypto.subtle); the store's dispatch already awaits every op. The approved bytes are [the R24 disclosure,] the text, then an in-band trailer; the quartet's hash is over `JSON.stringify(text, null, 1)`, as the one hasher computes it. Communications are their own table, `communication_drafts`, sharing R6/R7's `FIL-` id space and tables.
