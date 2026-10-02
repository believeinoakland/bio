# publication: second split (J10, K617), seam map

**Status.** A read-only worker's seam map for BOB #90, 2026-10-01, on `tranche/T22`. It covers J10 and A42 for the fold before L8. The code was read whole from `publication`'s `paths`, and the users were found by grep across `bio-plane/src` and `bio-plane/test`. All line numbers are those on `tranche/T22` today.

## 0. The size figure is wrong: publication owns 3,690 lines, not 4,408

`t22-check.md`:15, `t22-inventory.md` J10 and `current.md`:86 all give publication as 4,408 lines. That figure adds up every file under publication's `paths` prefix (`bio-plane/src/publication/`). It therefore counts `bio-plane/src/publication/worker.mjs`, which has 718 lines.

That file is `public-read`'s. Its `paths` name it exactly (K697, applied by K702). Ownership goes to the most specific path, as `civicos-process/checks/lib.mjs` `ownerIndex` decides it (BOB #38's ruling).

Measured with `ownerIndex` over `git ls-files`:

| module | files it owns | lines |
| --- | --- | --- |
| publication | `publication/index.mjs` 2,761, `schema.mjs` 672, `checks.mjs` 110, `door.mjs` 92, `deliverer.mjs` 55 | **3,690** |
| public-read | its 5 files plus `publication/worker.mjs` 718 | 2,165 |
| ratification (for comparison) | | 3,770 (the plan's figure, correct) |

**What follows from this.**
- By its own measure, K617 does not force J10 today, because 3,690 is under 4,000.
- The carve is still recommended. R32's verifying import (A42) is new code, likely about 150 to 300 lines. Publication's L8 job also carries the conditional H6 (1) and H9 shares.
- Left in publication, those would bring it to about 3,950 to 4,100 lines. That is at or over the mark, and A42's condition is that R32 lands "in a module that ends under 4,000".
- If the export moves together with R32, publication ends at about **3,590** and the new module at about 400 to 500.
- BOB should correct the three size lines to 3,690. The alternative, ruling J10 not due and homing R32 in publication, is not recommended for the reason above.

## 1. The new module

- **id:** `corpus-export`. It is the working-corpus export of Membership v2 §8.1. "export" alone would collide in reading with ES `export` and with drive.mjs's "export" verdict.
- **Position:** in `modules.json`, immediately before `publication`, which puts it between `case-grammar` (index 54) and `publication` (index 55 today). Layer 8.
- **Entry:**

```json
{"id": "corpus-export", "layer": 8,
 "paths": ["bio-plane/src/corpus-export/"],
 "tests": ["bio-plane/test/m/corpus-export/"],
 "uses": ["record-grammar", "record-core", "provenance", "connections"]}
```

- **Its `uses`, all earlier in the order:**
  - `record-core` (index 20): `recordOf`, `declarePurge`, and the read contracts on `bundles`, `files`, `history` and `manifest`.
  - `provenance` (25): the `register` read contract.
  - `connections` (34): the `refs` read contract, R58.
  - `record-grammar` (0): `createSha256`, for R3's re-derivation.
  - The job may add `test-support` (index 2) if its fixture uses it. It needs nothing from publication, so P4 holds.
- **`from`:** none. It is copied from a product module, not a legacy one (K624 (1)).
- **Owns the table** `export_log`. Publication reads no table of the new module once it delegates (§4), so K637's test holds in both directions.

## 2. What moves (copy, then delete: K624 (1))

| from | lines | what |
| --- | --- | --- |
| `publication/index.mjs` | 89–94 | `EXPORT_LOG_LIMIT_DEFAULT`, `EXPORT_LOG_LIMIT_MAX`, `EXPORT_NOTE_MAX`, with their comments (6) |
| `publication/index.mjs` | 1919–2007 | the "section 8: secure verified export" comment, `exportManifest` (1939–1980) and `exportLog` (1982–2007) (89) |
| `publication/schema.mjs` | 566–578 | the `export_log` DDL and its comment (13) |
| `publication/schema.mjs` | 592 | `"export_log"` in `PUBLICATION_EXEMPT`; it becomes the new module's exempt declaration |
| `publication/index.mjs` | 2753–2754 | ops `export`, `exportlog`: they **stay** as delegates (§4) |
| `test/m/publication/export.test.mjs` | 1–56 | whole, as `test/m/corpus-export/export.test.mjs`, renamed R18 → R1 and R19 → R2 |
| `test/m/publication/invariants.test.mjs` | 117 | the R32 todo is replaced by R3's real tests in the new module |
| `test/m/publication/invariants.test.mjs` | 30, 48–50, 55 | R31's `export_log` arms move as the new R4 test. Publication's R31 test keeps the rest, with the expected exempt list without `export_log` and `publicationOwns({name:"export_log"})` false |

**Comment-only edits in publication.** In `index.mjs` the header lines 5–6, 10–11, 33–34 and 46–47 name the export, `refs`, and R18's register and tables; they are re-worded. In `schema.mjs`, line 6 names `export_log`.

**Nothing private crosses the seam.** The two methods use only the class helpers `#rows` and `#when`, which the new module restates in two lines, the record-core tables, `register` and `refs`. No `#` member is shared, and no other publication method calls `exportManifest` or `exportLog`.

**New code in `corpus-export`:**
- A header.
- `corpusExportOf(host, deps)`: one instance per host (K61), a `migrate` that creates `export_log` (identical DDL, `CREATE TABLE IF NOT EXISTS`, so an existing store keeps its rows), and `record.declarePurge("corpus-export", [], {exempt: ["export_log"]})`.
- R3's verifying import.

## 3. What stays in publication

Everything else stays: every other table and write, R1–R7, R12, R14, R15, R17, R21–R23, R35, R37–R43, R50–R55 and the invariants. After the split, publication's code reads `bundles` and `register` but not `files`, `history`, `manifest` or `refs`.

**Line counts after:**

| module | count |
| --- | --- |
| publication | 3,690 − 95 (index) − 13 (schema) + about 11 (the import and re-export, two delegating methods, eager creation) ≈ **3,590**, before the conditional H6 (1) and H9 shares |
| corpus-export | about 200 for the moved code with its header, factory, schema and purge declaration, plus R32 at about 150–300, ≈ **400–500** |

## 4. What publication imports, and why it delegates

The plane's op map (`bio-plane/src/plane/store.mjs`:278, the `plane` module) spreads `publicationOps`. `plane` has no T22 job (P8). `queue-producers` imports `EXPORT_LOG_LIMIT_DEFAULT` from publication and calls `publication.exportLog`. A test in `conformance`, which has no T22 job, calls `publication.exportManifest`.

So publication's L8 job does the following:
- **Imports** `corpusExportOf` and **re-exports** the three constants unchanged (K649 (1): a re-export left for later importers).
- **Keeps** `exportManifest(a)` and `exportLog(a)` as one-line delegates to `corpus-export`. These are delegates, not code held twice (K624).
- **Leaves** the ops `export` and `exportlog` in `publicationOps` (2753–2754), unchanged.
- **Creates** `corpus-export` eagerly in `publicationOf` (a line beside the purge declaration at 2701), so `export_log` exists and is declared exempt at every boot.
- **Gains** `corpus-export` in its `uses`.
- **Keeps** `connections` in its `uses`. Its code no longer reads `refs`, but its test fixture imports `connectionsOf` (`fixture.mjs`:13).

A later job retires the delegates once two things have happened:
- the `plane` op map spreads a `corpusExportOps`;
- `queue-producers` imports from `corpus-export` directly.

This is a `next.md` entry, unless BOB puts the re-point in queue-producers' L11 START (below).

## 5. Requirement ids

| publication | → corpus-export | |
| --- | --- | --- |
| R18 (`exportManifest`, `op=export`) | **R1** | moved, retired in publication |
| R19 (`exportLog`, `op=exportlog`) | **R2** | moved, retired in publication |
| R32 (the verifying import, not yet met) | **R3** | moved, retired in publication |
| R31, its `export_log` clause | **R4** | R31 stays; `export_log` leaves its list, with a note "(`export_log`'s exemption moved to `corpus-export` R4, K617)" |
| R34 (no place named) | **R5** | copied, as R34 was copied to `public-read`, `project-stage` and `case-grammar` |

The other ids stay. In publication.md, edit the following, with no change of meaning:
- **Purpose:** "and exports the working corpus verifiably" becomes "; the verified working-corpus export is `corpus-export`'s".
- **Verified export section:** R18, R19 and R32 are marked retired, as moved.
- **Uses:**
  - `record-core` drops the `files`, `history` and `manifest` contracts and keeps `bundles`;
  - `provenance` is cited for R17 only;
  - `connections`' `refs` (R18) is struck;
  - `corpus-export` (R1, R2, through the delegates) is added.
- **Satisfies:** Membership v2 §8.2 stays; §8.1 and "What verified must mean" go.
- **Suggestions:** the `op=export` and `op=exportlog` half of "For callers" moves.
- **Decided by BOB 4** (`#findingsExportPerformed` reads R19) moves.
- **Old ids:** add "Moved by the second split (K617, J10): R18 → `corpus-export` R1, R19 → R2, R32 → R3, R31's `export_log` clause → R4; R34 copied as R5."

**Where R32 lands:** `corpus-export` R3, not yet met. A42 is met by the new module's L8 job, so A42 is homed and no longer conditional.

**Scope to state in the START** (P17, a detail):
- R32's testable meaning is the verification itself. The service is handed an export (R1's manifest) and the bytes it names. It re-derives every file's SHA-256, every bundle's history chain and base links (`manifest.base` → `history.sha256`), and byte-compares every registered capture. It answers verified, or each failure by name, trusting nothing the manifest asserts.
- Writing a verified corpus into a receiving store is not stated by R32. Leave it out, or BOB words it as a new id.
- R1's manifest carries hashes, not bytes (`inline` and `blobSha` only), so the import's input is the manifest plus the bytes.
- The plan's proof matches this scope: every hash, chain and base link re-derived, a tampered manifest refused, with a negative control.
- If R32 is given an op, it is a new op: op-declarations, admission (root of trust) and affordances totality would follow (accepted red 5's pattern). I recommend no op in T22.

## 6. Users of the moved services

| user | uses | re-point needed? |
| --- | --- | --- |
| `queue-producers` (L11, has a T22 job) | `EXPORT_LOG_LIMIT_DEFAULT` (`queue-producers/index.mjs`:41), `this.#publication.exportLog` (:1462); the tests `world.mjs`:131, `feeditems.test.mjs`:33, `producers.test.mjs`:62 stub `publication.exportLog`; `requirements/queue-producers.md`:79 ("`publication`: the export log (R2)") | Not needed: green through the re-export and delegate. Optional in its L11 job: import from `corpus-export`, `uses` gains `corpus-export` (earlier), Uses line → "`corpus-export`: `exportLog` (its R2)", tests stub `corpusExport` |
| `queue` tests | `feed.test.mjs`:202 and `world.mjs`:124 stub `publication.exportLog` through queue-producers' world | Follow queue-producers if it re-points |
| `conformance` (no T22 job) | `test/m/conformance/record.test.mjs`:165 `w.publication.exportManifest` | No: the delegate keeps it green. `next.md` |
| `plane` (no T22 job) | `store.mjs`:278 spreads `publicationOps`, which keeps `export` and `exportlog` | No in T22. `next.md`: spread `corpusExportOps` and drop publication's two entries |
| `admission`, `op-declarations`, `control-plane` | the op names `export` and `exportlog` (C-38.4 `ROOT_OF_TRUST_REQUIRED`, `op-declarations/index.mjs`:139) | No: op names and gates are unchanged |
| `ai-runs`, `retrieval`, `queuestate.mjs` | comments naming `op=exportlog` or `export_log` | No |

No other module calls `exportManifest`, `exportLog`, or the R32 import, which does not exist yet.

## 7. Risks and their resolution within P4

1. **Purge declared twice.** `record-core.declarePurge` refuses a table declared by two modules (`TABLE_DECLARED`) and then declares *nothing* from that call. `publicationOf` ignores the return value (2701). If `corpus-export` declared `export_log` on a host before publication's declaration still naming it ran, all of publication's tables would go undeclared, and so unpurged.
   - **Resolution:** the new module's job must not wire itself into any live path. It cannot anyway, since `store.mjs` and publication are not its paths. Only its own tests create it.
   - Publication's job drops `export_log` from `PUBLICATION_EXEMPT` in the same commit that starts creating `corpus-export`.
   - Proof in publication's job: a test that both declarations answer `ok: true` on one host.
2. **No circular need.** The moved code calls nothing of publication's, and publication reaches the new module only through its public services. P4 holds: corpus-export sits immediately before publication.
3. **Shared helpers.** Only `#rows` and `#when`, which are trivial and restated. `EXPORT_NOTE_MAX` is declared but `exportManifest` cuts the note with a literal `280` (1971). Copy it as it is; using the constant is a no-meaning tidy for the job.
4. **Read contracts not yet stated.** These gaps predate the split and the split does not change them:
   - `exportManifest` reads `bundles`' `title`, `current_state`, `bundle_sha`, `row_version`, `created` and `last_updated`, but record-core R37 states only `bundle_id` and `object_type`;
   - it reads the `files`, `history` and `manifest` tables, which publication's Uses mark "*(not yet provided: T8's record-core entry)*";
   - it reads `register.bytes`, but provenance R48 lists `capture_sha`, `bundle_id`, `path`, `registered` and `authored`.

   The new module's Uses carry the same mark. They are `next.md` entries for record-core and provenance wording, not this split's.
5. **The accepted red.** Red 4 (membership `MODULE_ORDER`) begins at the `modules.json` edit, as the plan already says. No other red: the op names, gates, catalogue rows (none move; the export holds no row) and `CATALOG_VERSION` are unchanged.
6. **The test fixture.** The new module's tests may not import publication's `fixture.mjs`, because publication is later. Build on `test/m/connections/fixture.mjs` (an earlier module's fixture, the precedent K651 §7 names), or a lean world of record-core, provenance and connections.

## 8. Merge order (as `current.md` L8)

1. `corpus-export`: it copies, adds R3 and merges first.
2. `publication`: it deletes 89–94, 1919–2007 and the schema lines, delegates, re-exports, drops the moved tests' arms, and merges second.
3. The rest of L8 as planned.

Nothing is held twice across tranches.
