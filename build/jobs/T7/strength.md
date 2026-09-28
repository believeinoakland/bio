# strength (T7)

**Status** · session_01HtJxXzMSHvzQXnWcPtibm8 · depth 2 · WORKING · handled B1

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
