# Build manifest

**Status** · Written by BOB #38, 2026-09-26 (TRANSITION.md T8). The one place that says where the product's build state, requirements canon and tests live (PROCESS-MECHANICS §1). The process itself is defined in `believeinoakland/civicos-process`.

## Where things are

| what | where |
| --- | --- |
| the process: principles, mechanics, role instructions, checks, the mail tool | `believeinoakland/civicos-process` (attach it to the session) |
| the requirements canon (mission, product requirements, construct designs) | listed in `requirements/README.md`; the files are under `docs/architecture/` and `docs/development/` |
| the layers, with their contracts and rulings | `build/layers.md` (rendered: `build/layers-view.html`) |
| the modules in their total order, with paths, tests and uses | `build/modules.json` |
| each module's requirements, and the conventions they follow | `build/requirements/<module>.md`, `build/requirements/README.md` |
| the running tranche's plan, the next one, the finished ones | `build/plan/current.md`, `build/plan/next.md`, `build/plan/archive/T<n>.md` |
| what each coming extraction moves out of a legacy module (P18) | `build/extraction/<module>.md` |
| one record per module job | `build/jobs/T<n>/<module>.md` |
| the capability ladders: what each construct can do at each rung L0–L5, every need found, and what each later rung takes (read before planning a stage that adds capability, or when a member's situation shows a gap) | `docs/architecture/BIO_Capability_Ladders_v0_1.md` (canon); the study's full evidence on branch `study/constructs`, commit `892fca16c4` (never deleted, K1433) |
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
| `pdf-worker/dist/pdf-worker.bundled.mjs`, `.bundle.json` | `pdf-worker` | `pdf-worker/`: `npm run build` | `pdf-worker`, and `pdf-reader`, `subresources`, `runtime-limits` files |
| `ocr-worker/dist/ocr-worker.bundled.mjs`, `.bundle.json` | `ocr-worker` | `ocr-worker/`: `npm run build` (re-renders `src/tesslib.mjs` when `tesseract-wasm` is installed) | `ocr-worker`, `pdf-pixels`, `image-codecs`, plane `pdfstructure` (and `subresources`, `cpu`) |
| `agent-worker/dist/agent-worker.bundled.mjs`, `.bundle.json` | `agent-worker` | `agent-worker/`: `npm run build` | `agent-worker`, the plane's `bio-plane/src/tokens.mjs` (runtime-limits) and `run-rules` (with observation-log's `checks.mjs` and `vocabulary.mjs` through it); no catalogue, skills or ai-runs input since T18 layer 6 (R48 reads the rendered pack from `op=affordances`; K683) |
| `newgroup/dist/newgroup.bundled.mjs` | `installer` | `newgroup/`: `npm run build` | `installer`, and `signatures` (`sshsig.mjs`) and `record-grammar` (`document.mjs`; found at T24 L1, K1182) |
| `bio-plane/src/case-checker/program.mjs` (the standalone checker, with its own SHA-256) | `case-checker` | repository root: `node bio-plane/src/case-checker/build-program.mjs` | `case-checker` and the modules it uses (record-grammar, signatures, content, strength, case-grammar), through `bundler` (K1315; verified byte-identical by case-checker's own test) |

**Verify, after regenerating:** `node --test bio-plane/test/system/fleetbundles.test.mjs` from the repository root (`verifyStatic` and `verifyFresh` over every member: input hashes, byte identity, externals). Also `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs` for the installer's bundle. Each must print `0 fail` with no `SKIP`; a `SKIP` means a member's `node_modules` is missing (`npm ci` there first). Baseline on `tranche/T1` @ BOB #40's takeover: 96 pass, 0 fail, no skip.

## Parallel work: the UX design stream (Bob, 2026-10-01; K945)

Bob's UX design work runs under his **primary account**, outside this process and its sessions (today on branch `claude/gallant-brown-zg0wc1`, session `session_01EhPoUTrVCgAqw2ktRyKjCU`). It writes `docs/development/ux-substrate/`, mints **DEC** ids (DEC-96 onward) for Bob's UX rulings, and amends canon documents under `docs/architecture/`. Every record this process writes (rulings, plans, job records, handoffs, reports to Bob) recognises it:
- Its DEC rulings are Bob's, made there; this process never mints a DEC id, cites them as that stream's, and folds a DEC into module requirements only once it is on `main` (or Bob names it), as a requirement change with its DEC cited.
- Its files are its own: no session of this process edits, reverts or re-words `docs/development/ux-substrate/` or that stream's canon amendments, and a merge conflict with them is resolved by keeping its text.
- Entries left out as "Bob's: UX" (K633; N470 and the legacy-ui shares in `plan/next.md`) wait on that stream's outcome, not on a question from this process.
- `main` can move while a tranche runs when that stream lands: a tranche's close then merges `main` into the tranche branch (never a rebase or force) and runs the checks before the fast-forward.
- A report to Bob says what this process did; it never presents that stream's decisions as this process's work.

## Starting a session

- **ROOT** (mechanics §2, K156): started by Bob, the parent of every BOB; reads `roles/ROOT.md`. ROOT #1, `session_0183DmvWFhkpLgr7EBFwPZMr` (started by Bob 2026-09-27 ~14:17 UTC), archived 2026-09-30 ~23:22 by BOB #77 on Bob's direction (past 300k tokens; K693). **ROOT #2**, `session_015QfrQQAdENFCG68uwrnxni` (started by Bob 2026-09-30 ~23:27 UTC), recorded by BOB #78 at takeover. **ROOT #3**, `session_01CCdj4Cyw8SixkZAnTPSXVf` (started by Bob on his secondary account 2026-10-01 ~03:42 UTC), recorded by BOB #80 at takeover (K742). ROOT #3 retired and archived 2026-10-02 on Bob's direction (K1259). **ROOT #4**, `session_01Ri7bXUDk5X4uwJa75gnbHM` (started by Bob on his secondary account 2026-10-02 ~22:13 UTC), recorded by BOB #103 at takeover (K1260). ROOT #2 and BOB #79 (`session_01DP5ySzhL1NUqbmUK7nxUNH`) belong to the first account and cannot be reached from this one: BOB #79 was not archived by its successor and has no `BOB-final` row (K742).
- **BOB:** read `roles/BOB.md` in the process repository, then this file, then the latest handoff (TRANSITION.md §6 until the first tranche closes).
- **A module job:** read `roles/JOB.md` in the process repository; BOB's first message names the module and the tranche.
