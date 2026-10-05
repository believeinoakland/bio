# sheet-worker (T33)

**Status** · session_01DytKFDiU55w9sQyB8CR7kJ · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

Two points; I carry on with my best reading of each.

**(1) bundler: code no, tests yes.** `bundler`'s code needs no change to carry a new member: `discoverMembers` (`bio-plane/scripts/fleet-bundle.mjs`) finds members by their `fleet-member.json`, `writeMember` already hashes upload assets (ocr-worker's wasm), and `release-assemble.mjs` and `bundles.mjs` iterate `discoverMembers()`. But two of bundler's own tests pin the member set and go red the moment `sheet-worker/fleet-member.json` lands: `bio-plane/test/system/fleetbundles.test.mjs` line 110 asserts the list is exactly `["agent-worker", "ocr-worker", "pdf-worker"]`, and `GUARDED_FLOOR = 3` (line 104), whose own comment says it moves up "in the SAME turn as the member that invalidates it". `deploybindings.test.mjs` (also bundler's) pins the plane's service bindings to the three members; that one changes only when the plane gains `SHEET_WORKER`, which is not in my job. **Best reading:** bundler needs a test-only change (the list gains `sheet-worker`, the floor goes to 4), made by a bundler job or by BOB, merged with or right after mine; until then that assertion is red because of my merge. I cannot write it myself (P7). Tell me if you want me to hold the marker file back instead (the member would then not be guarded, so I would not choose that).

