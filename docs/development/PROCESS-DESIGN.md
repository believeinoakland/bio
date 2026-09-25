# The process principles

**Status** · PROPOSED 2026-09-25 by BOB #36, from Bob's direction in BOB's session that day, awaiting his approval. These principles REPLACE the current process wholly; nothing in the old process survives unless it is derived from them. They belong in the process's own repository once it exists (P2). Until then they sit here. The restore point before the replacement is the branch `snapshot/pre-refactor-2026-09-25` (5b9c2643): its tree is `main` @ 95fe7bc7, and its parents are every branch tip of that moment, all kept reachable. Tags could not be pushed from the cloud (HTTP 403).

**P1 · Purpose.** The process exists to put correct, working product behaviour that meets every defined requirement onto `main`. Nothing else is output. A rule, a record or a test has value only as far as it serves that.

**P2 · The process and the product are separate.** Each has its own correctness. The process is defined in its own repository. It keeps the product's **build state** in one subtree of the product repository, and only the process writes there. The build state holds the architecture (layers, modules, dependencies), the plans, and the record of jobs.

**P3 · The process is correct before it is used.** A meaningful flaw in the process stops all product work until the process is fixed and **certified**: the fix is checked against these principles, then proven on a small dry-run tranche. The process is never patched in reaction while it runs.

**P4 · The architecture is explicit and enforced.** The build state defines the layers and the modules. Each module belongs to exactly one layer. A module uses modules in lower layers, and declared peers in its own layer without cycles, and never a module in a higher layer. The declared dependencies are checked against the actual imports, and a violation fails the build.

**P5 · A module fits in one reading.** A module is sized so that one session can read, in full, its code, its requirements, its layer's contract and the contracts of the modules it uses. Requirements are read whole, never scanned.

**P6 · Requirements are traceable.** Each module lists the requirements and design sections it satisfies, by section. Its tests show each one met.

**P7 · The unit of work is the module job.** A module has at most one job at a time. A job applies every plan entry for its module. A problem found in the module during the job is fixed in that job.

**P8 · Bottom-up.** A tranche runs its jobs lowest layer first, then in dependency order within a layer. A job that changes what its module provides adds entries for the modules that depend on it; those jobs run later in the same tranche.

**P9 · Tranches are frozen.** A tranche's plan is fixed when it starts. Anything found outside the current job's module goes into the **next** plan. When a tranche is merged, its plan is archived and the next plan becomes current. Only Bob can admit an entry into a running tranche.

**P10 · Tests follow the architecture.** Each module has tests of its behaviour at its interface, never of its source text. Each layer has layer tests. A job runs its module's tests and its layer's tests, plus the tests of every dependent module when it changes what it provides. The full regression runs only at release, or when Bob asks.

**P11 · Done means merged.** A job is done when its tests pass and it is merged to `main`. A tranche is done when every one of its jobs is merged.

**P12 · Sessions are short and single-purpose.** A session does one job, or one planning step, and ends. State lives in the build state, never in a long-running context. Long-lived sessions that are woken repeatedly re-read their whole context on every wake, and that was the largest hidden cost of the old process.

**P13 · Usage is measured and bounded.** Every session is tagged with its tranche and job. Its reported cost is summed per job and per tranche. Each tranche starts with an estimate Bob approves. A job or tranche that overruns stops and reports why, before it spends more.

**P14 · A ruling is made once.** A decision is recorded once, in its home document, and it is not reopened without new evidence named in writing.

**P15 · Rules derive from principles.** Every process rule names the principle it serves. A rule is never added in reaction to an incident unless it can be derived from a principle. These principles change only with Bob's approval.
