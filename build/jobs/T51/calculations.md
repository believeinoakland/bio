# calculations (T51)

**Status** · session_01Tcs5UBSYhkZ5nthcyxpECc · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Completion of T51-192 (calculations, words). Branch job/T51/calculations @ 635ae7444c (merged tranche/T51 first, no rebase).

**Entries applied.** The 17 findings of build/plan/words-pass/calculations.md, each by the words rule:
- Copies of an existing row now read through word(): calculations.body_measured (application.mjs), calculations.why.entity (index.mjs), calculations.obligor_office and calculations.proceeding_arose (patterns.mjs), calculations.says.per_period_measured (application.mjs; the design row's spelling "labeled" now applies), calculations.why.capture_alone_reads (index.mjs, grade filled).
- Plain or inline sentences with no row are localize(id, en): calculations.application.the_share_of_each, calculations.index.an_id_space_normalises, calculations.index.an_organisation_and_a_date, calculations.index.the_change_is_a_held, calculations.tables.a_table_schema_is.
- R3 (tablesAt, and rosterRows' not-read reason): a keyed civil-time why is read through reasonText, so the vintage reason names its cause in words (was "[object Object]"). R3's test is green.
- Test copies: four assertion messages that restated a product sentence were dropped (analysis x2, money, registrations, application); the copied NO_EVIDENCE_STORE detail in tables.test.mjs compares with localize(id, en) by equality, as connection-grammar's tests do.
- Wording choice for BOB to confirm: the NO_CHANGE detail was "the change is {standard} or {date: YYYY-MM-DD}"; localize fills {standard} as a placeholder, so it now reads "the change is a held standard's version or a date (YYYY-MM-DD)". No row existed; no test asserted the old text.

**Deferred.** None within T51-192.

**Found in another module.** None to route. Two words-check hits in case-checker and case-grammar are their modules' (not touched).

**Red, not in the entry, pre-existing at baseline.** R32 freezeUses (application.test.mjs:73, "relationships names the direct ties valid at the act's when"): expected "contract;former_employment" for the act's relationships, got "" (no tie found). Same failure before my change. Not named in rule 5; I did not diagnose it (the fixture uses connection-grammar's default registry, so the cause may sit in lines' owner registration or #ties). BOB to route.

**Checks (civicos-process checks, product /home/user/bio).**
- format: 175 modules, 174 requirements files; 0 failures
- architecture calculations: 15 product files, 70 relative imports; 0 failures
- coverage calculations: 41 of 41 live requirement ids named by a test; 0 failures
- ownership calculations tranche/T51 job/T51/calculations: 10 files changed by calculations (nine sources and tests, plus the job record); 0 failures
- words calculations: 0 failures (was 17)
- setup-words build --check: rows.mjs is stale (expected; BOB regenerates at layer close); no refusal naming calculations
- run.mjs (whole repo): no failure naming calculations; the others are other modules' words findings (3784 across 174 modules, not mine)
- module tests, test/m/calculations (57): before 55 pass, 2 fail (R3, R32); after 56 pass, 1 fail (R32, the baseline red above)

Size (session_01Tcs5UBSYhkZ5nthcyxpECc): test runs 3, module lines 3403
