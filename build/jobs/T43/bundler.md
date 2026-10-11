# bundler (T43)

**Status** · session_0176Gs2ArDkbAyfHKBHEdKdd · depth 2 · WORKING · handled B1

## Completion (BUNDLER #15)

**Reading set** (mechanics §17). BOB measured it at the START as 235 KB, under 300 KB. Read whole: `build/requirements/bundler.md`; the public parts of `signatures` and `test-support` (its Uses); `build/layers.md`'s "Helper modules"; `build/manifest.md` (with "Generated artifacts"); the plan's "Rules at the opening" and entry T43-2; K2650; every file under the module's `paths` and `tests`. **Measured here, that set is about 544 KB**: the code and tests alone are 520 KB (`release.test.mjs` 86 KB, `fleetbundles.test.mjs` 70 KB, `fleet-bundle.mjs` 60 KB). It is over the 300 KB limit, so the START's figure did not count the whole module. I read it all anyway (it fit this window); the measurement is BOB's to correct (see Found).

**Entries applied (T43-2).**
- **N860** (K2650; clears plan rule 4 (7)). `fleetbundles.test.mjs`'s agent-worker pin (was lines 248–261) is re-pinned 25 → 26 inputs, from the committed manifest `agent-worker/dist/agent-worker.bundle.json` (26 inputs since T42's L6 close). The one arrival is the member's own `src/transcribe.mjs` (T42-20). None left. The re-pin note names it. The test keeps its purpose: a census of the member's build inputs, by name. Green. No requirement changed; no bundle rebuilt or committed.

**Fixed in my own module.** `deploy.mjs`'s header comment (D-201) said the upload's `keep_bindings` excludes `service`. The code keeps it, as R18 states. The comment now describes the metadata the code sends. Comment only: no behaviour moved.

**Deferred.** R11's second test ("one implementation serves every caller") reads the four scripts' source text for `from "./jsonc.mjs"` and for no copy of the functions. JOB.md says tests check the interface, never source text. I found no behavioural test of "one implementation" that is not a larger rewrite than this tests-only entry allows: every caller would have to be driven with a marked parser. Kept as it stands; it is a candidate for a later bundler entry.

**Found.**
- **Reading set (to BOB, mechanics §17).** The START's 235 KB leaves out most of the module: the module is 520 KB of code and tests (about 544 KB with the requirements). A later bundler START is over the limit unless the set is narrowed (§17 (2): split the tests, or name which suites a tests-only entry reads).
- **R31's figures, for the layer close** (one run here): agent-runner 60,742 B, 4 ms; agent-worker 271,118 B, 7 ms; file-scanner 176,410 B, 8 ms; ocr-worker 301,738 B, 19 ms; pdf-worker 2,465,783 B, 65 ms; sheet-worker 26,160 B, 2 ms; **bio-plane 15,988,122 B (15.2 MiB), 794 ms: WARN** (past 500 ms; T42's J1 REPORT, K2547, still stands). No other module's finding.

**Ran.**
- `npm ci --ignore-scripts` in `agent-runner` and `file-scanner`, `npm ci` in `sheet-worker` (the container was fresh). The first fleetbundles run, before file-scanner's install, printed a SKIP; it is not counted.
- `node --test bio-plane/test/system/fleetbundles.test.mjs`: `fleetbundles: 149 pass, 0 fail`, no SKIP.
- `node --test bio-plane/test/m/bundler/ bio-plane/test/system/{bundle,deploybindings,resolveversion,fleetbundles}.test.mjs`, after the comment fix: tests 95, pass 95, fail 0, skipped 0 (fleetbundles 149/0 within it).
- No layer tests are named in the manifest. No provided service changed.
- Checks: `format` 0 failures; `architecture` bundler 0 failures; `coverage` bundler 31 of 31 live ids, 0 failures; `ownership` bundler against `tranche/T43`, 0 failures (re-run after the commit).

Size (session_0176Gs2ArDkbAyfHKBHEdKdd): test runs 4, module lines 3442
