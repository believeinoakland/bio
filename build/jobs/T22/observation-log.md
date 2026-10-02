# observation-log (T22)

**Status** · session_01V6n4Sam5rH4aTsVsmXRRHM · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 5; code at 0c78c67a1a; B2 answered J1, `tranche/T22` merged).
- **N471** (comments only, rows' `where` strings untouched): `checks.mjs`:212–213 now says C-54 was minted with the old process's `node tools/mintid.mjs C` (that tool was retired in T19), as `inquiry-grammar/checks.mjs` does; re-scan of the whole path found three more of the kind, fixed: `checks.mjs`:227 (C-54.1 "stays in the catalogue" → with the leg grammars, in `inquiry-grammar`, the catalogue deleted, K858); `vocabulary.mjs` `readerRunObservation`'s note ("where `index.mjs` already composes" `content_type` → extraction's pipeline, `src/extraction/pipeline.mjs`, which composes it); `vocabulary.mjs`'s `#frontierMeaning` (→ the meaning frontier, `retrieval`'s `src/retrieval/frontier.mjs`) and D-500's note on the legacy store's readers (put in the past tense, the store deleted). `schema.mjs`:106's `leadReach` names this module's own `index.mjs` and stays. Notes naming `#missingMeaningCause` and `#contentAxisTally` stay: those methods are live in `retrieval` and `case-authoring`.
- **DEC-88 R16 met:** `leadShare` takes `reason`; `LEAD_SHARE_NO_REASON` (C-54.12) when absent, not a string, blank (after trim) or over 2,000 characters (code points, `LEAD_SHARE_REASON_MAX`), after C-54.5, C-54.10, C-54.9 and before the repeat check and the insert; asked of a repeat too. Recorded as written in `lead_shares.reason` (new column; a store made before it gains it at `migrateObservationLog`, its shares kept with a null reason). A repeat answers `already: true` with the first sharer, instant and reason; every answer carries `reason`; `leadRead`'s `shared_to` entries carry it. The `leadshare` dispatch carries `reason` from the body, else the query.
- **DEC-88 R17 met:** `leadLook` refuses `LEAD_LOOK_NO_DETAIL` (C-54.11) when `detail` is absent, not a string or blank, after C-54.7 and before C-54.4 (the over-cap refusal stays C-54.4); no lead look is written with a null detail.
- **R26 met:** C-54.11 `LEAD_LOOK_NO_DETAIL` and C-54.12 `LEAD_SHARE_NO_REASON` added to `LEAD_CHECKS` after C-54.10; every other row unchanged. **C-54.11 awaiting stamp. C-54.12 awaiting stamp.** (They turn `bio-plane/test/system/row-census.test.mjs` red until T23's stamp: accepted red 3.)
- **R29** (amended by BOB, K1050): `lead_shares` has its fifth column `reason`; the R29 test names the five.

**Deferred:** none.

**Other modules (REPORT J2):** the plane bundle and the agent worker's bundle are stale (agent-worker R45 red until regeneration); no caller in another module needs the new words (grep in J2); affordances' `leadshare`/`leadlook` descriptions (`affordances.mjs`:1143, :1165) do not mention the new requirement (its L11 job).

**Tests and checks** (in `bio-plane/` unless said):
- `node --test test/m/observation-log/`: tests 61, pass 61, fail 0. Negative controls: with C-54.11's check removed, R17, the ops test and R26 fail; with C-54.12's removed, R16, the ops test and R26 fail. R16 and R17 tests carry the controls B1 names (each refusal writing nothing; the words recorded and read back; the reason kept on a repeat); a further R16 R29 test drives the forward migration.
- Users' suites: `test/m/retrieval/` 122/0; `test/m/run-rules/` 16/0; `test/m/ai-runs/` 56/0; `test/m/skills/` 44/0; `test/m/control-plane/` 100 pass, 2 fail (`doorbell.test.mjs`:310 and `catalogue-end.test.mjs`:15, accepted until control-plane's L11 merge, K1037); `node --test test/stats-disclosure.test.mjs` 1/0.
- `agent-worker/`: `node --test test/` 7 files pass, `test/requirements.test.mjs` fails on R45 only (the stale bundle above; it passes with my change stashed).
- Whole `node --test test/m/`: tests 4842, pass 4820, fail 3: the two control-plane reds above and `test/m/inquiry/content-legs.test.mjs`:395 (accepted until inquiry's L6 merge, K1047; red identically on `origin/tranche/T22` without my change). No new red.
- Checks: format `85 modules, 84 requirements files; 0 failures`; architecture `14 product files, 52 relative imports …; 0 failures`; coverage `1 modules, 32 of 32 live requirement ids named by a test; 0 failures`; ownership `10 files changed by observation-log between tranche/T22 and HEAD; 0 failures`.

**For COMPLETE:** R16, R17 and R26 met (their `not yet met: T22` marks are BOB's to strike); C-54.11 and C-54.12 `awaiting stamp`.

Size (session_01V6n4Sam5rH4aTsVsmXRRHM): test runs 15, module lines 3193

## J1 · QUESTION

R29 vs R16. R16 records a share's reason "with the share (a new column of `lead_shares`)", but R29's read contract lists `lead_shares`' columns as `lead_id`, `bundle_id`, `sharer`, `at` and says this module changes none of their names, types or meanings without a change to R29. My best reading, which I am building on: adding a column changes none of the four, so R16 licenses it; the new column is `reason` (TEXT, nullable only for shares recorded before DEC-88, migrated forward with `ALTER TABLE lead_shares ADD COLUMN reason TEXT` where absent; every new share writes it), and R29 should list it as a fifth column ("`reason`, the sharer's words, null on a share recorded before DEC-88"). My R29 test will name the five columns. Please confirm, and amend R29's words if you agree; no other change hangs on it. Also stated readings, no answer needed unless you disagree: "over 2,000 characters" counts Unicode code points; "blank" is empty after trim; the reason is stored as written (not trimmed), as a lead's words are; a pre-DEC-88 share's repeat answers `reason: null`.

## J2 · REPORT

(1) Generated artifacts staled (manifest "Generated artifacts"; I regenerated nothing): `bio-plane/dist/bio-plane.bundled.mjs` (every change under `bio-plane/src/observation-log/`) and `agent-worker/dist/agent-worker.bundled.mjs` (`checks.mjs`, `vocabulary.mjs` changed; it bundles both through run-rules). The second shows as agent-worker's one red: `agent-worker/test/requirements.test.mjs` R45 "STALE BUNDLE — the source ../bio-plane/src/observation-log/checks.mjs has changed" (and vocabulary.mjs); every other agent-worker test passes (7 of 8 files). Both clear at your layer-close regeneration.
(2) Callers (grep `leadShare(`, `leadLook(`, `leadshare`, `leadlook` over `bio-plane/`, `agent-worker/`, `civicos-ui/`, dist excluded): no caller in another module calls either method or op without the new words. `control-plane/index.mjs`:1508–1511 stamps `looker`/`sharer` and forwards the query and body unchanged, so `reason` (body, else query) and `detail` (body) reach this module; `test/stats-disclosure.test.mjs`:134, :218 (record-core's) already send a detail and pass (1/1). No red in another module from this change.
(3) Affordances (L11, not mine): `src/affordances.mjs`:1143 (`leadshare`'s `is:`) and :1165 (`leadlook`'s) do not say the act now requires the sharer's reason (C-54.12) or the looker's words (C-54.11); worth a clause in affordances' L11 job beside `RUNG_ABSENT`.
