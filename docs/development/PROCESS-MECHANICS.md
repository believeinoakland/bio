# The process mechanics

**Status** · PROPOSED 2026-09-25 by BOB #36, awaiting Bob's approval. This document describes HOW the approved principles (`PROCESS-DESIGN.md`, P1–P16) are carried out. Each mechanism cites the principle it serves (P16). Where it and the principles disagree, the principles win. It belongs in the process repository, beside the principles (P2).

## 1. Where things live (P2)

**The process repository** holds the principles, these mechanics, the role instructions (§2), and the four checks (§7). It is product-independent.

**The build state** is one subtree of the product repository, `build/`. Only process roles write there, and a module job writes only its own job record.

| path | holds | written by |
| --- | --- | --- |
| `build/layers.md` | the layers, in order, each with its contract: what the layer as a whole guarantees, and where its layer tests live | BOB with Bob |
| `build/modules.json` | the modules in their **total order**; per module: `id`, `layer`, `paths` (the files it owns), `tests` (its test files), `uses` (earlier module ids) | BOB with Bob |
| `build/requirements/<module>.md` | the module's requirements (§3) | BOB with Bob |
| `build/plan/current.md` | the running tranche's plan | BOB |
| `build/plan/next.md` | the next tranche's plan; everything new lands here | BOB |
| `build/plan/archive/T<n>.md` | each finished tranche's plan, with its outcome and usage | BOB |
| `build/jobs/T<n>/<module>.md` | one record per module job (§5, step 9) | the job |
| `build/rulings.md` | every ruling, one entry each (§8) | BOB |
| `build/metrics/T<n>.csv` | tokens processed per session (§9) | each session, at its end |

A file is owned by exactly one module, so `paths` never overlap. Product code outside every module's `paths` fails the architecture check (§7).

## 2. Roles (P4, P5, P9, P13)

- **Bob** approves the architecture, the requirements, each tranche's opening, and anything the principles reserve to him.
- **BOB** works with Bob on the architecture and the requirements. BOB opens and closes tranches, starts module jobs, routes flaws, improvements and interface changes, and records rulings. **BOB runs as short sessions, one per planning step** (P13). It carries no state of its own; its state is the build state.
- **A module job** is one short session that changes one module and ends (§5). It is the only role that changes product code (P7).

There are no other roles. Integration is each job's own final step (§5, step 8).

## 3. Requirements format (P5, P6, P7, P15)

Each `build/requirements/<module>.md` has five parts:
1. **Purpose.** One or two sentences.
2. **Provides.** Each service, with its interface (name, inputs, outputs, errors) and its behaviour. Each statement carries a requirement id, `R1`, `R2`, and so on, **stable forever**. A retired id is marked retired, never reused.
3. **Uses.** Each service used, named `<module>.<service>`, and only from modules earlier in the order.
4. **Invariants.** Each with its own `R` id.
5. **Satisfies.** The product requirements and design sections it serves, cited by section.

Requirements may add implementation notes marked **Suggestion**, which bind nothing. A requirements file is kept small enough that the module, its requirements and its used modules' requirements fit in one reading (P6).

## 4. The tranche cycle (P10, P12, P14)

**Open (BOB with Bob).**
1. BOB proposes `next.md` as tranche `T<n>`: its entries grouped by module, and the modules listed in total order.
2. Bob approves it, and notes his weekly usage meter.
3. `next.md` becomes `current.md`, and a new, empty `next.md` is created.

**Run.** BOB starts the jobs **one at a time, in module order**, for every module that has entries (P10). Only modules with entries run. After each job reports, BOB routes what it reported (§6), then starts the next job. *Running independent modules in parallel is deferred until the metrics (§9) show it is worth its coordination cost.*

**Close (BOB).**
1. When every job is merged, `current.md` moves to `archive/T<n>.md`, with each entry's outcome (done or deferred) and the tranche's measured usage.
2. Bob notes his weekly meter again.
3. BOB reports the tranche to Bob in plain words.

## 5. The module job (P6, P7, P8, P11, P12, P13)

1. **Start** from `main`, on branch `job/T<n>/<module>`.
2. **Read in full**, never scanned (P5, P6):
   - the module's requirements;
   - the requirements of every module it uses;
   - its layer's contract;
   - its code and its tests;
   - its entries in `current.md`.
