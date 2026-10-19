# law-relations (T51)

**Status** · session_01WUaDP43x71LajSMPAd7ZrS · depth 2 · WORKING · handled B2

## J1 · COMPLETE

Entry T51-197 (words, the four words-check findings and two plain findings in `build/plan/words-pass/law-relations.md`) is applied in commit b3a28d3893 on `job/T51/law-relations`, after merging `tranche/T51` (merge 1082344d24).

**Applied**
- `index.mjs` (inline, 4 findings, one per site): the temporal-effect refusal detail → `localize("law-relations.index.no_effective_detail", …)`; the referential-set note of `lawRelationsOf` → `localize("law-relations.index.says_kept_apart", …)` (this also clears the plain finding at :339); the no-viewer `why` of `neighbours` → `localize("law-relations.index.read_names_member", …)` (the same sentence is copied in `duties` and `hypotheses`; I did not hand-reference their keys, K3268); the court-standards note → `word("law-relations.why.first_court_standards", {scan_max})` (an existing row; the `{}` placeholder was a template literal); the citation-lookup note → `word("law-relations.says.keyed_citation_lookup")` (existing row, same sentence; this clears the plain finding at :627).
- Undetermined in-force reason (K3958, R7 / R7-R12 red since CR-1): `neighbours` now passes civil-time's keyed `why` `{key, vars}` on as is, and its fallback is `{key: "law-relations.why.undetermined_date_asked", vars: {}}` (an existing row for "undetermined at the date asked", the copy finding at :672). The `catch` around `validAt` used to put the exception's text into `why`; it now sets an undetermined answer with no reason, so the keyed fallback applies. A developer message no longer reaches `why`.
- `test/m/law-relations/reads.test.mjs` (R7 / R12 case): the assertion on `undetermined.why` now checks it is keyed (`.key` a string) rather than a string. This is the keyed-reason change BOB asked for, not a weakened test.
- No new requirement id, no change to any other module, no generated artifact edited.

**Deferred:** nothing in my module.

**Found in another module:** nothing to report. The whole-product words check run (`checks/run.mjs`) shows failures in other modules, all outside this job.

**Tests and checks**
- `node --test bio-plane/test/m/law-relations/*.test.mjs`: before my change 25 pass, 1 fail (R7 R12, the keyed reason); after: 26 pass, 0 fail.
- `node checks/words.mjs /home/user/bio law-relations`: 0 failures (was 6).
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage line for law-relations shows no finding (21 of 21 live ids named by a test; `checks/coverage.mjs`: 0 failures). The product-wide words line shows 3,795 failures in other modules; none name law-relations.
- `node bio-plane/src/setup-words/build.mjs --check`: exit 1 with one stale-rows note naming `law-relations.index.no_effective_detail` (expected: the new ids are not in `rows.mjs` until BOB regenerates it at the layer close; `localize` answers the English meanwhile). It names no refusal.
- `node checks/ownership.mjs /home/user/bio law-relations tranche/T51 job/T51/law-relations`: 1 file changed by law-relations, 0 failures.
- `node checks/architecture.mjs /home/user/bio law-relations`: 0 failures.

Size (session_015HSCTTafg8KGt1DUeEh3D1): test runs 2, module lines 936

## J2 · COMPLETE

RW (words round, B2) complete on `job/T51/law-relations` at `b8439ea8f2`, after merging `tranche/T51` (`21f27ab166`) into the branch (merge `02b0bb15fd`).

**Applied**
- `bio-plane/src/law-relations/checks.mjs` (commit `cc836c2c09`): the two inline findings, at :26 (`LAW_RELATION_NO_CITATION`) and :52 (`LAW_RELATION_SELF`), were string literals joined by `+`. Each translation now reads its existing row, `word('refusal.LAW_RELATION_NO_CITATION')` and `word('refusal.LAW_RELATION_SELF')` (rows in `setup-words/rows.mjs` at :9727 and :9730), as the other refusals in that file do. I checked each row equals the old sentence character for character.
- The plain findings and the four `index.mjs` findings on the words-pass list were cleared in J1; the check reads 0 for them now.
- No requirement, test, provided service or generated artifact changed. The module's tests compare `LAW_RELATIONS_CHECKS[code].translation` with the module's own value, so they copy no sentence.

**Deferred:** nothing in my module.

**Found in another module:** nothing to report against a module's requirements. The product-wide words and coverage failures are all in other modules (below); none names law-relations.

**Note on the tranche merge:** `bio-plane/src/setup-words/build.mjs --check` passed (exit 0, "match words.json and the source") before the merge. After merging `tranche/T51`, it exits 1 with "words-unreviewed.json is stale or absent". That is a stale generated artifact, not a refusal naming this module. I did not regenerate it (B2); BOB regenerates it at the layer close.

**Note on the branch:** `build/metrics/T51.csv` and `build/plan/starts-T51-RW/agent-worker.txt` differ from `tranche/T51`. They come from earlier commits on the job branch (K4022, K4030), not from this session's work. I did not change them.

**Tests and checks** (the module checks ran after the tranche merge; `checks/run.mjs` ran before it)
- `node checks/words.mjs /home/user/bio law-relations`: `words: 1 modules, 1703 string literals read, 15438 words; inline 0, plain 0, testcopy 0, missingkey 0, handlist 0 (0 tagged ?), marker 0, dev 2, unkeyed 13; 0 failures` (was 2 failures)
- `node --test bio-plane/test/m/law-relations/*.test.mjs`: `ℹ tests 26`, `ℹ pass 26`, `ℹ fail 0`
- `node checks/format.mjs /home/user/bio`: `format: 176 modules, 175 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio law-relations`: `architecture: 8 product files, 30 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio law-relations`: `coverage: 1 modules, 21 of 21 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio law-relations tranche/T51 job/T51/law-relations`: `ownership: 2 files changed by law-relations between tranche/T51 and job/T51/law-relations; 0 failures`
- `node bio-plane/src/setup-words/build.mjs --check`: exit 0 before the merge; exit 1 after it, the stale-artifact note above.
- `node checks/run.mjs /home/user/bio` (before the tranche merge): format 0 failures; architecture 0 failures; words 1628 failures and coverage 22 failures, all in other modules, none naming law-relations; exit 1 for those other modules only.

Size (session_01WUaDP43x71LajSMPAd7ZrS): test runs 3, module lines 933
