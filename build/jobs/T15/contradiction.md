# contradiction (T15)

**Status** · session_0171p4zErPrN1VgxXfWEhXn7 · depth 2 · WORKING · handled B3

## Progress

- Steps 1–3 done: started, read whole (requirements, uses' public parts, layer 6's contract, module code and tests, plan entry, B1–B3); J1 answered by B2 (K488); inquiry merged (B3, K489), tranche merged into this branch.
- Step 4 in progress: the N345 services are written (`src/contradiction/index.mjs`, `derive.mjs`, `text.mjs`, `checks.mjs`, `schema.mjs`, `../contradiction.mjs`); the fixture now drives the real record-core, membership, promotion, content, extraction, entities, connections and inquiry. Next: tests for R5–R55 at the interface (step 5), then the checks.

## J1 · QUESTION

Six readings I am building on; I carry on with each unless you answer otherwise.

1. **K5 while the gate is unmeasured (R24, R25, R27; START, draft-T15 point 5).** I have no model access, so R41 and the K5 gate arm are `test.todo` naming that cause. K5 pairs are formed (R5, R8, R11) and may be proposed (R13), but every K5 candidate reads weight `not_shown` with `unshown_why: "k5_gate_unmeasured"`, whatever its label; R25's `none_shown` counts them apart from `{precision, unrelated}` as `unmeasured`. R24's K5 plurality and R34's move to duty are then `test.todo` (the rule is written but cannot be reached at the interface).
2. **Inquiry's R46–R48 are not merged.** I read them through `import * as` inquiry (a missing export is `undefined`, never a link error) and an `inquiry` dependency (`contradictionLink`, `inquiryOfCandidate`, the vocabularies, `resolutionFamily`, `resolutionLines`) that the factory fills from inquiry's instance; my tests pass a stand-in built from inquiry's stated interface until you tell me inquiry has merged, then switch to the real one. With the vocabulary absent at run time, R32's coordinate check answers undetermined (refuses nothing it cannot judge? No: it refuses, `CLARIFY_COORDINATE_UNKNOWN`, since no coordinate can be shown to be in a vocabulary that is not held).
3. **Where a side lives (R10, R49).** A claim side lives in its inquiry; a leg side in its inquiry and its content row's bundle (when held); an extent side in its content row's bundle; a stance side in its inquiry and its project (the project at `FULL`, membership R44). A viewer may see a side when they may see every bundle it lives in. The candidate row gains `a_side` and `b_side` (the side as the plane formed it, JSON), so a leg's inquiry and a side's text are read back without re-pairing (R15's "both sides with their bundles"); `a_bundle_id`/`b_bundle_id` stay the purge keys (a stance side's is its project).
4. **R28's facts per coordinate, and R32's `{fact: coordinate}` evidence.** Stated date → `time_or_occasion`; doctype and capture → `observer_or_method`; each side's established resolutions → `subject`; K5's projects → `scope`. `{fact: c}` is `EVIDENCE_NOT_SEEN` when every fact R28 answers for `c` is `undetermined`, or it answers none.
5. **R29 at bytes.** The finding's accepted, unhidden, claimed versions and its legs "at those bytes" are read from its document at `sha` (record-core `textAtSha`, parsed by basis-versions' grammar); an inquiry leg's own versions are its current ones. A `sha` no text answers is `undetermined: true`.
6. **R36's atomicity** is one outer `record-core.transact` around `promotion.promote` (the resolution lines) and `basis-versions.conclude` (no project), as the Suggestion says; I report if `conclude` cannot nest.
