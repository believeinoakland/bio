# agent-runner (T46)

**Status** · session_01BPav5py7tUQEUxAhMso2Mn · depth 2 · COMPLETE · handled B1

## Completion (AGENT-RUNNER #5)

**Read, whole:** `build/requirements/agent-runner.md`; `bundler`'s Purpose and Provides; layer 6's contract; every file under `agent-runner/src/` and `agent-runner/test/` (stubs included), `Dockerfile`, `wrangler.jsonc`, `fleet-member.json`, `package.json`, `scripts/build.mjs`; T46-18 in `build/plan/current.md`; trial §2.1, §2.2 item 7 and §6 B4; `agent-model` R12, R14, R15 and `agent-worker` R72 for R24's shape.

**Entry applied.** T46-18 (R24): `src/runner.mjs` `toolContent` turns each `image` block of a relay's `tool_result` in `agent-model` R14's shape into MCP's image item `{type: "image", data, mimeType}`, bytes and media type unchanged, in its place among the text blocks; text and other blocks pass as before (R3). An image block whose `media_type` is not `image/png`, whose `data` is not base64, or which is not in R14's shape makes the result the tool's error naming the fault, no bytes passed. Nothing is decoded, written or logged (R8, R9).

**Flaw found and fixed in this job:** my first base64 check (a grouped, repeated regex) overflowed the regex stack on a 5 MiB page (`Maximum call stack size exceeded`, answered `SDK_ERROR`); replaced by a linear check, and the 5 MiB test keeps it so. No other flaw found in the module on the whole read.

**Measured at START (R24's suggestion):** a page at `agent-worker`'s `TRANSCRIBE_IMAGE_MAX_BYTES` (5 MiB) is 6,990,508 base64 characters in one frame; `ws.mjs`'s cap is 16 MiB, Cloudflare Workers' WebSocket limit 32 MiB. No limit hit.

**Open:** none (J1 answered by B2).

**For BOB, outside this module:** (1) the image must be rebuilt and republished for R24 to be live (0.82.0's image predates it; the release's `agent-runner-image.yml`, K1898). The Worker bundle is not stale (`runner.mjs` is not one of its inputs). (2) A pre-R24 runner fails an R14 image block as an MCP schema error (a tool error to the model), never `IMAGE_NOT_RELAYED`; `agent-model` R15's fallback depends on J1's answer.

**Deferred:** none.

**Tests and checks:** `node --test test/` in `agent-runner/`: tests 38, pass 38, fail 0 (baseline at START 34/34). `format`: 159 modules, 152 requirements files; 0 failures. `architecture agent-runner`: 28 product files, 29 relative imports; 0 failures. `coverage agent-runner`: 24 of 24 live requirement ids named by a test; 0 failures. `ownership agent-runner tranche/T46`: 3 files changed; 0 failures. Final `uses`: `bundler` (unchanged).

**B2 (K2947) applied:** R5 amended: `GET /version` answers `{ok, name, version, capabilities}`, `capabilities` `["image"]` (`src/entry.mjs` `CAPABILITIES`); R5's test checks the field and, in the same test, that an image block passes as R24 says; R12's `/version` assertion updated likewise. `fleet-member.json`'s surface line for `GET /version` names `capabilities`, which stales this module's Worker bundle (`fleetbundles`: agent-runner `STALE BUNDLE` from `fleet-member.json`, every other member PASS); per START, BOB regenerates it at the layer's close. J1 answered.

**Tests and checks after B2:** `node --test test/`: tests 38, pass 38, fail 0. `format` 0 failures; `architecture` 29 product files, 30 relative imports, 0 failures; `coverage` 24 of 24, 0 failures; `ownership` 0 failures.

Size (session_01BPav5py7tUQEUxAhMso2Mn): test runs 9, module lines 676

## J1 · QUESTION

R24 / agent-model R15: "IMAGE_NOT_RELAYED stays for a runner that does not answer R24's capability". Neither my requirements nor agent-model's say how a runner answers that capability, and R5 (`GET /version` → `{ok, name, version}`, tested by deepEqual) has no field for it.

My best reading, which I am building now: R24 changes no surface; the runner states nothing new, and an older runner (pre-R24) is told apart by agent-model from R5's `version` or by agent-worker's `/version` `runner`. Facts for the choice: a pre-R24 runner (0.82.0's image) passes the R14 block to Claude Code's MCP client as-is; that client's schema needs `{type:"image", data, mimeType}`, so the call fails as a tool error (the model sees an error, the picture is not dropped silently, but no `IMAGE_NOT_RELAYED` either).

If you want an explicit signal, the smallest is R5 amended: `/version` answers `{ok, name, version, image_results: true}` (I would update R5's test). Tell me which; until then I keep R5 unchanged.

Also measured at START (as R24's suggestion asks): a page at agent-worker's `TRANSCRIBE_IMAGE_MAX_BYTES` (5 MiB decoded) is 6,990,508 base64 characters in one relay frame; the runner's own frame cap (`ws.mjs` MAX_MESSAGE) is 16 MiB and Cloudflare Workers' WebSocket limit is 32 MiB (changelog 2025-10-31). No limit is hit; a test sends a 5 MiB page through the connection.

Detail I am applying (mine unless you rule otherwise): an `image` block not in R14's shape at all (no `source`, `source.type` not `base64`, or MCP's own `{data, mimeType}` shape) is treated like R24's bad media type: the tool's error result naming the fault, no bytes passed.

## J2 · COMPLETE

T46-18 (R24) applied and tested: 38/38 pass, all four checks 0 failures; completion section in my record. J1 stays open (R5 unchanged on my reading). The image needs the release's rebuild for R24 to be live; the Worker bundle is not stale.
