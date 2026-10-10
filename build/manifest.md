# Build manifest

**Status** · The one place that says where the product's build state, requirements canon and tests live (PROCESS-MECHANICS §1). The process itself is defined in `believeinoakland/civicos-process`.

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
| what Anthropic's plans and terms permit or forbid: verbatim quotes, each with its page, date read and the plan it governs (ids `AT-n`), the questions the pages leave open, and Bob's own choices; every other statement cites it (K1763) | `build/terms/anthropic.md` |
| the rulings in force, read whole at takeover | `build/rulings-active.md` |
| every ruling, one line each (searched on need, never read whole) | `build/rulings.md` |
| tokens processed per session | `build/metrics/T<n>.csv` (transition sessions under `T0`) |
| the latest handoff (replaced whole at each handoff) | `build/handoff.md` |
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
| `agent-runner/dist/agent-runner.bundled.mjs`, `.bundle.json` | `agent-runner` | `agent-runner/`: `npm run build` (bundler's `writeMember`; `@cloudflare/containers` 0.3.7 inlined as a vendored input; K1799) | `agent-runner`, through `bundler` |
| `agent-worker/dist/agent-worker.bundled.mjs`, `.bundle.json` | `agent-worker` | `agent-worker/`: `npm run build` | `agent-worker`, the plane's `bio-plane/src/tokens.mjs` (runtime-limits) and `run-rules` (with observation-log's `checks.mjs` and `vocabulary.mjs` through it, and record-grammar's `ids.mjs` through those since T33-30; K1598); no catalogue, skills or ai-runs input since T18 layer 6 (R48 reads the rendered pack from `op=agentpack` since T36-24, K2135; K683) |
| `newgroup/dist/newgroup.bundled.mjs` | `installer` | `newgroup/`: `npm run build` | `installer`, and `signatures` (`sshsig.mjs`) and `record-grammar` (`document.mjs`; found at T24 L1, K1182) |
| `bio-plane/src/case-checker/program.mjs` (the standalone checker, with its own SHA-256) | `case-checker` | repository root: `node bio-plane/src/case-checker/build-program.mjs` | `case-checker` and the modules it uses (record-grammar, signatures, content, strength, case-grammar), through `bundler` (K1315; verified byte-identical by case-checker's own test) |
| `court-citations/court-data.mjs` (reporters-db and courts-db, translated) | `court-citations` | repository root: `node court-citations/build.mjs` (check: `--check`) | the vendored, pinned packages under `court-citations/vendor/` (K1518) |
| `sheet-worker/dist/sheet-worker.bundled.mjs`, `.bundle.json` | `sheet-worker` | `sheet-worker/`: `npm run build` (the vendored engine `assets/sheet-engine.wasm` is rebuilt only by `npm run build:engine`, which needs rustup's `wasm32-unknown-unknown` target and `wasm-bindgen-cli` 0.2.126; K1531) | `sheet-worker`, and `runtime-limits`' `cpu.mjs` |

**Order (K1540):** regenerate `program.mjs` and `court-data.mjs` first, then the bundles with `node bio-plane/scripts/bundles.mjs` from the repository root (it rebuilds every stale bundle; the plane bundles `program.mjs`), then `newgroup`.

**Verify, after regenerating:** `node --test bio-plane/test/system/fleetbundles.test.mjs` from the repository root (`verifyStatic` and `verifyFresh` over every member: input hashes, byte identity, externals). Also `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs` for the installer's bundle. Each must print `0 fail` with no `SKIP`; a `SKIP` means a member's `node_modules` is missing (`npm ci` there first). Baseline on `tranche/T1` @ BOB #40's takeover: 96 pass, 0 fail, no skip.

## Parallel work: the UX design stream (Bob, 2026-10-01; K945)

Bob's UX design work runs under his **primary account**, outside this process and its sessions (today on branch `claude/gallant-brown-zg0wc1`, session `session_01EhPoUTrVCgAqw2ktRyKjCU`). It writes `docs/development/ux-substrate/`, mints **DEC** ids (DEC-96 onward) for Bob's UX rulings, and amends canon documents under `docs/architecture/`. Every record this process writes (rulings, plans, job records, handoffs, reports to Bob) recognises it:
- Its DEC rulings are Bob's, made there; this process never mints a DEC id, cites them as that stream's, and folds a DEC into module requirements only once it is on `main` (or Bob names it), as a requirement change with its DEC cited.
- Its files are its own: no session of this process edits, reverts or re-words `docs/development/ux-substrate/` or that stream's canon amendments, and a merge conflict with them is resolved by keeping its text.
- Entries left out as "Bob's: UX" (K633; N470 and the legacy-ui shares in `plan/next.md`) wait on that stream's outcome, not on a question from this process.
- `main` can move while a tranche runs when that stream lands: a tranche's close then merges `main` into the tranche branch (never a rebase or force) and runs the checks before the fast-forward.
- A report to Bob says what this process did; it never presents that stream's decisions as this process's work.

## Parallel work: the investigation design lane (Bob, 2026-10-07; K2076)

Bob's design of the investigation engine and the project as an investigation (K1627, K2064, K2075) runs in its own session, **INVESTIGATION-DESIGN** (#2: `session_01WzvEVTg39Jijv4CesGz4Dc`, started by BOB #145, K2398; #1 `session_01MoJa8LUVd6PRJDtgoSdRvj` archived), on branch `design/investigation`, writing only `docs/development/investigation-design/`. It works with Bob directly and records his decisions as D-numbers (the study's D1–D24, new ones from D25), never K or DEC. Its `HANDOFF.md` (entries `H<n>`) is read by BOB at takeover and at every backstop check; BOB folds each hand-off into requirements (N748) and answers with the K that folds it. Its screens are owed to the UX design stream. A successor (`#n+1`) is started by the BOB of the day when the lane asks.

## Parallel work: the actions design lane (Bob, 2026-10-09; K2433)

Bob's research and design of actions (requirements, current capabilities, capabilities needed, design and use cases; N817, his D43) runs in its own session, **ACTIONS-DESIGN** (#1: `session_01VDxYUZBV7s4gVx8xWwmCVY`, started by BOB #146), on branch `design/actions`, writing only `docs/development/actions-design/`. It works as the investigation lane does: Bob's decisions are its own D-numbers ("Actions D<n>"), never K or DEC; its `HANDOFF.md` (entries `H<n>`) is read by BOB at takeover and every backstop check and folded into requirements with a K; its screens are owed to the UX design stream. A successor is started by the BOB of the day when the lane asks.

## Starting a session

- **ROOT** (mechanics §2, K156): started by Bob, the parent of every BOB; reads `roles/ROOT.md`. Current, on Bob's **primary** account: **ROOT #5**, `session_0187SrKsqhqzSTqwDk2hzcXy` (started by Bob 2026-10-05, resumed by him for the account switch 2026-10-10; K2511); its context is about 250k tokens at resumption, so it is replaced (by Bob) at 300k. On the secondary account: ROOT #6, `session_01FXbdTJZyPp3Bhcv7pfVSR1` (2026-10-07; K2022), unreachable from the primary. Earlier ROOTs are archived (rulings K693–K2022).
- **BOB:** read `roles/BOB.md` in the process repository, then this file, then `build/rulings-active.md`, then the latest handoff, `build/handoff.md`.
- **A module job:** read `roles/JOB.md` in the process repository; BOB's first message names the module and the tranche.
