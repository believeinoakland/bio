# strength (T7)

**Status** · session_01HtJxXzMSHvzQXnWcPtibm8 · depth 2 · COMPLETE · handled B4

## J1 · REPORT

R26–R27's Provides are final as written; I propose no change to their text. How run-productions reaches them (K61): `strengthOf(ctx).candidatePair({inquiry, legs})` and `strengthOf(ctx).candidateIndependence({legs, parts})`, from `bio-plane/src/strength/index.mjs`. `legs` has the shape R26 states, `{target, role, grade, grade_axis, grade_source, ground}`, for both calls; R27 reads only `target` and `ground`. `parts` is the number of declared parts. `pair` is `{capture, connection, testimony}`, each an axis answer (Terms). One behaviour change from today's `suggestVersion` walk that run-productions should expect: R26 is R1–R5, so a candidate leg's capture grade is bounded by `inquiry.legCapped` (R1), and a hunch leg is inert and named (R5). Today's walk counts a hunch at its stated grade and bounds nothing. I will REPORT again when the code is pushed.

## J2 · QUESTION

Three cross-module points. I carry on with the rest of the job on my best reading of each.

1. **R13/R23, the cache table.** R23 moves the cache columns (`bundles.inquiry_capture_strength`, `_state`, `inquiry_connection_strength`, `_state`) to a table of strength's own. But query-language's `capture:` and `connection:` fields (`query.mjs` FIELDS, layer 5) read them as `bundles` columns, and retrieval has not yet moved its own projection columns (K75 (3)). If strength moves them now, search breaks or a layer-5 module reads a layer-6 table. **My best reading:** this job moves the derivation and registers nothing new for the cache. legacy-store's promotion step keeps the one `UPDATE bundles` it runs today, taking the pair from `strength` (it also writes inquiry's `inquiry_basis_count` and `inquiry_subject_entity`). R23's table move is deferred until retrieval offers a registration for cached fields (K75 (2)); I would file that as a REPORT for next.md.
2. **R24 and `skills`.** `skilldoctrine.mjs` imports `VERSION_STRENGTH_CHECKS` and `VERSION_STRENGTH_INERT_SOURCES` from the catalogue. If C-30 moves to `strength/checks.mjs`, that import breaks, and skills does not declare `strength` in its uses. **My best reading:** I move C-30, C-71 and C-32.9 here (R24). skills adds `strength` to its uses, and its job (running now) re-points the import to `../strength/index.mjs`. My merge and skills' merge must land together, or skills' first. The other choice is that I leave those two exports in the catalogue until skills re-points, and move them by a later CHANGE.
3. **R15's new code** (K107 (3)). I name it `STRENGTH_BAR_NOT_ADMIN`. **My best reading** of its row: a new family for strength, `C-106.1`. C-100 to C-105 are taken on `tranche/T7`, but other layer-6 jobs may mint a family now too (inquiry R39, ai-runs R40). Please allocate if 106 collides.

Decided myself (P17, recorded in my record): `STRENGTH_STATES` stays in the catalogue, because the C-2.8 published-strength arms there read it. I reach `inquiry` (`basisFor`, `earned`, `legCapped`, `subjectEntityOf`) and `basis-versions` (`currentOf`) through injected deps that legacy-store fills from its own methods. Those modules are being extracted concurrently, and neither exists on my branch yet. Whoever merges second re-points the one wiring line. I read the version rows and legs from `inquiry_basis_versions` and `inquiry_basis_version_legs` as today. basis-versions states no read contract for them, so I will REPORT that as a gap in its Provides.

## J3 · REPORT

N82 ("the earned registry reads provenance's `captureGrade`") names code that is not strength's. The earned registry (`earnedBasisRegistry`, `#capturedAt`) goes to `inquiry` (map §2, K83 (3); inquiry R13–R14), and INQUIRY #1 is extracting it now. Strength reads capture ceilings only through `inquiry.earned` and `inquiry.legCapped`, so this job has no share of N82 to apply. I suggest the inquiry job take it, or it goes back to next.md against `inquiry`. Nothing for you to answer unless you want strength to do something here.

