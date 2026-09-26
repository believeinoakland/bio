# Build manifest

**Status** · Written by BOB #38, 2026-09-26 (TRANSITION.md T8). The one place that says where the product's build state, requirements canon and tests live (PROCESS-MECHANICS §1). The process itself is defined in `believeinoakland/civicos-process`.

## Where things are

| what | where |
| --- | --- |
| the process: principles, mechanics, role instructions, checks, metrics recorder | `believeinoakland/civicos-process` (attach it to the session) |
| the requirements canon (mission, product requirements, construct designs) | listed in `requirements/README.md`; the files are under `docs/architecture/` and `docs/development/` |
| the layers, with their contracts and rulings | `build/layers.md` (rendered: `build/layers-view.html`) |
| the modules in their total order, with paths, tests and uses | `build/modules.json` |
| each module's requirements, and the conventions they follow | `build/requirements/<module>.md`, `build/requirements/README.md` |
| the running tranche's plan, the next one, the finished ones | `build/plan/current.md`, `build/plan/next.md`, `build/plan/archive/T<n>.md` |
| one record per module job | `build/jobs/T<n>/<module>.md` |
| every ruling, one line each | `build/rulings.md` |
| tokens processed per session | `build/metrics/T<n>.csv` (transition sessions under `T0`) |
| the transition to this process: plan, log, challenges, latest handoff | `docs/development/TRANSITION.md` |
| the old plan, frozen, and its triage | `docs/development/transition/old-plan/` |
| the restore point from before the new process | branch `snapshot/pre-refactor-2026-09-25` |

## Tests

| layer | layer tests |
| --- | --- |
| every layer | none yet; each module's tests are under its `tests` paths in `modules.json`. A layer's tests are added here when it has any (P11: kept as small as possible). |

The full regression runs only at a release or when Bob asks (P11): the GitHub workflow `regression`, started by hand.

## Starting a session

- **BOB:** read `roles/BOB.md` in the process repository, then this file, then the latest handoff (TRANSITION.md §6 until the first tranche closes).
- **A module job:** read `roles/JOB.md` in the process repository; BOB's first message names the module and the tranche.
