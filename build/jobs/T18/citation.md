# citation (T18)

**Status** · session_016yjBBai14h7u1bLpxUiV2n · depth 2 · COMPLETE · handled B2

## Completion (CITATION #4, T18 layer 6)

**Entries applied** (`current.md` layer 6, citation: "Converts: `citeproject-inquiry`, `project-discoverable`, `refuse-gate` (with legacy-store's share of `refuse-gate`). Size: tests only"). Each share by its row in `build/jobs/T17/legacy-tests.md`, carried at citation's interface in `bio-plane/test/m/citation/`:
- `citeproject-inquiry` (row 68, citation's share: op=audit finds no error on what cite/sever/reinstate rewrote) → `audit.test.mjs` (R2, R4): whole documents the catalogue passes before any act (6 checked, 6 clean); a case citing a question and a document, a second case citing the same question, a question resting on a document (pinned) and on another question, then a sever and a reinstate, each read back through record-core's `auditPass` (a different door from the one that wrote them): 0 errors before, after the cites, while severed and after the reinstate, every citing document's `rowVersion` moved. Control arm in the same file: a citing document the catalogue refuses is counted. Its affordances arms (R17/R9/R14) are `affordances`' share, not taken.
- `project-discoverable` (row 123, citation's share: C-70.1 at EXISTENCE for sever/reinstate; hidden = absent) → `existence.test.mjs` (R4, R9, and R1 for cite): at existence only, each of the three acts answers `membership.existenceAct`'s C-70.1 byte for byte, carrying only the id and name (no owner, state or edge), and writes nothing (table snapshot and document unchanged); control: the owner severs and reinstates. Set hidden again, each answers `noSuchProject` exactly as a never-minted id. Its other acts and reads are `queue`'s, `basis-versions`' and `membership`'s shares.
- `refuse-gate` (row 156): citation's share (R3's drift clause for a query selection swapped at a constant count) → `query-drift.test.mjs`: the Session Log states the set had moved while the published `moved` stays false (per-row), on a case and on a question; an unchanged query selection writes no clause. legacy-store's share, as my J1 reading (no answer yet): carried at citation's own refuse-weight acts (R4, R7): `sever` and `reinstate` over the swapped query selection are `SET_MOVED` with no members and no edge moved, whatever weight the caller sends; an unchanged query selection and a fresh one over the same criterion sever and reinstate. The `release` and `retire` arms themselves are not citation's interface and stay in the old suite.

**Negative controls, run against my own source and restored byte-identically (sha256 compared):** (a) cite's record statement back on `sel.moved` → `query-drift` 1 pass, 1 fail (the R3 arm); (b) `#citingObject` with the existence answer removed → `existence` 1 pass, 1 fail (the C-70.1 arm). The audit arm carries its own control (a refused document is counted).

**Not changed:** the module's source (no entry asks for a change, and I found no flaw in it); no catalogue row moved or changed, so none is `awaiting stamp`; no `not yet met` mark is met by this work (citation has none). The three old suites are not deleted (K619).

**Found in other modules, for REPORT:** `refuse-gate`'s `release` and `retire` arms (legacy-store's share) are not carried by this job, only their behaviour at citation's acts (J1): the `release` arms go with ratification's extraction of `Store.release` (N400, layer 8), `retire` with legacy-store. Nothing else.

**Tests and checks run:**
- `node --test bio-plane/test/m/citation/`: tests 55, pass 55, fail 0 (was 50; +5 in three new files).
- Layer tests: none named in `build/manifest.md`. I changed no service, so no user module's tests are due.
- `node checks/format.mjs`: 82 modules, 77 requirements files; 0 failures.
- `node checks/architecture.mjs … citation`: 8 product files, 30 relative imports; 0 failures.
- `node checks/coverage.mjs … citation`: 11 of 11 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … citation tranche/T18`: 4 files changed by citation; legacy-store 0 added, 0 removed; legacy-checks 0 added, 0 removed; 0 failures.

Size (session_016yjBBai14h7u1bLpxUiV2n): test runs 7, module lines 1040

## J1 · QUESTION

refuse-gate's convert "with legacy-store's share". legacy-store's share (T17 legacy-tests row 156) is op=release and op=retire refused SET_MOVED over a query selection swapped at a constant count, and a fresh selection releasing and retiring. Neither act is citation's, and a job's tests check its own module's interface (JOB.md step 5), so I cannot drive release or retire from bio-plane/test/m/citation/ without testing legacy-store's code.

My best reading, which I am carrying out: the share is converted as the same behaviour at citation's own refuse-weight acts. sever and reinstate over a query selection swapped at a constant count (moved false, digestChanged true) are refused SET_MOVED and no edge moves; an unchanged query selection passes; a fresh selection over the same criterion severs and reinstates normally (R4, R7). The release and retire arms themselves stay in the old suite, which I do not delete (K619), for ratification (release, N400, layer 8) and legacy-store (retire) to carry when their jobs convert it.

Say if you want it otherwise. I am not waiting on the answer: the rest of the job does not depend on it.

## J2 · COMPLETE

Complete. The three converts are carried at citation's interface in three new test files (audit, existence, query-drift; tests 55 pass, 0 fail, was 50); no source change, no row moved, nothing awaiting stamp. legacy-store's share of refuse-gate is carried as my J1 reading (sever and reinstate refuse a constant-count query swap SET_MOVED); if your answer to J1 differs, send a CHANGE. The release and retire arms themselves stay in the old suite for ratification and legacy-store. Format, architecture, coverage (11 of 11) and ownership (legacy-store and legacy-checks 0/0) all 0 failures. Details and the size line in my record's Completion section.
