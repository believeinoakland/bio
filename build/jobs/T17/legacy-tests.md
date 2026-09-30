# legacy-tests (T17)

**Status** · session_014pqvXagkpd4iXER4pYSR1z · depth 2 · NEEDS BOB · handled B0

## Progress

**NEEDS BOB: commit and push the removal of 305 old test files (`git rm` of the `covered` and `dead` suites, ten converted suites and their helpers) on `job/T17/legacy-tests`, refused by this session's permission check; it is the conversion's first step (K572, K573).** The removal is prepared and held in a stash on this session's checkout (`legacy-tests phase-1 deletions`); nothing of it is pushed. Approve it in this session (LEGACY-TESTS #15) and it lands as one commit.

What it removes, and why:
- every `covered` suite (187) and every `dead` file (43 of 44; `ocr-measure-probe.mjs` kept: `pdf-worker/test/pagepixels-corpus.probe.mjs`:486 reads its source);
- the ten suites whose conversion merged and carried every behavioural assertion (each record's "not carried" is source text, dropped by P7, or names the module test that carries it): `staff-directory` (civicos-ui, N390), `staff-directory-e2e` (N391), `projection-noproject` (N392), `content-capture-bound` (N393; §7 by strength B3), `contradiction-overstrict` (N394), `action-loop` (N396), `setup-signeradd`, `setup-honesty` (N397), `surfaced-by`, `unattended-lease` (N398, N399);
- 65 helpers whose every user, or every suite they drive, is gone (a fixpoint over real uses: import, spawn, join, read), `refusal-partition.control.mjs` and `nc-d355.mjs` among them (controls of the removed `admission-gate` suite and the dead m025 census).

**Kept, each a conversion that says it could not carry an assertion (for REPORT):** `analystvocab.test.mjs` (N395: its `app.html` arms), `purge.test.mjs` (N398: the three `confirm=<store>` arms, R39 held for N408), `stats-disclosure.test.mjs` (N399: A, B1, C, E, F for N408; D).

Carrying on meanwhile with what does not depend on it: verifying the `?` classes against the module tests they name.
