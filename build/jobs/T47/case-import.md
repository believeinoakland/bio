# case-import (T47)

**Status** · session_017tqJqUTKpFeyBvHdxfwpzn · depth 2 · WORKING · handled B1

## Completion

**How the reading set was read (mechanics §17; K2032).** The measured set (678 KB) is over the limit, so I followed BOB's START:
- **Read whole myself:**
  - `build/requirements/case-import.md`, both parts;
  - every file of my code (`index.mjs`, `checks.mjs`, `schema.mjs`) (P20);
  - from my tests, `fixture.mjs` and `flags.test.mjs`;
  - accepted-work's public part (R1, R2, R8, R9: the service I fill);
  - record-core R47–R48 (`stampInstant`, `instantOrder`: R24's "an instant record-core stamps");
  - public-read's door for R21 and R25 (R17's corrected citation);
  - my entry T47-30 and rule 5 in `build/plan/current.md`;
  - `build/layers.md` §"Layer 8: case-checker and case-import".
- **Used modules:** for every other used module, only the services my Uses names, as my code calls them.
- **Read by a helper in this session:** the other eight test files (`accept`, `calculations`, `group-fields`, `import`, `reads`, `real`, `voice`, `watch`). The helper had my entry and the requirements, read each file in full, and wrote me a digest citing each test by file and line. The sources stay binding.

**Entries applied (T47-30).**
- **R24 (N947, K3033):** a new service, `flagHistoryFacts({ref, edition, since, viewer})`. It is registered with `accepted-work` as the registration's fifth function, `flagHistory` (its R9).
  - It answers every flag on the edition the ref names, the edition's own and the named finding's, that was open at any instant from `since` through the read. That includes a flag open now and one cleared since, in the order flagged.
  - Each flag is `{flag, finding, issue, opened_at, cleared_at}`, with `cleared_at` null while the flag is open, and the answer carries `complete: true`.
  - A `since` that is not exactly one of record-core's two spellings (its R47) answers `{flags: [], complete: false}`.
  - A viewer who is not an active member is answered null.
  - It writes nothing and never throws; on an internal failure it answers `complete: false`.
  - **Reading:** a clear is stamped to the second, so `since` is compared at the second. A flag cleared in the same second as `since` is answered, never dropped. This errs toward showing a flag, which is the safe side for case-carriage R19.
  - No table changed, because flags and clears already record their instants. No refusal row changed.
- **R17 (N951):** the code's citation is corrected from "`docket` R23, R24" to the route `public-read` R21 and R25 serve, answering `docket` R24. The behaviour was already as R17 states it.

**Tests (under `bio-plane/test/m/case-import/`):**
- `flags.test.mjs`: three tests naming R24.
  - The full rule through `accepted-work.flagHistoryOn`: the edition's own flags and the named finding's, another finding's left out, order, instants, nothing written.
  - R24's three controls, and the boundary at the second.
  - A `since` that is not an instant (13 shapes) against both spellings as controls; non-member null; a viewer never sent; not held; never throws; registered, so never absent.
- `watch.test.mjs`:
  - one test naming R17 (N951): the address's query is exactly `op=docketpublic`, the case and `captures=omit`;
  - one test for R18's page bounds: 1–200, default 200, a cap at 200 with 203 watches, and `watchedImports` and `watchItems` never throwing.
- `accept.test.mjs`:
  - R5 for an import or edition not held, after R1's two;
  - R6's full refusal order, `NOT_RECREATED` before `GAPS_UNSTATED`;
  - R7's full refusal order.

  The digest showed these three were only sampled before.
- `import.test.mjs`: the title of R3's "checker throws" test now says what it asserts (no result, and why), where it used to say "recorded as unknown".

**Flaws in my own module.** The gaps the tests left (above) are dealt with. Two observations are left as they are, because the requirements state them this way:
- `openFlags` and `flagHistory` answer a ref naming a finding the edition does not hold with the edition's own flags. accepted-work R1 and R24 define them that way.
- A viewer never sent is the plane reading for itself (`#sees`). That is R16's existing reading, unchanged here.

**Deferred:** none.

**Found in another module (reported to BOB):**
- **R16's non-member clause on `moves` and `withdrawals`.** case-import R16 says "a viewer who is not an active member is answered null" across the whole registration. But accepted-work R1 and R8 give `withdrawals({after, limit})` and `moves({after, limit})` no `viewer`, so that clause cannot be reached for those two. This is a wording point for BOB in R16 or accepted-work R1; no code is wrong.
- **Generated artifact:** this change stales the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`), which BOB regenerates at L8's close (rule 5 (4)).

**Tests and checks run:**
- case-import: `node --test test/m/case-import/`: tests 109, pass 109, fail 0.
- Users of case-import or accepted-work (P11):
  - green: accepted-work 28/0; basis-versions 152/0; strength 160/0; reevaluation 141/0; case-carriage 80/0; publication 141/0; case-disclosures 97/0; conformance 109/0; filings 97/0; monitoring 137/0; queue-producers 74/0; control-plane 242/0; `test/system/migrate-released.test.mjs` 1/0.
  - red: case-authoring 209/1; affordances 242/3; op-declarations 144/12; answer-envelope 32/1; plane 221/2.
  - Each red count is the same on an untouched `origin/tranche/T47` worktree, so none of them is this job's. They are rule 5's (7a), (7b), (7c) and (8) reds. None names case-import.
- Checks, run from the process repository:
  - `format.mjs`: 168 modules, 167 requirements files; 0 failures.
  - `architecture.mjs … case-import`: 13 product files, 66 relative imports; 0 failures.
  - `coverage.mjs … case-import`: 24 of 24 live requirement ids named by a test; 0 failures.
  - `ownership.mjs … case-import tranche/T47`: 6 files changed; 0 failures.
  - `run.mjs` over the product: format 0, architecture 0 and channels 0 failures; coverage 44 failures, all in other modules (rule 5 (1)), none in case-import.

Size (session_017tqJqUTKpFeyBvHdxfwpzn): test runs 34, module lines 2116

## J1 · REPORT

Found reading R16 against accepted-work R1/R8: case-import R16's 'a viewer who is not an active member is answered null' cannot be reached for `withdrawals` and `moves`, since accepted-work R1/R8 give them only {after, limit}, no viewer. No code is wrong; a wording point for R16 or accepted-work R1, BOB's to place. Also: this job stales the plane bundle (rule 5 (4)), for L8's close.
