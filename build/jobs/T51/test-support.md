# test-support (T51)

**Status** · session_01EuoP4BVxYVJN8Zit2i4p66 · depth 2 · RUNNING until 2026-10-24T02:55:58Z (R-NOLOAD: generators, zip64, corpus test files alone x5 and on one core) · handled B7

## J1 · COMPLETE

T51-3 · test-support: applied. Red #10 (R2, `test-support.test.mjs` "a tree a test left read-only is removed") is green.

**Entries applied.** T51-3 (the only entry). Commit b33a4083fc on job/T51/test-support.

**Diagnosis.** On this host the test passes as uid 0 under a 0700 TMPDIR, as the one-line TMPDIR=/root 0700 probe also shows, and as uid 65534 for the non-root case itself. The red's environment is therefore a root that cannot make a child that is not root: the case runs `setpriv`, chowns the host directory to 65534, and drops to 65534, and any of those failing made the test fail rather than prove nothing. `sandbox.mjs` is not at fault (the EACCES retry and the sweep both behave under the injected refusal).

**Change.** A probe, `DROP`, runs once: as root it checks that `setpriv` runs, that the directory owner can be changed, and that the drop to 65534 gives uid 65534. The R2 non-root test skips by name with that reason when the probe fails, and otherwise runs the same assertions as before. Verified: with `setpriv` removed from PATH the case is reported as skipped with "setpriv cannot be run (ENOENT)"; as root with the probe passing, all 25 tests pass.

**Deferred.** None.

**Found in another module (not mine; not changed).** `checks/run.mjs` on bio reports coverage failures in three modules: agent-harness (R17 named by no test), agent-runner (R36, R37, R38, R40 named by no test), journey-check (R19 named by no test). Described against those modules' requirements; the owners need them, not test-support.

