# Build manifest

**Status** · The one place that says where the product's build state, requirements canon and tests live (PROCESS-MECHANICS §1). The process itself is defined in `believeinoakland/civicos-process`.

## Where things are

| what | where |
| --- | --- |
| the process: principles, mechanics, role instructions, checks, the mail tool | `believeinoakland/civicos-process` (attach it to the session) |
| the requirements canon (mission, product requirements, construct designs) | listed in `requirements/README.md`; the files are under `docs/architecture/` and `docs/development/` |
| the layers, with their contracts and rulings | `build/layers.md` (rendered: `build/layers-view.html`); their split history, `build/plan/archive/layers-history.md` |
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
| `agent-worker/dist/agent-worker.bundled.mjs`, `.bundle.json` | `agent-worker` | `agent-worker/`: `npm run build` | `agent-worker` and `agent-steps` (its delegate since T51-45/65, K3850, K3894), the plane's `bio-plane/src/tokens.mjs` (runtime-limits) and `run-rules` (with observation-log's `checks.mjs` and `vocabulary.mjs` through it, and record-grammar's `ids.mjs` through those since T33-30; K1598); query-language's `bio-plane/src/query.mjs` and its import tree since R085's R97 (the meaning arms, K3504); no catalogue, skills or ai-runs input since T18 layer 6 (R48 reads the rendered pack from `op=agentpack` since T36-24, K2135; K683) |
| `bio-plane/public/newgroup/index.html` (the invitation page, R79; K4073) | `installer` | `newgroup/`: `node scripts/invite-page.mjs` (check: `--check`) | setup-words' rows (the 24 `installer.invite.*` keys) |
| `newgroup/dist/newgroup.bundled.mjs` | `installer` | `newgroup/`: `npm run build` | `installer`, `installer-steps` (`newgroup/src/steps/`, K4083), and `signatures` (`sshsig.mjs`) and `record-grammar` (`document.mjs`, which reads `conformance.*` word rows at load; found at T24 L1, K1182, K4083) |
| `bio-plane/src/case-checker/program.mjs` (the standalone checker, with its own SHA-256) | `case-checker` | repository root: `node bio-plane/src/case-checker/build-program.mjs` | `case-checker` and the modules it uses (record-grammar, signatures, content, strength, case-grammar), through `bundler` (K1315; verified byte-identical by case-checker's own test) |
| `bio-plane/src/setup-words/rows.mjs` (the interface's word list, K3366) | `setup-words` | repository root: `node bio-plane/src/setup-words/build.mjs` (check: `--check`) | the design stream's `docs/development/ux-substrate/screens/words.json` (R10), and every `t(id, en)` call in tracked product source under a module's `paths` (R15; a new file is seen only once `git add`ed); it also writes and checks `bio-plane/src/setup-words/words-unreviewed.json`, the design's review list (R16, K3932); `--pseudo` writes the never-committed `rows.pseudo.mjs` (R17) |
| `bio-plane/src/wizard-scripts/screen-registry.mjs`, `front-doors.mjs`, `civicsmith-library.mjs` (K3771) | `wizard-scripts` | repository root: `node bio-plane/src/wizard-scripts/build-data.mjs` (check: `--check`) | the design stream's `docs/development/ux-substrate/` registry, front doors and wizard library at the design commit wizard-scripts R41 names |
| `site/src/pages.mjs` (civicsmith.org's pages, K3372) | `site` | repository root: `node site/build.mjs` (check: `--check`) | `site`'s design drawing `SCR.site` at `SITE_COMMIT`, `words.json` through setup-words, `jurisdictions/profiles/` |
| `bio-plane/src/member-roster/order.mjs` (`MODULE_ORDER`'s source since CR-4, K3633, K3972, K3979) | `member-roster` | repository root: `node bio-plane/src/member-roster/order-build.mjs` (check: `--check`) | `build/modules.json` (regenerate whenever it changes) |
| `court-citations/court-data.mjs` (reporters-db and courts-db, translated) | `court-citations` | repository root: `node court-citations/build.mjs` (check: `--check`) | the vendored, pinned packages under `court-citations/vendor/` (K1518) |
| `sheet-worker/dist/sheet-worker.bundled.mjs`, `.bundle.json` | `sheet-worker` | `sheet-worker/`: `npm run build` (the vendored engine `assets/sheet-engine.wasm` is rebuilt only by `npm run build:engine`, which needs rustup's `wasm32-unknown-unknown` target and `wasm-bindgen-cli` 0.2.126; K1531) | `sheet-worker`, and `runtime-limits`' `cpu.mjs` |

**Order (K1540):** regenerate member-roster's `order.mjs` (K3633, K3979), setup-words' `rows.mjs`, then `program.mjs` (it prints the members' words through setup-words' rows, so it follows them; K4355), `court-data.mjs` and wizard-scripts' data first, then the bundles with `node bio-plane/scripts/bundles.mjs` from the repository root (it rebuilds every stale bundle; the plane bundles `program.mjs`), then `newgroup`.

**Verify, after regenerating:** `node --test bio-plane/test/system/fleetbundles.test.mjs` from the repository root (`verifyStatic` and `verifyFresh` over every member: input hashes, byte identity, externals). Also `node --test bio-plane/test/system/newgroup-bundle-fresh.test.mjs` for the installer's bundle. Each must print `0 fail` with no `SKIP`; a `SKIP` means a member's `node_modules` is missing (`npm ci` there first). Baseline on `tranche/T1` @ BOB #40's takeover: 96 pass, 0 fail, no skip.

## Parallel work: the UX design stream (Bob, 2026-10-01; K945)

Bob's UX design work runs under his **primary account**, outside this process and its sessions (today on branch `claude/gallant-brown-zg0wc1`, today UX design #40, `session_01DtBKhrSmV3NbfCcEaygkz9`, started by Bob on his primary account on #39's notice U472, K5141; #39 `session_01VWoaFstEKg7YtQS2K41x6s` archived by #40). It writes `docs/development/ux-substrate/`, mints **DEC** ids (DEC-96 onward) for Bob's UX rulings, and amends canon documents under `docs/architecture/`. Every record this process writes (rulings, plans, job records, handoffs, reports to Bob) recognises it:
- Its DEC rulings are Bob's, made there; this process never mints a DEC id, cites them as that stream's, and folds a DEC into module requirements only once it is on `main` (or Bob names it), as a requirement change with its DEC cited.
- Its files are its own: no session of this process edits, reverts or re-words `docs/development/ux-substrate/` or that stream's canon amendments, and a merge conflict with them is resolved by keeping its text.
- Entries left out as "Bob's: UX" (K633; N470 and the legacy-ui shares in `plan/next.md`) wait on that stream's outcome, not on a question from this process.
- `main` can move while a tranche runs when that stream lands: a tranche's close then merges `main` into the tranche branch (never a rebase or force) and runs the checks before the fast-forward.
- A report to Bob says what this process did; it never presents that stream's decisions as this process's work.

## Parallel work: the investigation design lane (Bob, 2026-10-07; K2076)

Bob's design of the investigation engine and the project as an investigation (K1627, K2064, K2075) runs in its own session, **INVESTIGATION-DESIGN** (#2: `session_01WzvEVTg39Jijv4CesGz4Dc`, started by BOB #145, K2398; #1 `session_01MoJa8LUVd6PRJDtgoSdRvj` archived), on branch `design/investigation`, writing only `docs/development/investigation-design/`. It works with Bob directly and records his decisions as D-numbers (the study's D1–D24, new ones from D25), never K or DEC. Its `HANDOFF.md` (entries `H<n>`) is read by BOB at takeover and at every backstop check; BOB folds each hand-off into requirements (N748) and answers with the K that folds it. Its screens are owed to the UX design stream. A successor (`#n+1`) is started by the BOB of the day when the lane asks.

## Parallel work: the AI design lane (Bob, 2026-10-17; K3717)

How the assistant is architected for several AIs chosen by team, project and member, none of them Anthropic's, is explored in its own session, **AI-DESIGN** (#1, `session_01GLY6Z5UAa6urPzovQPKCkR`, sonnet, started by BOB #204, K3718), writing only `build/plan/lane-ai-design/` on its own branch `lane/ai-design` (its `CHARTER.md` says how; BOB reads that branch's `HANDOFF.md`, K4421). It decides nothing: its options reach Bob through BOB, and his decisions are K rulings that feed N1220. BOB reads its `HANDOFF.md` (entries `A<n>`) at takeover and at every backstop check. The assistant-hosting study (ASSISTANT-HOSTING, K3538) is ended (K3718); its folder stays as input.

## Parallel work: the journeys walk (Bob, 2026-10-16; K3539)

Every feature and journey that does not need the assistant is walked in its own session, **JOURNEYS** (#3, `session_01RhkG3SUxrZ9ENpSuRHnBQt`, sonnet, started by BOB #194, K3576; #1, #2 archived), writing only `build/plan/lane-journeys/` (its `CHARTER.md`). The assistant's own testing is the assistant-hosting lane's. BOB reads its `HANDOFF.md` (entries `W<n>`) at takeover and at every backstop check, and turns each defect into a plan entry.

## Parallel work: the performance lane (Bob, 2026-10-21; K4351)

Why Civicsmith is slow for a member is measured and diagnosed in its own session, **PERFORMANCE** (#3, `session_01Vp7GZTN9bpooZud5Wd2CuC`, sonnet, started by BOB #273 on the third account, K4851; #1 `session_015HB1ABUMedpZ4X94giQAiz` started by BOB #241; #2 on another account, unreachable), writing only `build/plan/lane-performance/` (its `CHARTER.md`). It changes no code and decides nothing: each finding (`P<n>` in its `HANDOFF.md`) reaches the plan through BOB, who reads it at takeover and at every backstop check.

## Parallel work: the reading architecture (Bob, 2026-10-23; K4812; ended K4834)

The READING-ARCHITECTURE lane designed how Civicsmith reads every file type and large file; Bob confirmed its architecture (K4831: D staged, C the fallback). Its deliverables, with Stage 0's measurements (`stage0/RESULTS.md`, K4838), are under `build/plan/lane-reading-architecture/` on the tranche; `GAP.md` is T51's reading work (K4834), its Stage 1 fix round 9 (K4837). The lane is ended; its sessions are archived.

## Starting a session

- **ROOT** (mechanics §2, K156): started by Bob, the parent of every BOB; reads `roles/ROOT.md`. Current, on Bob's **primary** account: **ROOT #7**, `session_01NBNGB2ziVqiZg4ewLgRSWm` (started by Bob 2026-10-17, replacing ROOT #5 past 55%; K3653), replaced (by Bob) when its context passes 55% of its window (Bob, 2026-10-11, K2679). ROOT #5 `session_0187SrKsqhqzSTqwDk2hzcXy` is archived. On the **third** account, where the work runs since BOB #269 (K4786-K4790): **ROOT #9**, `session_01GndWUi5ubGmXCVVnFqtJAi` (started by Bob 2026-10-23; K4789), which started BOB #269. On the **secondary** account, superseded by ROOT #9 and unreachable from the third: **ROOT #8**, `session_01R3hvN64bYHG3vPQmYmaeLR` (started by Bob 2026-10-20; K4213), which started BOB #232 to #268; ROOT #6 `session_01FXbdTJZyPp3Bhcv7pfVSR1` (2026-10-07; K2022) is superseded. Sessions on one account are unreachable from the other. Earlier ROOTs are archived (rulings K693–K2022).
- **BOB:** read `roles/BOB.md` in the process repository, then this file, then `build/rulings-active.md`, then the latest handoff, `build/handoff.md`.
- **A module job:** read `roles/JOB.md` in the process repository; BOB's first message names the module and the tranche.