3. **Ambiguity.** If a requirement is ambiguous, report it to BOB and wait. BOB clarifies the text with Bob if needed (P7), then the job continues against the clarified text.
4. **Change the module** to apply every entry. Deal with every flaw or improvement found in the module within the job whenever possible. Defer one to `next.md` through BOB only when the job must (P8).
5. **Test** (P7, P11):
   - Every requirement id must be named by at least one test, and the coverage check (§7) must pass.
   - Run the module's tests, then its layer's tests.
   - If the job changed a provided service, first get BOB's requirements change (§6), then run the tests of every module that uses it.
6. **Check** (§7): architecture, coverage and ownership.
7. **Rebase** on `main`. If a module it uses has changed since the job started, re-run step 5.
8. **Merge** to `main` (P12).
9. **Record** `build/jobs/T<n>/<module>.md`. It lists: the entries applied; anything deferred, with the reason; flaws or improvements reported in other modules; the tests run and their results; and the job's token counts (§9).
10. **Report** to BOB in one message, then **end the session** (P13).

A job may write only its module's `paths` and `tests`, plus its job record. **Stopping rule:** if its tests cannot pass after three honest attempts, or it meets a blocker outside its module, it stops. It records why, reports to BOB, and ends. Its entries stay open for BOB and Bob to decide.

## 6. Routing through BOB (P5, P9, P10)

- **A flaw or improvement in another module.** BOB confirms it. If that module's job is running, BOB forwards it; otherwise BOB adds it to `next.md`.
- **A change to a provided service.** This is always a requirements change, so it goes to BOB with Bob. BOB edits the provider's requirements, then adds an entry for every module that uses the service. The entry goes into `current.md` if that user comes later in the order in this tranche, and into `next.md` otherwise.
- **An ambiguity.** BOB clarifies the requirement text, with Bob where the meaning is his. It is recorded as a ruling if it decides anything (§8).
- **A flaw in the requirements themselves** goes to Bob.

## 7. The four checks (P4, P7, P16)

These are small tools in the process repository. They are the only process tooling.
1. **Architecture:** every product file is in exactly one module's `paths`, and every import goes to the module itself or to a module earlier in the order that is declared in `uses`.
2. **Coverage:** every live requirement id of the module is named by at least one of its tests.
3. **Ownership:** a job's diff touches only its module's `paths` and `tests` and its own job record.
4. **Format:** `modules.json`, the requirements files and the plan entries parse, and every id they reference exists.

A new check is added only by BOB with Bob, and must cite the principle it serves.

## 8. Rulings (P15)

One entry per ruling in `build/rulings.md`, in this form:

`K<n> · <date> · <module or layer> · <the ruling, in one or two sentences> · <why, in one sentence>`

A ruling that changes requirements is folded into those requirements in the same act. A ruling is changed only by a new entry that names the evidence and the one it replaces.

## 9. Metrics (P14)

At its end, every session appends one row to `build/metrics/T<n>.csv`:

`session id · role · module · cache-read tokens · cache-write tokens · input tokens · output tokens · turns · test runs · module lines`

Bob's weekly meter is noted at each tranche's open and close. **No budget bounds apply yet.** After a few tranches BOB reports the empirical model: tokens per job against module size, entries and test runs, and tokens against the movement of the weekly meter. Bob then sets bounds.

## 10. Release (P11)

A release runs the full regression, then follows the distribution process, which is a separate document. A full regression also runs whenever Bob asks.

## 11. Starting BIO on this process

1. **Build state.** BOB, with Bob, drafts `layers.md`, `modules.json` and the requirements for BIO's target modules. They are drawn from the design corpus and read in full.
2. **The monoliths.** `store.mjs`, `index.mjs` and `app.html` are each registered as a temporary **legacy module**. A tranche entry to extract a target module from a legacy module is applied by that target module's job, which is the one allowed exception to ownership: it may remove the moved code from the legacy file. Extraction runs bottom-up. A legacy module is retired when it is empty.
3. **Tests.** Each extracted module's job writes its requirement-named tests at its interface. Source-anchored tests die with the legacy modules.
4. **The old plan.** BOB rewrites each of the 225 open rows that affects the product as an entry against a target module, and drops the rest.
5. **Batch30 is Bob's call:** land it once (one full test run) before the extraction starts, or leave it in the snapshot branch and rebuild what matters through the new process.
