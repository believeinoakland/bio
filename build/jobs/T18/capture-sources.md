# capture-sources (T18)

**Status** · session_01Eg9KWJWXCPBY5y5WiHYtEU · depth 2 · COMPLETE · handled B1

## Completion · 2026-09-30 (CAPTURE-SOURCES #5)

### Entries applied (layer 3, capture-sources; B1)

- **N242's share (the `CAPTURE_CREDENTIAL` rows, as the DEC-49 guard prints them today): already met; nothing to change.** `node civicos-ui/check-refusal-codes.mjs --strict` on this branch (tranche/T18 @ 7fd391f674) prints no `FAIL` line naming C-105, `CAPTURE_CREDENTIAL_*` or `src/capture-sources/credentials.mjs`. Its 13 failures are other modules' (below). Every item T7's legacy-tests record listed for this module (the source of N242's line) was fixed by CAPTURE-SOURCES #3 (N189, K288): each of the 11 rows has a `where` naming its function and DEC-49 region (arm C judges each region; `is-credential-permitted` has 3 judged, the rest 1); `NO_SUCH`'s translation is two sentences, no longer 19 characters; `NO_KEY` and `NO_SUCH` are one condition each (`SUPPLY_FAILED` C-105.10 and `WITHDRAW_FAILED` C-105.11 took the failures they also covered); `credentialsForFetch` reads one row (`LIMIT 1`) and `credentialList` at most `limit` + 1. The guard's one remaining mention, `CAPTURE_CREDENTIAL_NOT_PERMITTED` in `MULTI_SITE_CLOSED`, is a declared closure: its sites are one condition. Minting it at one literal site would make that declaration stale, and the guard fails on a stale closure. The guard file is legacy-tests', so the code stays as it is. The share is proven by the existing module test "R55, R57, R63: the DEC-49 guard resolves every C-105 region and names none of this module's rows as a failure", which passes.
- **Convert `drive-convert` (capture-sources' share).** Of the old suite's assertions, this module's are the convert step's own facts (R43) and its agreement with the hop (R42). The rest are other modules' (extraction R11/R12/R19/R29, capture R18, text-chain R59). The old R43 test checked the `odt` kind only. A new test in `drive.test.mjs` checks the whole requirement for every kind (odt, ods, odp) on every Drive host spelling: "R43, R42: for every kind and every host spelling, the step is the hop's conversion, its cap present and null until a calibration raises it". Each step has exactly its six keys, `cap` present and `null`, `calibration` `null` and `engine` `google-export`. Its `format` equals `driveHop`'s `export_format` for the same address. `measured_by` says it is unmeasured and names what raises it (CAP-11, a calibration row). Each call answers a fresh step. **Negative control:** the step's cap set to `"B"` fails R43 and the new test (10/2). The step's format pinned to `"odt"` fails the new test, and R42 too, because the edit also reached the hop (10/2). Each restore was checked by `git diff` (clean). The old suite is not deleted (K619).
- No code changed. No catalogue row moved or changed, so there is nothing `awaiting stamp`. capture-sources has no `from`, so it has no legacy copy to delete.

### `not yet met` marks this module already meets (rule (5): for BOB to strike)

Reported as met in T4 (R3, R26, R36, R54) and T7/T9 (R55–R63), but still in the requirements file:
- **R3** "(not yet met: D-570, K48 — the settled class)": met. `waitFiredClass` answers `settled` for `quiet_excluding_long_lived` (R3 test).
- **R26**'s last sentence ("The rule is off until N is measured"): N was measured in T4 (4 s, CAPTURE-SOURCES #1). The rule is on (R26 test).
- **R36** (the Status line's "not yet met"): met. `chosen.urlkey`, and the hop's evidence names it (R36 test).
- **R54** "(not yet met: K48 …)": `renderLocaleFor` is met (R54 test). Passing the profiles' view to it is `capture`'s (its R41; Suggestions).
- **R55–R58, R59–R63** "(not yet met: K103, K109 …)" and the Status line's "(K103, K109)": all met since T7/T9 (15 credentials tests, all passing).
R37 (Memento) stays not yet met and unscheduled (K48); it is named by a `test.todo`.

### Found in other modules (REPORT)

None new. The guard's 13 failures on this branch are other modules' and already routed: record-core's C-59.5/C-102.1–.3 duplicates with the catalogue's copies (the split tables, T19), record-core's regions (`is-audit-check-registration`, `is-audit-check-failed`, `is-grammar-registration`, `is-stats-source-registration`), GRAMMAR_MALFORMED at 2 sites, TASK_NOT_YOURS (N412), inheritedVerdicts 6/4 (N411), unclassifiedOutcomes 1, the comment stripper eating `src/record-grammar/grades.mjs`, and ten floors with slack (re-pinned at the release, K622).

### Tests and checks

- `node --test bio-plane/test/m/capture-sources/`: tests 75, pass 74, fail 0, todo 1 (R37). Layer tests: none (`build/manifest.md`). No provided service changed.
- `node checks/format.mjs`: 0 failures. `architecture.mjs … capture-sources`: 0 failures. `coverage.mjs … capture-sources`: 63 of 63 live requirement ids named by a test, 0 failures. `ownership.mjs … capture-sources tranche/T18`: 1 file changed, 0 failures.
- The DEC-49 guard ran once, read only (13 failures, none this module's).

Size (session_01Eg9KWJWXCPBY5y5WiHYtEU): test runs 5, module lines 2245