**Found in my own module, noted, not fixed (environment).** Run as uid 65534 with NODE_EXTRA_CA_CERTS inherited from the proxy (/root/.ccr/ca-bundle.crt, unreadable to 65534), R3 fails ("nothing thrown or warned": node prints the extra-certs warning on the child's stderr) and R6 fails by exactly that warning's 125 bytes on the pipe count. Both pass as root, which is the base run's uid. A fix would strip NODE_EXTRA_CA_CERTS from the children's env in the test; I did not make it, since the red is R2's alone and the change touches every child spawn. Say if you want it in this job.

**Tests and checks.**
- `node --test test/m/test-support/test-support.test.mjs` as root, before and after: 25 pass, 0 fail (after: 25 pass, 0 skipped; with setpriv removed: 24 pass, 1 skipped).
- `node --test test/m/test-support/make-zip.test.mjs`: 17 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 170 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio test-support`: 6 product files, 4 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio test-support`: 14 of 14 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 1 file changed by test-support; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0 (3533 product files), channels 0; coverage has the three failures above, none in test-support.

Size (session_01KsgH5RfwYGuB5JXagtzuu5): test runs 6, module lines 721

## J2 · COMPLETE

CR-2 · test-support: applied. Commit b7ee6bb68f on job/T51/test-support (test files only; no module code changed).

**Entries applied.** CR-2 (the only entry).

**Change.** The child runs that R3 and R6 start are handed the environment without NODE_EXTRA_CA_CERTS (`childEnv()`, used by `child()` and by R6's flood spawn). A new test, named R3 and R6, sets the variable to an unreadable path, checks the child runs silent and does not see the variable, and runs an unstripped control child that does warn, so the silence is the strip's doing. make-zip.test.mjs's R13 had the same defect in its two spawns (the non-root failure below), and is stripped the same way, so the suite is green as non-root.

**Deferred.** None. Not changed, because no assertion reads their stderr: the R2 non-root child (`childNotRoot`), the R2 exit-listener spawn, and R7's and R8's spawns.

**Found in another module (not changed).** `checks/run.mjs` on bio, run from the process repository, reports coverage failures in 33 places and words failures (2,821: 1,841 inline, 798 testcopy, 182 handlist) in other modules; none is in test-support. Named here for BOB to route.

**Tests and checks.**
- `node --test test/m/test-support/test-support.test.mjs`, as root: 26 pass, 0 fail. As uid 65534 before the change: 23 pass, 2 fail (R3 "nothing thrown or warned"; R6 byte count off by the warning's 125 bytes). As uid 65534 after: 26 pass, 0 fail.
- `node --test test/m/test-support/make-zip.test.mjs`, as root: 17 pass, 0 fail. As uid 65534 before: 16 pass, 1 fail (R13, stderr warning). After: 17 pass, 0 fail.
- `node checks/format.mjs /home/user/bio`: 174 modules, 173 requirements files; 0 failures.
- `node checks/architecture.mjs /home/user/bio test-support`: 6 product files, 6 relative imports; 0 failures.
- `node checks/coverage.mjs /home/user/bio test-support`: 14 of 14 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 2 files changed by test-support; 0 failures.
- `node checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; coverage and words findings all in other modules (above); none in test-support.

Size (session_01EFMiVNACxY3XDRbufBuqk3): test runs 10, module lines 723

## J3 · QUESTION

R15/R16 need a new source file. modules.json lists test-support's paths as four files (sandbox.mjs, stdio.mjs, make-pdf.mjs, make-zip.mjs); none fits (sandbox.mjs is an import-for-side-effect module, R8). My best reading: I create bio-plane/test/declared-ops.mjs exporting declaredOpHolds and declaredOpsOf, and BOB adds that path to test-support's paths in build/modules.json (and regenerates member-roster order.mjs per manifest, if it applies). I carry on on this reading; the ownership check will name the file until the path is added. Extra optional keys I add to declaredOpHolds beyond the contract: values (sample value per field), outside (field names probed for check c; default one generated unknown name), same (answer equality for 'dropped'). Contract names and the four required keys are unchanged.

## J4 · COMPLETE

FR-01 · test-support: applied (commit 1c23c02de0 on job/T51/test-support).

**Entries applied.** K4168: R15 `declaredOpHolds({op, declaration, call, refusedNaming})` and R16 `declaredOpsOf(root)`, new file `bio-plane/test/declared-ops.mjs` (111 lines; no side effect on import). Requirement lines R15, R16 written first in `build/requirements/test-support.md` (status line updated; marked met now). Optional keys beyond the contract: `values`, `outside`, `same`; the contract names and shapes are unchanged. A `Response` answer is read as `{status, ...body}` before `refusedNaming` sees it. Check (c) probes `outside` (default one generated name `undeclared_field_<op>`): the op passes if its answer equals check (a)'s or it refuses naming the field.

**NEEDS BOB before merge (the J3 QUESTION, unanswered).** `bio-plane/test/declared-ops.mjs` is in no module's `paths`: add it to test-support's `paths` in `build/modules.json` (and regenerate member-roster's `order.mjs` if that applies, manifest §14). Until then `architecture.mjs` reports it "owned by no module", and `ownership.mjs` lists it and `build/requirements/test-support.md` (the START told me to write the lines) as outside my paths: 2 failures, both of this kind.

**Deferred.** None. **Found in other modules.** Coverage failures remain in agent-harness (R17), agent-runner (R36 R37 R38 R40), installer-steps (R26 R31), journey-check (R19); none is test-support's.

**Tests and checks.**
- `node --test bio-plane/test/m/test-support/`: 61 tests, 61 pass, 0 fail, 0 skipped (18 new in `declared-ops.test.mjs`).
- `checks/coverage.mjs test-support`: 16 of 16 live ids named by a test; 0 failures.
- `checks/architecture.mjs test-support`: 7 product files; 0 failures.
- `checks/run.mjs /home/user/bio`: format 0; words 0 findings; channels 0; architecture 1 (the path above); coverage 4 modules, none mine.
- `checks/ownership.mjs`: 2 failures, the path above and the requirements file.

Size (session_0191CQmcSf7uN8VoqE7fDryB): test runs 5, module lines 111

## J5 · COMPLETE

CHANGE B4 applied (commit 7f5f85e069 on job/T51/test-support, tranche/T51 merged in first).

`declaredOpsOf` now takes a file only when it has a real export: a line-anchored `^export const DECLARED_OPS\b`, so a comment or string that only mentions the phrase (including its own source) is not imported. A file with that line that exports no object still rejects naming the file. The R16 test with two fake modules gained a file that only mentions the phrase in a comment and a string and throws if imported; it is not imported. The helper's breach messages are now direct arguments of `new Error(...)` (the words check read them as plain sentences once the path was owned).

Tests and checks: `node --test bio-plane/test/m/test-support/`: 61 pass, 0 fail, 0 skipped (R16 on this repository green). `checks/words.mjs test-support`: 0 failures. `checks/coverage.mjs test-support`: 16 of 16. `checks/architecture.mjs test-support`: 0 failures. `checks/run.mjs`: format 0, channels 0, architecture 0, words 0; coverage failures only in other modules (agent-harness, agent-runner, citation, installer-steps, journey-check, link-sweep, monitoring). `checks/ownership.mjs`: only `build/requirements/test-support.md` listed, the requirement lines the START told me to write and B4 accepted.

Size (session_0191CQmcSf7uN8VoqE7fDryB): test runs 9, module lines 112

## J6 · COMPLETE

CHANGE B5 applied (K4240). Commit 1cf205fc9c on job/T51/test-support, pushed; tranche/T51 merged in first (BOB's tranche had moved past my branch: queue R-tests, the handoff, the B5 entry's predecessors; no test-support file changed by BOB except my job record).

**Entries applied.** B5 (the only entry): R17 `registerDeclared(root, ...registrations)` in `bio-plane/test/declared-ops.mjs`.

**Change.** `registerDeclared` calls each registration once per process with every owner's declaration as `[owner, DECLARED_OPS]` pairs, in `modules.json` order, duplicates included. A registration already called (identity, kept in a WeakSet) is skipped, so a second call is a no-op for it; a new one in the same call is called. A registration's own refusal propagates and rejects the call. A call with no registrations reads nothing.

**Deviation from the wording, for BOB to note.** The entry says "from `declaredOpsOf(root)`". `declaredOpsOf` answers `{ops, owners, duplicates}` and keeps only the first owner of a duplicate op, so it cannot give every owner's full declaration. I split its file walk into an internal `pairsOf(root)` that yields the pairs; `declaredOpsOf` now builds its three parts from it and answers exactly as before (R16 unchanged, its tests unchanged and green). `registerDeclared` reads through the same `pairsOf`, so both answers read the same files by the same rule.

**Rulings for build/rulings.md (I did not edit it: outside my paths; BOB to record once).**
1. `registerDeclared` passes `pairsOf(root)`'s pairs, the same ones `declaredOpsOf` is built from; the pairs carry a duplicate op's second owner (the plane refuses it, DECLARED_OP_DUPLICATE).
2. A registration is marked called before it runs, so a refusing registration is not silently re-run by a later call; a refusal stops the rest of that call's registrations, which stay uncalled and unmarked.
3. "Once per process" is per registration function identity, not per root.

**Requirement line for BOB (R17; not written to build/requirements/test-support.md by me):**
**R17** `registerDeclared(root, ...registrations)` calls each registration function once per process with every owner's declaration as `[owner, DECLARED_OPS]` pairs (R16's collector, duplicates included, `modules.json` order); a registration already called is skipped by a later call, and a registration's refusal propagates, naming what it refused. Test tooling: only tests call it.

**Tests and checks.**
- `node --test bio-plane/test/m/test-support/`: 65 pass, 0 fail, 0 skipped (4 new R17 tests in `declared-ops.test.mjs`: each called once with every owner's pairs incl. the duplicate; a second call a no-op for the old one and a new one called; a refusal propagates naming `bar`; no registrations reads nothing).
- Before the change, `declared-ops.test.mjs`: 18 pass.
- `checks/format.mjs /home/user/bio`: 175 modules, 175 requirements files; 0 failures.
- `checks/architecture.mjs /home/user/bio test-support`: 8 product files; 0 failures.
- `checks/coverage.mjs /home/user/bio test-support`: 16 of 16 live ids named by a test; 0 failures. (R17 is not yet a live id in the requirements file; its test names it.)
- `checks/words.mjs /home/user/bio test-support`: 0 failures.
- `checks/ownership.mjs /home/user/bio test-support tranche/T51 job/T51/test-support`: 1 file changed by test-support; 0 failures. Its two files are `bio-plane/test/declared-ops.mjs` and its test.
- `checks/run.mjs /home/user/bio`: format 0, architecture 0, channels 0; words 33 failures and coverage 4 failures, none in test-support (below).
- `node_modules` installed for every tracked lockfile directory first (K4113).

**Deferred.** None.

**Found in other modules (not changed; for BOB to route).**
- coverage (checks/coverage.mjs): agent-harness R17 named by no test; agent-runner R37, R38, R40 named by no test; installer-steps R26, R31 named by no test (both stated "by design" in K4234, not met); journey-check R19 named by no test.
- words (checks/run.mjs): 33 failures in other modules, 26 testcopy and 6 missingkey (op-grades' tests t35–t49 among them), and 1 inline. None in test-support.

Size (session_0161FtoUuJFb1r4CZvpGeae3): test runs 4, module lines 136

## Round 6, wave 6: G41's gap fix (TEST-SUPPORT #9, B6; K4631 (8))

**Changed.** `bio-plane/test/platform-sqlite.mjs` (new; BOB adds it to `paths` at the merge, K1043; `ownership` and `architecture` name it until then) and `bio-plane/test/m/test-support/platform-sqlite.test.mjs` (7 tests). The preload wraps `StatementSync.prototype.run/all/get/iterate` and the tag store's four methods; it throws before the statement runs when one bound string or blob, or the bound strings and blobs together, are over 2,098,176 B. Error shape read from a real refusal (`new DatabaseSync(":memory:", {limits: {length: 1000}})`, node 26.10.0): `Error`, message `string or blob too big`, own `code` `ERR_SQLITE_ERROR`, `errcode` 18, `errstr` `string or blob too big`; the test compares the preload's refusal to that real one field by field. Cannot judge: computed values (`||`, `json_set`, `group_concat`, `zeroblob`), literals in SQL text, a column grown by UPDATE from its own value.

**Failing-first.** Red with the preload file absent: 6 of 7 fail (the 7th is the control that the same fixture is not refused without it). Green with it: 7 of 7. Each check is a child `node [--import <it>] --test <fixture>` (the runner's `NODE_TEST_CONTEXT` is removed so the nested runner really spawns). `node --test` hands `--import` to each test file's process: asserted by the fixtures (a fresh `DatabaseSync` in a test file refuses 2,252,800 B); `NODE_OPTIONS=--import=<abs path>` reaches them equally, and is what the full run used.

**Why tests missed it.** node:sqlite has no value limit and every fixture builds its own `DatabaseSync`; a per-fixture shim would miss modules (diagnosis-R6-g41 §3). Gap closed once, in the preload.

**Full run** (`NODE_OPTIONS=--import=$PWD/bio-plane/test/platform-sqlite.mjs node .github/scripts/module-tests.mjs`, alone, tranche/T51 merged at 84d8a188a7): 18 of 182 modules red. The same 18 re-run without the preload (a runner of the same file lists): **7 + 1 tests turn red under the preload and not without it**:
- (a) product write over the limit, extraction (7 tests: g38 "1 MB CSV through the op", g40 six): `reading_history.reading` bound at `extraction/index.mjs:1150` (`#keepReading`, called from `writeReading` :1024), 11,820,513 B (the 1 MB CSV's reading) and 2,585,472 B; `readings.reading` :1030 would follow. This is G41's own case.
- (a) case-authoring `document.test.mjs` R17 (searched section bounded by SEARCHED_SUBJECT_MAX): `case_documents.text` bound at `publication/index.mjs:490` (`storeCaseDocument`, from `case-authoring/index.mjs:1206`), 16,831,411 B. NEW: not in the audit; a case document's text has no byte bound before storage. A real write over the limit if a case reaches that size (the test builds the large searched section on purpose); owner publication (writes) and case-authoring (builds the text).
- (b) fixtures unlike the platform: none found.
- Not shim-caused (red without it too, identical sets): setup-words 2, bundler 1, ocr-worker 1, promotion 1, file-safety 1, reading-pipeline 1, agent-worker 1, case-checker 2, affordances 4, screens-settings 1, screens-intake 2, screens-inquiry 4, screens-publish 5, screens-action 1, plane 2, installer 15, journey-check 23. screens-intake `t51-fix5` R31 (E8) failed once under the preload and once without it, passed on two other runs of each: a flake, not the preload.

**Measured under the preload (smallest scripts through the ops; `measure-calc.mjs`, `measure-follow.mjs` in the scratchpad, not committed):**
- calculations `calc_ingests`: `ingestMoney rows:"all"` over an 18,098-row table (698,409 B CSV, no payer identified): `not_written_json` bound at `calculations/index.mjs:1620` is **2,746,775 B** (about 152 B a row; over the limit from about 13,800 rows). **RED**: the act throws SQLITE_TOOBIG inside `transact`.
- following `portal_snapshots.rows`: a 1,500,035 B portal CSV (24,121 rows) through `followTick` -> `#readPortal` :842: `rows` (JSON.stringify of the dataset rows) is **3,067,862 B** (2x the file; over the limit from about 1.0 MB). **RED**: the tick records the follow as failed with reason `string or blob too big`; no snapshot is stored.

**Proposed requirement (BOB writes it):** "**R18** `bio-plane/test/platform-sqlite.mjs`, loaded as `node --import <it>` (or `NODE_OPTIONS=--import=<it>`), makes `node:sqlite` refuse, as Durable Object SQLite does, any statement run through `run`, `all`, `get` or `iterate` (and a tag store's) whose single bound string (judged by its UTF-8 bytes) or blob is over 2,098,176 B, or whose bound strings and blobs sum over it, before the statement runs, with an `Error` of message `string or blob too big`, `code` `ERR_SQLITE_ERROR`, `errcode` 18, `errstr` as node's own SQLITE_TOOBIG; it judges no number, bigint or null, no literal in SQL text, no computed value; importing it twice wraps once. Test tooling: only the test commands load it." (Private invariant: R9 unchanged; it creates nothing outside the sandbox.)

**Checks.** `checks/run.mjs`: format, coverage (6674 of 6674), channels, words: 0 failures; architecture 1 failure: `platform-sqlite.mjs` owned by no module (expected until BOB adds it). `ownership.mjs`: the same file outside paths (expected). Suite: `node --test --test-force-exit bio-plane/test/m/test-support/` run, results below.

Size (session_01NsoiLyHMoVNrYC5YG4oMt4): test runs 5, module lines 205

## J7 · REPORT

REPORT (G41 full run under the preload, tranche/T51 84d8a188a7, full detail in my record's new section).
Reds under the shim and not without it: 8 tests.
(a) extraction (7 tests, g38 + g40): reading_history.reading at extraction/index.mjs:1150 (#keepReading, via writeReading :1024), 11,820,513 B and 2,585,472 B. G41's own case.
(a) NEW, not in the audit: case-authoring document.test.mjs R17 (searched section): case_documents.text at publication/index.mjs:490 (storeCaseDocument, from case-authoring/index.mjs:1206), 16,831,411 B; a case document's text has no byte bound before storage. Owner publication / case-authoring: your call whether it is a real-member risk or only the test's deliberate size.
(b) fixture unlike the platform: none found.
Red without the shim too (not the shim's): 16 modules, identical sets; screens-intake t51-fix5 R31 is a flake (failed once with and once without, passed otherwise).
Measured under the shim: calculations calc_ingests.not_written_json (calculations/index.mjs:1620), ingestMoney rows:"all", 18,098 unidentified payers: 2,746,775 B (~152 B a row; over from ~13,800 rows) RED, the act throws. following portal_snapshots.rows (following/index.mjs:842), 1,500,035 B CSV (24,121 rows): 3,067,862 B RED, the tick records the follow failed "string or blob too big". So rows 3 and 4 of the diagnosis both need jobs (K4631 (7)).

## J8 · COMPLETE

COMPLETE. Changed: bio-plane/test/platform-sqlite.mjs (new preload; add to paths) and bio-plane/test/m/test-support/platform-sqlite.test.mjs (7 tests); record section "Round 6, wave 6" holds everything. Failing-first: 6 of 7 red with the preload absent, 7 of 7 green; test-support suite 72 pass 0 fail. Full run under NODE_OPTIONS=--import=<abs path>, alone: 8 tests red only under it (extraction 7: reading_history.reading extraction/index.mjs:1150, 11,820,513 B and 2,585,472 B; case-authoring R17: case_documents.text publication/index.mjs:490, 16,831,411 B), none class (b); 16 modules red the same without it. Measured: calc_ingests.not_written_json 2,746,775 B (18,098 rows) RED; portal_snapshots.rows 3,067,862 B (1.5 MB CSV) RED. Proposed R18 text is in my record and my REPORT J7. Checks: format, coverage, channels, words 0 failures; architecture and ownership each name only platform-sqlite.mjs as owned by no module (BOB adds it at the merge). Size (session_01NsoiLyHMoVNrYC5YG4oMt4): test runs 5, module lines 205.

## Fix round 9: G123c (first half), G123d, G123e, 2c.1 (TEST-SUPPORT #10, B7; K4837, K4840, K4842)

**Entries applied.** G123c's first half (`alarmDouble`, R26), the registrar stub of plan 2c.1 (`jobRegistrarStub`, R27), G123d (the generators `pdfgen`, `imggen`, `sheetgen`, `docgen` with their truths, R19-R22; the lazy ZIP64 writer `zipChunks64`, R23; `truthOf` and the independent-reader oracles, R24; `loopbackOrigin`, R25), G123e (the marking rule in `sheetgen`, R21), R28, and R9 as amended. Commit c01417486e on job/T51/test-support (tranche/T51 merged in first, ca7e907170; requirement file read whole after the merge).

**New files (ruling K4842 (2): BOB adds them to test-support's `paths`; no BLOCKED).** `bio-plane/test/pdfgen.mjs`, `imggen.mjs`, `sheetgen.mjs`, `docgen.mjs`, `alarm-double.mjs`, `job-registrar-stub.mjs`, and two more: `corpus.mjs` (the shared entry: `generate`, `truthOf`, `buildFixture`, `fixtureDir`, `loopbackOrigin`, the oracles `pdfjsText`, `pdftotext`, `pillowPixels`, `soffice`, `chromiumText`, `unzipTest`, `pyZipfile`) and `seeded.mjs` (the seeded draw, the vocabularies, the recipe key; a file of its own because `corpus.mjs` imports the four generators and they need these, so one file would be an import cycle). `make-zip.mjs` (already in paths) gains `zipChunks64`, `zipChunks64Sized`, `crc32Update`, `ZIP64_OVERHEAD`. Tests: `bio-plane/test/m/test-support/corpus.test.mjs`, `doubles.test.mjs`, `generators.test.mjs`, `zip64.test.mjs`. Until the paths are added `architecture` names the 8 files "owned by no module" and `ownership` names them outside test-support's paths (8 failures each, all this kind).

**What each provides (for the later jobs).** A recipe is `{kind, seed, size, ...options}`; `generate(recipe)` answers `{kind, ext, type, size, truth, chunks(), bytes()}` (chunks lazy: a CSV a batch of rows at a time, a package through `zipChunks64`, a PDF's padding written as it streams); `buildFixture(recipe)` streams it once into `BIO_FIXTURE_CACHE` as `<kind>-<key>.<ext>` and finds it there after; `truthOf(recipe)` answers the truth without the file. A recipe's `size.bytes` builds exactly that many bytes (any of bound-2, bound, bound+1: PDF comment padding, picture padding chunk or trailing bytes, CSV padding in the last row's last cell, package padding member or comment); `bound` makes the truth's `refusal` `{code: "TOO_LARGE", size, bound}` past it (the generator never chooses a bound, R-SILENT). Each file's header comment lists its recipe axes and truth fields.
- `pdfgen` (kind pdf): fonts winansi, macroman, differences (no ToUnicode), type0 (Identity-H with ToUnicode; the full vocabulary, CJK and RTL), type0-nounicode (truth: unread `NO_TOUNICODE`), type3; page kinds text, scan (imggen's raster, Flate, 8- or 1-bit; truth: the lines, read by OCR), mixed, folio, blank, vector; structures classic, xref-stream, object-streams, linearized, damaged-xref, no-xref; `revisions: n`; `truncate`; encryption RC4-128 and AES-128, empty or user password (truth: `ENCRYPTED`); heavy page, huge page, rotation; `declare` (a stream's /Length, /Count, an image's /Width /Height over few bytes); `hostile` pages and objects; polyglot zip.
- `imggen` (png, bmp, gif, tiff): a built-in 5x7 bitmap font (no font file); modes L, 1, RGB, P, LA, I;16; TIFF none, PackBits, LZW, Deflate, predictor 2, II or MM, several pages; GIF LZW, several frames; degradations tilt, turn 90/180/270, shade, contrast, noise, invert (per page); `frame` (wide or tall; lines that do not fit are unread `OFF_FRAME`); `declare` (patched header), `hostile` chunks, IFDs, frames; polyglot zip; `pixelBound` for a declared frame. Truth: each page's pixels as Pillow gives them (`pixels()`, `sha256()`).
- `sheetgen` (csv, tsv, xlsx, ods): a cell is a pure function of (seed, sheet, row, column), so a 1,048,576-row truth is computed; encodings UTF-8, UTF-8 BOM, UTF-16 LE/BE with and without BOM, Windows-1252; CRLF, CR, LF; quoting doubled, newline, tab, stray; ragged; title block; header of N characters; empties (leading, middle, last, every nth row, a column); long cell; 16,385 columns; merged title; annotations; shared or inline strings; dates under `yyyy-mm-dd`; formulas with cached values; several sheets; hostile bomb, lying-directory, lying-dimension, no-r, styled-empty. `rfc4180(text, delimiter)` is the generator's own RFC 4180 reader (no code shared with csv-reader); `truth.checkUnits(units)` is the J-1 check of G123e.
- `docgen` (docx, pptx, odt, odp, html, text, json, xml): units `<seed>-u<n>-k<part>` plus a word; parts body, table, footnote, endnote, header, footer, comment, deleted (tracked), textbox, notes, master, hidden (by kind); tables of any size; paragraphs of any length (`size.chars`); the ladder at equal main-part bytes (`size.partBytes`); flavours template and macro (dotx, docm, potx, pptm, ott, otp); `encryptedMember`; `declares: {member, more}`; the encoding matrix with `bad-byte` and charset declaration (meta, xml, header); markup depth and unterminated; `<main>`; a client-rendered shell. `truth.oracleOmits` lists the parts LibreOffice's export leaves out (below).
- `zipChunks64(entries, {comment})`: an async stream; ZIP64 extra field on every member, ZIP64 end record and locator; members `{name, data}`, `{name, chunks}` (deflated as they go, data descriptor), stored with known size and CRC, or `zip64: false` (a classic member: an ODF `mimetype` at offset 38); `central` overrides declare more than a member holds. `zipChunks64Sized(entries, size)` pads to exactly `size`.
- `alarmDouble({maxRetries = 6, rerunAfterSuccess = false})` -> `{storage, getAlarm, setAlarm, deleteAlarm, run(fn), retries}` as 2c.6; `storage` also has `get`, `put`, `delete`, `list` and a `log`; `rerunAfterSuccess` models PLATFORM_FIGURES' re-run after completion (retryCount 1). No import at all.
- `jobRegistrarStub()` -> `{registerJob, armJobs, rows(), armed(), transact(fn), bump(key, kind, fields)}` as 2c.1; `transact` is the caller's transaction (a throw rolls the rows back), `bump` stands in for a reader's progress write. `JOB_KINDS`, `SESSION_KEYED` exported. Refusal reasons are codes (`JOB_ENTRY_INVALID`, `JOB_KIND_UNKNOWN`, `JOB_SHA_INVALID`, `JOB_SESSION_MISSING`).
- `loopbackOrigin(routes)`: 127.0.0.1, port 0; `{status, headers, body (bytes, string, recipe, or function), encoding (gzip, deflate, br, real), redirect (loopback only; refused when made otherwise), delayMs, hang}`; `requests` log; unref'd and closed at process exit.

**R-FOUR, each cause.**
- **G123c (first half, the double).** (1) `bio-plane/test/m/scheduler/fixture.mjs:6-26` (read): `storage()`'s `getAlarm()` answers the alarm at every moment, nothing models a run in flight, a spent alarm or a retry. (2) Missed: the doubles were written from the API's names, not the platform's semantics, so a consumer that reads `getAlarm()` inside its own run (G91's case) or fails on tick 2 was never exercised; gap fixed by `alarmDouble` and its tests. (3) Failing first: `doubles.test.mjs` run before the file existed: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../bio-plane/test/alarm-double.mjs' imported from .../doubles.test.mjs`; then green, 11 of 11 (R26 6, R27 5). The scheduler-side red (`r8-budget`'s null `getAlarm()` in a gated consumer) is scheduler's test (job 33), through its new `uses: test-support` edge. (4) **L**: in node, against PLATFORM_FIGURES (K4838: 6 retries, re-run after completion with retryCount 1).
- **2c.1 (the registrar stub).** (1) No stub existed; the users (acquisition, capture, doorbell, extraction) need the contract in memory before plane-2 merges. (2) Missed: nothing to count rows on before the real table; fixed by the stub. (3) Failing first: the same red as above (the test file imports both); green 5 of 5 R27 tests (one row per (sha, kind); re-arm keeps counters and raises priority only; every kind, session keys, `ok:false` never a throw; a rolled-back transaction leaves no row; `armed()`). (4) **L** (node).
- **G123d.** (1) `bio-plane/test/m/plane/shape/xlsx-gen.mjs:48-78` (read): `zipChunks` writes 32-bit sizes and the classic end record only (no ZIP64); no seeded generator with a truth existed for any family. (2) Missed: the fixtures were the reader's own kind of file at the wrong size; fixed by the four generators, each with its truth and an independent reader, and by the lazy ZIP64 writer. (3) Failing first, on tranche/T51 with only the new tests copied in: `zip64.test.mjs`: `SyntaxError: The requested module '../../make-zip.mjs' does not provide an export named 'zipChunks64'`; `corpus.test.mjs` and `generators.test.mjs`: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../bio-plane/test/corpus.mjs'`. Then green. The reds the oracles found in the generators while they were written, each fixed in the generator (R24: a generator that disagrees with its reader is the defect): TIFF LZW, Pillow: `tempfile.tif: Using code not yet in table` (the width grew one code early; now as libtiff writes it); pdf.js and poppler on a right-to-left word (a line written as one text item was reordered; the marker and the word are now two items, the oracles turn an RTL run back to logical order); LibreOffice on a padded XLSX: `Error: source file could not be loaded` (it finds no end record behind a comment of 600 bytes, 400 opened: padding over 256 bytes now goes in a stored member); LibreOffice on an ODS annotation: `Unspecified Application Error` (an annotation naming no graphic style; the styles are now declared); a sized XLSX with shared strings came out 1 byte short (the shared-string counter carried over from the counting pass; each sheet's first index is now computed). (4) **L** (node, LibreOffice 24.2, Pillow 12.3, pdf.js 4.10.38, poppler, Python zipfile, Info-ZIP, Chromium).
- **G123e.** (1) `bio-plane/test/m/plane/shape/xlsx-gen.mjs:14-17` (`xlsxCells`: FIRSTROWMARK in row 1, the row a header-repeating index repeats; the harness line `harness.mjs:303` is plane's file, not read, plane-1's to widen). (2) Missed: the mark shared the header row; fixed by the marking rule in `sheetgen` (non-header cell of the first, middle and last data rows, `<seed>-R<row>-C<col>`) and `truth.checkUnits`. (3) Failing first, a scratch run (not committed) of the J-1 check over today's harness sheet with the header repeated in every unit: `J-1 on a header-repeating index of today's harness sheet: FIRSTROWMARK is in 17 of 17 units (exactly one wanted) -> FAIL`; the same index over a `sheetgen` sheet: `first mark J1-R2-C1 in 1 unit; checkUnits {"ok":true,"missing":[],"repeated":[]}`; pinned by the two `R21 G123e` tests. (4) **L**.

**Rulings for build/rulings.md (BOB's to record once; I did not edit it).**
1. pdf.js as the oracle is `pdfjs-dist` from bio-plane's own node_modules (4.10.38, the library the pdf-worker bundle carries), not the bundle file: test-support (layer 1, order 11) cannot import pdf-worker (a later module) under R-LAYER and `architecture`. poppler's `pdftotext -layout` is a second reader.
2. `corpus.mjs` and `seeded.mjs` are test-support paths beside the six named.
3. `BIO_FIXTURE_CACHE` unset: the cache is `<os.tmpdir()>/bio-fixture-cache`, inside the sandbox for any test that imports it (so R9 holds); set, the files outlive the process and are never removed.
4. A recipe's `bound` only makes the truth state `TOO_LARGE {size, bound}`; the bound itself is the caller's (from PLATFORM_FIGURES or the START), never the generator's.
5. The parts LibreOffice leaves out, measured, listed in each truth's `oracleOmits` and checked in their package member instead: DOCX and ODT text export: header, footer, comment, text box, footnote, endnote (it keeps a tracked deletion); PPTX and ODP PDF export: notes, hidden slide; ODP master text: LibreOffice drops a master page's own text frame on import (a round trip through it loses the frame).
6. A recipe that names no seed takes its case id as its seed (K4842 (5)); seeds are strings or numbers; `pdfgen` and `imggen` take seeds of letters, digits, `_`, `.`, `-` (the font and the marker).

**Proposed requirement wording (BOB writes it).**
- R24: "pdf.js (the library the committed pdf-worker bundle carries, from bio-plane's `pdfjs-dist`) and poppler's pdftotext" in place of "pdf.js through the committed pdf-worker bundle".
- R9: "... except the generators' files in the directory named by `BIO_FIXTURE_CACHE` (R19), which this module creates and never removes; when it is unset, they are built inside the process's temporary directory (the sandbox)".
- R26: add "`storage` keeps values (`get`, `put`, `delete`, `list`) and logs each call; `opts.maxRetries` (6) bounds the retries and `opts.rerunAfterSuccess` re-runs a completed handler once with retryCount 1 (PLATFORM_FIGURES)".
- R27: add "`transact(fn)` is the transaction a row commits or rolls back with".

**Not in this job, by rB D1 (not deferred: no requirement of mine names them).** Encoders the envelopes mention that R20-R22 do not: JPEG (baseline, progressive, CMYK, EXIF), CCITT G4, JBIG2, JPX, WebP, HEIC; XLS (BIFF); DOC/OLE, RTF, EML; PDF structures two-catalogs, fake `obj`, untyped leaf. A later job whose named case needs one builds it in its own test directory marked `// MOVE`; BOB moves it here at the round end.

**Words.** No sentence a member reads (test tooling); refusals are codes. `words` check on test-support: 0 failures. No row owed.

**Found in other modules (not changed).** plane's `plane/shape/xlsx-gen.mjs` still marks FIRSTROWMARK in row 1 (G123e's harness half, plane-1's). Generated artifacts made stale by this change: none.

**Tests and checks.**
- Module, from `bio-plane/`: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/test-support/`: tests 129, pass 129, fail 0, skipped 0 (as root; R2's inherited red does not show here).
- Impact set (`node build/plan/impact.mjs origin/tranche/T51 HEAD`: 10 modules, 42 files; 35 bio-plane files run two at a time): tests 343, pass 341, fail 1, skipped 1; the one failure is file-safety `rows.test.mjs` R24 words, accepted in the START. file-scanner's 2 files: 28 tests, 19 pass, 0 fail, 9 skipped.
- `checks/format.mjs`: 176 modules, 176 requirements files; 0 failures. `checks/architecture.mjs test-support`: 14 product files; 0 failures. `checks/coverage.mjs test-support`: 28 of 28 live ids named by a test; 0 failures. `checks/words.mjs test-support`: 0 failures. `checks/ownership.mjs test-support tranche/T51`: 14 files; 8 failures, the 8 new files above (paths BOB adds).
- `checks/run.mjs`: format 0; architecture 8 (the same 8 files, "owned by no module"); channels 0; coverage 33 failures and words 11 failures, all in other modules (coverage: round-9 ids of acquisition, capture, plane, reading-pipeline, scheduler and 25 others; words: case-checker `spec.mjs` inline 6, named in the START, and installer-steps missingkey `installer.fleet.logsunconfirmed` 5 (`newgroup/src/steps/uploads.mjs:41`, `newgroup/test/steps/observability.test.mjs:69, 86`), not named in the START: sent to BOB in a REPORT); none in test-support.

## J9 · REPORT

REPORT (found while running checks/run.mjs; not test-support's, not changed). words: installer-steps missingkey installer.fleet.logsunconfirmed, 5 failures (newgroup/src/steps/uploads.mjs:41; newgroup/test/steps/observability.test.mjs:69 and :86); the key is not in words.json. Not among the reds my START names. Also for your routing: coverage on bio reports 33 failures in other modules (round-9 ids not yet named by a test: acquisition, capture, plane, reading-pipeline, scheduler and 25 more); none is test-support's.
