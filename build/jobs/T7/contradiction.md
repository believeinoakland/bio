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
