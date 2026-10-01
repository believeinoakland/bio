# query-language (T21)

**Status** · session_01PXvHqUoNr5cngACTYbDozK · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (B1; `bio-plane/src/query.mjs` only):
- **N458** "record" for "bundle" in text members read: the `grain` of `resolves` (:555) and `concerns` (:558) now read "the record carrying a capture …" (published by `meaningVocabulary()`, R18). A re-scan of every string in the file found no other outward "bundle" but the interface names N71 keeps (`bundle_id`, `bundle.md`, SQL). :1864's warning (`projection: not a table and a key; the projection is read from bundles`) names the TABLE `bundles` (R25's own words), so it is an identifier and stays; no test re-keyed (none pinned the old grain words; R18's test compares the registry, not literals).
- **N469** notes naming a deleted file as live, re-worded: :1379 (`fieldread.control.mjs`) and :1776 (`project-sight.test.mjs`) kept as provenance, past tense, no file named; :1798 ("the §7 digest … says so") now points to R11's test; :2691–2697 (`fieldread.control.mjs --tripwire-sweep`, "runs the WHOLE battery") kept as provenance in the past tense, and its live claim of an `Object.keys` pin in the deleted `query.test.mjs` dropped (the `plan.meaning` key set is no requirement of mine, so no test added). The re-scan also found, and re-worded to the module test that proves each claim: :589 and :1971 (`content-arm.test.mjs` "pins" R7) and :819 (`passage-arm.test.mjs` "pins" R7) → R7's test, `statements.test.mjs`; :699 (`rec121-chain-bytes.test.mjs`, deleted at T17) → R6's test, `grammar.test.mjs`; :2070 (`bounds.test.mjs`, deleted at T17) → R12's test; :2455 (`passage-arm.test.mjs` S10) → R16's tests, `statements.test.mjs` and `converts.test.mjs`; :2534 (`content-arm.test.mjs`) → R15's test, `converts.test.mjs`; :2636 (`npm run bench:facets`, no such script) → R14's test. Each target test was read and checks the claim it is now named for.

**Deferred:** none.

**Found in other modules / generated artifacts (REPORT):** the change to `bio-plane/src/query.mjs` stales `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`), and the committed `release/bio-plane.bundled.mjs` (:26895, :26904 hold the old grain text) and `newgroup/src/release.mjs` (its embedded source). Regenerated nothing.

**Tests and checks** (on `job/T21/query-language`):
- `node --test bio-plane/test/m/query-language/`: tests 38, pass 38, fail 0 (no layer tests named in `build/manifest.md`).
- `node checks/format.mjs`: 86 modules, 84 requirements files; 0 failures.
- `node checks/architecture.mjs … query-language`: 8 product files, 31 relative imports; 0 failures.
- `node checks/coverage.mjs … query-language`: 26 of 26 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … query-language tranche/T21`: 1 file changed; 0 failures.

Size (session_01PXvHqUoNr5cngACTYbDozK): test runs 2, module lines 2736
