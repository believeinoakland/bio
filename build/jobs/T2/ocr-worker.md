# Job record · T2 · ocr-worker

Session: `session_01LumujCtUSN1WBLyoke2Hz2` (OCR-WORKER #1)

## Questions and reports for BOB

- **Q1 · open, not blocking.** R19 says the wasm and model byte sizes (`WASM_BYTES`, `MODEL_BYTES`) are "checked against what actually loaded before any page is processed". The model's size can be checked at run time (it arrives as bytes). The wasm core cannot: it arrives as a compiled `WebAssembly.Module`, which carries no byte length, and `WASM_BYTES` is read by nothing. **My best reading, which the job is built on:** at run time the member checks what it can observe (the core arrived as a compiled module; the model's byte length equals `MODEL_BYTES`) and refuses `ENGINE_ABSENT` otherwise; the core's exact bytes are pinned before deploy by the bundle manifest, which hashes `assets/tesseract-core.wasm` (bundler R4/R6). My R19 tests check both halves, and that the committed asset files are `WASM_BYTES` and `MODEL_BYTES` long. **Recommendation:** reword R19 to say so. Its meaning is unchanged.

## Status

**COMPLETE**, on my best reading of Q1. If BOB's answer changes R19's meaning, I re-open.

## Entries

- **T2-12 · applied.** `ocr-worker/test/ocr-worker.test.mjs` is rewritten by requirement, and every live id R1–R21 is named by tests that check it in full:
  - **Part A** drives the member's own code in node through its `fetch` (`makeMember`, below). It uses a recording `CAPTURES` that logs every property touched and every key read, and, where a step needs one, a stand-in renderer or engine. It covers every refusal R7 orders and their order. That includes the two steps no real page reaches: a container other than PNG (step 3) and every PNG shape the reader refuses (step 5, all eight reasons). It also covers the frame bound at exactly the bound and one row over; R1–R6 over their full input classes; R8's exact field set and the byte-pinned `measured_by`; the floor parse; R9/R10/R17/R18 over 17 crafted regions; and R14 over nine method/path pairs. R15 and R21 are checked by what was touched: only `CAPTURES.get`, no network call, and answers that are stable across calls. For R16, unknown names are checked by the bucket never being asked, even with bytes sitting under that key.
  - **Part B** boots the committed bundle under miniflare with the real engine and renderer. It covers the real scanned page (R8/R9/R17/R18, the pins, the independent-decoder digest), a wrong model and a wasm core uploaded as plain data (R13, R19, R7.1), an instance with a floor and PSM set, the real renderer's refusals checked verbatim against `renderPageToPixels` itself, the real frame bound, the blank and noise controls, a whole-bucket byte snapshot before and after (R15), the deployment config, and R20 over every wire answer the suite saw.
  - Source text is read in two places only. R15's own clause is that no write call appears in the sources, so they are scanned with comments stripped; the vendor glue is accounted for separately. R16 requires the set to equal the plane's, and the plane is a later module that cannot be imported, so its `NAMESPACES` line is read from `bio-plane/src/index.mjs`.
  - **Retired:** `test/ocr-worker.control.mjs`, the old process's negative-control harness. It mutated `transcribe.mjs` and matched the old suite's labels. A mutation spot-check of the new suite is listed under Tests.

## Flaws found in this module and fixed

- **The member could not be tested at its refusal steps 3 and 5.** The handler and pipeline imported the engine, which node cannot load, and the real renderer never answers those two steps. They now live in `src/member.mjs`, which imports no engine: `makeMember(engine, {render})` returns `{fetch, transcribeRequest, transcribeOnePage}`. `src/index.mjs` wires in the real engine (`TESSERACT`, exported by `tessengine.mjs`) and keeps `SURFACE`. `src/transcribe.mjs` is removed; its code moved into `member.mjs`. Behaviour is unchanged except for the three fixes below.
- **R4: a non-empty `pages` naming no page answered 200.** R4 and R7 say a malformed request is non-200. It now answers 400 `BAD_PAGES`. The plane always sends page numbers, so no plane path changes (`ocr-member-e2e` and `d606-perpage-ocr` pass).
- **R7.6: an engine that threw escaped as a 500.** It is now `ENGINE_FAILED` carrying the error's name and message. The real engine already caught its own throws, so this guards the seam.
- **R10: a region whose `rect` was not an array threw.** Destructuring a non-array crashed the request. Such a region is now dropped and counted as unanchored.
- `dist/ocr-worker.bundled.mjs` and `.bundle.json` rebuilt with `npm run build` (this module's own generated artifact); `src/tesslib.mjs` re-rendered identical.

## Deferred

- None.

## Found in other modules

- None. No other module's generated artifact is staled: `fleetbundles` passes 96/0.

## Tests and checks run

On `job/T2/ocr-worker` from `tranche/T2` @ 611986933c:
- `node test/ocr-worker.test.mjs` (from `ocr-worker/`): `ocr-worker: 195 passed, 0 failed`
- Mutation spot-check: `frame > MAX_FRAME_BYTES` changed to `>=` in `member.mjs` gave 193 passed, 2 failed (the at-the-bound row, and R19's manifest-staleness row). File restored by `cp` and verified with `cmp`.
- Plane and legacy suites that touch this member, all green: `fleetbundles` 96 pass 0 fail; `bundles` 21/0; `memoryshare` 21/0; `m025-arm-anchor-witness` 26/0; `ocr-member-e2e` 77/0; `d606-perpage-ocr` 28/0; `resolveversion` 11/0.
- `node checks/format.mjs /home/user/bio`: `format: 61 modules, 19 requirements files; 0 failures`
- `node checks/architecture.mjs /home/user/bio ocr-worker`: `architecture: 19 product files, 20 relative imports (0 naming no tracked file, not judged); 0 failures`
- `node checks/coverage.mjs /home/user/bio ocr-worker`: `coverage: 1 modules, 21 of 21 live requirement ids named by a test; 0 failures`
- `node checks/ownership.mjs /home/user/bio ocr-worker tranche/T2`: `ownership: 10 files changed by ocr-worker between tranche/T2 and HEAD; 0 failures`

Module lines: 779 first-party source lines (`src/` without the generated `tesslib.mjs`). Test runs: 5 runs of the module suite.

## Metrics

## Metrics

```csv
session,role,module,cache_read,cache_write,input,output,turns,test_runs,module_lines
session_01LumujCtUSN1WBLyoke2Hz2,job,ocr-worker,6843421,198039,82,64624,41,5,779
```
