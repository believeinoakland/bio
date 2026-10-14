# odf-reader (T47)

**Status** · session_01Jn5rD2YHo9oPrridu4wiX2 · depth 2 · COMPLETE · handled B1

## Completion (ODF-READER #6)

**Entry applied** · T47-5 (N942): R47 moved from Private to Provides (folded by K3028, wording unchanged), its test at the interface. No behaviour change. Checked as the START asked: `active.test.mjs` imports `odtEntry`, `odsEntry`, `odpEntry` from `bio-plane/src/odf.mjs`, the module's one file and the same entry `file-safety` (`src/file-safety/formats.mjs`) imports and calls `structure(bytes)` on; no internal function is reached, so nothing needed re-pointing. Added one test, "R47 structure() and text() given parts()' own output carry the same list as given the bytes, on every entry", so the provided signature's other form (`partsOrBytes`) is also tested, under the size guard and with nothing active as well. The test file's header now states that R47 is a provided service tested only through the public entries. R47's T47 mark is met.

**Read** · whole: `build/requirements/odf-reader.md` (both parts); the Purpose and Provides of `subresources`, `ooxml`, `office-readers`; `build/layers.md` layer 1's contract (and its "No jurisdiction" and helper-module sections); my entry and the plan's "Rules at the opening"; all of `bio-plane/src/odf.mjs`; all of `bio-plane/test/m/odf-reader/` (10 test files and `pkg.mjs`).

**Flaw fixed in my module** · `walkTextBody` kept three pieces of state that nothing read (`openStack`, a `prev` cursor, and an `openChanges` map it returned and no caller used); all three were removed. Behaviour is unchanged (70/70).

**Deferred** · none.

**Found in other modules** · none.

**Tests and checks** (on `job/T47/odf-reader`)
- `node --test bio-plane/test/m/odf-reader/`: before 69/69; after, tests 70, pass 70, fail 0.
- Users' tests (no service changed, run as a regression check): `format-registry` and `file-safety` together, tests 97, pass 97, fail 0.
- `checks/format.mjs`: 0 failures; `architecture.mjs … odf-reader`: 0 failures; `coverage.mjs … odf-reader`: 47 of 47 live ids named, 0 failures; `ownership.mjs … odf-reader tranche/T47`: 3 files, 0 failures.
- `checks/run.mjs`: format 0, architecture 0 (3057 files), channels 0; coverage 3 failures, none odf-reader's: connection-grammar R21, jurisdictions R88, record-grammar R61 R62 (the T47 marks rule 5 (1) accepts until their merges).

Size (session_01Jn5rD2YHo9oPrridu4wiX2): test runs 3, module lines 2412

## J1 · COMPLETE

T47-5 applied: R47 in Provides, tested at the interface (active.test.mjs drives the public entries file-safety calls; one test added for structure()/text() given parts() output). Flaw fixed: dead walkTextBody state removed, no behaviour change. odf-reader 70/70; format-registry + file-safety 97/97; format, architecture, coverage (47/47), ownership 0 failures; run.mjs architecture 0 (coverage reds only other L1 modules' T47 ids). Nothing deferred, nothing found elsewhere. Record: build/jobs/T47/odf-reader.md on job/T47/odf-reader.
