# legacy-tests (T17)

**Status** · session_014pqvXagkpd4iXER4pYSR1z · depth 2 · WORKING · handled B2

## Progress

**NEEDS BOB: commit and push the removal of 305 old test files (`git rm` of the `covered` and `dead` suites, ten converted suites and their helpers) on `job/T17/legacy-tests`, refused by this session's permission check; it is the conversion's first step (K572, K573).** The removal is prepared and held in a stash on this session's checkout (`legacy-tests phase-1 deletions`); nothing of it is pushed. Approve it in this session (LEGACY-TESTS #15) and it lands as one commit.

What it removes, and why:
- every `covered` suite (187) and every `dead` file (43 of 44; `ocr-measure-probe.mjs` kept: `pdf-worker/test/pagepixels-corpus.probe.mjs`:486 reads its source);
- the ten suites whose conversion merged and carried every behavioural assertion (each record's "not carried" is source text, dropped by P7, or names the module test that carries it): `staff-directory` (civicos-ui, N390), `staff-directory-e2e` (N391), `projection-noproject` (N392), `content-capture-bound` (N393; §7 by strength B3), `contradiction-overstrict` (N394), `action-loop` (N396), `setup-signeradd`, `setup-honesty` (N397), `surfaced-by`, `unattended-lease` (N398, N399);
- 65 helpers whose every user, or every suite they drive, is gone (a fixpoint over real uses: import, spawn, join, read), `refusal-partition.control.mjs` and `nc-d355.mjs` among them (controls of the removed `admission-gate` suite and the dead m025 census).

**Kept, each a conversion that says it could not carry an assertion (for REPORT):** `analystvocab.test.mjs` (N395: its `app.html` arms), `purge.test.mjs` (N398: the three `confirm=<store>` arms, R39 held for N408), `stats-disclosure.test.mjs` (N399: A, B1, C, E, F for N408; D).

Carrying on meanwhile with what does not depend on it: verifying the `?` classes against the module tests they name.

## J1 · BLOCKED

Cause: needs Bob. NEEDS BOB: commit and push the removal of 305 old test files (the covered and dead suites, ten converted suites and their helpers) on job/T17/legacy-tests, refused by this session's permission check; it is the conversion's first step (K572, K573). Prepared and held in a stash on my checkout; nothing pushed. Bob approves it in this session (LEGACY-TESTS #15, https://claude.ai/code/session_014pqvXagkpd4iXER4pYSR1z). The list and the reasons are in my record's Progress. I carry on with the ? verification meanwhile.

## J2 · QUESTION

Where the inventory's 49 system suites go. 40 are in bio-plane/test/ and 9 in civicos-ui/test/ (run.mjs, stdio-census, surface-registry, refusal-codes.test, and the system? analyst-vocabulary, bias-vocabulary, identifier-vocabulary, preauth-vocabulary, semantics-harvest). My best reading, which I am carrying out: (1) the 40 bio-plane ones move to bio-plane/test/system/; helpers they share with suites that stay (sandbox.mjs and stdio.mjs are test-support's paths; extracted-sources, register-doc, surfacing-run, publishingproject, adoptable-reading, earned-connection, caseceremony, docdates, store-started) stay where they are and the moved suites import them from ../; helpers only system suites use (verdict-reader, row-census.mjs, multisite-census, unruled-op-fixture, moduleclosure.mjs, gatedeps, t4/t5/t8-extracted, and each system suite's own .control.mjs) move with them. (2) The eight whose subject is app.html or the civicos-ui suites themselves (run.mjs, stdio-census, surface-registry and the five vocabulary/semantics censuses) move with the legacy-ui suites to civicos-ui/test/release/, run only at release and retired with the old app (K5). (3) refusal-codes.test.mjs, the DEC-49 guard's own suite, moves to bio-plane/test/system/ beside the other DEC-49 guard suites; the guard itself stays at civicos-ui/check-refusal-codes.mjs (my path). (4) The probes and benchmarks among them (curated-producer.probe, retrieval-scale, scale) move too, as the inventory classes them, run once from the new place at a small size. Say if you want any of it otherwise.

## J3 · REPORT

J1 resolved: Bob approved in this session; the removal of 305 old test files is pushed as ec24b52b65 on job/T17/legacy-tests (187 covered, 43 dead, ten converted suites N390-N399, 65 helpers). Kept for REPORT: analystvocab, purge, stats-disclosure (each conversion says it could not carry an assertion), and ocr-measure-probe.mjs (pdf-worker's probe reads its source). Also pushed: row-census re-pinned over 1.47.0 (7 pass, 1 fail: case-authoring's T17 record does not name C-120.1/C-120.2's re-pointed where as awaiting stamp, so that row change has no record; CASE-AUTHORING's to fix, or your ruling), gate-reads captureaccounts gated (188/0), d311 sourceconsent driven (22/0). The ? verification is in progress.
