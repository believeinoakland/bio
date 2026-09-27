# Job record: calibration, T5

**Status** · IN PROGRESS, 2026-09-27. CALIBRATION #1, session `session_01DT2wYuh5pHNvHTYzS5psTF`, branch `job/T5/calibration` (cut from `tranche/T5`; `tranche/T5` @ 1e75fac6b2 merged in). Process: civicos-process @ 7549c0b, `roles/JOB.md`. Entry: T5-1 (extract per map and requirements, K73, K74; D-587, D-668), and every requirement marked *not yet met* in `build/requirements/calibration.md` (R4, R5, R8, R10, R11, R12, R16).

**Read whole:** `roles/JOB.md`; `PROCESS-MECHANICS.md`; `build/manifest.md`; `build/requirements/calibration.md`; `build/extraction/calibration.md`; `build/layers.md`; the public parts of `record-core` (and `legacy-checks`, which has no requirements file); my entry in `build/plan/current.md`; rulings K23, K57, K61, K64, K73, K74; `bio-plane/src/calibration.mjs`; the store's calibration region, its import notes, the `calibration-reprobe` consumer, the four dispatch arms, `#calDriftFor`/`calibrationDrift` and the frontier's use of it; the three tables in `schema.mjs`; C-42 in `bio-checks.mjs`; D-587 and D-668 in the old plan, and D-668's built work on `land/worker/D-668` (5887b36df7, its calibration share); promotion's T3 record and its factory and registration code, membership's factory and `membershipOps`, record-core's `recordOf`, `transact` and `declarePurge`; `extraction`'s R6 and R38–R40, which use this module.

## Questions to BOB

Sent 2026-09-27 as one `QUESTION`. I carry on with every entry on the best reading stated with each.

- **Q1 · `driftObligations` sits in `calibration.mjs`, which only I may edit, and it is extraction's (its R38).** The store's `#calDriftFor` imports it from here until EXTRACTION #1 moves that method, and extraction cannot remove it from my file. **Best reading:** I leave `driftObligations` (and its header) in `calibration.mjs`, unchanged and outside my Provides, until extraction has its own copy and the store no longer imports it from here; then a `CHANGE` from you re-opens this job and I delete it (a removal). Everything else of the map is done now.
- **Q2 · R5: where `measured_by` comes from, and the window until the control plane stamps it.** **Best reading:** `calibrationRecord(pkg, {principal})` takes the stamp as its second argument and ignores any `measured_by` in `pkg`; an empty stamp is refused `CAL_UNATTRIBUTED` (C-42.8, D-668's row). The dispatch arm reads the principal from the control plane's existing `identity` stamp, which `index.mjs` deletes from every request before stamping, so a caller can never supply it; `index.mjs` stamps `identity` only for `IDENTITY_READS` and `POSITIONAL_ACTS` today, so until `calibrate` joins those (one line in `legacy-index`, T5-11's routes; D-587's ruling: a session stamps its member, a machine credential `class:<cls>`, an `ai` credential its principal) every `op=calibrate` through the Worker is refused `CAL_UNATTRIBUTED`. That fails closed, which R5 asks for; it is a REPORT for `legacy-index`. Rows written before the stamp keep the caller's string.

## Work so far

- Reading done; building the module.
