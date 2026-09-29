# content (T12)

**Status** · session_017fc5LrB8dqSfCReXYcSpsV · depth 2 · WORKING · handled B1

## Completion

**Applied.** N285, content's share (B1): R44's no-digest refusal answers through `extraction.noSha` (its R63). `attestationsFor` (`src/content/index.mjs`) returns `noSha("attestations are read by a capture sha256")` for a request naming no capture digest (absent, not a string, or empty: the condition R63 words, which the old guard already tested exactly), imported from `../extraction/index.mjs` beside `extractionOf`. Content no longer mints `NO_SHA`; the answer gains R63's `code`, `check` and `translation`. Built against R63's text as worded: extraction's helper is not on `tranche/T12` yet (its job has started, nothing built), so I verified against a local stand-in with R63's shape, not committed.

**Until extraction merges.** `import { noSha } from "../extraction/index.mjs"` does not resolve, so every module that loads content (content's own tests, and the plane) fails to load on this branch alone. It resolves the moment extraction's R63 lands, if extraction exports `noSha` from `src/extraction/index.mjs` (R63 names no file; if it lives elsewhere, the CHANGE tells me and I re-point one import). On the CHANGE: merge `tranche/T12`, re-run the tests below against the real helper.

**Strike.** R44's `(not yet met: N285)` is met by this work (for BOB to strike once the real helper runs green).

**Deferred.** None.

**Found (reported to BOB).**
1. The plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (`src/content/index.mjs` is an input). Not rebuilt (mechanics §14).
2. DEC-49 guard (`civicos-ui/check-refusal-codes.mjs --strict`), my commit against its parent with the same stand-in both times: arm G's `NO_SHA` list loses `src/content/index.mjs`'s site (6 → 5 literal sites; the rest are entities ×3, extraction's own R27 literal, progressions, each theirs under N285). No census, walk or ratchet figure moves by my change; no new failure kind. With the committed tree alone the guard stops at arm E (it loads content, which cannot resolve `noSha` yet).

**Tests and checks.**
- `node --test bio-plane/test/m/content/` with the R63 stand-in: tests 57, pass 57, fail 0 (1 new: "R44 (N285)": every shape of absence — undefined, null, "", 7, {}, an array, true — is `noSha`'s answer field for field, reads nothing and writes nothing; a digest held or never read is not the refusal). Without it: fails to load (above).
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … content`: 14 product files, 43 relative imports; 0 failures.
- `node checks/coverage.mjs … content`: 47 of 47 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … content tranche/T12`: legacy-store 0/0, legacy-checks 0/0; 0 failures.

Size (session_017fc5LrB8dqSfCReXYcSpsV): test runs 3, module lines 2233

## J1 · REPORT

Found beyond my module (record, Completion 'Found'): (1) plane bundle bio-plane/dist/bio-plane.bundled.mjs stale (src/content/index.mjs is an input); not rebuilt. (2) DEC-49 guard: arm G's NO_SHA loses content's site (6 -> 5 literal sites: entities x3, extraction's R27 literal, progressions remain, each theirs under N285); no census/walk/ratchet figure moves by my change; no new failure kind. (3) Until extraction's R63 lands, content's import of noSha from ../extraction/index.mjs does not resolve: content's tests, the plane and the guard's arm E cannot load on job/T12/content alone; they do on the merge, if extraction exports noSha from src/extraction/index.mjs (R63 names no file; tell me in the CHANGE if it lives elsewhere).

## J2 · COMPLETE

N285 applied: attestationsFor answers no digest (absent, not a string, empty) through extraction.noSha (its R63); content mints no NO_SHA. New test R44 (N285): every shape of absence is noSha's answer field for field, reads and writes nothing; negative control. Tests 57/57 against a local R63 stand-in (not committed); format, architecture, coverage 47/47, ownership: 0 failures. R44's 'not yet met: N285' is met by this work. Awaiting the CHANGE to merge tranche/T12 and re-run against the real helper. Record: build/jobs/T12/content.md, Completion.