Outside my module, for the record and not for this job: `instance-setup`'s `FLEET_BINDINGS` (`bio-plane/src/setup-fleet.mjs`) and `control-plane`'s `members-pin.test.mjs` (which pins each member's `NAMESPACES`/`PLANE_OPS`, my R11) will need sheet-worker added when the plane binds `SHEET_WORKER` (workbooks' or the installer's job, T33-42/T33-91).

**(2) R13, "a compiled `WebAssembly.Module` of that length".** In Workers the wasm arrives as a `WebAssembly.Module`, which exposes no byte length (ocr-worker checks `instanceof` only and checks length on its Data part). **Best reading:** at run time the member checks that it is a `WebAssembly.Module`, that its exports are the ones my build declares, and that a custom section I add at build (`bio-engine`) names the pinned IronCalc commit and the length and SHA-256 of the engine code before that section was added; the vendored file's own byte length and SHA-256 are the fixed constants, checked against the file by my tests and pinned by the bundle manifest (bundler R4). So a different wasm (or none) gives `ENGINE_ABSENT`.

## Completion (SHEET-WORKER #1, 2026-10-05)

**Entry applied.** T33-18: the new fleet member `sheet-worker` (layer 1), all 16 ids (R1–R16) met and tested. **Paths for `modules.json`:** `paths: ["sheet-worker/"]`, `tests: ["sheet-worker/test/"]`. **Final `uses`:** `runtime-limits` (`makeMeter`, `bio-plane/src/cpu.mjs`), `bundler` (`discoverMembers`/`writeMember` in the build, `parseJsonc` in the tests), `test-support` (the sandbox). `sha256hex` is not used: the member never hashes at run time, because a compiled wasm module exposes no bytes (R13, J1 (2)).

**What was built.**
- `engine/`: a Rust crate over IronCalc at commit `4deab8f6e6a858744f8966f67f70f4ed8d29c78d` (with its `xlsx` crate), exposing `inspect` (R3 checks 2–4 on the real decompressed parts, stopping one byte past the bound), `Book.load`/`evaluate` (values, error codes, causes, volatile flags) and `engine_commit`.
- `scripts/build-engine.mjs` builds it reproducibly (paths remapped; two builds from different target directories gave identical bytes) and appends a `bio-engine` custom section naming the commit, features, toolchain and code hash. It renders the wasm-bindgen 0.2.126 glue to `src/enginelib.mjs` and `src/enginelib-tz.mjs`.
- `assets/sheet-engine.wasm` is 1,866,957 B, SHA-256 `6cb03bcc…ced3d`, about 0.6 MB smaller than the measure's estimate. It is vendored, pinned in `contract.mjs` and in the bundle manifest.
- **A generated artifact this module owns (§14).** Regenerate from `sheet-worker/` with `npm run build:engine` (needs rustup's `wasm32-unknown-unknown` target and `cargo install wasm-bindgen-cli --version 0.2.126 --locked`), then `npm run build`. BOB may add this row to `build/manifest.md`'s artifacts table: `sheet-worker/dist/sheet-worker.bundled.mjs` and `.bundle.json`, owned by `sheet-worker`, regenerated in `sheet-worker/` with `npm run build`, inputs from `sheet-worker` and `runtime-limits`' `cpu.mjs`.
- Member: `src/member.mjs` over an engine handed in, as ocr-worker does; `src/enginecore.mjs` gives a fresh wasm instance per request (R12).

**Choices made on my reading (BOB's to overrule).**
- **(a) Request-check order.** R1's order is followed literally: sha → store → namespace → `NOT_ENABLED` (R2) → `R2_NOT_CONFIGURED` → `NOT_FOUND`.
- **(b) The setting.** `SHEET_RECOMPUTE` enables recompute only when it is exactly `"on"`. `wrangler.jsonc` sets it to `"off"`.
- **(c) Error codes.** `error` is the engine's own code, so not-implemented reads `#N/IMPL`, as IronCalc prints it, not the `#N/IMPL!` R5 lists.
- **(d) Error causes.** A cause follows the engine's error origin: a cascaded cell takes its source cell's cause and names it in `via`. This is how the 2024 NOFA `#N/A` cascade reads `implicit_intersection` rather than `undetermined`. `function` names the unsupported function.
- **(e) Extra answer fields.** `engine_message`, `work` (makeMeter's counts plus the instance's linear memory) and the refusal details `measure`, `measured`, `measured_is`, `bound`, `external`, `stage`, `engine_error`, `elapsed_ms`.
- **(f) `formula`** is the engine's own rendering. When IronCalc applies implicit intersection to a legacy formula, it shows the `@` it inserted, e.g. `TRIM(@C1:C2)`.

**Findings that change what the measure said (for `workbooks`' method note).**
- **(1) HYPERLINK.** IronCalc at this commit now holds HYPERLINK (the measure probed 0.8.3).
  - The corpus's 106 HYPERLINK cells are recomputed as text.
  - The one disagreement is a link location over 255 characters, which Excel caches as `#VALUE!`. IronCalc returns the friendly name, so this one disagrees with a value, not with an error.
  - The `unsupported_function` cause is therefore tested on functions the engine does not hold (WEBSERVICE, GETPIVOTDATA, IMAGE, an unknown name).
- **(2) Array-lifted TRIM/YEAR inside SUMPRODUCT.** These now give `#VALUE!` through the `@` the engine inserts, cause `implicit_intersection`, not `#N/IMPL`. `not_implemented` is tested on `INFO("osversion")`.
- **(3) The Zoning-Fees "iterating" workbook** declares no `iterate` in its `calcPr`. Its 312 cells are circular references, `#CIRC!`, cause `circular`.

**Re-measured agreement (R15), on the 111 link-free corpus workbooks with formulas.** Method: this build in node (V8), every formula cell held against its cached `<v>`, numbers to a relative 1e-9.

| scope | workbooks | cells compared | agree | workbooks agreeing whole |
|---|---|---|---|---|
| all link-free with formulas | 111 | 200,551 | 198,250 (98.85%) | 81 (73%) |
| within the bounds | 99 | 82,985 | 81,292 (97.96%) | 73 (74%) |

Of the 1,694 cells that disagree within the bounds:
- 1,288 are `implicit_intersection` and 313 are `circular`, all errors marked "not recomputed here";
- 34 are `undetermined` errors (e.g. `DATE` with a year IronCalc rejects as `#NUM!`, where Excel gives a number);
- 49 are numeric. Most are stale caches: the file caches `#N/A` while the engine computes a value, as in the Banking Calculator workbooks. One is a residue of −1.16e-10 against 0;
- 9 are text, including the over-long HYPERLINK.

Other outcomes:
- 17 workbooks are refused `EXTERNAL_LINKS` and the one non-zip file `NOT_A_WORKBOOK`.
- Five workbooks did not finish in 600 s in node: three 14.3 MB C-26 Sites Inventory files and two 29 MB APR files. All are far over the bounds.

The method-note figure for `workbooks`: "98.9% of cells and 73% of workbooks whole on the 111 link-free corpus workbooks, and 98.0% / 74% on the 99 within the member's bounds".

**Bounds (R14), measured.**
- `MAX_UNZIPPED_BYTES` 9,000,000, `MAX_CELLS` 250,000, `TIME_BUDGET_MS` 120,000. `wrangler.jsonc` declares `limits.cpu_ms` 300,000.
- **Memory binds first.** The instance's linear memory is 3–7× the unzipped size. Under the bounds the maximum was 59.2 MB (8.85 MB unzipped, 17,823 formulas), against the 128 MB isolate. ocr-worker measured 61.3 MB completing in an isolate.
- The longest load plus evaluation under the bounds was 13.3 s; the longest load was 6.3 s; evaluation took at most 1.1× its load.
- Above the bounds are the four 10.3 MB 2023 APR files: 74–75 MB and about 57 s each. These are the workbooks the plane routes elsewhere (ladders §8.5 L4).
- **The clock.** TIME_LIMIT reads `Date.now()` after a turn boundary (`setTimeout(0)`), because workerd advances its clock only between turns. Under local workerd (miniflare) a probe measured 146 / 268 / 614 ms for loads of 10 / 20,000 / 80,000 formulas, so the limit is observable there.
- **Deferred: a deployed run.** The figures are from V8 in node and from local workerd, not from a deployed Worker. I deployed nothing: the member ships inactive, and deploying is the release's step (K1501). A deployed probe at the release, before `SHEET_RECOMPUTE` is turned on, would confirm the memory figure on the platform.

**Deferred.** Nothing in my own module beyond the deployed probe above.

**Found in other modules (also in my REPORT).**
- `bundler`: `bio-plane/test/system/fleetbundles.test.mjs` fails only "members discovered by their own marker file" (got the four members). This is T33-18a, as planned. Every sheet-worker arm in it passes: freshness, byte identity, manifest sha, symlinks, mutation arms.
- `bundler`: `bio-plane/test/system/resolveversion.test.mjs` ARM 7b also pins "the plane and all THREE members (8 sites)" and now reads 10. T33-18a does not name it, and it needs the same test-only change.
- When the plane binds `SHEET_WORKER` (T33-42 or T33-91): `instance-setup`'s `FLEET_BINDINGS`, `control-plane`'s `members-pin.test.mjs` (my `NAMESPACES`/`PLANE_OPS`) and bundler's `deploybindings.test.mjs` gain this member.

**Tests and checks run.**
- `node --test sheet-worker/test/` (from `sheet-worker/`: `npm test`): **35 pass, 0 fail**. That is 24 interface tests under node with the real engine, 3 under workerd booting the committed bundle with its CompiledWasm part, and 8 corpus tests.
- `cargo test --release` in `engine/`: 3 pass.
- No layer tests are named in `build/manifest.md`.
- `node checks/format.mjs bio`: 0 failures.
- With `modules.json`'s empty `paths`/`tests` as committed: `architecture` 0 failures (0 files judged); `coverage` and `ownership` fail only because the paths are empty.
- With the paths above filled in locally (not committed): `architecture` 0 failures (35 product files); `coverage` 16 of 16 ids named, 0 failures; `ownership` 36 files, 0 failures.

Size (session_01DytKFDiU55w9sQyB8CR7kJ): test runs 14, module lines 1,270 (plus 449 generated glue lines and 884 test lines)

## J2 · REPORT

Found in other modules (details in my record's Completion): (1) bundler: `bio-plane/test/system/resolveversion.test.mjs` ARM 7b pins "the plane and all THREE members (8 sites)" and reads 10 with sheet-worker; T33-18a names only fleetbundles.test.mjs's list and GUARDED_FLOOR, and it needs this test-only change too. fleetbundles.test.mjs fails only its pinned list, as planned; every sheet-worker arm passes. (2) When the plane binds SHEET_WORKER (T33-42/T33-91): instance-setup's FLEET_BINDINGS, control-plane's members-pin.test.mjs (my NAMESPACES/PLANE_OPS, R11) and bundler's deploybindings.test.mjs gain this member. (3) manifest.md's generated-artifacts table can gain sheet-worker's row (in my record).

## J3 · COMPLETE

T33-18 done: all 16 ids met and tested (35 tests pass: node with the real engine, workerd booting the committed bundle, 8 corpus fixtures). modules.json: paths ["sheet-worker/"], tests ["sheet-worker/test/"]; uses runtime-limits, bundler, test-support. Engine: IronCalc 4deab8f6 with xlsx, own reproducible wasm build, 1,866,957 B. Bounds measured: 9,000,000 B unzipped, 250,000 cells, 120,000 ms load budget, cpu_ms 300,000; memory binds first (59.2 MB max under the bounds). Re-measured agreement: 98.85% of cells, 81 of 111 workbooks whole (98.0% / 74% within the bounds). HYPERLINK is now held by the engine at this commit and array-lifted TRIM reads implicit_intersection; both differ from the measure (record). Checks: format 0; architecture, coverage and ownership 0 failures with my paths filled locally. Expected red until T33-18a: fleetbundles' member list (and resolveversion ARM 7b, see my REPORT).
