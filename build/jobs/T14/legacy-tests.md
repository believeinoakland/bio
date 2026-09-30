# legacy-tests (T14)

**Status** · session_019CY4XgfPJPBSXghWdbPkGG · depth 2 · WORKING · handled B2

## Progress (working notes; the COMPLETE entry supersedes)

- Read whole: `roles/JOB.md`; `build/manifest.md`; B1; the plan's "Last"; `t14-reread.md` (header, "Last", N350–N353); every `build/jobs/T14/*.md`; K457, K458, K464. A legacy module: no requirements file, no live ids.
- Baseline @ 12e562af6d (everything merged; four at a time, foreground chunks): plane 352 of 371 green; red aicredential 95/2, airuns 53/2, bias 135/3, capability 62/1, capture 18/1, d134 11/5, d470 11/3, d484 31/1, derivation-bounds 71/5, identity-claims 32/1, machine-attest 35/2, machinefences-dec49 88/1 (carried, N337), meaning-bounds 97/2 (carried), mint-ledger 25/1 (N342, T15), pdfstructure-op 28/1, plane-envelope 61/3, project-sight 254/1, projects 114/2, row-census 4/4. civicos-ui 85 of 90: add-surface, bias-vocabulary 75/6, semantics-harvest 13/3 (carried), custodial-acts (K458), preauth-vocabulary 87/1 (new). The guard: 19 failures. gate-reads 168/0.
- Done: d470 1.44.0 row, A1 358, A5 (14/0; control 12 arms as declared); bias store floor 212,573, TWENTY and K102 arms retired (K457: bias R29, R11) 136/0; d484 floor 212,573 32/0; capture:74 retired (capture R63/R21) 18/0; pdfstructure-op:126 retired (extraction R31) 28/0; plane-envelope CLOSED (i) retired (ratification R17), its other direction and REACH (D2) re-anchored on the correlation 63/0.
- Done: derivation-bounds census 206 -> 207 (bias/index:migrate, PRAGMA), `#findingsSourceFlagged:ids` departed (ungradeable, 20 -> 19, out of reach), three unread-form republications (queue) 76/0; airuns corpus widened to monitoring (source_reach_failing read by monitoring R47) 55/0.
- Done (N327/N335, K457 per arm, B2): aicredential R62 arm retired (membership R62/R84), C-29.12 accepted by name as unminted with a staleness arm 97/0; capability confirm arm retired (membership R22) 62/0; machine-attest re-anchored NOT_AN_ADMIN (kept: class:ai stamp wiring) 37/0; project-sight rescue arm retired (membership R41/R84), POSITIONAL ADMIN_ONLY -> NOT_AN_ADMIN (kept: sight matrix) 254/0; identity-claims (i) re-anchored (kept: wiring), N348 comments corrected there and in bounds 33/0, 229/0; projects :193 and :497 retired (membership R39, R41/R84) 114/0; d134 three C-96.1 arms retired (membership R84), family 12 -> 11 re-pinned (kept: the catalogue's family) 13/0; civicos-ui custodial-acts reads membership's row, family 11, 49/49.
- Next: the N327/N335 suites; row-census; the guard; N353; N325; N348; preauth-vocabulary; final battery.

## J1 · QUESTION

K457's grain (not blocking; I build on my reading). Baseline @ 12e562af6d: plane 352 of 371 green (19 red), civicos-ui 85 of 90, the guard 19 failures.

My reading: K457 is applied per red arm. A red arm whose subject is extracted and whose behaviour a module's requirement-named test covers is deleted, with a one-line comment naming the covering test (e.g. `projects.test.mjs`:497's ADMIN_ONLY arm, covered by membership's R39/R84 tests). A whole suite is retired only when every arm in it is so covered, which I check only for a suite whose subject is wholly one extracted module (d134-custodial-refusals is the first candidate). Re-anchored: an arm guarding something no module test does (source-reading guards, censuses, the DEC-49 guard, cross-module wiring such as index.mjs' Store export), each named with why. The alternative, retiring every red suite whole (e.g. projects 114/2, project-sight 254/1), would need every one of their arms proved covered first.

Also found at baseline, not in B1: civicos-ui `preauth-vocabulary` 87/1 ("first state for standard matches the catalog"), and the guard's arm G FACT_FAILED and FACT_UNAVAILABLE now minted at two sites (filings and promotion, filings' N331), taking the multi-site ceiling 54 -> 56. I am root-causing both.
