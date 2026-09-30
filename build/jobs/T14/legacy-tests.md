# legacy-tests (T14)

**Status** · session_019CY4XgfPJPBSXghWdbPkGG · depth 2 · WORKING · handled B1

## J1 · QUESTION

K457's grain (not blocking; I build on my reading). Baseline @ 12e562af6d: plane 352 of 371 green (19 red), civicos-ui 85 of 90, the guard 19 failures.

My reading: K457 is applied per red arm. A red arm whose subject is extracted and whose behaviour a module's requirement-named test covers is deleted, with a one-line comment naming the covering test (e.g. `projects.test.mjs`:497's ADMIN_ONLY arm, covered by membership's R39/R84 tests). A whole suite is retired only when every arm in it is so covered, which I check only for a suite whose subject is wholly one extracted module (d134-custodial-refusals is the first candidate). Re-anchored: an arm guarding something no module test does (source-reading guards, censuses, the DEC-49 guard, cross-module wiring such as index.mjs' Store export), each named with why. The alternative, retiring every red suite whole (e.g. projects 114/2, project-sight 254/1), would need every one of their arms proved covered first.

Also found at baseline, not in B1: civicos-ui `preauth-vocabulary` 87/1 ("first state for standard matches the catalog"), and the guard's arm G FACT_FAILED and FACT_UNAVAILABLE now minted at two sites (filings and promotion, filings' N331), taking the multi-site ceiling 54 -> 56. I am root-causing both.
