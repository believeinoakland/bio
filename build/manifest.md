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
| what each coming extraction moves out of a legacy module (P18) | `build/extraction/<module>.md` |
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

## Generated artifacts (PROCESS-MECHANICS §14)

Committed files built by `bundler` (`bio-plane/scripts/fleet-bundle.mjs`, `writeMember`) from several modules' source. No job edits one by hand or writes another module's; a job that stales one reports it. At each layer close BOB regenerates every one, verifies, and commits the result on the tranche branch.

| artifact, with its manifest | owned by | regenerate (run in that directory) | its inputs come from |
| --- | --- | --- | --- |
| `bio-plane/dist/bio-plane.bundled.mjs`, `.bundle.json` | `not_product` | `bio-plane/`: `npm run build` (renders `src/signpage.mjs` first) | the plane's source |
| `pdf-worker/dist/pdf-worker.bundled.mjs`, `.bundle.json` | `pdf-worker` | `pdf-worker/`: `npm run build` | `pdf-worker`, and plane files (`pdfstructure`, `subresources`, `cpu`) |
| `ocr-worker/dist/ocr-worker.bundled.mjs`, `.bundle.json` | `ocr-worker` | `ocr-worker/`: `npm run build` (re-renders `src/tesslib.mjs` when `tesseract-wasm` is installed) | `ocr-worker`, `pdf-worker/src/pagepixels.mjs`, plane `pdfstructure` |
| `agent-worker/dist/agent-worker.bundled.mjs`, `.bundle.json` | `agent-worker` | `agent-worker/`: `npm run build` | `agent-worker` only |

**Verify, after regenerating:** `node --test bio-plane/test/fleetbundles.test.mjs` from the repository root (`verifyStatic` and `verifyFresh` over every member: input hashes, byte identity, externals). It must print `0 fail` with no `SKIP`; a `SKIP` means a member's `node_modules` is missing (`npm ci` there first). Baseline on `tranche/T1` @ BOB #40's takeover: 96 pass, 0 fail, no skip.

## Starting a session

- **BOB:** read `roles/BOB.md` in the process repository, then this file, then the latest handoff (TRANSITION.md §6 until the first tranche closes).
- **A module job:** read `roles/JOB.md` in the process repository; BOB's first message names the module and the tranche.
