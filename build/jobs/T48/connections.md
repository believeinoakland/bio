# connections (T48)

**Status** · session_01PrxArXookTYp8gXpFjHkXC · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Three points in R68/R69 where the text and the code disagree. I am building on the readings below and will continue unless you say otherwise.

(1) R68 `EXTENT_MALFORMED` ("an extent `content.canonicalExtent` cannot read"): `canonicalExtent` never refuses; it always answers a string. My reading: judge the extent with content's `checkContentExtent(extent, CONTENT_EXTENT_DOCUMENT_ONLY)`, the shape-only check entities R46 already uses. A refusal answers `EXTENT_MALFORMED` and carries content's code (C-45.x) as `extent_refusal`. The stored key for the "same (relation, capture, extent)" rule is `canonicalExtent(extent)`.

(2) R69 `evidence` `[{capture_sha, extent, basis, relation}]`: connection-grammar R1 (`shape.mjs` `connectionErrors`) refuses every evidence entry without a non-empty `source`, so the item as written fails `ownerConformance`. My reading: each entry also carries `source`, the cited capture's bundle id. This matches `mentioned_together`'s evidence, and the viewer must be able to see that bundle anyway (R33).

(3) R69 `grade.assertion` "the cited capture's grade (`provenance.captureGrade` through `content`)": `captureGrade` answers `grade: null` for a capture with no receipt, a received or uploaded capture, or an authored observation, and the shape requires a letter. My reading: a null capture grade answers the lowest grade, `D` (connection-grammar `LOWEST_GRADE`, never above the capture's), and the item states why in `grade_says`. A lettered grade is taken as is. This is the fallback `lines` already uses.

Also, for your report to the owners (not mine to change): `screens-investigate/explore.mjs` today sends `connectionassert` for "Attach a source to a declared step", and `setup-words`/`affordances` hold `connectionassert`'s help text under that label. Both are already planned under T48-74 / interface-shell R55 / op-declarations R67; I note it only so that nothing points at `connectionassert` after the merge.

## Completion

**How the reading set was read (mechanics §17; START's 869 KB):** I read whole: `build/requirements/connections.md` (public and private), every file of my code (`index.mjs`, `schema.mjs`, `mentioned.mjs`, `themes.mjs`, `pair.mjs`, `checks.mjs`, `ops.mjs`), layer 5's contract in `build/layers.md`, and my entry T48-20 with the plan's "Rules at the opening" (P20). Two helpers in this session, each given my entry and START, read the rest in full and wrote me digests citing each section:
- one for my tests: all 17 files under `test/m/connections/`, 3,387 lines;
- one for the public parts (Purpose, Provides) of entities, content, connection-grammar, provenance, record-core, membership, explore and capture, with their sources for `readRelation`, `canonicalExtent`/`checkContentExtent`, `captureGrade`, `registerOwner`, `ownerConformance` and `declareTable`.

The sources stayed binding: I checked `connection-grammar/shape.mjs` `connectionErrors`, `entities.declareRelation`/`readRelation` and content's extent check myself before building on them.

**Entries applied:** T48-20 (N1030, K3145), read with J1 (answered B2, K3245).
- **R68**, in the new `src/connections/stepsources.mjs`:
  - `attachStepSource` refuses, in order, each writing nothing:
    - `STEP_SOURCE_NOT_A_MEMBER`;
    - `NO_SUCH_RELATION`, for an absent or withdrawn relation, through `entities.readRelation`;
    - `CAPTURE_NOT_HELD`, for a capture hidden or absent, answered alike;
    - `EXTENT_MALFORMED`, from content's `checkContentExtent(extent, CONTENT_EXTENT_DOCUMENT_ONLY)`, with content's code as `extent_refusal`;
    - `STEP_SOURCE_NO_BASIS`;
    - `STEP_SOURCE_BASIS_TOO_LONG`, with `limit` 4,000.
  - It records `{id, relation, capture_sha, extent, basis, member, at}`, with the id `STEPSOURCE-<n>`.
  - The same standing (relation, capture, `canonicalExtent(extent)`) attached again answers `wrote: false`. The relation is never touched.
  - `withdrawStepSource` refuses a machine or absent member, then `NO_REASON`, then `NO_SUCH_STEP_SOURCE` (also for a source already withdrawn or hidden), then `STEP_SOURCE_NOT_THE_ATTACHER`.
  - A withdrawn source stays recorded, with `withdrawn: {by, at, reason}`. Attaching again afterwards writes a new row.
  - The ops map gains `stepsource` and `stepsourcewithdraw`, with `member` and `viewer` from the stamps, never the body (control-plane R92, op-declarations R67).
- **R69**:
  - The owner's one registration now names two kinds: `mentioned_together` and `step_source` (class `evidentiary`, word "stated in a source", provisional).
  - `neighbours` takes the step-source read for a node `entities.has` holds, and the co-mention read otherwise.
  - Each standing source of a standing relation, whose capture the viewer may see, is one item, in this shape:
    - `from` and `to` are the relation's ends, and `id` is the source's id;
    - `evidence` is `[{source, capture_sha, extent, basis, relation}]`, where `source` is the cited bundle (J1 (2));
    - `grade.assertion` is `provenance.captureGrade` through content; with no letter it answers `D`, with `grade_says` (J1 (3)). `grade.ends` is `[D, D]`;
    - `valid` is unstated, with `undetermined`.
  - Hub and paging follow `BOUNDS`. It passes `ownerConformance` declared undated, not group-wide.
- **R36, R67:** a new table `step_sources`, keyed to the cited capture's bundle, sight `bundle`, declared through `declareTable`.

**Read whole, and flaws dealt with (P8):** my code holds no flaw I found beyond this entry. In the tests I fixed:
- **R67** compared the declared names with the module's own constant, which is tautological. It now names every table by hand, each in exactly one sight list, and checks that each table is created.
- **R36**'s whole-store purge missed `theme_placement_acts`, `asserted_connection_judgements`, `file_membership_pending` and `connection_derivations`, and asserted zero on tables that were already empty. It now covers every table, after first showing rows held.
- Placeholder assertions that checked nothing are removed: asserted `assert.ok(sha)`, edges `assert.ok(u)`, converts-reads `assert.ok(t)`, read `assert.ok(p)` and themes `assert.ok(c3)`. derive's `assert.ok(caps.length === 3)` is now an equality.

Kept as they are, not flaws: derive R2's `|| k === 2` is the `maxEndsForPairs` floor at a pair limit of 1, and the `where` strings pinned in R35 are the catalogue contract.

**Tests:**
- New `stepsources.test.mjs`, 10 tests naming R68, R69, R36 and R67. Every refusal has its control, and the order is proven by inputs carrying every later fault.
- The walk "explore reaches the other end through a step_source hop" is tested through `connection-grammar`'s registry with the caller's host, the path explore reads (explore merges after me). The control: after `withdrawStepSource` the hop is not answered.
- owner R62 is amended for the second kind (R69 amends R62).

**Deferred:** none.

**Found in another module (no new report):**
- `screens-investigate/explore.mjs`, `setup-words` and `affordances` still send `connectionassert` for "Attach a source to a declared step". Placed by B2 with T48-74, interface-shell R55 and op-declarations R67.
- `stepsource` and `stepsourcewithdraw` are now on the store's op map. Their specs and routes are op-declarations R67's and control-plane R92's (L11). With this change, no test of op-declarations or plane names them.

**Tests and checks run:**
- connections: `node --test "test/m/connections/*.test.mjs"`: tests 129, pass 129, fail 0.
- Whole suite (`npm test`, every user of the module and the registry): tests 12151, pass 12091, fail 48.
  - All 48 are in other modules: action-grammar, affordances, answer-envelope, following, capture-requests, control-plane, filings, journey-check, op-declarations, project-roster, reading-guides and scheduler.
  - Each of their 19 files was re-run at the commit before mine and fails with the same count, so none is this job's. They are inherited (rule 5).
  - plane, explore, entities and every other module that composes connections: 0 failures.
- `node checks/format.mjs`: 168 modules, 167 requirements files; 0 failures.
- `node checks/architecture.mjs . connections`: 23 product files; 0 failures.
- `node checks/coverage.mjs . connections`: 69 of 69 live ids named by a test; 0 failures.
- `node checks/ownership.mjs . connections tranche/T48`: 0 failures.
- `node checks/run.mjs`:
  - format 0, architecture 0 (3279 files) and channels 0 failures;
  - coverage 45 failures, all other modules' not-yet-met ids (rule 5 (1)), none of them connections'.

Size (session_01PrxArXookTYp8gXpFjHkXC): test runs 7, module lines 3145
