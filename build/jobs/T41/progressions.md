# progressions (T41)

**Status** · session_01LZyVTWVwnV72eYeLbeyQAm · depth 2 · COMPLETE · handled B1

## Completion (PROGRESSIONS #11)

**Entry applied: T41-10b** (tests only; K2431, K2446). Red at START as named: `define.test.mjs`:232 (the R27 R28 test at :199) pinned `Object.keys(SHARED_ACT_CHECKS)` as `["NO_BASIS", "NO_CITATION"]`, and record-grammar R52 added `ACCEPT_MUST_REAUTHOR` (C-33.54). It now reads the keys from record-grammar's export. It keeps the pins this module relies on (`NO_BASIS` C-33.40, `NO_CITATION` C-33.41). For every shared row, whatever their number, it asserts that the code is not in `PROGRESSION_CHECKS` and that its id is none of this module's. No code changed; no requirement changed. The drive at :247–295 is unchanged: this module answers only `NO_BASIS` and `NO_CITATION` of the shared rows, and has no accepting act.

**Reading set (§17, K2304).** Own code and tests alone are 287 KB, plus 26 KB of requirements, so the set is over 300 KB and step (3) applied.
- **Read whole myself:** `build/requirements/progressions.md`; layer 5's row of `build/layers.md`; `define.test.mjs`, the file my entry changes; and the used service this entry names, record-grammar's `SHARED_ACT_CHECKS` (its R29 and R52, and its export at `src/record-grammar/index.mjs`:20).
- **Read by a worker:** the rest, in full: `src/progressions/{index,schema,checks}.mjs` and every other test file. It was told the task and R27/R28. Its summary is about 3 KB and cites file and line for:
  - every reader of `SHARED_ACT_CHECKS` (`checks.mjs`:169, the only code site, choosing a row only for the two codes; `exceptions.test.mjs`:29, :35);
  - other pins on other modules' catalogues (`dispose.test.mjs`:45–74, promotion's `DISPOSITIONS`, which R35 itself fixes as the two words; `feeds.test.mjs`:179, extraction's C-51.6; `owner.test.mjs`:37; `instance.test.mjs`:254);
  - R27/R28 flaws (below).
- **Whether anything it left out mattered:** none. Nothing else counts the shared keys.

**Found in another module (REPORT J2):** record-grammar's `NO_BASIS` row (C-33.40, `src/record-grammar/acts.mjs`:45) has a `where` that names only `src/inquiry/index.mjs actNoBasis`. But progressions raises `NO_BASIS` too (`index.mjs`:458, :471, through `refusal`, `checks.mjs`:168), as R29's text says ("entities, progressions and inquiry read them"). By contrast, C-33.41's `where` names the progressions sites. This is a row-text question for record-grammar, not a failure.

**Deferred, own module:** `refusal(code, detail, extra)` (`checks.mjs`:172) spreads `extra` after `code`/`check`/`translation`, so a caller's extra fields could overwrite them. No caller passes such a key, so it is unreachable at the interface, and no interface test could show it. It is left as is because this entry is tests only and a code change would stale the plane bundle at L5. It is worth folding into the next job that changes `checks.mjs`.

**Tests and checks run:**
- `node --test test/m/progressions/`: tests 63, pass 62, fail 1 at START (the named red); tests 63, pass 63, fail 0 after. Layer tests: none named in the manifest. No provided service changed, so no users' tests to run.
- `format`: 145 modules, 144 requirements files; 0 failures.
- `architecture`: 16 product files, 66 relative imports; 0 failures.
- `coverage`: 42 of 42 live requirement ids named by a test; 0 failures.
- `ownership`: 1 file changed by progressions between tranche/T41 and HEAD; 0 failures.

Size (session_01LZyVTWVwnV72eYeLbeyQAm): test runs 2, module lines 2

## J1 · REPORT

Found applying T41-10b (record, 'Found in another module'): record-grammar's NO_BASIS row C-33.40 (src/record-grammar/acts.mjs:45) names only inquiry's actNoBasis as its where; progressions raises NO_BASIS too (progressions index.mjs:458, :471 through refusal, checks.mjs:168), as record-grammar R29 states. C-33.41's where already names the progressions sites. A row-text question for record-grammar.

## J2 · COMPLETE

T41-10b applied (tests only): define.test.mjs R27 R28 reads SHARED_ACT_CHECKS' keys from record-grammar's export; 63/63; format, architecture, coverage (42/42), ownership 0 failures. No code or requirement changed. Record: build/jobs/T41/progressions.md.
