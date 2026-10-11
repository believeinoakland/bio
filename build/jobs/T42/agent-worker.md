# agent-worker (T42)

**Status** · session_015HxKEDkguQKE7aafHdePDD · depth 2 · WORKING · handled B1

## Work (T42-20; N832, K2611, K2613)

**Read whole (K2304; the reading set measured 1373 KB, over 300 KB):** `build/requirements/agent-worker.md`; layer 6's contract (`build/layers.md`); `build/plan/current.md`'s head, rules and T42-20; `draft-T42-transcribe.md` §0, §1, §4, §5; K2611, K2613, N852; the code my entry changes (`src/draft.mjs`, `ops.mjs`, `cascade.mjs`, `signin.mjs`, the router, `SURFACE`, `accountOf`, `MODEL_TURNS` and the header of `index.mjs`) and `test/t37.test.mjs`, `t41.control.mjs`; of my uses, `agent-model`'s R1, R2, R6, R12, R14 and its `converse`, `opening`, `toolResultContent`, `factsOf`, `sumUsage`. A worker read the rest of `index.mjs`, `ask.mjs`, `reads.mjs` and every other test and control in full and wrote a summary of about 4,000 words (each statement citing file and line) of what this change touches.

**Applied:**
- R72–R75: `src/transcribe.mjs` (new), routed from `index.mjs`. The refusals come in R72's order: BAD_BODY, BAD_SHA, BAD_PAGES (naming the first fault and never quoting `data`), NO_ACCOUNT, BAD_ACCOUNT (through the shell's `accountOf`, R6 unchanged), and TRANSCRIBE_NEEDS_API_KEY for a sign-in at any level. Each page is one `converse` in mode `transcribe`, in ascending page order. The conversation opens with this module's own words, then a fixed `read_page` call whose result is the picture as an `image` block (agent-model R14). The tools are `read_page` and `transcription`. There is no pack and no plane call. Usage and calls are summed, and a `null` stays `null`. When every page ended silent or refused, the answer is R59's ending for the first such page.
- `TRANSCRIBE_PAGES_MAX` (8), `TRANSCRIBE_TURNS` (2) and `TRANSCRIBE_IMAGE_MAX_BYTES` (5 MB, the Messages API's per-image limit) are exported from `ops.mjs`.
- R34: `SURFACE` gains `transcribe`. R31: UNKNOWN's words name `POST /transcribe`. R58: `MODEL_TURNS` (GET /version) and the header name `/transcribe`.
- R63: the picture reaches the model only on `/transcribe`, only as a tool result. R72 also checks the PNG signature from the first 12 base64 characters, so a picture that is not a PNG (a scanner's JPEG labelled `image/png`) never reaches the model. This is my addition, under R63's "only a PNG the plane renders". Every other path is unchanged: reads still go through `reads.mjs`, which drops bytes.

**Readings (no question needed):**
- R58 names "R28" among the places that carry the one sentence. The `/run` answer has no field carrying it: its `judgement_note` is per run, and R28 pins the exact key set. I left R28's answer unchanged, as the T35/T37 jobs did for `/ask` and `/draft`.
- No pack is read (the draft's doubt 1, as R73 says).

**Deferred / dependency:** `MODEL_FOR_MODE.transcribe` is agent-model's T42-19a, not yet merged. Without it `converse` refuses `MODE_UNKNOWN`, so `t42.test.mjs` is red on this branch until that merge. With the entry added locally and uncommitted (`transcribe: "claude-opus-5"`), I ran t42 at 112 passed, 0 failed, and its controls at 17 of 17. I re-run both on BOB's CHANGE.

**Found in another module (REPORT J1):**
- `bio-plane/test/system/fleetbundles.test.mjs`:248–261 (bundler) pins agent-worker's bundle inputs as exactly 25. Once the bundle is regenerated the list gains `src/transcribe.mjs` (26).
- My change stales the bundle (`agent-worker/dist/`), which BOB regenerates at the layer's close. Until then, requirements.test R45 (2 lines) and fleetbundles' agent-worker staleness arms (3 lines) are red.

## J1 · REPORT

T42-20 built and pushed (378f05157c): POST /transcribe in src/transcribe.mjs, with R72–R75 and R31, R34, R58 and R63 applied. Coverage is 67 of 67 and format, architecture and ownership are green. Waiting on agent-model's MODEL_FOR_MODE.transcribe (T42-19a): without it t42.test.mjs is red (converse refuses MODE_UNKNOWN). Against a local, uncommitted copy of that entry it ran 112 passed, 0 failed, with its controls 17 of 17. I re-run on your CHANGE and then post COMPLETE. For you, from another module: (1) bio-plane/test/system/fleetbundles.test.mjs:248–261 (bundler) pins agent-worker's 25 inputs exactly, and after your layer-close regeneration it gains src/transcribe.mjs (26). (2) agent-worker/dist is stale from this change, so requirements.test R45 (2 lines) and fleetbundles' agent-worker staleness arms (3) are red until that regeneration. User suites: control-plane's 42 suites are all green. One reading, no answer needed: R58 says R28 carries the sentence, but the /run answer has no field for it (its key set is pinned), so I left R28 unchanged, as for /ask and /draft.
