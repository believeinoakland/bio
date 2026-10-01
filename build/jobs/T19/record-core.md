# record-core (T19)

**Status** · session_01Q3pc45D9ZwWbRHBdgAZ8pf · depth 2 · WORKING · handled B1

## J1 · QUESTION

Seven points; my best reading of each, which I am building on now. Points 1–4 decide what other modules see; 5–7 are yours to act on.

1. **R67 (K766) against record-grammar R39.** R39's `checkBundle` throws for one grammar claiming two slots or two grammars claiming one slot, and promotion's gate, inquiry's `checkEntry`, `gate.mjs` and my audit all pass `grammars()` straight to it. Best reading: `grammars()` answers a list `checkBundle` accepts. Each claimed slot is one entry `{module, ids: the slot's ids, arm}`, where `module` is its first claimant. Its arm runs every claimant's arm in registration order, calling each as `arm(ctx, findings, {slot, rest})`: `slot` is the `EXTENSION_ARMS` name, and `rest()` runs the slot's later claimants at that point, once (inquiry-grammar R6's sub-slot for basis-versions R43); claimants not yet run when an arm returns run after it. A registration claiming no slot is one entry as it was registered. With one claimant per slot (every registration today) the list is exactly the registrations, so nothing changes for the three callers. The audit wraps each claimant on its own, so one that throws is one `AUDIT_CHECK_FAILED` (R67, R59).
2. **"module order (membership's MODULE_ORDER)".** record-core uses no membership. Best reading: registration order, which the composition root's construction order makes module order.
3. **`LEGACY_GRAMMARS` at construction (rule 2).** Best reading: record-core exports `registerLegacyGrammars(record)`, importing `LEGACY_GRAMMARS` from legacy-checks, which record-core uses. It registers as `legacy-checks` one grammar over every slot no registration holds at the time, its arm running the matching legacy entry by `slot`. `store.mjs` calls it as the last line of its constructor (§12.2: an import from my path and one line using it). That way capture's C-2.7 and promotion's C-18.6/.7 are never doubled. The audit then calls record-grammar's `checkBundle`, with the same findings as the catalogue's wrapper. The export goes when the catalogue does (rule 1).
4. **R72's purge and capture-requests' lead.** `capture_requests.lead_inquiry` is cleared (an UPDATE, not a delete) by `captureRequestsOf(ctx).clearLead(bundleId)`, which the store calls by name. record-core has no form for it. Best reading: R46 gains a declaration form `{name, keys?, whole?, clears: [columns]}`: a bundle purge sets each `clears` column to NULL where it names the bundle; the whole-store form is unchanged. capture-requests declares it in its L6 job. That is a wording of R46 for you. Until then I am building `recordCoreOps.purge` without the clearing (purge, transact and the proof as R72 says), and the store keeps its own `purge` arm until legacy-store spreads the map (L10, K671), so nothing is lost meanwhile. If you prefer a hook (`onPurge(module, fn)`), say so.
5. **`uses`.** Re-pointing `checkBundle`, `EXTENSION_ARMS` and `createSha256` to record-grammar (R67, R71 and the Uses section already name it) fails the architecture check: `modules.json` gives record-core `["legacy-checks","id-spaces"]`. Please add `record-grammar`.
6. **Striking the "not yet met" marks.** The ownership check refuses any edit to `build/requirements/record-core.md`, which is outside my paths. I will list in my record each R met, with its test, for you to strike.
7. **What stays in `store.mjs`.** The store keeps its seven arms, its `auditPass` with the `route` and `membership` findings and R45's context, `#counts`, and `MINT_LEDGER_LIVE`. They go when provenance, membership, inquiry, publication and ratification register (R68–R70) and legacy-store spreads the map (K671). In `store.mjs` this job only moves `#migrate`'s record share into record-core's `migrate()`, which runs `RECORD_SCHEMA` first (R71), drops `schema.mjs`' interpolation of `RECORD_SCHEMA`, and adds the legacy-grammar line (point 3). New rows: `MINT_SEED_DECLARED` C-102.19 and `MINT_SEED_MALFORMED` C-102.20, the next free numbers. The DEC-49 guard today fails on five record-core sites (helper-built refusals its arm C cannot see, the :970 outcome, `AUDIT_CHECK_FAILED`'s region outside `auditPass`, and `GRAMMAR_MALFORMED` minted at two sites); I am fixing all five (N422). That changes C-102.3's `where` span but not its text.

## J2 · REPORT

For other modules; nothing here is mine to change.

1. **capture: two of its tests go red, both from K766/K775 as adopted** (`test/m/capture/grammar.test.mjs`).
   - `:77` expects a second C-2.7 claim to be refused: `captureOf` throws "refused the information grammar: GRAMMAR_DECLARED". Under R67 as K766 words it, a slot may be claimed by several registrations, so the claim is accepted and nothing throws. The test, and `capture/index.mjs`' `registerGrammar` if it is meant to stay loud about a shared slot, are capture's to change.
   - `:115` compares the audit with capture's grammar against an audit with no registration, which used to fall back to the catalogue's C-2.7 arm. Now the audit runs only registered grammars, as rule 2 says; the catalogue's arms come in through `registerLegacyGrammars` (K775 (3)). In the "without" world the test needs `registerLegacyGrammars(record)`, which fills C-2.7 from `LEGACY_GRAMMARS`.

   Both are capture's (L3). The other 8 failures in `test/m/` are the same 8 on `tranche/T19` before my change (membership `module-order`, `t9-notice-sight-bounds`, promotion `registry.test.mjs`:57, query-language ×5).
2. **capture-requests (L6):** declare `capture_requests` as `{name, keys: ["target"], clears: ["lead_inquiry"]}` (R46's form, K775) and drop `clearLead`. After that, `recordCoreOps.purge` clears the lead with no call by name.
3. **For the registering modules (R68–R70):**
   - provenance: `registerAuditFinding("provenance", "route", (page) => …)`. `page` is `{bundles: [{bundleId, type, state}], after, last}`.
   - membership: the same, under the key `membership`.
   - inquiry and publication: `registerAuditContext` for the earned and published registries.
   - ratification and publication: `registerMintSeed` for `cases`, `case_documents`, `published_cases` and `published_case_members`.

   Then the store's `auditPass` and `MINT_LEDGER_LIVE` can go, and legacy-store spreads `recordCoreOps(record, url, body, {sight: viewerPredicate})` (K671).
4. **Generated artifact staled:** `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`; inputs `src/record-core/*`, `src/store.mjs`, `src/schema.mjs`), for the layer close's regeneration.
5. **DEC-49 guard:** record-core's five failing sites are fixed (N422). Still red and not mine: C-102.1–.3 are defined in both `RECORD_CORE_CHECKS` and the catalogue's `REGISTRATION_CHECKS`; they clear when the catalogue's copy goes (with `REGISTRATION_CHECKS`, promotion L2).
