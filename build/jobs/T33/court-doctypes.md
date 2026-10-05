# court-doctypes (T33)

**Status** · session_01UL3CanLegQc1bhXUiyGG9N · depth 2 · WORKING · handled B2

## Completion (COURT-DOCTYPES #1)

**Code:** `court-doctypes/` (`index.mjs`, `common.mjs`, `courtlistener.mjs`, `cpuc.mjs`, `ecourt.mjs`). **Tests:** `court-doctypes/test/` (`readers.test.mjs`, `assess.test.mjs`, `helpers.mjs`, `fixtures/` with its README). **Final `uses`:** docprofile, id-spaces, jurisdictions (the tests' test and first profiles, R15); court-citations is not used and can be dropped (K1505 (7)). For BOB at merge: `{"paths": ["court-doctypes/"], "tests": ["court-doctypes/test/"], "uses": ["docprofile", "id-spaces", "jurisdictions"]}`.

**Entry applied: T33-16**, every id R1–R17, on the readings K1514 confirmed (B2):
- Three content types (`courtlistener_docket`, `cpuc_proceeding`, `ecourt_roa`), contract MEMBERSHIP, and `registerCourtTypes(register)`, which hands each to docprofile's seam in that order and reports a refusal without throwing (plane wires it after roster-reader's types, before `generic`).
- R1/R15: CERTAIN only with the address and the structure. The address is matched through `id-spaces.systemOf` against `view.systems` entries whose `origin` is the type key; on structure alone the answer is LIKELY, with why. A sign-in page, an error page or a search page at the right address is not matched, and says which it is (tested on CourtListener's and the eCourt portal's real sign-in pages, CourtListener's real 404, and the eCourt and CPUC search pages).
- R2: `ecourt_roa` needs `ctx.origin === "member"` (or `{kind: "member"}`). Any other origin is refused in `detect` and in `parse` (no rows, no parties), with K1492's why.
- R3: `number` is `id-spaces.recognise(view, "proceeding", number_as_written)`, or null with why. `docket_number_core` is null with why (the HTML page does not state it). A CourtListener status is given only as the page writes it ("Date Terminated: …"), otherwise null with why. The CPUC card names no forum in its text, so `forum_as_written` is null with why.
- R4: CourtListener's Assigned To and Referred To; the CPUC card's Filed By, and each Staff line with its role and its "Assigned" date as written; the eCourt parties table. Roles are only as written.
- R5/R6: CourtListener rows are `div#entry-n` and `div#minute-entry-id`, keyed `entry:<n>` (`entry_id` the number). An unnumbered row is keyed by date and text, or by its documents' descriptions when it has no text (one such row is on page 2), and its `entry_id` is null. The CPUC key is the composite of date, type, filer and description plus the document link. The eCourt key is the date and the row's order within that date. Twins on one reading are told apart by their order (`#2`). Each document link has its label as written; a fee-bearing one (a purchase, or a price above $0) is marked `fee` and never followed. Rows also carry `documents` (CourtListener's document labels and descriptions) and, for docprofile, `entities`.
- R7: every `ecourt_roa` reading is `provisional: true`, and its `key_basis` says why.
- R8: the page as stated ("Page n of m", APEX's "first - last of total"). `complete` is true only for the register's only page or every row of its total.
- R9: `sealed` / `unsealed` / null from the row's own words. A motion or request to seal states nothing sealed; a granted one, or "SEALED", does.
- R10–R12: `assess` (shared). Page order, white space, markup and the "Last Updated" stamp give nothing. Added rows give `item_added`. A gone row gives `delisted` only when both readings are complete, otherwise `possibly_delisted`. A held row with a field changed gives `outcome_changed` naming the row and the field. The status gives `status_changed`; the caption, a party or another proceeding field gives `item_changed`. Under the CPUC composite key, an edited key field gives the gone row and the added row, each naming the other as `counterpart`. No row, a failed reading, different proceedings or different registers give `meaningful: null` with why, never a mass removal. Two CPUC card readings (no register) compare the proceeding only.
- R13/R14/R17: pure (tested with the clock and `fetch` throwing). Every no says why. A position comes only from `ctx.locate`.

**Fixtures (R16):** captured by me on 2026-10-05 (README, with addresses): CourtListener 4214664 pages 2 and 4 (127 rows: 57 unnumbered, one sealed, two unsealed), the CPUC A2106021 card and documents page 1 (100 of 590), the real negative pages, and the FICTIONAL eCourt register (marked so, built from the portal's stated fields, its number in the current Superior Court form).

**Deferred, with why:** none in this module. The live CERTAIN path waits on profile data. K1514 assigned it to JURISDICTIONS: the three `systems` entries under these keys, and the `proceeding` forms. My tests set both as fixture data over `combine` of each profile, replacing whatever the profile holds under these keys, so they do not move when that data lands.

**Found in other modules (REPORT):**
- **id-spaces (T33-9):** until its `proceeding` space is built (R1), `recognise(view, "proceeding", …)` answers null. My test "R3 R16 R17" fails on `bio-plane/src/idspaces.mjs` as it stands on `tranche/T33`, and nothing else does. With that one space added locally (not committed), all 24 pass. It goes green once id-spaces merges, which comes before me in L1's order.
- **docprofile:** the seam is not yet built (its J1), so no test of mine runs the types through `doctypeFor` or `assess` end to end; `registerCourtTypes` is tested with a stub `register`.
- **following / site-profiles:** as my Suggestions say, a new register row is `item_added` (ROUTINE), so a register that only grew is not `meaningful`.

**Tests and checks run** (with the module's `modules.json` row set as above, locally, uncommitted):
- `node --test court-doctypes/test/`: tests 24, pass 23, fail 1 (R3, waiting on id-spaces' `proceeding` space, above). With that space in place locally: tests 24, pass 24, fail 0.
- No layer tests (manifest names none). I changed no service anyone uses.
- `checks/format.mjs`: 126 modules, 125 requirements files; 0 failures.
- `checks/architecture.mjs . court-doctypes`: 19 product files, 17 relative imports; 0 failures.
- `checks/coverage.mjs . court-doctypes`: 17 of 17 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs . court-doctypes tranche/T33`: 0 failures (re-run after commit below).

Size (session_01UL3CanLegQc1bhXUiyGG9N): test runs 12, module lines 873

## J1 · QUESTION

Four points where my requirements leave a choice. I am building on my best reading of each now; only (1) and (2) change what a profile or a caller must supply.

1. **Where the "publishing-system address shapes, under this module's keys" live (R1, R15).** `jurisdictions` R6's vocabulary is a closed set with no key for them, and T33-2's entry adds none. **Best reading:** they are `view.systems` entries (jurisdictions R4: `hosts`, optional `path`) whose `origin` is the type's key (`courtlistener_docket`, `cpuc_proceeding`, `ecourt_roa`), and I match a locator through `id-spaces.systemOf(view, locator)` (its R13), so the address is the view's and never code's. No profile holds such entries today, and T33-2 does not add them, so in production nothing reaches CERTAIN until a profile does: on structure alone `detect` gives LIKELY, with why. **Asks:** confirm the shape; and say who adds the three systems (and the measured `proceeding` forms of `courts-workbooks.md` §1) to the first and test profiles — the jurisdictions job (a CHANGE to T33-2), or a later entry. My tests build their view as `combine` of the test profile and of the first profile, each extended in the test with these entries as fixture data, labelled so.
2. **`ctx.origin` (R2).** Not yet in docprofile's ctx (my Suggestions). **Best reading:** `ctx.origin` is the string `member` for a member's own capture made in their own browser; anything else (absent, `fetch`, `daemon`) is not a member's capture and `ecourt_roa` does not match, with K1492's why. Name the value if `docprofile`/`acquisition` will spell it otherwise.
3. **CourtListener's unnumbered entries (R6).** On the page they are `div#minute-entry-<n>` with an empty number cell; `<n>` is CourtListener's own row id, not an entry number. **Best reading:** `entry_id: null` for them (R6 "the entry number CourtListener assigns"), keyed by date and text as R6 says; so only numbered entries become events (`events` R38). Two unnumbered rows with the same date and text on one reading are told apart by their order among those twins (stated in `key_basis`); likewise identical CPUC composites.
4. **`docket_number_core` (R3).** The docket HTML page does not carry it (only the API JSON does; checked on 4214664's pages). **Best reading:** `proceeding.docket_number_core` is given as written when the capture states it, else `null` with why ("the docket page does not state it; the API does").

Also for the record: I captured the fixtures myself today (CourtListener 4214664 pages 2 and 4, which hold unnumbered, sealed and unsealed rows; CPUC A2106021 card and documents page 1, "1 - 100 of 590"); `uses` at COMPLETE will be docprofile, id-spaces and jurisdictions (tests: the test and first profiles, R15); court-citations is not used.

## J2 · REPORT

Found in other modules (also in my record's Completion):
1. **id-spaces (T33-9):** `recognise(view, "proceeding", …)` answers null until its `proceeding` space is built, so my test "R3 R16 R17" is red on `tranche/T33` as it stands, and that is my only red. With that one space added locally (uncommitted), all 24 pass. It clears once id-spaces merges (it precedes me in L1).
2. **docprofile:** its seam is not built yet (its J1), so my types are tested through a stub `register`, not through `doctypeFor`/`assess`. plane wires `registerCourtTypes(registerDoctype)` after roster-reader's types, before `generic`.
3. **following / site-profiles** (my Suggestions, BOB's): a new register row is `item_added` (ROUTINE), so a register that only grew is not `meaningful`.
