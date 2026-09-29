# intent (T13)

**Status** · session_01NeUjSARtJrUvGsQ3fY9FRB · depth 2 · WORKING · handled B1

## Completion

**Applied** (on `tranche/T13` at 07e0b3cc7e): **N323**, as K408 words it in R12, R13, R14, R27 and the Bounds paragraph. Each bound now limits the walk itself, not only what the walk keeps (K391).
- **R12, R13 (`aspirationsFor`, `contacts`).** `#heldAspirations` reads the first 1,000 aspirations the viewer may see, in id order. Held and retired ones of every scope count toward the bound. It answers the held ones among them. A project aspiration whose project the viewer may not see is skipped and not counted (DEC-36, K391). `contacts` pairs the held ones from that same read.
- **R28's context (the Bounds paragraph).** The read is the same one under the plane's sight, bounded by `CONTEXT_MAX`, and `servesOf` takes the held group and project aspirations from it. Member and retired aspirations now count toward the bound (they did not before). `context_truncated` says when the read was cut.
- **R14 (`pursuitOf`).** It reads the first 1,000 goals held, in id order, whatever aspiration each names (`GOALS_READ_MAX`), and answers `goals_read_truncated` and `goals_read_limit`. The 200-goal answer bound and `goals_truncated` are unchanged.
- **R27, R17 (`ageDue`, `ageWake`, `ageSurfaced`).** `#ageable` is one SQL statement over record-core's `bundles` and `manifest` (its R37 read contract). It takes at most the first 1,000 questions at `surfaced` (`AGEING_READ_MAX`), those whose last entry is oldest first, then by id, and reads one more so a cut shows. Ageability is judged among those alone. `ageSurfaced` answers `limit` and `truncated`. The old walk read every inquiry and its whole image. The new one reads each question's distinct manifest authors a page at a time (64 per statement, `#machineOnly`) and stops at the first member, so the judgement stays exact however many authors a question has. `manifestOf` is gone.

**Tests** (`bio-plane/test/m/intent/bounds.test.mjs`)
- New, one test for each of BOB's interface cases, each also run at the bound exactly:
  - 1,001 retired aspirations, then held ones: `aspirationsFor` answers none held with `truncated`, and `contacts` pairs none with `truncated` (R12, R13).
  - A hidden project's aspiration is not counted: bob sees 1,000 and nothing is cut; carol sees 1,001 and the read is cut (R12, R13, DEC-36).
  - 1,001 goals under another aspiration, then one under the asked aspiration: no goal, and `goals_read_truncated` (R14).
  - 1,001 human-surfaced questions older than an ageable one: null from `ageDue` and `ageWake`, and `truncated` from `ageSurfaced`. A tie on the last entry is read by id. An ageable question older than all of them is aged (R27, R17).
  - A question with 70 machine authors and one member's entry past the first page is not ageable (R27, R17). A negative control, stopping the paging after one page, turns this test red.
- Rewritten because they pinned what N323 replaces:
  - R12's bound test: a retired aspiration now counts, so it expects 999 answered with `truncated`.
  - R28's context test: member and retired aspirations now count toward the 1,000.

**Please strike** (my work meets these marks): intent R12, R13, R14 and R27, each `*(not yet met: N323)*`; the Bounds paragraph's `*(not yet met: N323)*`; and in the Status line, "R12, R13, R14, R27 and the Bounds paragraph bound their internal walks (no cursor), not yet met".

**Check rows:** none added, moved or retired. There is nothing for promotion to stamp (N318).

**Deferred:** nothing.

**Found in other modules** (sent to BOB as a REPORT):
1. **Stale, not rebuilt (§14):** `bio-plane/dist/bio-plane.bundled.mjs`. fleetbundles names `src/intent/index.mjs`. No worker bundle takes intent.
2. **civicos-ui and affordances' lists:** no hits on the names I added or retired (`GOALS_READ_MAX`, `AGEING_READ_MAX`, `goals_read_*`, `#machineOnly`, `manifestOf`).
3. **DEC-49 guard** (`civicos-ui/check-refusal-codes.mjs`): the same 16 failures as on the parent, with every figure unchanged. No refusal site moved.
4. **Legacy `meaning-bounds`** (fails on the parent too): the only change is that `op=pursuit` now lists `goals_read_limit` and `goals_read_truncated`.
5. **As worded (K408 (1)):** `ageDue` and `ageWake` answer null for an ageable question that sits behind 1,000 older non-ageable questions at `surfaced`. It is reached once those leave `surfaced` or take a newer entry. There is no cursor.

**Tests and checks run**
- `node --test bio-plane/test/m/intent/`: tests 51, pass 51, fail 0.
- Modules using intent:
  - `scheduler` (reads `ageDue` and `ageWake`): 48 tests, 46 pass, 0 fail, 2 todo, the same as the parent.
  - `monitoring`: 52 pass, 6 todo.
  - `affordances`: 74 pass, 1 todo.
  - `queue`: 58 pass, 1 todo.
  - 0 fail in each.
- Legacy suites naming intent:
  - `bounds`, `gate-reads`, `hygiene`, `rung-ladder` and `derivation-bounds` pass.
  - `derivation-bounds`: the census stays at 206 unbounded, as on the parent, and `intent/index:#ageable:rows` is now among the graded truncation sources (71 → 72).
  - `meaning-bounds` fails on the parent too; the one difference is item 4 above.
- `node checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `node checks/architecture.mjs … intent`: 11 product files, 39 relative imports; 0 failures.
- `node checks/coverage.mjs … intent`: 28 of 28 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs … intent tranche/T13`: legacy-checks 0/0, legacy-store 0/0; 0 failures. Run before this record was written, so it counted 1 file changed.

Size (session_01NeUjSARtJrUvGsQ3fY9FRB): test runs 28, module lines 1863
