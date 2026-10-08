# calculations (T36)

**Status** · session_01JLKQ4KM6RQvEVRSy8fPJcz · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

R38 keeps each visit "with ... the testimony's `observed_at`". provenance writes it to `register.observed_at` (its R1, R28), but R48's read contract (the columns a later module may join in its own SQL) lists `capture_sha`, `bundle_id`, `path`, `registered`, `authored`, `bytes`, `author`, not `observed_at`; no provenance service answers it either (`homeOf` omits author and observed_at by R4).
My best reading, on which I proceed: calculations reads `register.capture_sha, bundle_id, authored, author, observed_at` in its own SQL (as R38's "as provenance records" asks), and provenance R48 gains `register.observed_at` (the member's stated instant, R28) as a wording change BOB writes; no provenance code changes. If you prefer another route (a provenance read service), say so and I will switch to it.

## Completion

**Entries applied (T36-19; N735, U119, DEC-178; K2015, K1430, K2092, K2115).**
- R18: `draw` takes an optional `question` (1 to 2,000 characters, trimmed), refused `BAD_QUESTION` writing nothing. The question joins the draw key only when given, so every draw without one keeps its old key. Two draws that differ only in their question are two draws with the same sample. The answer carries `question`. The column is `calc_draws.question`, added by migration on older stores.
- R38: `recordVisit` (`op=spotcheckvisit`).
  - Its refusals come in R38's order, each writing nothing.
  - The testimony is read from provenance's `register` through R48's contract: `capture_sha`, `bundle_id`, `authored`, `author`, and `observed_at` (J1, answered B2/K2115).
  - Exhibits are optional (DEC-178), deduplicated, and must be visible to the visitor.
  - Visits live in a new table, `calc_visits`. It is append-only, has no change or remove service, is keyed to the draw's project for purge, exports `yes` and has bundle sight (R29).
  - A visit stales every calculation over its draw (R11; the detail's cause is `visit_recorded`, and the listener is told `calculation_input_changed`).
- R39: `spotCheck` (`op=spotcheck`). It answers:
  - the draw: set, `set_size`, `n`, seed, method, and `reproduced` (shared with `reproduceDraw` through `#reproduce`);
  - the question;
  - the items in drawn order, each with its visits in recorded order and its standing;
  - counts that sum to `n`;
  - the estimates over the draw that the viewer may see, with their recompute status.

  It answers `{ok: true, found: false}` alike for an absent draw, a hidden set, a hidden testimony or exhibit, and no viewer. The same withholding reaches `read`, `create` and `#visible` through `#seesDraw` (R10). It never throws and writes nothing.
- R40: an `estimate` over a draw that carries a question binds the draw as a canonical table, one row per drawn item (`item`, `standing`, `visits`, through `tableBuilder`). The input's `sha` is that CSV's SHA-256, and its bytes go to the evidence store (R9).
  - The recipe is composed (`visitRecipe`): select, share and count steps, so all arithmetic is calc-grammar's (R25).
  - Results: `share_judged`, plus `interval` (`calc-grammar.interval` over the set's size, `judged` and `yes`) with `low_share` and `high_share` from calc-grammar `divide` at `RATIO_DEFAULT`.
  - `estimate_count` is calc-grammar `multiply(share_judged.value, N)`. `counted_apart` gives `could_not_tell`, `disagree` and `not_visited`, plus `steps`, the R5 trace list. `assumption` is the sentence `VISIT_ASSUMPTION`.
  - With no item judged, it is refused `NOTHING_JUDGED`. The capture axis is testimony, D (`#gradeFacts` and `#bind`).
  - An estimate over a draw with no question is unchanged.

**My detail decisions (BOB's to confirm or rule):**
- (1) Two refusals that R40 does not name, needed to keep the template closed: `ESTIMATE_INPUTS`, when an estimate over visits has any input beside its draw, and `RECIPE_NOT_TEMPLATE` (the code R33 already uses), when a recipe is given that is not the composed one.
- (2) `counted_apart` on a visit estimate is an object `{could_not_tell, disagree, not_visited, steps, says}`. Other kinds keep the list.
- (3) `testimony` and `exhibits` are named by capture sha256.
- (4) A visit's id is its sequence number within its draw.

**Deferred:** nothing.

**Found in other modules (also in the REPORT):**
- (a) My new ops `spotcheckvisit` and `spotcheck` turn **affordances** `t33.test.mjs:144` (its R40/R12, "each new module's op map holds exactly the ops graded for it") red. They also add `spotcheckvisit has no spec` to **op-declarations** `t33.test.mjs:192`, which is already red 17. Both are expected until T36-35 declares and grades the ops (with op-grades and control-plane, as START B1 says). op-declarations' other two failures (`t34:135`, red 13; `t35:196`) are the same on the base.
- (b) The generated plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (calculations' source changed). It is regenerated at layer close (mechanics §14).

**Reading.** The set was over 300 KB (code and tests 391 KB). I read whole: my requirements, layer 5's row of `build/layers.md`, the plan's rules at the opening and the T36-19 entry, K2092, K2015, K1430 and K874, `index.mjs`, `schema.mjs`, `calculations.test.mjs`, `fixture.mjs`, calc-grammar's `draw.mjs` and its arithmetic (`divide`, `multiply`, `RATIO_DEFAULT`, the share rule), and provenance's `testify`, R1, R28 and R48.

My worker read the rest whole (`patterns.mjs`, `tables.mjs`, `application.mjs`, and the tests `application`, `money`, `registrations`, `invariants`, `tables`, `analysis` and `fixtures/heap`). It wrote a summary of about 2,400 words citing file:line: the R29 table test, the snapshot sweeps of `calc_*` tables, R18's draw test and estimate, the ops-map test, the forbidden-words greps (R27, R37) and `tableBuilder`'s shapes. Nothing it left out mattered: every point it raised was checked against the code I wrote, and the suites are green.

**Tests and checks.**
- `node --test bio-plane/test/m/calculations/`: 55 pass, 0 fail. This includes the new `spotcheck.test.mjs`, 8 tests naming R18, R38 (×2), R39 (×2) and R40 (×3), each in a test of its own (K874). R40 is tested against a hand-computed hypergeometric interval.
- Users' tests:

  | module | pass | fail |
  |---|---|---|
  | workbooks | 26 | 0 |
  | inquiry | 175 | 0 |
  | hypotheses | 30 | 0 |
  | strength | 143 | 0 |
  | answers | 43 | 0 |
  | reevaluation | 141 | 0 |
  | case-authoring | 151 | 0 |
  | conformance | 76 | 0 |
  | consequences | 41 | 0 |
  | affordances | 207 | 1 (a) |
  | op-declarations | 90 | 3 (a; two inherited) |
  | plane | 130 | 0 |
  | `system/migrate-released` | 1 | 0 |

  No layer tests are named in the manifest.
- `checks/format.mjs`: 135 modules, 0 failures.
- `checks/architecture.mjs calculations`: 15 product files, 63 relative imports, 0 failures.
- `checks/coverage.mjs calculations`: 40 of 40 live ids named, 0 failures.
- `checks/ownership.mjs calculations tranche/T36`: 0 failures.
- `tranche/T36` @ bf37b4ce24 merged in (B2), then the module suite re-run: 55/0.

**P6:** `bio-plane/src/calculations/` holds 3,391 lines, under about 4,000.

Size (session_01JLKQ4KM6RQvEVRSy8fPJcz): test runs 6, module lines 3391

## J2 · REPORT

Other modules, from T36-19:
(a) calculations' map gains `spotcheckvisit` and `spotcheck`. This turns affordances `t33.test.mjs:144` (R40/R12: a new module's map holds exactly its graded ops) red. It also adds "calculations: spotcheckvisit has no spec" to op-declarations `t33.test.mjs:192`, which is already red 17. Both clear when T36-35 declares the two ops (with op-grades and control-plane). op-declarations' `t34:135` (red 13) and `t35:196` fail on the base too.
(b) The generated plane bundle `bio-plane/dist/bio-plane.bundled.mjs` is stale (calculations' source changed), for layer close.
