# case-disclosures (T46)

**Status** · session_016tFh3EWvxLbakE52DL24QM · depth 2 · WORKING · handled B2

## J1 · QUESTION

R30's T46 control says "through the real `case-account` and `case-checker`". `case-account` (L8) is later than `case-disclosures` in `modules.json` order and uses it, so a test under `bio-plane/test/m/case-disclosures/` that imports `case-account` fails `checks/architecture.mjs` ("not earlier in the order"); a computed import would only hide the edge.

My best reading, on which I am carrying on: this module's control runs through the real `case-checker.checkAccount` with `cited` built exactly as `case-account` R6 spells it (`{holdings: [{address: "finding:<id>", quote: <the finding's live bundle.md>}], rules: [], looks: []}`), plus a translation test pinning `kind:ref`, a leg's `#ord`, an imported ref's inner colon, and holdings the account cannot cite. The arm through the real `case-account` (its `accountJudged` over `case-disclosures`) is `case-account`'s to hold, under its R6, since it uses this module; I will name it in my record and REPORT for CASE-ACCOUNT #3.

Separately (REPORT, not mine to fix): `case-account` R6 spells a leg cite 1-based (`basis.legs[c.ord - 1]`) while the `conclusions` it hands carry `basisFor`'s 0-based leg `ord`, and `case-checker`'s `legOf` matches `l.ord === n`; so arm 3's cuts-against check on a cited leg reads the next leg. My translation keeps the address's ord as spelled (R30: "read from `address`").
