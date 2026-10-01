# filings (T18)

**Status** · session_01VKxymxaNpmDPoVYbMyJ7no · depth 2 · COMPLETE · handled B5

## Completion (FILINGS #6)

**Entries applied.**
- The publication split's re-points (K651): `filingsOf` registers the available-actions block with `public-read` (its R8; R15); `reads.test.mjs` and `packet.test.mjs` read `publishedCase`, `verifySha`, `publishedList`, `publishedManifest` and `registerEvidenceBlock` from `public-read`. publication's next job may delete its 17-line copy.
- N-A5: R3's addressee arms (blanks `counterparty_organisation`, `counterparty_description` added; a blank the arm does not hold is unfilled naming the arm); R8's packet for an action resting on a premise override (facts say no determination is held); R22 the in-band quartet on approved bytes (filings and communications) and every packet export, by `inbandQuartet`, floors from `strength.projectBar` (K701); R23 `communicationPrepare` (`op=communicationprepare`, table `communication_drafts`, `FIL-` ids, R6/R7 unchanged, listed by R13 marked a communication); R24 the disclosure first on every draft, packet, communication, approved bytes and export; R25 each exhibit's capture grade (provenance's `captureGrade`), co-attestation, and its reading against the kind's venue standard (accepted, contestable, below, undetermined), never a refusal.
- N-A18 / R26: `templateSave` (`op=templatesave`), `filingPrepare({template})`, `templatesFor` (`op=templates`, K701), table `filing_templates`, keyed to the draft's action and purged with it; codes as confirmed in B2.
- The split's share: `clockPropose` read from `action-clocks` (its R2); `dates.mjs`' `deadlineDate` now counts through `action-clocks`' `computeDeadline`, so one rule counts a clock entry's date and a packet's deadline.
- Decided (reported in J1): `filingApprove` and `counselPacketExport` are async (the quartet's hash is crypto.subtle's); the store's dispatch awaits every op. Columns added to existing tables by a guarded `ALTER TABLE` (`FILINGS_COLUMNS`).

**Rows `awaiting stamp` (T19's promotion).** New: C-115.28–C-115.40. `where` only: C-115.3 `ACTION_CLOSED` (`#closed` › `is-action-closed`), C-115.9 `ALREADY_APPROVED` (`#alreadyApproved` › `is-already-approved`).

**Deferred.** Nothing.

**Found in other modules.**
- `affordances` (layer 11): `test/m/affordances/catalogue.test.mjs` "R3 R7 R12: layer 9's 22 mutating ops …" pins the set of layer-9 op names and fails on my three new ops (`communicationprepare`, `templatesave`, `templates`); it needs `NON_ACTS` reasons and rungs for the two acts and `templates` among its reads (J2). `control-plane` needs their op specs (B2: in its START).
- `conformance`: "R10: flagged basis_changed …" fails on `tranche/T18` itself, not through this job.
- `public-read`'s `src/inband.mjs` (still in `publication`'s paths until BOB's edit) is imported here for R22.

**Tests and checks** (on `job/T18/filings` @ f6a59738a9, tranche/T18 merged through B5):
- `node --test bio-plane/test/m/filings/`: 45 pass, 0 fail. Users of filings: escalation 29/0, public-read 65/0, skills 39/0, action-clocks 20/0, actions 61/0; affordances 105/1 (the census above; 106/0 on tranche/T18).
- `format`: 82 modules, 0 failures. `architecture filings`: 13 files, 53 imports, 0 failures. `coverage filings`: 26 of 26 ids named, 0 failures. `ownership filings tranche/T18`: 13 files, 0 failures.

Size (session_01VKxymxaNpmDPoVYbMyJ7no): test runs 26, module lines 1873

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

## J3 · COMPLETE

Every entry applied, B5 included: clockPropose read from action-clocks (its R2), and a packet deadline counted by its computeDeadline. Module tests 45 pass, 0 fail; format, architecture, coverage (26 of 26) and ownership pass. Ready to merge for escalation and action-plans. One test of another module stays red until its own job: affordances' layer-9 op census (J2). Completion, rows awaiting stamp and size in my record.
