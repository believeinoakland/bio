# court-citations (T48)

**Status** · session_01MwBvb1DAPUGfMhfWC4d2cf · depth 2 · COMPLETE · handled B1

## Completion (COURT-CITATIONS #2)

**Entry applied** · T48-5 (N1039, K3147): R11 met. The names stayed plain bindings, so no QUESTION and no `id-spaces` re-point.
- `court-data.mjs` (generated) now holds the data as data: its one export is `DATA`, one JSON text `{SOURCES, REPORTERS, COURTS}` written as a single string literal, each entry on its own line by a line continuation (the text itself has no line breaks). Evaluating it builds nothing but the string. Regenerated with `node court-citations/build.mjs`; `--check` is fresh.
- `index.mjs` exports `SOURCES`, `REPORTERS`, `COURTS` and `VARIANTS` as before, each a `const` binding to a proxy over an empty target of the right kind (arrays; a null-prototype object for `VARIANTS`). The first operation on any of them (or a call of `reporterFor` or `courtsNamed`) parses the text once, fills every target, deep-freezes it and builds `VARIANTS`; every operation after is forwarded to the filled, frozen target. So each export reads value for value as before: entries, `length`, prototype, `Array.isArray`, frozenness, identity of each entry across reads, and a write throws in strict code. `id-spaces` (R27) reads the module namespace as before; its tests pass unchanged.
- Measured (fresh process, as bundler R31 times a global scope): the import fell from 68–173 ms to 22–38 ms here (the rest is reading and parsing the 1.9 MB source text). The first read costs 30–75 ms (the parse); the first `courtsNamed` also compiles every court's patterns, about 1.5 s, as before T48 (that cost is unchanged and is not in the global scope).
- Tests: three R11 tests. (1) For each of the six names read first, in a fresh process with `JSON.parse` counted: nothing is parsed at import, exactly one parse at the first read, none after for any export (the control: a second read parses nothing again), later reads equal the first, import under 500 ms; the data module has one export, the string. (2) Each export's first and later reads equal the committed data, by the same names and shapes, frozen, and writes refused. (3) R6 covers the new form: the build's text is the committed file, `verifyFresh` true; control: the same data held as built objects (the pre-R11 form) is not fresh.

**Flaws and improvements in my module (P8)** · none found beyond the entry. Kept, with why: `courtsNamed`'s first call compiles all 2,809 courts' patterns (about 1.5 s). Each call must test every court (R7: every court whose pattern matches, in order), so compiling per court on demand saves nothing after the first call; it is outside the global scope R11 governs.

**Read** · My requirements (public and private), `index.mjs`, `build.mjs`, `translate.mjs`, `pins.json` and the whole test file, each whole, by me (P20); `build/layers.md` layer 1's contract; my plan entry; bundler R31; `id-spaces`' use of my exports (its `recogniseCitations` region). My module uses nothing. The START measured 1805 KB, over the 600 KB limit, but nearly all of it is the generated `court-data.mjs` and the vendored packages under `vendor/`, which are not part of the reading set (K2053, K2083); what remains I read whole myself, so no helper was needed.

**Found in other modules** · `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (bundler's artifact, `not_product`) are stale: they carry `court-data.mjs`' old form and its old hash. BOB regenerates them at the layer close (manifest, K1540 order: `court-data.mjs` first, then the bundles). Reported to BOB in COMPLETE.

**Tests and checks** (on `job/T48/court-citations`, `tranche/T48` @ 761a1159cc merged)
- `node --test court-citations/test/`: tests 18, pass 18, fail 0.
- User's tests: `node --test bio-plane/test/m/id-spaces/`: tests 37, pass 37, fail 0.
- `node court-citations/build.mjs --check`: fresh.
- `checks/format.mjs`: 0 failures. `architecture.mjs … court-citations`: 0 failures. `coverage.mjs … court-citations`: 11 of 11 live ids named, 0 failures. `ownership.mjs … tranche/T48`: 5 files, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 failures (3254 files), channels 0; coverage 8 failures, none court-citations' (ai-accounts, bundler, file-scanner, jurisdictions, membership, ooxml, record-grammar, signatures: their T48 ids).

Size (session_01MwBvb1DAPUGfMhfWC4d2cf): test runs 6, module lines 847

