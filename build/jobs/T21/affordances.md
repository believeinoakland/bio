# affordances (T21)

**Status** · session_01LvzWGqxgNTP61BdSTnZm48 · depth 2 · COMPLETE · handled B1

AFFORDANCES #12, T21 layer 11. Started from `tranche/T21` @ e8749fa859 (merged into `job/T21/affordances` at start).

## Entries applied

- **(1) R30 (K921, K922 (3), K927).** `RUNGS` grades `templateretire` and `factconfirm` `reasoned`; `TEMPLATE_REASON_REFUSED` and `FACT_HOW_REFUSED` join `JUSTIFICATION_REFUSALS` (R19). `RUNG_ABSENT` holds `templatereviewgrant` and `templategrantrevoke` (ground `credential`, as `reviewgrant`, `reviewrevoke`) and K921's seven (`templatedraft`, `templaterevise`, `templatepropose`, `templatesubmit`, `templatereview`, `templatecomment`, `templateapprove`; ground `undetermined`, R27's rule), so R27's count is 78. `NON_ACTS` gives each of the fifteen ops its reason, R30's words: the ten template acts "template-directed: …"; `templatereview`, `templatecomment`, `templateread`, `templatecomments` add "reached also through a review grant's door"; `factconfirm` "fact-directed: …"; the reads `templates`, `templateread`, `templatecomments`, `factstatus`, `factsdue` "read: …". `VOCABULARIES` gains `template_states`, `template_uses`, `template_review_outcomes` (filing-templates' `TEMPLATE_STATES`, `TEMPLATE_USES`, `REVIEW_OUTCOMES`) and `local_fact_acts`, `local_fact_statuses` (local-facts'), each the owner's own object (R4). `templatesave`'s rows stay; their sentences now say filings R32's act (a template draft from an approved filing), not R26's library; the NON_ACTS comment that said `templates` carries no `NEEDS` row is corrected.
- **K992.** `catalogue.test.mjs`'s layer-9 test is re-keyed: `templates` left filings' op map, so it now reads 41 writes, 20 reads, 61 ops. A new R30 test is keyed to `filingTemplatesOps` and `localFactsOps`.
- **(2) N463's share.** `plane.test.mjs` stands the plane up from `src/plane/index.mjs` (the scriptPath and the script). Green before (132/133, the one red being K992's) and after (138/138).
- **(3) N469.** Re-worded in `affordances.mjs`: :2071 now points to R20's drive in `plane.test.mjs` (with `sourceconsent` and `contradictionresolve` at their own modules). :2090 stays as provenance ("found when the old `d311-roster-affordances` suite …") and says R20's drive holds it now. :2378 now points to the R18 roster test, which measures an owner of one project being refused on another they only joined. :2540 drops `surface-registry.test.mjs`. My re-scan found eight more live mentions of the deleted `rung-ladder.test.mjs` (:33, :55, :406, :453, :741, :856, :900, :1852 at HEAD). Each now names what proves the claim today: `unaccounted` (R12) for the totality, and the R19 tests for the backing and the `terminal` rung. Kept as provenance: `divide.test.mjs` ("was caught by", still exists), `conclude-project-arm.test.mjs` (still exists), and `repair-reachability` in the REC-72 history. No note names "the battery".
- **Not yet met: T21 marks this job meets:** R30. Tests: `catalogue.test.mjs` "R30 R2 R3 R12 …", "R30 R7 …", "R30 R19 …", and R2, R4, R19 and R27 extended; `backing.test.mjs` "R19 R30: templateretire …" and "R19 R30: factconfirm …", both driven at the owning modules' interfaces over their fixtures. R12's totality holds with the new ops (the "R3 R12" consistency test, and the R30 test with the control plane's rows for them).

## Deferred

None.

## Found in other modules (REPORT J1)

1. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`), from my change under `bio-plane/src/`.
2. **op-declarations / control-plane (rule 3's accepted red).** R30 gives the five reads (`templates`, `templateread`, `templatecomments`, `factstatus`, `factsdue`) `NON_ACTS` reasons. So `unaccounted` reads them as gated: each needs a `NEEDS` row, or it reads `stale`. Today `templates` was an ungated read (it had no `NEEDS` row under filings). The ten template writes and `factconfirm` need mutating, gated rows.
3. **No test runs R12 against the real table.** Nothing in `bio-plane/test` calls `unaccounted` with the control plane's real op table (grep: only `test/m/affordances/` calls it, with constructed tables). My notes used to point to `rung-ladder.test.mjs`, which T20 deleted, so DEC-8/FW-14's totality over the live table is unmeasured. My suggestions say the control plane carries it (convention 2), but `control-plane.md` does not name it. A control-plane (or plane) test calling `unaccounted(table)` and expecting it empty would close this; my module cannot, because control-plane is later in the order.
4. **local-facts, possible flaw (R1, R5).** `localFactsOps.factconfirm` passes `...body` to `factConfirm`, so `by` comes from the request body, not a stamp. R1's Terms say `by` is the control plane's stamp. Unless control-plane writes `by` into the body for this route, a caller could name another member as `by`; a machine credential naming a member would pass `MACHINE_CANNOT_CONFIRM` (R5). `filingTemplatesOps` reads `author` from the query for the same reason ("a caller's own copy never wins").
5. **control-plane's tests** fail 2 of 93 on `tranche/T21` with and without my change ("R43, R22: every code decorated …" and "R22 (K585 (1)): CHECK_FAMILIES is total …"; filing-templates' and local-facts' new families). Not mine.

## Tests and checks

- `node --test test/m/affordances/*.test.mjs` (in `bio-plane/`): **138 pass, 0 fail** (before: 132 pass, 1 fail, K992's accepted red).
- Modules that use affordances: tasks 71/0, queue 76/0, op-declarations 17/0, plane 28/0; control-plane 91/2, identical without my change (item 5). `build/manifest.md` names no layer tests.
- `format`: 86 modules, 84 requirements files, 0 failures. `architecture affordances`: 13 product files, 99 relative imports, 0 failures. `coverage affordances`: 30 of 30 live ids named by a test, 0 failures. `ownership affordances tranche/T21`: 5 files changed, 0 failures.

Size (session_01LvzWGqxgNTP61BdSTnZm48): test runs 8, module lines 3158

## J1 · REPORT

Found while applying B1. Details in my record, "Found in other modules".
(1) Stale artifact: `bio-plane/dist/bio-plane.bundled.mjs` (not_product), from my change under `bio-plane/src/`.
(2) op-declarations / control-plane (rule 3): R30 gives `templates`, `templateread`, `templatecomments`, `factstatus` and `factsdue` NON_ACTS reasons, so each needs a NEEDS row (gated) or it reads `stale`; `templates` had none under filings. The ten template writes and `factconfirm` need mutating, gated rows.
(3) No test anywhere runs `unaccounted` (R12) against the control plane's real op table. Only my tests call it, with constructed tables. The deleted `rung-ladder.test.mjs` used to do this, so DEC-8/FW-14's live totality is unmeasured today. A control-plane or plane test asserting `unaccounted(table)` empty would close it; affordances cannot, since control-plane comes later.
(4) local-facts, possible flaw against its R1/R5: `localFactsOps.factconfirm` spreads the request body into `factConfirm`, so `by` is the caller's, not a stamp. Unless control-plane overwrites it, a machine naming a member passes MACHINE_CANNOT_CONFIRM. (filing-templates reads `author` from the query.)
(5) control-plane fails 2 of 93 on tranche/T21 with and without my change (R43/R22 decorated codes; R22 CHECK_FAMILIES total). Not mine.

## J2 · COMPLETE

AFFORDANCES #12 complete on `job/T21/affordances` @ c148498b82. Record: `build/jobs/T21/affordances.md`.
Applied: (1) R30: templateretire and factconfirm `reasoned`, their two codes in JUSTIFICATION_REFUSALS; the grant pair `credential`; K921's seven `undetermined` (R27 count 78); NON_ACTS reasons for all fifteen ops, reads included; five vocabularies, each the owner's object. templatesave's rows stay, re-worded to filings R32. K992: the layer-9 test is re-keyed (41 writes, 20 reads); a new R30 test is keyed to filing-templates' and local-facts' op maps. (2) N463: plane.test.mjs stands up from src/plane/index.mjs, green before and after. (3) N469: :2071, :2378, :2540 re-worded, and :2090 kept as provenance, now pointing to R20's drive. Eight more live mentions of the deleted rung-ladder.test.mjs re-worded to `unaccounted` (R12) and the R19 tests.
Not yet met marks met: R30.
Tests: affordances 138/0 (before 132/1, K992's red). Users: tasks 71/0, queue 76/0, op-declarations 17/0, plane 28/0, control-plane 91/2 (same without my change). format, architecture, coverage (30/30), ownership: 0 failures.
Stale: bio-plane/dist/bio-plane.bundled.mjs. REPORT J1 has the findings in other modules.
