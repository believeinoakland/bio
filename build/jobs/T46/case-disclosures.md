# case-disclosures (T46)

**Status** · session_016tFh3EWvxLbakE52DL24QM · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R30's T46 control says "through the real `case-account` and `case-checker`". `case-account` (L8) is later than `case-disclosures` in `modules.json` order and uses it, so a test under `bio-plane/test/m/case-disclosures/` that imports `case-account` fails `checks/architecture.mjs` ("not earlier in the order"); a computed import would only hide the edge.

My best reading, on which I am carrying on: this module's control runs through the real `case-checker.checkAccount` with `cited` built exactly as `case-account` R6 spells it (`{holdings: [{address: "finding:<id>", quote: <the finding's live bundle.md>}], rules: [], looks: []}`), plus a translation test pinning `kind:ref`, a leg's `#ord`, an imported ref's inner colon, and holdings the account cannot cite. The arm through the real `case-account` (its `accountJudged` over `case-disclosures`) is `case-account`'s to hold, under its R6, since it uses this module; I will name it in my record and REPORT for CASE-ACCOUNT #3.

Separately (REPORT, not mine to fix): `case-account` R6 spells a leg cite 1-based (`basis.legs[c.ord - 1]`) while the `conclusions` it hands carry `basisFor`'s 0-based leg `ord`, and `case-checker`'s `legOf` matches `l.ord === n`; so arm 3's cuts-against check on a cited leg reads the next leg. My translation keeps the address's ord as spelled (R30: "read from `address`").

## Completion

**Read.** My requirements (`build/requirements/case-disclosures.md`, public and private) and my code (`bio-plane/src/case-disclosures/`: `index.mjs`, `checks.mjs`, `materials.mjs`, `document.mjs`, `accepted.mjs`, `people.mjs`) whole myself, with `account.test.mjs` and `fixture.mjs` (the tests I changed). The rest of the reading set was over the 600 KB limit (B1), so a helper in this session read whole and digested, citing each section: my other nine test files; the Public parts of `case-checker` (R24 verbatim), `answers` (R33, R3/R4) and `case-account` (R6 verbatim); the Status, Purpose, ids and every T46-tagged requirement of the other Uses modules; and the code of `case-checker/account.mjs` (`citedMap`, `citeOf`, `judgeSentence`), `answers/sentences.mjs` and `readlog.mjs`, and `case-account/index.mjs` (`citeAddress`, `#held`, `citedFor`). I then read `case-account`'s `accountJudged`, `citedFor` and `#held` myself. The sources stay binding.

**Entry applied.** T46-25 (N901; K2829): R30. `accountJudged` passed `cited` to `checkAccount` unchanged. `checkAccount` read case-account's `{holdings, rules, looks}` object as a map with three keys, so no cite ever matched and every cited sentence answered `ACCOUNT_SENTENCE_UNSUPPORTED`. Now `checkerCited(cited)` (exported) translates it at the one site.
- Each holding becomes `{kind, ref, ord?, text}`:
  - `kind` is the address up to its first `:`, so an imported ref keeps its inner colon;
  - a leg's `ord` is its trailing `#<digits>`; any other kind keeps a `#` it holds;
  - `text` is the `quote`.
- A holding no sentence can cite is not passed on. That covers a kind outside `case-grammar` R23's `ACCOUNT_CITE_KINDS`, an empty ref, or a leg with no ord.
- `rules` and `looks` are not passed on.
- Any other `cited` is passed on as given, so `checkAccount` judges it, and a shape it does not take still fails closed as `ACCOUNT_CHECK_UNDETERMINED`.
- The `case-grammar` import gains `ACCOUNT_CITE_KINDS` (a declared use).

**Tests** (`account.test.mjs`):
- New: "R30 (T46; N901): … translated at this one site …". It covers every kind, a leg's ord, an imported ref, a non-leg `#`, the holdings dropped, and other shapes passed on as given.
- New: "R30 (T46; N901; K2829) control, over the real case-checker.checkAccount". A sentence citing a held finding, its `cited` built exactly as case-account R6 spells it, passes. The same sentence with no holding answers `ACCOUNT_SENTENCE_UNSUPPORTED`. A quotation the finding does not hold answers `ACCOUNT_FACT_NOT_IN_CITED`.
- Brought in line: the first R30 test now expects `[]` for `{holdings: []}`. The real-checker test hands `cited` in case-account's shape.
- With the translation removed, all four of these R30 tests fail, so they test the change.
- Per J1/B2 (K2965), the arm through the real `case-account` is `case-account`'s.

**Ran:**
- `node --test test/m/case-disclosures/`: tests 97, pass 97, fail 0.
- Users of the changed service: `test/m/case-account/` (tests 32, pass 32, fail 0) and `test/m/case-authoring/` (tests 204, pass 204, fail 0).
- No layer tests are named in the manifest.
- `format`: 159 modules, 158 requirements files; 0 failures.
- `architecture case-disclosures`: 17 product files, 102 relative imports; 0 failures.
- `coverage case-disclosures`: 31 of 31 live requirement ids named by a test; 0 failures.
- `ownership case-disclosures tranche/T46`: 0 failures.
- `checks/run.mjs` over the product: architecture 2949 product files, 0 failures. Coverage has 33 failures, all in other modules (inherited; none mine). Channels 0 failures.

**Flaws in my module.** Reading the whole module found none beyond the entry's.

**Deferred.** None.

**Other modules (REPORT in J1, forwarded by B2):**
- `case-account` R6 spells a leg cite 1-based (`basis.legs[c.ord - 1]`), but the `conclusions` it hands carry `basisFor`'s 0-based leg `ord`. `case-checker`'s `legOf` matches `l.ord === n`, so arm 3's cuts-against check on a cited leg reads the next leg. My translation keeps the address's ord as spelled.
- B2 also asks me to merge `tranche/T46` when case-checker's merge is announced. I will do it on that `CHANGE`.

**Generated artifacts.** None made stale: no generated artifact in the manifest is built from `case-disclosures`.

Size (session_016tFh3EWvxLbakE52DL24QM): test runs 6, module lines 2418
