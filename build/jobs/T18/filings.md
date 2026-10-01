# filings (T18)

**Status** · session_01VKxymxaNpmDPoVYbMyJ7no · depth 2 · WAITING ON BOB (J2) · handled B4

## J1 · QUESTION

Three points, my best reading of each in brackets; I carry on with it.

1. **R22's floors.** `inbandQuartet` takes a `bar`; a filing, a packet and a communication are not a published case, so no frozen case bar exists. [The floors are the bar of the project the draft or packet draws on (its determination's project), read through `strength.projectBar` (strength R14), as `review` and `case-authoring` read it; with no determination (an override, a communication) `floorsOf(null)`'s "no floor is declared". This needs `strength` (layer 6) in filings' `uses` in `modules.json`: BOB's edit. Until it lands my architecture check fails on that one import.]

2. **R26's codes** (the job names, BOB confirms). `templateSave`: `MACHINE_CANNOT_SAVE_TEMPLATE`, `TEMPLATE_NAME_REFUSED` (empty, over 200 characters, or a line break), `TEMPLATE_KIND_REFUSED` (not a kind token), then `NO_SUCH_FILING` (the draft absent or unseen, R6's row), `TEMPLATE_FROM_UNAPPROVED`, `TEMPLATE_TEXT_REFUSED` (a member's derivative text empty, over R6's bound, not UTF-8), `TEMPLATE_KIND_TIER3` (the view gives the kind tier 3: R17), `TEMPLATE_NAME_TAKEN`. `filingPrepare({…, template?})` after `TIER3_COUNSEL_PACKET`: `NO_SUCH_TEMPLATE` (named, absent or unseen), `TEMPLATE_KIND_MISMATCH` (a template saved for another kind); and, where the profile holds no template for the kind but the group holds one the viewer may see, `TEMPLATE_NOT_NAMED`, listing them, so `KIND_NO_TEMPLATE` is answered only when neither exists. All C-115.28 onward, `awaiting stamp`.

3. **A template list.** R26 gives no read of the library, so a member cannot find a template to name. [I add `templatesFor({kind?, viewer})` (`op=templates`): the group's templates the viewer may see (a template is seen by whoever may see the project its approved draft drew on, K316), newest first, at most 200, `truncated`. It needs a sentence in R26 and op specs in control-plane (`communicationprepare`, `templatesave`, `templates`; layer 11). If you would rather not add it, I drop it and `TEMPLATE_NOT_NAMED`'s list is the only way to find one.]

Also, for the record (decided, not asked): `filingApprove` and `counselPacketExport` become async, because `inbandQuartet` is (crypto.subtle); the store's dispatch already awaits every op. The approved bytes are [the R24 disclosure,] the text, then an in-band trailer; the quartet's hash is over `JSON.stringify(text, null, 1)`, as the one hasher computes it. Communications are their own table, `communication_drafts`, sharing R6/R7's `FIL-` id space and tables.

## J2 · REPORT

Merged B2–B4 (tranche/T18 @ fa31349f4b in my branch). Every entry is applied except the one that waits on action-clocks:

- **Done, tested, pushed:** the publication split's re-points (registration with `public-read`, the tests' public reads: reads.test, packet.test green); N-A5: R3's addressee arms, R8's packet for an overridden action, R22 the in-band quartet on approved bytes and exports (floors from `strength.projectBar`), R23 `communicationPrepare`, R24 the disclosure, R25 graded exhibits beside the venue's standard; N-A18 / R26 `templateSave`, `filingPrepare({template})`, `templatesFor`. Module tests 45 pass, 0 fail; format, architecture, coverage (26 of 26) and ownership pass.
- **Waiting:** `clockPropose` re-pointed to `action-clocks` (your next CHANGE). `actions` still exports its copy, so R7's `proposed` works meanwhile.

**Merge early?** escalation reads `filingsFor` and `availableActions`, both final. If you want me merged before action-clocks, say so and I post COMPLETE now and do the re-point as a CHANGE after.

**Found in another module (affordances, layer 11):** my three new ops (`communicationprepare`, `templatesave`, `templates`) fail `test/m/affordances/catalogue.test.mjs` "R3 R7 R12: layer 9's 22 mutating ops …", which pins the exact set of layer-9 op names (it passes on tranche/T18). It needs `NON_ACTS` reasons and rungs for the two mutating ops and `templates` among `LAYER9_READS`: affordances' job (layer 11), beside control-plane's op specs. Layer 9 closes red on that one test unless you accept it by name (K651's precedent) or tell me to hold the ops back until then.

Pre-existing, not mine: `test/m/conformance/` "R10: flagged basis_changed …" fails on tranche/T18 as on my branch.

Rows for `awaiting stamp` (T19's promotion): C-115.28–C-115.40 (new: the R23 and R26 codes); C-115.3 `ACTION_CLOSED` and C-115.9 `ALREADY_APPROVED`, `where` only (now `#closed` › `is-action-closed`, `#alreadyApproved` › `is-already-approved`, each minted at one site for its two callers).
