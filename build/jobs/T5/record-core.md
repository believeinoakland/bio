# Job record: record-core, T5

**Status** · IN PROGRESS. RECORD-CORE #2, session `session_014SH9wUytqUzw3oKoJhPj7C`, branch `job/T5/record-core` (cut from `tranche/T5`; `tranche/T5` @ e717124b06 merged in). Process: civicos-process @ 7549c0b, `roles/JOB.md`. Entries: N40, N51, N58, N64 (its share), N66 (its share), N74, N83, and every requirement marked *not yet met* in `build/requirements/record-core.md`.

**Read whole:** `roles/JOB.md`; `build/manifest.md`; `build/requirements/record-core.md`; `build/layers.md`; `build/extraction/record-core.md`; my entries in `build/plan/current.md`; my T3 record; the module's code (`src/record-core/index.mjs`, `schema.mjs`) and tests (`test/m/record-core/`); rulings K31, K64, K65, K72, K85, K87, K91, K93, K96, K99, K118, K126–K128; the legacy code that moves (store.mjs: `EMPTY_STRING_SHA`, `stampInstant`/`instantOrder` and their D-543 header, `#migrate`'s first-boot witness, `#fileDigestOf`, `#inlineBytesOf`, `digestCensus`, `#manifestFiles`, `snapKeyCensus`, `#perItem` with its D-126 header, the `capture-completed-unattended` producer's manifest reads); `affordances.mjs`' `PER_ITEM_MAX`/`PER_ITEM_ACTS` block; `PER_ITEM_CHECKS` (C-75) in the catalogue; promotion's `fileDigestOf`/`inlineBytesOf`/`EMPTY_STRING_SHA`/`recordAudit`; provenance's `provenanceAudit` and its SQL over `files`, `history`, `bundles`; LEGACY-CHECKS #1's REPORT 3 and PROVENANCE #1's REPORT 5.

## Questions to BOB

**Q1 (N51: no requirement states it yet).** `auditPass` "offers a registration for later modules' audit checks (the K31 pattern)". Step 5 says BOB states a new service first. **Best reading, on which I build:** a new **R59**, `registerAuditCheck(module, check) → {ok}`:
- A later module registers, once at start, an audit check, `check({bundleId, files, elidedPaths, sha256, sha512, resolveTarget, ...context}) → findings` (sync or async), over the same image `checkBundle` gets, `resolveTarget` being R19's whole-corpus resolution and `context` R45's.
- `auditPass` runs the catalogue and then every registered check, in registration order, over each bundle on the page; a bundle's errors from all of them are counted once in `clean`/`withErrors`, and each error once in `tally`/`tallyDetail`; `offenders` lists its first five.
- A second registration by the same module is refused `AUDIT_CHECK_DECLARED`; an unnamed module or a check that is not a function, `AUDIT_CHECK_MALFORMED`. A registered check that throws counts as one error finding for that bundle, `check: "<module>"`, code `AUDIT_CHECK_FAILED`, so a broken check never reads as clean.
- Its users: `promotion` (`recordAudit` becomes a registration of `recordChecks`) and `provenance` (`provenanceAudit` likewise); each is a change in its own module (a REPORT), and until they make it their wrappers keep working unchanged.

**Q2 (N83: R37's widening).** R37 is approved text; N83 adds columns. **Best reading, measured in provenance's SQL (`src/provenance/index.mjs`):** R37's read contract gains `files` (`bundle_id`, `path`, `sha256`), `history` (`bundle_id`, `snap_key`, `path`, `sha256`) and `bundles.created`, `bundles.last_updated` (provenance also reads `criticality`, `current_state` and `object_type`, already in R37). Proposed wording appended to R37: "The tables `files` and `history`, with their columns `bundle_id`, `path` and `sha256` (and `history.snap_key`), and the columns `bundles.created` and `bundles.last_updated`, are part of it too, on the same terms (N83: `provenance` reads them)." R37's "not yet met: N64" flag can then be dropped: I test every stated column at the interface.

**Q3 (N64's share, for BOB to route).** R49 says `affordances` re-exports `PER_ITEM_MAX` unchanged; `affordances.mjs` is `affordances`' (layer 11, not in this job's `from`), so it keeps its own `PER_ITEM_MAX = 100` until its job. Reading: I define `PER_ITEM_MAX` and `perItem` here, `perItem` takes the identity groups as its argument (R51), and `legacy-store` calls it with `affordances`' `PER_ITEM_ACTS`. `affordances`' re-export is a REPORT, not mine.

## Entries applied

(in progress)
