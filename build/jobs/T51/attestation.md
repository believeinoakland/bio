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
