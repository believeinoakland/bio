# case-inputs (T49)

**Status** · session_015ACfzc2kakEh8pKoGWg4BC · depth 2 · COMPLETE · handled B0

## J1 · REPORT

Stale generated artifact (not written by this job, per mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` still carries the removed constant `OPEN_REQUEST_NOQUOTE_PLAIN` and the `key: null` no-quotation line (around lines 169471–169473). T49-10 changes `bio-plane/src/case-inputs/` so that the bundle must be rebuilt by its own build step. No other generated artifact of another module is affected. `git grep` finds no other reference to the removed constant.

## J2 · COMPLETE

**T49-10 applied (R18, by key; N1076, K3321 (B), DEC-232).**
- `signing.openrequest.noquote` joins `CASE_INPUTS_WORDS` (`checks.mjs`), verbatim from `words.json` (its `en`, protected, DEC-232). Checked present at the design commit before the change.
- `openRequestLine` answers `quoting: {key: "signing.openrequest.noquote", says}` for `quotable: false`, with `says` from `fillWords(key, {whom})`. `OPEN_REQUEST_NOQUOTE_KEY` is the key's constant; the plain constant `OPEN_REQUEST_NOQUOTE_PLAIN` is deleted (`index.mjs`).
- Tests: `openrequests.test.mjs` R18 now reads the key and its sentence from `words.json` (the old assertion that the key is absent is removed); `t46-words.test.mjs` adds the key to the table's exact key set. The `$&` control is updated to the new sentence.
- Read whole before the change: R18 and R8–R10, R17 of `build/requirements/case-inputs.md`; T49-10 entry and BOB's notes in `build/plan/current.md` and `build/jobs/T49/case-inputs.bob.md`; L8 contract in `build/layers.md` (the T47 opening's row for case-inputs); own code in `bio-plane/src/case-inputs/`; R18 tests in `openrequests.test.mjs`. The other tests of the module were run, not read (plan rule 2, K3271). Module reading set measured at START, under the limit.
- Plan rule 6: N1075: the no-quotation sentence now reads by key (the only member-facing sentence of R18 that was inline). N1068: no member-facing word in this module says "labelled"; the three uses are comments in `index.mjs` (lines near 375, 396) and `schema.mjs` (line 38), not reader-facing, left as they are. N1072: no `admin` reaches a reader from this module's source. N1073: no hand-list in this module's tests needed changing. D29: no `ok: true` carrying a refusal is treated as success here (`openRequestsOn` returns `{ok: true, rows}` only for well-formed rows).

**Deferred:** nothing.

**Found in other modules:** none in the module's own scope. See the REPORT entry for the stale generated bundle.

**Tests and checks (module's tests, run once):**
- `node --test test/m/case-inputs/` in `bio-plane`: `tests 48, pass 48, fail 0`.
- `node checks/format.mjs /home/user/bio`: `170 modules, 169 requirements files; 0 failures`.
- `node checks/architecture.mjs /home/user/bio case-inputs`: `12 product files, 44 relative imports ...; 0 failures`.
- `node checks/coverage.mjs /home/user/bio case-inputs`: `1 modules, 18 of 18 live requirement ids named by a test; 0 failures`.
- `node checks/ownership.mjs /home/user/bio case-inputs tranche/T49`: `5 files changed by case-inputs between tranche/T49 and HEAD; 0 failures`.
- `node checks/run.mjs /home/user/bio` (repo-wide, from the process repository): format 0 failures, architecture 0 failures, coverage 17 failures, all in other modules (admission, affordances, control-plane, interface-assets, interface-shell, journey-check, op-capabilities, screens-*, setup-words, site: live ids named by no test, as those modules are not yet built). case-inputs is not among them; channels 0 failures.

Commit `5ff15d9c2a` on `job/T49/case-inputs`, pushed.

Size (session_015ACfzc2kakEh8pKoGWg4BC): test runs 1, module lines 1337
