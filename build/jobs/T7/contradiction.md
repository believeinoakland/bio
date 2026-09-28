# contradiction (T7)

**Status** · session_01CNWDMUKyWAYEbbdCmSKxyK · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

**Read contracts for the pairing's joins (map §3: "each to a service or a stated read contract, BOB decides which").**

The pairing (R5–R11) must stay bounded in SQL, one statement per key (and per K3 arm) reading one row past the bound, with the viewer gate compiled into the same statement (R7's observed `truncated`; D-365, `derivation-bounds`). That cannot be done through per-row services, so my best reading is: contradiction joins the tables below in its own SQL, and each owner states them as a read contract, as record-core R37, content R45 and extraction R58 do. None of the owners' Provides states them today. I am building on this reading now; nothing here is written, only read.

Proposed Provides text, one line per owner:

- **inquiry** (new R): "The table `inquiry_basis` and its columns `bundle_id`, `ord`, `role`, `target_id`, `content_id` and `note`, and the column `bundles.inquiry_subject_entity` (the inquiry's subject entity as R12 records it, null or empty for none), are a stated read contract: a later module may join them in its own SQL (`contradiction`'s K1, K4 and its ladder), and this module changes none of their names, types or meanings without a change to this requirement. Every write to them stays this module's."
- **basis-versions** (new R): "The tables `inquiry_basis_versions` (`bundle_id`, `name`, `state`, `hidden`, `claim`) and `inquiry_basis_version_legs` (`bundle_id`, `name`, `ord`, `target_id`, `target_type`, `content_id`) are a stated read contract on the same terms (`contradiction`'s K2, K3, K4 and its ladder)."
- **entities** (new R, its own Suggestion made Provides): "The table `resolutions` and its columns `capture_sha`, `entity_id` and `established` (1 exactly when R34 holds of the grade) are a stated read contract on the same terms (`contradiction`'s K4 and its ladder)."

Extraction needs no change: I read `readings.capture_sha` and `content_type` by R58, and the reading's top-level `date` through `readingOf` (R30).

If you would rather these be services, say which; the SQL bound is the reason I did not propose that.

## J2 · REPORT

Found in other modules and in generated artifacts (none changed by me). Each measured on `job/T7/contradiction` after merging `tranche/T7` @ B3.

1. **legacy-tests · `bio-plane/test/contradictionpairs.test.mjs`** imports `CONTRADICTION_PAIR_CHECKS` from `../checks/bio-checks.mjs`, which no longer holds it (R20). Re-point that one import to `../src/contradiction/index.mjs`: with that change alone it reads **43 pass, 0 fail** against the real store (measured). Until then it fails to load.
2. **legacy-tests · `bio-plane/test/contradiction-overstrict.test.mjs`**: 49 pass, 2 fail. The two red arms are its source scans: "§8's ONE APPEND SITE" looks for the insert inside `#appendContradictionCandidate` over the plane bundle's source list, and "APPEND-ONLY" the same list. The append site is now `#append` in `src/contradiction/index.mjs` (still exactly one insert, still inside one method), and the scanned list is the bundle manifest, which lists 127 files without the new ones until the plane bundle is regenerated (item 7). Re-anchor both arms to `src/contradiction/index.mjs` `#append`.
3. **legacy-tests · `bio-plane/test/derivation-bounds.test.mjs`**: one new red arm, "WHAT THE GRADER'S OWN SPELLING CANNOT READ …", which pins `#contradictionK3: same.truncated || doc.truncated`; the same expression is now `#k3` in `src/contradiction/index.mjs`. The census roster's names `#contradictionK3Same:rows`, `#contradictionK3Doc:rows`, `#contradictionK3` become `#k3Same`, `#k3Doc`, `#k3` there. The other seven red arms are red identically on the base (66/7 base, 65/8 here).
4. **legacy-tests · `bio-plane/test/run-conditions.test.mjs`**: ARM W3b, 58/1: `contradictionPropose` no longer reads `ai_runs` (R21 met: it asks the registered run gate), as map §4 foresaw. Drop it from the `AUTHORISES` classification; the read is now in legacy-store's registration closure (store.mjs 796–801), which leaves when ai-runs registers its own.
5. **legacy-tests · source-patching controls** `nc-rec146.mjs` and `contradiction-overstrict.control.mjs` patch `store.mjs` text that moved to `src/contradiction/index.mjs` (map §4); not run here.
6. **Unchanged, measured:** `gate-reads` 115/0; the DEC-49 guard `civicos-ui/check-refusal-codes.mjs` 102 failures on the base and here, the same 102 (only other codes' line numbers shift). It finds all eight governed regions at their new `where`s (`src/contradiction/index.mjs pairs > …`, `propose > …`). Its arm F now lists `RUN_GATE_DECLARED` and `RUN_GATE_MALFORMED` as residue codes (constants). They are `registerRunGate`'s answers to a registering module, never a member's refusal, and they fail nothing.
7. **Generated artifact · `bio-plane/dist/bio-plane.bundled.mjs`** (and its `.bundle.json`) is stale: it embeds `store.mjs`, `schema.mjs`, `bio-checks.mjs` and not `src/contradiction/`. It is yours to regenerate at the layer's close (manifest §Generated artifacts).
8. **ai-runs (its R37, K182)**: when it registers `registerRunGate("ai-runs", (run, viewer, caller) => ({found, running, refusal}))`, legacy-store's registration (store.mjs 796–801) must go in the same change. This module keeps one gate, and a second registration answers `RUN_GATE_DECLARED` with the holder's name. The act text legacy-store passes to `runPrincipalGate` is "proposing contradictions under a run".
9. **Requirements**: R21's *not yet met* marker can be cleared: the gate is built, K182's shape, tested (R21's test). Also for your note: the entities `resolutions` contract (N135) is read as proposed (`capture_sha`, `entity_id`, `established`).

## J3 · COMPLETE

**Entries applied** (plan: T6-5, extract per map and requirements; R21)

- **Extracted** per the map (as re-checked, K181) into `bio-plane/src/contradiction/`: `index.mjs` (the factory `contradictionOf(ctx)` (K61), the class `Contradiction` with `pairs` (R5–R12) and `propose` (R13–R16), `registerRunGate` (R21), `migrate` and `declarePurge` (R22), the ops `contradictionOps` (K3), and the key catalogue and absence sentences as frozen exports); `checks.mjs` (C-60.1, C-93.1–C-93.7 with their headers, `where`s re-pointed; R20); `schema.mjs` (`contradiction_candidates` and its index). `src/contradiction.mjs` stays in place (the judgement's words, R1–R4) and `index.mjs` re-exports it.
- **Legacy side** (ownership check: legacy-store 9 lines added, 828 removed; legacy-checks 0 added, 82 removed): the store's pairing and candidate door (map §1, 12504–13274), both dispatch entries, the `contradiction_candidates` purge entry and DDL, the `CONTRADICTION_LABELS` and catalogue imports, and the now-unused `sha256HexSync` import are removed. Added: the import, one `...contradictionOps(...)` dispatch line, `contradictionOf(this.ctx).migrate()`, and the run gate registration (store.mjs 796–801, built from `ai_runs`, `#aiRunInSight` and `runPrincipalGate` until ai-runs registers, R21).
- **R21** (K31, K182): `registerRunGate(module, gate)`, `gate(run, viewer, caller) → {found, running, refusal}`; one gate (`RUN_GATE_DECLARED` names the holder; `RUN_GATE_MALFORMED`); none registered → C-93.2. Met.
- **Reads** as K181 adopted: `inquiry_basis` and `bundles.inquiry_subject_entity` (inquiry R40), the version tables (basis-versions R38), `resolutions` (N135 as proposed), `content` (content R45), `readings.content_type` (extraction R58) and the reading's `date` through `readingOf` (extraction R30). Each join stays one bounded statement, read one row past the bound.

**Improvements made in this module** (each meets its requirement more strictly than the moved code did):
1. R13's order, "each asked of the whole batch": the old code asked label then reason per proposal, so a blank reason at index 0 hid a bad label at index 1. Now every label is asked, then every reason, then every pair (tested).
2. R10/R11 sight: K4's "cited" test and the ladder's `cited` rung now count only citing legs whose inquiry the viewer may see, so a pair or rung no longer discloses that a hidden question cites a visible passage. The `shared_entity` rung, which was ungated, now asks only of documents with a passage the viewer may see (R11: "each rung … under the same viewer gate"). The store's own `contradictionpairs` suite still reads 43/0 against it.
3. The candidate write runs in `record-core.transact` (R32 there) rather than the store's `transactionSync`. K4's catalogue `why` no longer names a person ("Bob's two examples"); it states the two shapes.

**Deferred:** nothing.

**Other modules:** J2 (legacy-tests: `contradictionpairs` import, `contradiction-overstrict` two scan arms, `derivation-bounds` one pin, `run-conditions` W3b, the two source-patching controls; the stale plane bundle; ai-runs removing legacy-store's gate registration when it registers; R21's marker).

**Tests and checks** (on `job/T7/contradiction` after merging `tranche/T7` @ B3):
- Module: `node --test bio-plane/test/m/contradiction/` → tests 28, pass 28, fail 0 (words R1–R4; pairs R5–R12, R18, R23; propose R13–R17, R19–R22; factory and routes).
- Layer tests: none named in `build/manifest.md`. Users of a service I provide: ai-runs (the run gate), which has no tests yet.
- Legacy suites measured (J2): contradictionpairs 43/0 with its import re-pointed; contradiction-overstrict 49/2; derivation-bounds 65/8 (base 66/7); run-conditions 58/1; gate-reads 115/0; DEC-49 guard 102 = base 102.
- `node checks/format.mjs .` → format: 69 modules, 64 requirements files; 0 failures
- `node checks/architecture.mjs . contradiction` → architecture: 7 product files, 16 relative imports (0 naming no tracked file, not judged); 0 failures
- `node checks/coverage.mjs . contradiction` → coverage: 1 modules, 23 of 23 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs . contradiction tranche/T7` → ownership: 12 files changed by contradiction between tranche/T7 and HEAD; legacy-store: 9 line(s) added, 828 removed; legacy-checks: 0 line(s) added, 82 removed; 0 failures

Size (session_01CNWDMUKyWAYEbbdCmSKxyK): test runs 19, module lines 1008
