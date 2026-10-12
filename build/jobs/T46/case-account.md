# case-account (T46)

**Status** · session_01Xn37tqsLSaaQvhHtapo2Nd · depth 2 · COMPLETE · handled B0

## Working notes

**Reading (mechanics §17).** I read these whole myself:
- my requirements, `build/requirements/case-account.md` (public and private parts);
- all my code: `src/case-account/` (`index.mjs`, `checks.mjs`, `document.mjs`, `schema.mjs`);
- all my tests: `test/m/case-account/` (the fixture and six test files);
- my entry T46-26 and the "Rules at the opening" in `build/plan/current.md`; BOB's START (B1);
- `words.json`'s `refusal.ADVOCACY_NOT_OWN_PROJECT` (the one C-153 code it holds);
- the patterns R15 and R16 name: local-facts R15, R16 and its `localFactsOps`, `RULE_WORDS` and test helper `words.mjs`;
- the plane's own two arms for my ops (`src/plane/store.mjs` 701–710), which my map reproduces;
- case-disclosures R30 (as T46-25 amends it) and case-checker R24 (as T46-23 amends it), for BOB's R6/R13 note.

The set is over the limit only with the used modules' public parts. I did not read those this time, and used no helper digest: nothing in this job calls a service of theirs differently. The two that bear on my change (case-disclosures R30 and case-checker R24) I read whole.

**Entries applied (T46-26).**
- **R15** (N935). New export `caseAccountOps(c, url, body)`, with two arms:
  - `advocacycheck` → R13's `advocacyCheck`. `project` is the query's, else the body's. `sentences` is the body's. `author` is the URL's `by` stamp and `viewer` the URL's.
  - `advocacychecks` → R13's `advocacyChecksOf`, with `project` read the same way and `viewer` the URL's.
  - A body cannot set `author` or `viewer`. A body that is not an object carries no sentences.
  - The arms answer exactly what the plane's own named entries answer today. Until plane T46-62 replaces those entries with the spread, they override it, and both answer alike.
- **R16** (DEC-194, N913). New `ADVOCACY_WORDS` in `checks.mjs`, exported from `index.mjs`. It holds `refusal.ADVOCACY_NOT_OWN_PROJECT` verbatim, and C-153.2 reads its translation from it by key. The code, number, `where` and behaviour did not move. C-153.1 and C-153.3, which `words.json` does not hold, keep their words.
- **BOB's note on case-checker R24.** My R6 and R13 tests agree with it. New test: a sentence stating nothing checkable reads `supported` when it cites a held passage or a seen finding. Its control: cite nothing, or only an unseen finding, and it reads `not_supported`.
- Tests: new `t46.test.mjs` and helper `words.mjs` (a key the list lacks throws).
  - R15: the map's two arms; each arm deep-equals R13's answer; query beats body for `project`; the stamps come only from the URL; a non-object body; refusals through the arms write nothing.
  - R16: the translation equals the key's words; only that key is held; all three rows' checks and `where`s are pinned; the other two keep their words; the refusal reached at the interface, with a control.

**Found in my own module (P8).** I read all of it. One thing fixed: `t45-judgment.test.mjs` drove R6's figure arms through a fixture workaround for N901. Once case-disclosures' T46-25 fix merges, that workaround would hand the fixed module a list where it expects `{holdings}`. The fixture now probes once whether the real R30 translates by itself, and if so hands it R6's `cited` as built. It passes before and after the fix. Nothing deferred.

**Found outside my module.**
- `op-declarations` (T46-51): `test/m/op-declarations/t42.test.mjs:186`, "R48, R6: … case-account exports no ops map …", asserts that no export's name ends in `ops`. R15 makes it stale: green on the tranche, red on my branch, the only new red. What it means to say still holds: the map carries neither `accountpropose` nor `accountdrafts`, which stay the door's. Suggested re-pin: `Object.keys(caseAccountOps(...))` is exactly `["advocacycheck", "advocacychecks"]`. `t45.test.mjs` "R49, R6 …" (already red, rule 5) names "case-account's two by the plane". With R15 they are served by my map.
- `plane` (T46-62): `src/plane/store.mjs` 701–710 names my two ops itself, with a comment saying case-account exports no ops map. Under plane R39 the plane spreads `...caseAccountOps(caseAccountOf(ctx), url, body)` instead.
- Generated artifacts staled by this change: the plane bundle, `release/bio-plane.bundled.mjs`, `newgroup/src/release.mjs` and its bundle (rule 5 (4)). The re-worded C-153.2 row waits for T47's stamp (rule 5 (2)).

**Tests and checks** (on `job/T46/case-account`, after the change):
- `node --test test/m/case-account/`: tests 38, pass 38, fail 0.
- The users of the changed row and the new export: case-authoring, review, plane t42 and t45 together give tests 282, pass 282, fail 0. op-declarations, control-plane `r53-routes` and affordances together: 10 failing tests on my branch against 9 on the tranche, the extra one being the t42 pin above.
- Layer tests: none named in `build/manifest.md`.
- `format`: 159 modules, 158 requirements files; 0 failures.
- `architecture`: 11 product files, 47 relative imports; 0 failures.
- `coverage`: 16 of 16 live requirement ids named by a test; 0 failures.
- `ownership`: 6 files changed by case-account; 0 failures.
- `checks/run.mjs` over the product: architecture 2951 product files, 0 failures. Coverage shows 32 failures, none of them case-account's (rule 5 (1) and other modules' new ids).

Size (session_01Xn37tqsLSaaQvhHtapo2Nd): test runs 7, module lines 935

## J1 · COMPLETE

T46-26 applied: R15 and R16. I read my code and tests whole (record: Working notes).
- R15: new export caseAccountOps(c, url, body), with arms advocacycheck and advocacychecks. Each answers exactly what R13 answers. `author` is the URL's `by` stamp and `viewer` the URL's, both from the query; `project` is the query's, else the body's.
- R16: C-153.2 ADVOCACY_NOT_OWN_PROJECT reads words.json's refusal.ADVOCACY_NOT_OWN_PROJECT by key, through ADVOCACY_WORDS (checks.mjs). No code, number, where or behaviour moved. C-153.1 and C-153.3 keep their words.
- case-checker R24: my R6 and R13 tests agree. A new arm shows the "supported" reading, with its control.
- Fixed in my module: the T45 test's N901 workaround now probes whether case-disclosures translates `cited` by itself, so it stays green once T46-25 merges.
- Found outside: op-declarations t42.test.mjs:186 pins "case-account exports no ops map". R15 makes it red (the only new red; for T46-51). plane store.mjs 701–710 should spread caseAccountOps (T46-62).
- Checks: case-account tests 38/38; users 282/282; format, architecture, coverage (16/16) and ownership each 0 failures.
