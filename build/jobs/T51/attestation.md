# attestation (T51)

**Status** · session_018zHHtjB7JmmyHPkwiS2Y3W · depth 2 · WORKING · handled B0

## J1 · COMPLETE

Job T51-179 · attestation (R3, the words rule, K3949 and K3957): complete. Code is on `job/T51/attestation` (commit 8c9b8ab, merged with `tranche/T51` at 4562bb4).

**Entries applied.** T51-179 (the 4 findings in `build/plan/words-pass/attestation.md` and its 3 `plain` findings):
- `plain` index.mjs:126 (the NO_SUCH_CAPTURE detail): now `localize("attestation.index.no_such_capture", …)`; the other arm (store not asked) is `attestation.index.no_such_capture_unasked`.
- `plain` index.mjs:325 (the attestationsOf note's cut-out sentence): `word("attestation.capture_cut_captured")`, the row that already holds it.
- `plain` index.mjs:338 (the no-register-row reason): `word("attestation.register_row_names")`, the row that already holds it.
- `testcopy` wording.test.mjs:27, :32, :37: `word("refusal.CAPTURE_HELD_IN_PARTS")` (the three fragments are parts of that row; line 26 already compares it by key).
- Also converted, because setup-words R13 binds every sentence a member reads whatever the check counts (K3964): the held-parts detail, the CAPTURE_HELD_IN_PARTS detail, the BAD_SHA details (attest and attestationsOf), the no-key detail (RECEIPT_NO_KEY), the RECEIPT_MALFORMED detail and the nest-deeper reason, each `localize` under `attestation.index.*`; and the test copies and regular-expression sentence checks in wording.test.mjs and inherit.test.mjs, now `word`/`localize` equality.

**Visible text change (for BOB's review).** The cut-out note now comes from the row `attestation.capture_cut_captured`, which reads "named in from" where the code read "named in `from`". The list wins, as the rule says.

**Left as they are, and why.** The `http ${status}` attempt notes are values, not sentences. The Error messages in `instanceStatement` and `instanceSign` are developer text thrown to code (the check's `dev` arm, 1 string).

**Deferred.** None in this module.

**Found in other modules.** None by this job. `checks/run.mjs` still reports words findings in other modules (case-checker, events, case-grammar, wizard-scripts and others); those belong to their own jobs.

**Generated artifacts.** `rows.mjs` is stale for the nine new `attestation.index.*` ids (the expected stale-rows note). Regenerating it at R3's close is BOB's act; I did not edit it.

**Tests and checks.**
- `node --test test/m/attestation/*.test.mjs` (bio-plane): 32 pass, 0 fail.
- `checks/words.mjs` on attestation: 0 failures (792 string literals read; `dev 1`, the developer error above).
- `checks/format.mjs`: 0 failures (175 modules).
- `checks/architecture.mjs attestation`: 0 failures.
- `checks/coverage.mjs attestation`: 10 of 10 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs attestation tranche/T51`: 4 files changed, 0 failures.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0; its words and coverage totals include other modules' findings, none attributed to attestation.
- `setup-words/build.mjs --check`: the stale-rows note only, no refusal naming attestation.

Size (session_01RSDhXseZbHSkXJyNbh7BN5): test runs 1, module lines 596

## J2 · COMPLETE

Fix round 10, Wave A batch 3: attestation publishes its two fixtures (START, `build/plan/starts-T51-F10/attestation.txt`). Code on `job/T51/attestation` at 8abab3cdff (fixtures at 8476b9f995; merged `tranche/T51` at 8abab3cdff).

**Fixtures published** (`bio-plane/test/m/attestation/fixtures.mjs`, new). Each is the real answer, made when called over `fixture.mjs`'s world, never stored:
- `attestationsOfBadSha()`: `attestationsOf("x")` answers `ok: false, reason: "BAD_SHA"`, with no attestations read. The START writes the call as `attestationsOf({sha:"x"})`; the real argument is the digest text, so the fixture passes `"x"`. Both give BAD_SHA. Users' stubs of that shape (filings, `packet.test.mjs:203`) re-point in filings' job.
- `noKeyInstanceSign()`: `instanceSign` of an `instanceStatement` made by the real module, on the keyless object, answers `ok: false, reason: "RECEIPT_NO_KEY"` with its `C-103.7` row, and records nothing. Users (network-notices `activity.test.mjs:212`, `words.test.mjs:48`) re-point in their own jobs.
- `keylessAttestation()`: the keyless attestation object itself, which the START asks for as a fixture. Added as a third export, beyond the two named.

**Test** `bio-plane/test/m/attestation/fixtures.test.mjs` (3 tests, naming R5, R6, R7): each fixture checked against its requirement at the interface. Passing.

**Markers.** None added: no `fixtures-own` or `fixtures-generic` marker in this job.

**Lines.** `checks/fixtures.mjs /home/user/bio attestation --list`: 0 failures for attestation's own lines (no finding names attestation as the user). Wave B and stay lines: none for this module. Note: the START's relative root `.` returns 0 without reading (K5066), so I ran the check with the absolute root.

**Other modules' findings naming attestation as provider** (users' lines, left to their jobs): filings `packet.test.mjs:203`, network-notices `activity.test.mjs:212` and `words.test.mjs:48`, screens-inquiry `document.test.mjs:163` and `fr3-document.test.mjs:162` to `:181` (op-table `attest`), case-disclosures `documents.test.mjs:154`.

**Branch history.** The job branch was behind `tranche/T51`. Before the merge, the impact test run showed 5 failures of 455 in `ocr-worker/test/ocr-worker.test.mjs` (manifest hash, R23 renderer digest); they come from the stale base, not from this job's change. After merging `tranche/T51`, the impact tool names only attestation (1 file, 3 pass), so ocr-worker's suite was not re-run.

**Tests and checks** (failure counts):
- `node --import ./bio-plane/test/platform-sqlite.mjs --test --test-force-exit bio-plane/test/m/attestation/*.test.mjs`: 36 pass, 0 fail (36 includes the 3 new).
- Impact (`node build/plan/impact.mjs origin/tranche/T51 HEAD`), after the merge: attestation 1 of 8 test files affected, that file run: 3 pass, 0 fail. Before the merge, 28 files over 7 modules; the 262 bio-plane ones run: 262 pass, 0 fail.
- `checks/format.mjs /home/user/bio`: 0 failures.
- `checks/architecture.mjs /home/user/bio attestation`: 0 failures.
- `checks/coverage.mjs /home/user/bio attestation`: 11 of 11 live ids named, 0 failures.
- `checks/words.mjs /home/user/bio attestation`: 0 failures (843 literals; the one `dev` item is the developer error text, as before).
- `checks/ownership.mjs /home/user/bio attestation tranche/T51`: 0 failures (3 files).
- `checks/run.mjs /home/user/bio` (repository-wide): format 0, architecture 0, words 0, channels 0. Coverage has 12 failures and fixtures 2,753, none naming attestation as a user of its own lines. Nothing in run.mjs's output names attestation as a failing module.
- `bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, no refusal naming attestation.

**Deferred, flaws in other modules.** None found by this job.

**Generated artifacts.** `rows.mjs` is not touched; the stale-rows note is BOB's to regenerate at the layer close.

Size (session_018zHHtjB7JmmyHPkwiS2Y3W): test runs 7, module lines 603
