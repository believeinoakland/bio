# capture (T17)

**Status** · session_01CeSQD7cKcqii9K2VExg18L · depth 2 · COMPLETE · handled B1

## J1 · QUESTION

Three readings, each built on now; please word the requirements (or correct me).

(1) N380, R65 amended (my wording): "`pullKnock({knockId, by, at?, within?})`. With `within` (a synchronous function; control-plane R36), it is called with the pulled document inside the pull's own transaction, after the receipt, the knock's `pulled` update and the actor are written. An answer `{ok: false, …}` rolls the whole pull back (no receipt, the knock unchanged, no actor) and is the pull's answer, with `knockId`; a throw, or an answer that is not synchronous, rolls it back likewise and answers `PULL_WITHIN_FAILED` (500). Any other answer is carried as `within` beside the pull's own. A knock already pulled does not call it (`existed: true`, as now). The bytes held under their own digest before the transaction stay: content-addressed, and already held as the knock's own object." No catalogue row: `PULL_WITHIN_FAILED` is a programming fault, like `RECEIPT_NOT_WRITTEN`.

(2) N388, sight. `lateattestations`: every field is machine-made (kind, service, instant, token digest, archived locator, replay match) plus `by`; it names no bundle, so REC-30's rule leaves a row about a capture standing (as op=reading's row). I keep it ungated; R68 gains "It takes no viewer: it names no bundle (REC-30)." `captureaccounts`: each account's `text` is the capturing member's own words, which can name a project, so it is gated. R69 amended: "Through the op, `captureAccountsOf` answers by the caller's viewer (membership R43, through the register's bundle as R27): a capture filed in a bundle the viewer may not see answers as a capture with no actor and no account recorded, so an unseen capture and an unknown one read alike; a capture filed in no bundle is visible; an absent viewer sees nothing. An in-process caller passing no viewer reads whole (case-authoring R36's pre-flight)." For it to reach a caller, control-plane must stamp `viewer` on `captureaccounts` (its REC30_VIEWER_READS list); until it does, the route answers every caller as an unseen capture. I REPORT that separately (with legacy-tests' gate-reads classification).

(3) N388, `op=reattest` by a machine: may, no fence, no row. Intake Doctrine §3: a timestamp authority vouches, not the caller, and nobody can backdate a third-party snapshot or forge a token; a late attestation proves only existence by its own instant, and `by` records who asked (`class:ai` for a machine). This is attest's design, and legacy-tests' machine-attest already reads it so. R68 gains: "Any caller the control plane admits may ask, a machine included (Intake Doctrine §3: the authority vouches, not the caller); `by` records who asked."

## J2 · REPORT

Found for other modules (capture's side is built and pushed on job/T17/capture):
(1) control-plane (R36, its layer-11 N380 share): `pullKnock({knockId, by, at, within})` now calls `within(document)` inside the pull's own transaction; an `{ok: false}` answer or a throw rolls the whole pull back (a throw answers PULL_WITHIN_FAILED, 500), any other answer rides back as `within`. `pull.mjs` can drop its dry run and its "pulled but not filed" residue for a new pull: pass `within: (doc) => promoteIn(deps, doc, who)` (promoteIn is already synchronous and runs in record-core's `transact`, which nests). A knock already pulled does not call `within`; its `existed` arm stays as it is.
(2) control-plane: `captureaccounts` must take the `viewer` stamp (add it to REC30_VIEWER_READS in `src/control-plane/index.mjs`). Capture's route now answers by `viewer` and fails closed when it is unstamped, so until then op=captureaccounts answers every caller as an unseen capture (empty actors and accounts). No test in the tree drives op=captureaccounts end to end, so nothing is red. `lateattestations` stays unstamped: it names no bundle.
(3) legacy-tests: `test/gate-reads.test.mjs`'s UNGATED entry for `captureaccounts` ("Capture R69 states no sight for it") is stale once (2) lands: it moves to the gated reads. gate-reads is 184/0 and machine-attest 41/0 on my branch today; machine-attest's "reattest ACCEPTED" verdict is the one I confirm (J1 (3)).
(4) No early merge is needed: sources and provenance use nothing this job changed (knockerDigestOf, knockAttempt, pulledKnocksOf, recordReceipt unchanged; N381 is provenance's alone).

## J3 · COMPLETE

**Entries applied** (`build/plan/current.md` layer 3; built on my readings in J1, awaiting BOB's wording):
- **N380** (K559): `pullKnock({knockId, by, at, within})` (`src/capture/index.mjs`). `within(document)` runs inside the pull's own `transact`, after the receipt, the knock's `pulled` update and the actor; its `{ok: false}` rolls the whole pull back and is the answer (with `knockId`); a throw, or a promise, rolls it back as `PULL_WITHIN_FAILED` (500); a fault of the pull's own still throws. Any other answer is carried as `within`. A knock already pulled does not call it. The caller gets its own copy of the document.
- **N388** (REC-30): `captureAccountsOf(captureSha, {viewer})` answers by sight through `#captureGate` (D-701's gate over the register's bundle): an unseen capture reads exactly as an unknown one; no viewer in process reads whole (case-authoring's pre-flight); the `captureaccounts` route passes the stamp and fails closed without one. `lateAttestationsOf` stays ungated: it names no bundle. `op=reattest` by a machine is confirmed permitted (Intake Doctrine §3, attest's design): no fence and no catalogue row, so no row is `awaiting stamp`.

**Deferred:** none.

**Found in other modules** (J2), and: the plane bundle `bio-plane/dist/bio-plane.bundled.mjs` (not_product) is stale, capture's source changed; control-plane R36 should pass `within` from `pull.mjs` (its N380 share) and stamp `viewer` on `captureaccounts` (REC30_VIEWER_READS); legacy-tests' gate-reads classification of `captureaccounts` goes stale when it does. No early merge is needed for sources or provenance.

**Tests and checks** (`job/T17/capture`):
- `node --test test/m/capture/`: tests 96, pass 96, fail 0 (5 new: R65 (N380) ×2, R69 (N388), R68 (N388) ×2).
- Users of the changed services: `node --test test/m/control-plane/ test/m/case-authoring/ test/m/publication/ test/m/sources/`: tests 269, pass 266, fail 0, todo 3 (the todos pre-existing, N381's among them).
- Legacy battery touching these ops: `node test/gate-reads.test.mjs`: 184 pass, 0 fail; `node test/machine-attest.test.mjs`: 41 pass, 0 fail.
- `checks/format.mjs`: 72 modules, 67 requirements files; 0 failures. `checks/architecture.mjs … capture`: 15 product files, 70 relative imports; 0 failures. `checks/coverage.mjs … capture`: 72 of 72 live requirement ids named by a test; 0 failures. `checks/ownership.mjs … capture tranche/T17`: legacy-store and legacy-index 0 added, 0 removed; 0 failures.

Size (session_01CeSQD7cKcqii9K2VExg18L): test runs 6, module lines 3704
