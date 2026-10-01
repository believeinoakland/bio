# record-core (T19)

**Status** · session_01Q3pc45D9ZwWbRHBdgAZ8pf · depth 2 · COMPLETE · handled B1

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

## J3 · COMPLETE

**Entries applied** (`build/plan/current.md` L2 record-core; draft-T19 and the refresh; B1, B2/K775), on `job/T19/record-core` @ 833e9b3334:
- **R67 (K766, K775 (1)–(2)):**
  - `registerGrammar` validates against record-grammar's `EXTENSION_ARMS`, re-pointed from the catalogue.
  - A registration may claim several whole slots, and a slot may be claimed by several registrations. Part of a slot is `GRAMMAR_MALFORMED`. A held id outside a shared slot, or a module's second registration, is `GRAMMAR_DECLARED`.
  - `grammars()` answers a list `checkBundle` accepts. A shared slot is one entry, whose claimants run in registration order with `{slot, rest}`. A lone claimant comes back as it was registered.
  - **N422:** an acceptance is `{ok: true, module, ids}`, with `ok` first. The guard's :970 outcome is gone.
- **Rule 2 (K775 (3)):** `registerLegacyGrammars(record)` registers `LEGACY_GRAMMARS` as `legacy-checks` over the unheld slots. `store.mjs` calls it as its constructor's last line. The audit (R18) calls record-grammar's `checkBundle` with `grammars()`, with findings identical to the catalogue wrapper's (tested).
- **R68, R69:** `registerAuditFinding` and `registerAuditContext` go through `registerAuditCheck`'s one door, so each of C-102.1 and .2 is minted at one site. Findings come back under their keys. A finding, context or claimant that throws is `AUDIT_CHECK_FAILED` (C-102.3), built in `auditPass`' own region.
- **R70, R40:** `registerMintSeed`, with new rows `MINT_SEED_DECLARED` C-102.19 and `MINT_SEED_MALFORMED` C-102.20. `seedMintLedger` also reads the registered sources.
- **R71:** `migrate()` runs `RECORD_SCHEMA` itself, then the manifest columns (before and after), `project`, the `classification` drop and the alias normalisation (record-grammar's `LEGACY_TYPE_ALIASES`).
  - `store.mjs`' `#migrate` calls it first.
  - `schema.mjs` no longer interpolates `RECORD_SCHEMA`.
  - The store's copies of those steps are removed: 3 lines added, 31 removed.
- **R72, R73:** `recordCoreOps(record, url, body, {sight})` holds `allocid`, `lease`, `snapkeycensus`, `digestcensus`, `stats`, `audit` (sight-gated, `total`, no page ids, fail closed) and `purge` (one transact, the proof before and after, R72's 33 `removed` keys). The store keeps its arms until legacy-store spreads the map (K671).
- **R46 (K775 (4)):** the `clears` declaration form, applied inside a bundle purge's transaction.
- **R34, R37, R44 (N426), record-core's share:** `project` is recorded as given, answered by `bundleInfo` and fenced by in SQL. Promotion writes it (its job).
- **Catalogue re-points:** `index.mjs` reads `checkBundle`, `createSha256`, `EXTENSION_ARMS` and `LEGACY_TYPE_ALIASES` from record-grammar. Only `LEGACY_GRAMMARS` stays, and it goes at rule 1. The test reads record-grammar; its one catalogue read is the rule-2 oracle, by dynamic import.
- **DEC-49 guard (N422 / N242 share):** record-core's five failing sites are fixed. `refusedAs` became `rowRefusal`, so the guard's arm C sees it.

**Rs met, with their tests, for BOB to strike** (`test/m/record-core/record-core.test.mjs`):
- R18: "R67 R18 (rule 2) …" and "R18 R45: auditPass runs the check catalogue …"
- R34, R37, R44: "R34 R37 R44 (N426) …"
- R40: "R70 R40 …"
- R45: "R69 R45 …"
- R46 (`clears`): "R46 R22 R72 (K775) …"
- R67: "R67 (K766, N422) …", "R67 R59 R18 …", "R67 R18 (rule 2) …"
- R68: "R68: a registered finding …"
- R69: "R69 R45 …"
- R70: "R70 R40 …"
- R71: "R71: migrate runs RECORD_SCHEMA …"
- R72: "R72: recordCoreOps holds seven ops …" and "R72 R22 R24 R64: op=purge …"
- R73: "R73 R19: op=audit is gated …"

R64's own mark ("moved in record-core's next job") was met in T18 (K650) and can go too.

**Deferred:** none of my own. For other modules (capture's two tests, capture-requests' `clears` declaration, the R68–R70 registrations, the stale plane bundle, the catalogue's C-102.1–.3 copies): J2.

**Tests and checks:**
- `node --test bio-plane/test/m/record-core/`: 90 pass, 0 fail.
- Whole `bio-plane/test/m/`, every module that uses record-core: 4,344 tests, 4,314 pass, 10 fail. 8 of the 10 fail identically on `tranche/T19` (measured in a worktree at origin/tranche/T19: 12 fail there, the 8 plus 4 of that worktree's own setup). The 2 new ones are capture's (J2 §1).
- Layer tests: none (manifest).
- `civicos-ui/check-refusal-codes.mjs`: no record-core failure. It is still red on other modules' rows, as on the base: 104 FAIL lines against the base's 109.
- `node checks/format.mjs`: 0 failures.
- `architecture.mjs bio record-core`: 0 failures.
- `coverage.mjs bio record-core`: 73 of 73 live ids, 0 failures.
- `ownership.mjs bio record-core tranche/T19`: 0 failures. legacy-store: 3 lines added (the import, `registerLegacyGrammars(recordOf(ctx));`, `recordOf(this.ctx).migrate();`), 31 removed.

Size (session_01Q3pc45D9ZwWbRHBdgAZ8pf): test runs 12, module lines 1686
