# The transition to the new process

**Status** · APPROVED BY BOB 2026-09-25 as the first priority: document the new process and this plan fully, and record progress and challenges as they happen, so the work can resume in any later session, on either account, when tokens allow. Written by BOB #36. The process it serves is `PROCESS-DESIGN.md` (principles, approved) and `PROCESS-MECHANICS.md` (approved). **The rule for every step: never start a step, or a chunk of one, that cannot be finished and committed in the tokens left. Record progress in §4 after every step or chunk.**

## 1. Where everything is

| what | where |
| --- | --- |
| the restore point: `main` at 95fe7bc7, plus every branch tip of 2026-09-25 ~14:45Z, including batch30 and all unmerged worker branches | branch `snapshot/pre-refactor-2026-09-25` @ 5b9c2643 |
| the principles, the mechanics, this plan, and the frozen old plan | branch `land/bob/process-design` (not on `main`; see §5, C2) |
| the old plan, frozen as it stood when the old process stopped | `docs/development/transition/old-plan/QUEUE-2026-09-25.txt` and `BACKLOG-2026-09-25.txt` (coord @ 85f3a9f7) |
| the index of its 216 open rows, the working sheet for step T5 | `docs/development/transition/old-plan/index.csv` |

**To resume:** read `PROCESS-DESIGN.md`, `PROCESS-MECHANICS.md` and this file, each whole. Check out `land/bob/process-design`. Continue at the first step in §3 that is not done. Do not follow the old process's `CLAUDE.md`, kickoffs, lanes or `coord` ledgers; see §5, C1.

## 2. The old plan's open rows

`index.csv` has one row per open item of the old plan, with these columns:

| column | holds |
| --- | --- |
| `id`, `old_state`, `milestone`, `old_owner`, `headline` | the item as the old plan held it; the full text is in the frozen `.txt` copies |
| `first_pass_class` | an automatic guess from the files the row names: `product` 66, `machinery` (tests and tooling only) 73, `both` 14, `unclear` 63. **A guess, never a verdict.** |
| `built_branch`, `branch_tip` | where built but unmerged work for the row sits (112 rows); every such tip is also reachable from the snapshot branch |
| `verdict`, `target_module_or_reason` | empty until step T5 fills them |

## 3. The steps

Each step says what it produces, what "done" means, and roughly how much work it is. Status is kept in §4, not here.

**T0 · Snapshot.** The restore point in §1. *Done.*

**T1 · Principles and mechanics.** Written with Bob and approved. *Done.*

**T2 · This plan and the frozen inputs.** This file, the frozen old plan, and `index.csv`. *Done when committed and pushed.*

**T3 · The requirements canon.** Inventory the design corpus (`docs/architecture/`, plus the design documents under `docs/development/` that the corpus standard governs). Decide with Bob which documents are canon, and list them in `requirements/README.md` with one line each. Moving or copying the files can wait until T8. *One BOB session. Done when Bob approves the list.*

**T4 · The architecture draft.** Draft `build/layers.md` and `build/modules.json`: the target layers and modules in their total order, plus the three **legacy modules** (`store.mjs`, `index.mjs`, `app.html`). Sources are the canon's construct map (`BIO_System_Design.md` §3–§4) and the actual structure of the code (which functions of `store.mjs` serve which construct). *One or two BOB sessions with Bob. Done when Bob approves the layers and the module list.*

**T5 · The old plan's triage.** Every one of the 216 rows gets a verdict in `index.csv`:
- **carry:** it affects the product and is still true. `target_module_or_reason` names the target module, and the row becomes a plan entry against that module in T8.
- **fold:** it states something the module's requirements will already require. It becomes a requirement or a test, not an entry.
- **drop:** it is about the old process's tests or tooling, is superseded, or no longer holds. `target_module_or_reason` states why in a few words.

Method: work in **chunks of about 25 rows**, reading each row's full text in the frozen copy. Where `built_branch` is set, note whether the built work looks worth taking at extraction. Commit `index.csv` after each chunk, and log the chunk in §4. Needs T4's module list for carry verdicts. A chunk can record `carry (module TBD)` if T4 is not done. *About 9 chunks.*

**T6 · The first layer's requirements.** Write `build/requirements/<module>.md` (public and private parts, P5 and mechanics §3) for every module of the lowest layer, folding in the T5 rows marked fold for those modules. *BOB with Bob. Done when Bob approves them.*

**T7 · Process tooling and home.** Bob creates the process repository (a GitHub act only Bob can take). Build the four checks (mechanics §8) and the metrics recording (mechanics §10) there. **Retire the old process's guards** (§5, C3) in the same step. *Done when the four checks run on the product repo.*

**T8 · Build state and the first tranche.** Create `build/` on `main`: the manifest, layers, modules, the first layer's requirements, the rulings file, and `plan/current.md` for tranche T1. T1 holds the extraction of the first layer's modules plus the carried T5 entries for them. **Replace `CLAUDE.md`** with a short pointer to the new process (§5, C1). Land the process documents on `main`. *Done when `main` carries all of it.*

**T9 · Tranche T1, the certification run (P3).** Run T1 under the mechanics. It proves the process on a small tranche and starts the metrics (P14). *Bob approves its opening.*

## 4. Progress log

One line per step or chunk, newest last: `date · step · what was done · where it is · what is next`.

- 2026-09-25 · T0 · snapshot branch created (tags refused by the cloud proxy, HTTP 403) · `snapshot/pre-refactor-2026-09-25` @ 5b9c2643 · —
- 2026-09-25 · T1 · principles P1–P16 and mechanics approved by Bob · `land/bob/process-design` · —
- 2026-09-25 · T2 · this plan, frozen old plan, index of 216 rows with first-pass classes · `land/bob/process-design` · next: T3
- 2026-09-25 · T3 · canon list drafted by BOB #37: 38 canon documents plus the DEC rulings (4 mission, 12 level-1, 22 level-2; some by section), 10 reference, 5 retired · `requirements/README.md` · next: Bob approves the list

## 5. Challenges identified

Each: what it is, and how the plan handles it.

- **C1 · The old instructions still load.** The repository's `CLAUDE.md` and kickoffs describe the old process, and every session loads `CLAUDE.md` automatically. A session that is not told otherwise will follow the old process. **Until T8,** start every session with an explicit instruction to read this file first and to ignore the old process. **At T8,** `CLAUDE.md` is replaced.
- **C2 · The new documents are not on `main`.** The old train mechanism is retired, so nothing lands them now. They stay on `land/bob/process-design` until T8, which lands them. Start every transition session on that branch.
- **C3 · The old guards still run on push.** The push hook (`bio-pushguard`: corpus check, construct status, merge markers) enforces the old process. It already demanded that the corpus standard classify the new documents. T7 retires it. Until then, satisfy it minimally and never build on it.
- **C4 · The monoliths.** `store.mjs` is 54,618 lines, `app.html` 26,489 and `index.mjs` 13,438: 75% of the product source in three files. Extraction (mechanics §12) is the core of the transition, and its cost is unknown until T9's metrics exist.
- **C5 · Source-anchored tests.** Much of the old test suite locates code by its exact text, so it breaks on any move. It will not survive extraction and is not carried forward. Each module's new requirement-named tests replace it (P7).
- **C6 · The weekly token budget.** Tokens are scarce. Every step above fits in one or two sessions and is committed as it goes. No step starts that cannot finish. Usage is measured from T9 (P14).
- **C7 · The live instance.** biosmoke7 runs release 0.79.0. Releases stay held until the new process produces one. The disclosure fixes that are built but not released (REC-196, D-706 and D-722, D-480) are rows for T5 to **carry**.
