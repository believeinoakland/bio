# ratification (T37)

**Status** · session_01WijqF42RSZhCvSzJq82kMd · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R39's obscured copy: where does it live, and how do I name the key? My START says case-carriage's COMPLETE names it; case-carriage has only just started (its branch has no code yet), and `case-carriage` is not in my `uses` (no `modules.json` change).

My best reading, which I am building now: the copy's bytes are in the evidence-store bucket (`env.CAPTURES`), outside `captures/`, under a key of the form `<store>/obscured/<sha256>` (I avoid `<store>/derived/`, which `file-safety` already spends on safe copies, `derivedKey`). `copyMaterials` takes the commit's `[{sha, held}]` items and reads an `evidence` one from `<store>/captures/<sha>` and a `derived` one from that key; both counted in `materials_copied` the same way, the published key `<store>/published/<sha>` for both. The key is one function in my `ops.mjs` (`obscuredCopyKey`), so it is a one-line change once case-carriage names the real key. If case-carriage holds the copy somewhere other than an R2 bucket (e.g. in the Durable Object's SQL), tell me and I will read it through `publication` instead.

Carrying on with R32 and the rest meanwhile.

## J2 · COMPLETE

T37-19 done on `job/T37/ratification` (two code commits after the START's merge of `tranche/T37` @ `0303f8861b`).

**Entries applied**
- **R32 (N761; K2129, K2175):** `ratificationOps(...).casegate` reads `secretSha` only from the internal request's body (`index.mjs`:1479), and only when it is a non-empty string, as publication's `casedocument` reads it. A `secretSha` in the query is never read. The map's doc comment says so (`index.mjs`:1466–1469).
- **R39 (N757; DEC-180 (4); K2206; B2/K2222):** `copiedMaterials` (renamed from `evidenceShas`, `index.mjs`:1421–1426) now hands the Worker `{sha, held}` for `evidence` and `derived` materials.
  - `copyMaterials` (`ops.mjs`:233–257) reads a `derived` one from `obscuredCopyKey(store, sha)` = `<store>/obscured/<sha>` in `CAPTURES`, never from `captures/`. It reads an `evidence` one from `captures/` as before.
  - Both are counted alike in `materials_copied`. Its shape is unchanged.
  - The same path serves the commit (R3), a re-sent `op=caseratify` (through `heldMaterialsOf`) and the scheduled publisher (R42).

**Tests (K874's explicit clauses)**
- `case-commit.test.mjs`, "R32: casegate reads secretSha from the body only…":
  - a `secretSha` in the query alone admits no grant;
  - the body's admits it;
  - the query's never overrides the body's;
  - a non-string body digest counts as none.
- `caseratify-op.test.mjs`, "R39: a derived (obscured copy) material is copied…": a `derived` item is copied from `obscured/` and counted; one present only under `captures/` is missing, never copied from there; the retry goes through `heldMaterialsOf`.
- `schedule.test.mjs`, "R42, R39: … the publisher copies each evidence-held and derived material…": the scheduled publisher's Worker branch, which was untested before.
  - To drive it, the fixture's `world()` takes an optional `worker`, and the schedule setup passes it through.

**Rule 4:** confirmed. No test outside this module drives `casegate`, through control-plane or otherwise, at `tranche/T37` @ `0303f8861b`. `git grep casegate` outside `bio-plane/src/ratification` and `bio-plane/test/m/ratification`, excluding `dist/`, finds nothing. The Worker half's own hop (`ops.mjs`:152–155) sends no `secretSha`, since the ceremony is session-only. So my merge opens no red.

**Reading set:** measured over 300 KB (tests alone 383 KB), so option (3).
- I read whole:
  - my requirements;
  - layer 8's row and its split sections of `build/layers.md`;
  - `ratificationOps` and `copyMaterials` and their neighbourhoods;
  - `case-commit.test.mjs`, `caseratify-op.test.mjs` and `fixture.mjs`;
  - `case-carriage` R1 and R11, its T37 technical note, and `publication` R57.
- One worker read the rest of the code (241 KB) and the other 16 test files (319 KB) in full. Its summary was about 600 words, citing file and line for every reader of `evidenceMaterials`, `materials_copied`, `copyMaterials`, `secretSha`, `casegate` and `held`.
  - It found no test asserting the old shapes.
  - It found two gaps, both fixed here: the scheduled path's copy was untested, and the R32 guard was weaker than publication's.
  - It left out nothing that mattered.

**Deferred:** none.

**Other modules**
- The derived path is exercised only with stubbed commit answers until case-carriage (T37-34) lands `held: "derived"` and the copy at `<store>/obscured/<sha>`. Its tests should check that key, which is now `ratification`'s exported `obscuredCopyKey`.
- R32 relies on control-plane (T37-33) setting `secretSha` in the body. No external route reaches `casegate` today.

**Tests and checks run**
- `node --test test/m/ratification/*.test.mjs`: tests 216, pass 216, fail 0. No layer tests are named; no service another module uses changed (`copyMaterials` and `obscuredCopyKey` are imported only within this module).
- format: 0 failures.
- architecture: 0 failures.
- coverage: 47 of 47 live ids named, 0 failures.
- ownership: 7 files, 0 failures.

**P6:** 3,540 lines (3,530 at the opening).

Size (session_01WijqF42RSZhCvSzJq82kMd): test runs 6, module lines 3540
