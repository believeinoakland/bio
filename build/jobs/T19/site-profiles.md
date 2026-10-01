# site-profiles (T19)

**Status** · session_012Q6VzShdRmKdjhfmTkxiGp · depth 2 · COMPLETE · handled B1

## Completion

**Entry applied** (`build/plan/current.md` layer 1, site-profiles; B1): copied `docprofile/index.mjs`, `recogniser.mjs`, `events.mjs` and `handlers/` into `site-profiles/` (not `registry.mjs`). Nothing in `docprofile/` changed; DOCPROFILE's job deletes its copies and re-exports.

**Registration and the cycle.** The module registers its own four handlers in `index.mjs` (order `client_rendered`, `aspnet_webforms`, `wordpress`, `conservative`). To avoid the cycle, `REGION` moved to a new leaf `site-profiles/region.mjs` and the handlers import `CONFIDENCE` from `recogniser.mjs` and `REGION` from `region.mjs`, never `index.mjs`. `index.mjs` is the whole interface: it re-exports `recogniser.mjs` and `events.mjs` and exports `REGION`, `register`, `handlers`, `applyRules`, `applyBoundary` and the four handlers by their docprofile names (`aspnetWebforms`, `wordpress`, `clientRendered`, `conservative`), so `docprofile/registry.mjs` can drop its four `register` lines and re-export `site-profiles/index.mjs` alone (`export *` plus the four names come with it).

**Flaws fixed in the copy** (each within R1–R19's meaning):
- `confidenceRank`, `significanceRank` and `event()` treated inherited names (`"constructor"`, `"toString"`) as known: `event("constructor")` returned an ungraded event instead of throwing (R13), and `confidenceRank("constructor")` returned a function (R4). Now own-key lookups.
- `event(type, detail)` let `detail.significance` / `detail.type` override the catalogue's (R13: "with the catalogue's significance"). Now the catalogue's always win; key order unchanged. No caller passes either.
- `worstSignificance`/`bySeverity` gave an inconsistent order or a non-catalogue "worst" on an entry with no catalogue significance; now such an entry ranks below routine and is never the worst (R14).
- `unescapeHtml` decoded twice (`&amp;lt;` → `<`); now one pass (`&amp;lt;` → `&lt;`) (R15).
- `digests` could throw on a handler's malformed rule (no `patterns`, a non-RegExp pattern) or a non-RegExp boundary; now skipped (R8–R9 "otherwise never throws").
- `compare` threw on a null handler; now answers like `digests` (R10 "Errors: as digests").
- `identify(null)` threw; a missing ctx is now an empty one (R1).
- Error messages name `site-profiles` (Suggestion).

**Deferred:** none.

**Found in other modules:** none beyond the split itself. Note for DOCPROFILE: `docprofile/test/docprofile.test.mjs` registers `KINDLESS` through `dp.register`; once `registry.mjs` re-exports this module that reaches this module's registry, which is what it needs.

**Tests:** `node --test site-profiles/test/` → tests 19, pass 19, fail 0 (one per R1–R19, at the interface `site-profiles/index.mjs`; fixtures in `site-profiles/test/fixtures.mjs`, no place named). `node --test docprofile/test/` (unchanged, for reference) → pass 46, fail 0. No layer tests (`build/manifest.md`).

**Checks** (process repository):
- `format`: 83 modules, 78 requirements files; 0 failures
- `architecture site-profiles`: 10 product files, 17 relative imports; 0 failures
- `coverage site-profiles`: 19 of 19 live requirement ids named by a test; 0 failures
- `ownership site-profiles tranche/T19`: 0 failures

Size (session_012Q6VzShdRmKdjhfmTkxiGp): test runs 4, module lines 919
