# How BIO is built — the process design

**Status** · PROPOSED 2026-09-25 by BOB #36 at Bob's direction, awaiting his approval. When approved, it OUTRANKS every process rule in `CLAUDE.md`, the kickoffs, `VERIFICATION.md`, `WORK-PIPELINE.md` and `ORCHESTRATION.md`. A rule there that serves no principle here is retired to `docs/archive/`, not kept. Written after the parked overnight run of 2026-09-24/25. Its measurements are in `BOB-NEXT.md` §0 on `coord`: 88% of the lines landed in three days were not product code, 43% were tests, and the plan grew from about 100 rows to 225 by filing work about itself.

## 1. What the process is for

The process exists to put **working product behaviour on `main`**, in the order Bob sets. Nothing else is output. A row, a rule, a test, a measurement or a report has value only as far as it gets product behaviour merged sooner or keeps it correct. **Process work is overhead, and it is justified only when it measurably unblocks product, and then it is time-boxed.**

## 2. The order of work: product first, bottom-up

The product is built in layers, each resting on the one below: **the record** (store, schema, checks) → **capture and content** (intake, extraction) → **meaning** (entities, connections) → **inquiry and case** → **publication** → **member surfaces**. The rules:
- Work on the lowest layer that is not yet **confirmed**. A layer is confirmed when its behaviour contract is demonstrated end to end through its public ops, and nothing known against it is open.
- A defect in a confirmed layer is fixed before any work above it continues.
- Within a layer, product behaviour comes before process. Process work waits unless it blocks that layer's product work today.

## 3. The unit of work is a module job

- A **module** is one file, or one named region of a file too large to reason about whole (for example `store.mjs`).
- Each module has **one job list**: its planned changes and every known defect in it.
- **One worker takes a module's whole list in one job**, on one branch, with one test run and one merge. Findings are lines on a module's list, not rows of their own.
- The plan is the ordered list of **module jobs**, not of findings.

## 4. Fix it, list it, or drop it

When anyone finds a problem:
1. **In the module being worked, fix it now**, in the same job and the same commit series. No row, no ceremony.
2. **In another module, and it affects the product** (a member or stranger sees something wrong, data is lost or false, or a security or disclosure fence fails): add one line to that module's job list.
3. **Anything else** (a weak test, a tooling quirk, a cosmetic gap, "a check could be stronger"): **do not file it.** It may appear in the job's report. Nobody is obliged to act on it.

## 5. Done means merged and demonstrated

- A job is **done** when its behaviour is demonstrated through the public op or page, the **full suite passes once**, and it is **merged to `main`**. Unmerged work is not done, and nobody reports it as done.
- **Merge continuously.** Each job rebases on `main`, runs the suite, and merges as soon as it passes. There are no batches that grow while they wait.
- **Work-in-progress limit:** at most **3 unmerged jobs** in the estate. At the limit, nobody starts new work; they help merge.
- **Stall rule:** no merge for 2 hours means stop and fix the blockage. It never means start more work.

## 6. Tests check behaviour, not code

- Tests assert **what an op or page does** at its public boundary. They never assert the text or shape of the source. Controls anchored on source text are retired.
- While working, run the **targeted tests** for the module. Run the **full suite once**, before merge.
- A test that fails for a reason other than the product is fixed within the job that met it, under §4.1. It never becomes a row.
- Speeding up the suite is process work (§1). It is done only when test time is measurably the bottleneck on product merges.

## 7. People and sessions

- **Few workers, 2 to 4, on modules that do not overlap.** Ownership, not after-the-fact merging, prevents conflicts.
- One **integrator** keeps `main` green and merges jobs in order. One **planner** keeps the job list ordered under §2. **BOB** carries design questions to Bob, each with a recommendation.
- **A ruling is made once**, recorded in its home design document, and not reopened without new evidence named in writing. A reversal states that evidence.

## 8. Budget

- Each lane has a **daily token budget**. The estate runs unattended only with an explicit budget and a stop condition set by Bob.
- The one health metric is **product behaviour merged per token**. If it falls for a day, the estate stops and the cause is found. It does not grow.

## 9. Governing the rules

- `CLAUDE.md` holds only rules derived from this document, each citing the section it serves.
- A new rule must name the principle here that it serves, and the product failure it prevents. A rule that exists only because of an incident goes to the archive with the incident, not into the file every session loads.
- This document changes only by Bob's approval.

## 10. Moving to this process from today's state

1. Land the parked batch30 once, as is.
2. Sort the 225 open rows into **module job lists**. Keep the product-affecting ones. Close the others under §4.3 with one line each: "dropped under PROCESS-DESIGN §4.3".
3. Order the module jobs bottom-up under §2. Run at most 3 at a time, and merge each as it passes.
4. Retire source-anchored controls as their modules' jobs come up.
