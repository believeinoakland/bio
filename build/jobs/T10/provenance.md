# provenance (T10)

**Status** · session_01U1hr3TuE7sjb7d1PSfBTtt · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N263 / R50: where does C-53.14's catalogue row live, and where is it asked?

1. The row. No `C-53.14` exists anywhere today. R50 says "C-53.14, this module's row"; provenance's Suggestions say "C-53.14 (legacy-checks' row until this module holds its family, as C-53.13)"; N263 names legacy-checks too, but T10's plan gives legacy-checks no job (its rows are `draft-T11.md`) and `bio-checks.mjs` is not my path.
   My best reading (building on it now): the row is this module's own, in a row table under my paths, `REGISTER_ENTRY_CHECKS` in `bio-plane/src/provenance/checks.mjs`, `{REGISTER_BYTES_UNSTATED: {check: 'C-53.14', where: 'src/provenance/index.mjs #registerEntries > is-register-bytes', translation}}`, as capture-sources added C-105.10 to its own table (1.40.0) and publication holds C-44.2 apart from the rest of C-44. The rest of C-53 stays in legacy-checks' TESTIMONY_CHECKS. The arrival moves `CATALOG_VERSION` (promotion R34: rows counted wherever they live), which is promotion's re-stamp, reported, not mine.
2. The order. R50 does not rank itself against R3 and R2. My reading: asked first in the module's registered check, before the testimony fence (R3) and one-home (R2), since an entry that states no size is malformed before anything is judged about it. R3's "asked before R2's" holds unchanged. Every entry of the list is asked (a non-object entry has no `bytes`, so it is refused too, naming `sha256: null, path: null`); a replay is not exempt (R50 says any promotion).

## J2 · REPORT

Found in other modules and artifacts by this job; I changed none of them.

1. **Generated artifacts made stale** (mechanics §14): `agent-worker/dist/agent-worker.bundled.mjs` with its `.bundle.json` (owner `agent-worker`), and `bio-plane/dist/bio-plane.bundled.mjs` with its `.bundle.json` (owner `not_product`). `fleetbundles.test.mjs` names `src/provenance/index.mjs` as the source for both. Regenerate them at the layer's close with `node tools/bundles.mjs`.
2. **promotion (R34): `CATALOG_VERSION`.** C-53.14 `REGISTER_BYTES_UNSTATED` arrives in provenance's own row table, `REGISTER_ENTRY_CHECKS` (`src/provenance/checks.mjs`, exported from `src/provenance/index.mjs`). The catalogue changed, so the stamp and census move. That is promotion's re-stamp (1.40.0's pattern), and the d470 census pin is legacy-tests'.
3. **legacy-checks: C-53's header** in `bio-checks.mjs` (above `TESTIMONY_CHECKS`) lists the family's regions, and it does not name C-53.14 or say that it lives in provenance. Add a line when legacy-checks' convergence rows run (T11).
4. **connections (and capture R58): one red test, and it is not caused by this job.** `test/m/connections/factory.test.mjs:11`, "R24, R18, K155: the capture and extraction connections creates carry the env…", fails with capture's `captureOf` R58 refusal: "a caller supplied a different `env` for a storage whose capture already holds another one". It fails the same way with my change stashed (connections 59/60 both ways). Its test or capture's R58 needs one of those modules' jobs.

## J3 · COMPLETE

**Entry applied** (plan: the provenance bullet, N263 → R50), on the readings B2 confirmed (K324):
- **R50 is built.** A new row table, `REGISTER_ENTRY_CHECKS`, in `bio-plane/src/provenance/checks.mjs`, exported from `index.mjs`, holds `REGISTER_BYTES_UNSTATED` → C-53.14. Its `where` is `src/provenance/index.mjs #registerEntries > is-register-bytes`, and the region is marked. `#registerEntries` runs first in the module's registered check, before the testimony fence (R3) and one-home (R2), over every entry of the promotion's `register` list, replays included.
  - An entry whose `bytes` is not a safe integer ≥ 0 is refused with its code, row and translation, plus `index`, `sha256` and `path` (both `null` for a non-object entry). Refused cases include absent, null, negative, fractional, a string, NaN, Infinity, 2^53, a bigint, an object and a boolean. The promotion writes nothing.
  - An accepted `bytes` is stored exactly as stated (R1's write is unchanged). The stated size is not compared with the stored object's size.
  - I used a *safe* integer so that "stored exactly as stated" holds. 2^53 and above cannot be stored exactly and are refused.
- **Improvement (K316):** the module's tests now run on a workerd-shaped fixture. `sql.exec` answers a cursor, never an array. All 62 earlier tests stay green on it, so provenance, record-core, membership and promotion all read through spreads here.

**Tests** (`register.test.mjs`): R50's `test.todo` is replaced by one test that checks everything R50 states:
- each malformed kind above, with its code, row, translation, index, sha256 and path, and nothing written;
- a non-object entry;
- a replay;
- ordering before R2 (a capture held by another bundle) and before R3 (an authored capture);
- 0 and `MAX_SAFE_INTEGER` stored exactly;
- an empty list not asked.

Negative control: with the check disabled the test is red (17/1). Restored, it is green.

**Deferred:** none. **Other modules:** J2. Two stale bundles (agent-worker, bio-plane). Promotion's `CATALOG_VERSION` (N281). A line for C-53's header in legacy-checks. One connections test red before and after this job (capture R58).

**Tests run:**
- `node --test bio-plane/test/m/provenance/` gives tests 63, pass 63, fail 0, todo 0.
- The manifest names no layer tests.
- Every module that uses provenance: capture 64/0, content 54/0, entities 34/0, connections 59/1 (the failure predates this job, J2 4), progressions 40/0/1 todo, observation-log 42/0, retrieval 58/0, inquiry 50/0, basis-versions 42/0, strength 40/0, intent 35/0, reevaluation 39/0, publication 53/0/2 todo, ratification 65/0/1 todo, case-authoring 38/0, consequences 22/0, actions 30/0, filings 33/0, monitoring 43/0/10 todo, queue 10/0.
- `fleetbundles.test.mjs` fails only on the two stale bundles (J2 1).

**Checks:**
- format: 69 modules, 64 requirements files; 0 failures
- architecture: 12 product files, 41 relative imports (2 naming no tracked file, not judged); 0 failures
- coverage: 50 of 50 live requirement ids named by a test; 0 failures
- ownership: 5 files changed by provenance between tranche/T10 and HEAD; legacy-checks, legacy-store and legacy-index 0 added, 0 removed; 0 failures

Size (session_01U1hr3TuE7sjb7d1PSfBTtt): test runs 8, module lines 3233
