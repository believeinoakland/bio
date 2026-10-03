# case-grammar (T31)

**Status** · session_01PgEhNJ94yAy3KBKUN6MKcr · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`plan/current.md` T31 L8; B1):
- **N538, R1**: `CASE_DOCUMENT_FORMAT` is `bio-case-document/7`; `CASE_DOCUMENT_FORMAT_V6` (new export) names `/6`; `CASE_DOCUMENT_FORMATS_ACCEPTED` is `/7`–`/1`. Every predicate holds for `/7` as it does for `/6`, `caseDocumentRequiresMaterials` included (`formats.mjs`). Test: `formats.test.mjs` R1 checks every predicate over `/7`–`/0` and `/8`, checks that `/7` and `/6` give the same answer from each, and covers odd tokens. `reference.test.mjs` R10: `working_on` is optional in `/6` and in `/7`.
- **N538, R14 (the name by format)**: `editionProductOf(fm)` gives "CivicOS" for `/6` or any earlier accepted format, and "Civicsmith" for `/7` or anything else (a case file with no readable document included). The name reaches all three places: the foot (`madeWithLine(product)`, which replaces the constant `MADE_WITH_LINE`; no other module imported it), the "without <product>" checking line, and `gradingMethodText(version, product)`. Tests in `complete.test.mjs`:
  - "R14 DEC-124 K1365…": `complete-v6-golden.json` holds a `/6` case file and the edition rendered from it on `main` @ d2b7451b80 (pre-T31, SHA-256 `e86dfa0c…576e22`). It re-renders byte for byte, and this module's own `/6` fixture gives the same bytes.
  - "R14 DEC-124 a /7 case file…": `/7` shows Civicsmith in all three places and never CivicOS. Covers the name for each format and the no-document page.
- **N528, R14 (light only)**: a `/7` edition carries `<meta name="color-scheme" content="light">`. No edition has a `prefers-color-scheme` rule. Its colours stay inline and light. Test: "R14 DEC-122 (2)…". A `/6` edition gets no declaration, so its bytes stay as before. That is my reading of the conflict in J1 (QUESTION, still open when I completed). If BOB rules otherwise, it is a one-line change in `page()`.
- The fixture takes `format` (default: the format written, `/7`). Small comments updated: `formats.mjs` header and the `/7` note, `reference.mjs` (`/7`), `complete.mjs` header.

**Deferred:** nothing.

**In other modules** (all owed by the plan's L8 entries, K1367; none is a new flaw). Each fails with my change and passes on `tranche/T31` without it:
- **publication**: 1 red, `casedoc.test.mjs` "K651…" (`assert.equal(CASE_DOCUMENT_FORMAT, "bio-case-document/6")`). Also `checks.mjs` ~114 commits materials only for exactly `/6`, so a `/7` document is refused there. That is its N538 entry: read `/7` as `/6`.
- **public-read**: 3 red (`standing.test.mjs` R3; two R23 case-file tests). Its fixtures publish a `CASE_DOCUMENT_FORMAT` (now `/7`) document through publication, which refuses it as above. They should go green once publication's entry lands. Public-read's own code names no format.
- **case-authoring**: 2 red, the R14 and R55 tests that expect `bio-case-document/6`. Its R14 entry writes `/7`.
- **case-checker**: 2 red (R13 build identity, R13 R16 offline run). `program.mjs` is stale; BOB regenerates it after this merge (mechanics §14; I did not write it).
- ratification 203/203, docket 39/39, case-import 52/52, case-disclosures 48/48, case-carriage 21/21: green. Ratification's `checks.mjs` 516–801 still names `CASE_DOCUMENT_FORMAT` in its refusal texts. That is its own entry.

**Tests and checks:**
- `node --test bio-plane/test/m/case-grammar/`: tests 63, pass 63, fail 0.
- The tests of every module that uses case-grammar (9 modules): 717 pass, 8 fail, as listed above. All 9 pass 0-fail on `tranche/T31` without this change.
- `node checks/format.mjs`: 98 modules, 97 requirements files; 0 failures.
- `node checks/architecture.mjs … case-grammar`: 23 product files, 67 relative imports; 0 failures.
- `node checks/coverage.mjs … case-grammar`: 17 of 17 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … case-grammar tranche/T31`: 10 files changed by case-grammar; 0 failures.

Size (session_01PgEhNJ94yAy3KBKUN6MKcr): test runs 18, module lines 1754

## J1 · QUESTION

R14 says the complete edition "is always light ... declares only the light colour scheme" (DEC-122 (2), N528), and also that a `/6` (or earlier) case file renders byte for byte as before T31, with a test proving it (DEC-124, K1365 (1)). Adding `<meta name="color-scheme" content="light">` to a `/6` edition changes its bytes, so both cannot hold for `/6`.

My best reading, which I am building on: the light-only declaration is added to `/7` editions only; `/6` and earlier stay byte-identical. A `/6` edition already sets its own light colours (`color:#1b1b1b; background:#fff`) and has no `prefers-color-scheme` rule, so it is light-only in effect, just without the declaration. This keeps every published `/6` case file re-verifying byte for byte, which K1365 (1) gave as the reason for the format split. The test: a `/7` edition has the declaration and no `prefers-color-scheme` rule; a `/6` edition matches its pre-T31 bytes exactly.

The other choice, adding the declaration to every edition, would break the byte-identity test and every `/6` case file's complete-edition hash.
