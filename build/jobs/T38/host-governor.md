# host-governor (T38)

**Status** · session_0169cu6wYS5iQTcatDMjjXq7 · depth 2 · WORKING · handled B0

## Completion

**Read whole** (mechanics §17): `build/requirements/host-governor.md`; record-core's public part (its one Use); `build/layers.md`'s table (layer 3's contract) and its layers-3-and-6 section; the plan's T38-7 entry and its rules at the opening (rule 6 among them); K2182 and K2189; every file of the module's `paths` and `tests`. BOB's START measured the set at 86 KB, under the 300 KB limit, and I read it whole.

**Entry applied (T38-7; N784, K2189; as K2182).** `bio-plane/test/m/host-governor/ops.test.mjs`, test only, no `src/` change:
- The whole-plane helper `call(q, tok, body)` sends the credential as `Authorization: Bearer <tok>`, never `&token=` in the address (C-38.10); every caller re-pointed (`memberadd`, and every `governorstate` / `governorconfig` call). `enroll`, `login` and `claim` send no header, as before.
- The three `T.member` uses are gone (C-38.11): the `MEMBER_TOKEN` binding is no longer bound (the installer writes none, `installer` R9), and the two class rows that presented it (R18's readers, R19's refused callers) now present a second ordinary member's session (`dee`, enrolled beside `cai`). R18's test title says "the admin and probe classes and by every session, a member's among them". Nothing loosened: every assertion is the same, against the same answers.
- Before: 36 pass, 4 fail (the `before` hook's `memberadd` refused `CREDENTIAL_IN_ADDRESS`, failing the file's whole-plane tests). After: 40 pass, 0 fail. Rule 6 item 6 (the nine) clears with this merge.

**Deferred:** none.

**Found in my own requirements** (a REPORT to BOB, requirements are BOB's): R18 still says "Reached by the `admin`, `member` and `probe` classes"; since T36 (admission R5, C-38.11) there is no binding class `member`, so R18's wording names a class that cannot exist. The test now checks the classes that do (admin, probe) and every session, a member's included. Suggested wording: "Reached by the `admin` and `probe` classes and by every session."

**Found in another module:** none.

**Tests and checks** (tests from `bio-plane/`, checks from the process repository against this checkout):
- `node --test test/m/host-governor/` → tests 40, pass 40, fail 0.
- Layer tests: `build/manifest.md` names none.
- `format`: 137 modules, 136 requirements files; 0 failures. `architecture … host-governor`: 6 product files, 11 relative imports; 0 failures. `coverage … host-governor`: 27 of 27 live requirement ids named by a test; 0 failures. `ownership … host-governor tranche/T38`: 1 file changed; 0 failures.

Size (session_0169cu6wYS5iQTcatDMjjXq7): test runs 3, module lines 1480

## J1 · REPORT

In my own requirements (yours to word): host-governor R18 still says "Reached by the `admin`, `member` and `probe` classes"; since T36 (admission R5, C-38.11) no binding class `member` exists. The test now checks admin, probe and every session, a member's included. Suggested wording: "Reached by the `admin` and `probe` classes and by every session." No code change needed.

## J2 · COMPLETE

T38-7 done (N784), test only, no src/ change; commit 39793b19eb on `job/T38/host-governor`; the record's Completion has the detail.

- `ops.test.mjs`'s plane helper sends `Authorization: Bearer` (C-38.10); the retired `MEMBER_TOKEN` binding and its two class rows replaced by a second member's session (C-38.11), as K2182. No assertion loosened.
- host-governor tests 36/4 -> 40/0: rule 6 item 6 clears with this merge.

Checks: format, architecture, coverage (27/27), ownership: 0 failures. One REPORT (J1): R18's wording still names the retired member class.