## J4 · QUESTION

R5 has one reading I should confirm. The case is a hunch leg whose target is another inquiry.

- **My reading, built:** the leg "contributes nothing". It is inert on its own axis, and it also does not carry up the target inquiry's pair (R2). A question connected to the evidence below only by a hunch does not count that evidence.
- **The other reading:** the leg is inert "as R3's ungraded member". An ungraded inquiry leg still inherits the target's pair (R2), so the hunch would lose only its own letter and keep the inherited one. The legacy version path behaved this way: `#versionLegsAsMembers` nulled the grade and the walk still recursed.

Both readings make the live pair and the pair over a version agree, and switching between them is a one-line change. Unless you answer otherwise, I complete on my reading.

For your layer close: in the old battery, the fixtures that author connection grades as hunches now read differently by R5 (K102). These are `strength`, `inquirystrength`, `dec65-strength-reach` and `caseproduction`. The rest of the red there is source-text pins on the moved code (`strengthpair`, `independence`, `partitionindependence`, `d280-strengthbar`, `machinefences-dec49`'s row census). I will list them in my record for legacy-tests.

## J5 · COMPLETE

**Completion.** `strength` is extracted per its map and requirements, on `job/T7/strength`. The module is `bio-plane/src/strength/`: `index.mjs` (the services, the ops and the factory `strengthOf(host, deps)`, K61), `arithmetic.mjs` (R1–R4, pure), `checks.mjs` and `schema.mjs`. legacy-store delegates to it.

**Entries applied (layer 6, T6-4):**
- **Extraction (K3, K86, K102).** Moved out of `store.mjs`:
  - the bar (`#barAxisWords`, `#projectBar`, `strengthBarSet`, `strengthBarOf`);
  - the axes and the arithmetic;
  - the walk, `strengthOf`, `inquiryStrength` and the redaction;
  - `#independenceOf`;
  - `versionStrength`, `partitionIndependence`, `#versionLegsAsMembers` and `#refusePairComposed`;
  - the six ops: `strength`, `inquirystrength`, `versionstrength`, `partitionindependence`, `strengthbar` and `strengthbarof` (now `strengthOps`).

  Also moved: C-30, C-71 and C-32.9 out of `bio-checks.mjs` (R24), and `group_strength_bar` out of `schema.mjs`, now declared to purge as exempt (R23).

  legacy-store keeps the following, with `strengthModule(this.ctx)` doing the strength work:
  - a `strengthOf` delegate and `static STRENGTH_AXES`;
  - the wiring of the inquiry and basis-versions deps;
  - `op=suggest`'s calls, now to `candidatePair` and `candidateIndependence`;
  - `publishCase` and `reviewCopy`'s calls to `projectBar`.
- **R5 (K102).** A hunch is inert in every pair and named as a hunch. It inherits nothing, on my reading in J4.
- **R15 (K102).** Only an active administrator may set the group's default bar. Anyone else is refused `STRENGTH_BAR_NOT_ADMIN`, row C-107.1 (K181).
- **N60 (R26–R27).** `candidatePair` and `candidateIndependence` are built as their Provides say (J1).
- **N82.** No share for strength; it belongs to inquiry (J3).
- **No carried rows** (D-660 and D-736 were dropped).

**Behaviour to know:** every path now bounds a capture grade by what the record earns, at every depth (R1, R2, R19). That covers the pair over a version, whose sub-inquiries were uncapped before, and a candidate's legs. Improved in this job: an inherited grade's `through` now names the actual leg however deep; before, it named the intermediate inquiry.

**Deferred:**
- R23's cache table, and R13's registration with promotion: N137 (K181). legacy-store's `#writeStrengthProjection` still writes the `bundles` columns, taking the pair from `strength`.
- `STRENGTH_STATES` stays in the catalogue, because the C-2.8 published-strength arms there read it (P17, decided).

**Found in other modules:**
- `skills`: `skilldoctrine.mjs` must import `VERSION_STRENGTH_CHECKS` and `VERSION_STRENGTH_INERT_SOURCES` from `../strength/index.mjs`. The plane does not boot until then. Both merge at the layer close (K181).
- `legacy-tests`, from runs with that import re-pointed locally:
  - These fixtures author connection grades as hunches, and now read differently by R5: `strength` (it throws on a null weakest), `inquirystrength` (14 fail), `dec65-strength-reach` (8), `caseproduction` (18).
  - These pin the moved source text or the row census: `strengthpair` (it imports C-30 from the catalogue), `independence` (1), `partitionindependence` (1), `d280-strengthbar` (1), `machinefences-dec49` (2).
  - `versiongrade` (28/0), `dec65-single-part` (37/0) and `suggest` (101/0) pass.
- The plane bundle (`bio-plane/dist`) is stale from this job's source changes, for regeneration at the layer close (§14).
- `inquiry` R16's `basisFor` has no bound. `partitionIndependence` reads it whole and then slices it at 501 legs. The SQL read it replaced had `LIMIT`.
- Whoever merges second of inquiry and basis-versions must re-point legacy-store's one strength wiring statement (`store.mjs`, the constructor) to `inquiryOf` and `basisVersionsOf`. My module also imports `VERSION_MACHINE` from the catalogue; if basis-versions moves it, re-point that import too.

**Tests and checks:**
- `node --test bio-plane/test/m/strength/`: tests 40, pass 40, fail 0. Negative controls were run: with the hunch rule removed, 2 tests fail; with the capture bound removed, 4 fail.
- The manifest names no layer tests.
- `format`: 69 modules, 64 requirements files; 0 failures.
- `architecture`: 8 product files, 22 relative imports; 0 failures.
- `coverage`: 27 of 27 live requirement ids named by a test; 0 failures.
- `ownership`: 12 files; legacy-store 15 lines added, 1,890 removed; legacy-checks 0 added, 229 removed; 0 failures. The 15 added lines are the import, the wiring, the delegates and the calls listed above.

Size (session_01HtJxXzMSHvzQXnWcPtibm8): test runs 10 (module) and 22 (old-battery suites), module lines 1,369

## J6 · COMPLETE

**B4 applied.** I merged `tranche/T7` at `a21d88b177` and later, cleanly. `partitionIndependence` now reads the question's basis through `inquiry.basisFor(id, {limit: VERSION_LEGS_MAX + 1})`, bounded in SQL by inquiry's R16. A test asserts the bound is asked for. I also kept a slice at 501, so the read stays bounded even when a provider reads the basis whole.

**One thing for basis-versions' re-pointing:** legacy-store's strength wiring line (`store.mjs`, constructor) passes `basisFor: (id) => this.basisFor(id)`, which drops the options. I did not edit that line, because a one-for-one change there fails the ownership check's net-removal rule. When basis-versions re-points it, `inquiry: inquiryOf(ctx)` (or `(id, o) => …basisFor(id, o)`) passes the limit through. Until then the slice holds the bound.

**Tests and checks:**
- `node --test bio-plane/test/m/strength/`: tests 40, pass 40, fail 0.
- `format`: 0 failures.
- `architecture`: 0 failures.
- `coverage`: 27 of 27 live ids named by a test; 0 failures.
- `ownership`: 4 files; legacy-store and legacy-checks 0 lines added, 0 removed against `tranche/T7`; 0 failures.

J4 is settled by B3 (K187). My reading was already the one built.

Size (session_01HtJxXzMSHvzQXnWcPtibm8): test runs 13 (module) and 22 (old-battery suites), module lines 1,371
