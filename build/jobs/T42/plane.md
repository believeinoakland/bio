# plane (T42)

**Status** · session_019KPdWXgGFwpp8DJJjNuRry · depth 2 · COMPLETE · handled B2

## Completion (PLANE #30)

**Entries applied (T42-30):**
- R36 (N832): `src/plane/transcribe.mjs` (new): `transcriberOf(ctx, env, deps)` (one per storage; `deps.testSet` a test's set, read on the first call), registered once at start in `store.mjs` (`extractionOf(ctx).registerTranscriber("plane", transcriberOf(ctx, env))`, after ai-runs). `deployable()` is `run-rules.partDeployableOn(set, "transcribe", {verifications: [], testBars: aiRuns.testBarRecords()})`, a throw false; `keptAway` relays `credentials.aiKeptAway`; `transcription` answers the object's credentials, `ai-use.useCheck`, the act id (K2684: `transcribe:<16 hex>:<at>`, a getter filled when the AI path is asked for a capture) and the AI path: unbound → `AGENT_WORKER_UNBOUND`; bytes absent → `EVIDENCE_ABSENT`; pages rendered one at a time ascending, at most `TRANSCRIBE_PAGES_MAX` (8), by `pdf-pixels.renderPageToPixels(…, {decodeDct: true})`, a refused/throwing/non-PNG/over-5 MiB page not sent, none left → `NO_PAGE_RENDERED` (K2684); posts `{capture_sha, pages, account}` (R6 wire shape, `project` for a project's account) to `/transcribe`; a throw or non-JSON → `AGENT_WORKER_SILENT`; any `usage` counted in one transaction through `ai-use.countUsage` under the act (owner per ai-use R1); a refusal or ending answered `ok: false` with its `reason` or `code`. The door's `gatedOp` answers `pagetranscribe` through extraction's `pageTranscribeOp`, beside `pdfstructure`'s arm, with the same stamps.
- R37 (N826): `doorbellOf(ctx)` directly after capture (actions' factory may reach it first, the same instance), migrated directly after capture's in R3's pass, `doorbellOps` spread directly after `captureOps` (same nine names, so no key moves; doorbell's handlers win); the public hook's knock through `doorbellPublicOp`; capture's `plane.test.mjs`:66–75 carried, re-pointed (`t42.test.mjs`, Miniflare); the "directly after capture" comments re-worded (`store.mjs`, `maps.mjs`, `t36.test.mjs` titles).
- R38 (N839): `caseAccountOf(ctx, {runs: aiRunsOf(ctx, env)})` directly after `caseDisclosuresOf`, before `reviewOf` and `caseAuthoringOf`.
- R35 (N839): `controlPlaneOwnerOps`' getter `caseAccount: () => caseAccountOf(ctx)` replaces `caseAuthoring`.
- Edges (`modules.json`, as B1 and K2613 direct): plane → `doorbell`, `case-account`, `pdf-pixels`, `run-rules`, and `agent-worker` (test-only: R36's test holds `TRANSCRIBE_PAGES_MAX` and `TRANSCRIBE_IMAGE_MAX_BYTES` equal to agent-worker's; the architecture check refuses the import without it). BOB's to keep or strike.

**Measured (draft-T42-transcribe.md §8 doubt 1):** `scan-dct-page.pdf` (3300×2550 colour DCT, 4:2:0) renders with `decodeDct` to a 1,136,289 B PNG in ~0.7 s CPU (node, 3 runs: 705–762 ms); the CCITT G4 page 129,366 B in ~0.3 s. Eight such pages ≈ 6 s CPU in the object per act, each PNG under the 5 MiB limit (doubt 2 not met by these pages). No cap change proposed.

**Deferred:** none.

**Found in other modules (reported):** `control-plane`'s `owner-ops.mjs`:37–38 still call `of.caseAuthoring()`, so R35's test (`t42.test.mjs`, R35) is red on this branch until T42-29 merges (it merges before the plane, L11's order); `op=accountpropose`/`accountdrafts` throw on this branch alone until then.

**Reading (K2304):** read whole myself: `requirements/plane.md`; layer 11's row of `layers.md`; `src/plane/store.mjs`, `door.mjs`, `index.mjs`, `ask.mjs`; the used services named in Uses for T42 (doorbell's `doorbellOf`/`doorbellOps`/`doorbellPublicOp`, case-account's factory and header, extraction's `registerTranscriber`, `pageTranscribe` and `pageTranscribeOp`, reading-pipeline's `tier4Extend`, ai-use's `countUsage`/`useCheck`/`actualOf`, ai-runs' `testBarRecord(s)`, run-rules' `test-bar.mjs`, credentials' `accountFor`/`aiKeptAway`, pdf-pixels' `renderPageToPixels`, agent-worker's `transcribe.mjs` and its bounds). A worker read the rest of the plane's code (`wiring.mjs`, `stats.mjs`, `screens.mjs`, `unpack.mjs`, `wizards.mjs`) and all 28 files of `test/m/plane/` and `migrate-released.test.mjs` in full: summary ~200 lines, each statement citing file and line.

**Tests and checks** (on `job/T42/plane` with `tranche/T42` merged at e92b6a5c5e):
- `node --test "test/m/plane/**/*.test.mjs"`: 183 tests, 182 pass, 1 fail (R35, above).
- `test/system/migrate-released.test.mjs`: 1 pass, 0 fail.
- Users' suites (P11): no module uses `plane`.
- `checks/format.mjs`: 0 failures; `architecture.mjs bio plane`: 0 failures; `coverage.mjs bio plane`: 38 of 38 live ids named, 0 failures; `ownership.mjs bio plane tranche/T42`: 1 failure, `build/modules.json` outside plane's paths (the edges B1 asks this job to add).

Size (session_019KPdWXgGFwpp8DJJjNuRry): test runs 7, module lines 1,683 (`src/plane/`, 139 new in `transcribe.mjs`)

## J1 · QUESTION

Two readings of R36, applied; the job carries on on them.

1. **The act's id.** R36: `transcription({member, project, at})` answers `act`, `transcribe:<captureSha prefix>:<instant>`. But extraction's `pageTranscribe` calls `transcription` before any digest reaches the transcriber (`extraction/index.mjs`: `reg.t.transcription({member: by, project, at})`), and the digest first arrives in the AI path's `transcribe({capture_sha, ...})`. Best reading: `act` is minted at `transcription` with the instant `at`, and its digest prefix (16 hex) is filled in when the AI path is asked for that capture: `act` is a getter, read by `countUsage` and by extraction after `tier4Extend`, so both see `transcribe:<16 hex>:<at>`. No module changes.
2. **Two outcomes R36 does not name.** (a) the capture's bytes are absent from the evidence store when the AI path runs (extraction checked them just before); (b) every asked page is refused by the renderer or over `TRANSCRIBE_IMAGE_MAX_BYTES`. Best reading: neither posts to agent-worker (no account leaves the object for nothing); each answers `{ok: false, reason}` as the unbound and silent cases do (`EVIDENCE_ABSENT`, `NO_PAGE_RENDERED`), which `tier4Extend` states as "the AI declined (<reason>)" in the reading's note. These are tier-4 seam answers, not catalogue refusals (R9 unchanged). The alternative, posting an empty `pages` for agent-worker's `BAD_PAGES`, sends the secret for nothing.
