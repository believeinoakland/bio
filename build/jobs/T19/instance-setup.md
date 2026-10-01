# instance-setup (T19)

**Status** · session_017NLdnYUv8CHPKYpWgiwsHE · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

**Entries applied** (layer 11, instance-setup, as amended; B1). Commit `dbd9aaf4c6`. Merge early (rule 4).
- **R12, R16 (N420).** `profiles()` (and so `profilesSet`'s answer and `op=profiles`) carries `view`: `deadlines` and `legal_organisations` as `jurisdictions.combine` gives them over the active list, and `venues`, each `{kind, venue}` of a combined `action_kinds` entry that gives one. A fact no active profile states, one `combine` withholds (a conflict) or one it cannot give (`errors`, e.g. an id no longer held) is absent, never `[]`; with nothing active `view` is `{}`. From the namespace addressed (R16).
- **R24, R32 / rule 1.** `src/setup.mjs` imports `STATES`, `HEADINGS` from `record-grammar/document.mjs`, `deriveInquiryTitle` from `record-grammar/titles.mjs` (was `:19`, the catalogue), and `RISK_TIERS`, `riskTierState` from `action-grammar/index.mjs` (was `:23`, `actions/checks.mjs`; K787, K837). Stale "check catalog" comments re-worded.
- **Tests re-pointed.** `page.test.mjs` (STATES, HEADINGS, deriveInquiryTitle from record-grammar; RISK_TIERS, riskTierState from action-grammar); `intake.test.mjs` (`createSha256` and `checkBundle` from record-grammar, R45's C-2.7 comparison with capture's `INFORMATION_GRAMMAR` registered, K767); `worker-page.test.mjs` (deriveInquiryTitle from record-grammar; the question's conformance judged by record-grammar's `checkBundle` with the grammars the record answers: the test's Store subclass runs it with `recordOf(this.ctx).grammars()` inside the real plane, asserting inquiry-grammar's and capture's are among them, plus a negative control). No instance-setup file imports `bio-checks.mjs`.
- **K767, last of three.** Promotion (`gate.test.mjs`) and capture (`grammar.test.mjs`) had re-pointed, so I deleted from the catalogue: the held C-2.7 copy (`checkInformationExtension`, `INFO_ENUMS`, `MONITOR_FREQ`, its block comment), its `LEGACY_GRAMMARS` entry (the list is now `[]`, still frozen), `CONTENT_HASH_RE` (C-2.10's copy was gone: no other reader) and `asText` (no other reader). Pure removal: legacy-checks 0 added, 84 removed.
- **K789.** `keys.test.mjs`'s roster builds the real `credentials` beside membership on one storage (`credentialsOf(ctx, {record, membership})`, `migrate()`), claims through `credentials.claim`, and registers and lists keys through credentials (R6, R8). The four accepted reds are green. `uses` already named record-grammar, action-grammar and credentials.

**Requirements met, with their tests (for BOB to strike the marks, K775 (6)):**
- R12, R16 (`view`): `profiles.test.mjs` "R12 R16 profiles() carries view: …" (Oakland's profile, the non-Oakland test profile, and both; combine's withheld `records_request` venue absent; nothing active and an uncombinable list give `{}`; through the route; a scratch store's own view); and the R15 end-to-end test now also reads `view` through the real Worker's `op=profiles`.
- R32: `page.test.mjs` "R32 the tiers the form offers and writes are action-grammar's RISK_TIERS and riskTierState …"; `worker-page.test.mjs` "R32 R24 …" (both).
- R24 (re-pointed): `page.test.mjs` "R24 the intake form offers record-grammar's own first states and headings …"; `worker-page.test.mjs` "R24 a Question through the form …".
- R44 (K789): `keys.test.mjs`, its four tests.

**My readings (BOB's to overrule):**
1. "Absent, never an empty list" is applied per fact: a profile set stating `deadlines: []` gives no `deadlines` key. A deadline entry with one field withheld (e.g. `days`) is passed as combine gives it, with that field absent, not dropped whole ("as the combined view gives them").
2. "The grammars the record answers" read as `record-core`'s `grammars()` on the live plane, reached by the test's own Store subclass (a string script inside Miniflare, as the existing failing-store subclass already was), so the test imports no module outside `uses`.

**Deferred.** None.

**Found in other modules (REPORT):**
- `legacy-checks`: its `catalogue.test.mjs` pins the held C-2.7 copy K767 had me delete. Three tests go red from this change: "§1b no grammars, an empty list and an absent opts answer the same findings" and "§1b a registered grammar claiming a built-in arm's ids replaces that arm …" (their fixture's premise is that the held arm raises C-2.7), and "J2 the held C-2.7 copy runs only when …". Three were red before and stay red ("T19 wheres: C-28.13 …", "rule 2 LEGACY_GRAMMARS fills six …", "rule 2 the wrapper answers exactly …"). Before: 23 tests, 20 pass / 3 fail; after: 17 pass / 6 fail. They need re-wording or removal by legacy-checks' owner (or BOB, the catalogue being deleted whole in L11).
- `legacy-checks` stale comments (left, no act per K837 (3)): `bio-checks.mjs` comment ending "`CONTENT_HASH_RE` stays, for C-2.7 below …" and the `LEGACY_GRAMMARS` header's last sentence about the held copy.
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`) is stale from this change (`src/setup.mjs`, the catalogue), for the layer-close regeneration.
- `control-plane` (users' run): 1 of 85 fails, "R22 (K585 (1)): CHECK_FAMILIES is total …", as MONITORING #8 recorded identical on the baseline.
- Old battery files naming C-2.7 (`test/release.test.mjs`, `test/ratify-authority.test.mjs`, `test/provenance-chain.test.mjs`, `civicos-ui/test/add-surface.test.mjs`): red before and after this change, with identical first failures (none about C-2.7).

**Tests and checks.**
- `node --test bio-plane/test/m/instance-setup/`: tests 85, pass 85, fail 0 (on the branch before the job: 4 fail, the K789 reds in `keys.test.mjs`).
- Users of instance-setup: `test/m/control-plane/` 85 / 84 / 1 (pre-existing R22); `plane` has no tests path; `newgroup/test/` 31 / 31 / 0; `agent-worker/test/plan.test.mjs` (R51's reader of `view`) 1 / 1 / 0.
- Affected: `test/m/record-grammar/` 57/0; `capture/grammar.test.mjs` 4/0; `promotion/gate.test.mjs` 8/0; `test/m/legacy-checks/` as above.
- Layer tests: none named in `build/manifest.md`.
- `format`: 87 modules, 82 requirements files; 0 failures. `architecture`: 16 product files, 62 relative imports (3 naming no tracked file, not judged); 0 failures. `coverage`: 46 of 46 live requirement ids named by a test; 0 failures. `ownership` (vs `tranche/T19`): 8 files; legacy-store 0/0, legacy-checks 0 added / 84 removed, legacy-index 0/0; 0 failures.

Size (session_017NLdnYUv8CHPKYpWgiwsHE): test runs 16, module lines 5510
