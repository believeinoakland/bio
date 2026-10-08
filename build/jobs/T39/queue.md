# queue (T39)

**Status** · session_01BUk7szvsRmbWApiCReZVmt · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

T39-21 (K2381, K2383) applied, commit `375e05aec0` on `job/T39/queue`. Tests only; no requirement and no product code changed.

**Reading set (B1).** Read whole: queue's Purpose, `bio-plane/test/conclude-project.test.mjs`, `test/m/scheduler/plane.test.mjs`:30–60, K2381, K2383, and the draft's §2–§3 (queue).

**Applied.**
- `GET` and `POST` (:96–98) now go through `send`, which lifts `token` out of the address into `Authorization: Bearer …` before `mf.dispatchFetch`, exactly as scheduler's `send` does (admission R20, C-38.10). The call sites keep their readable `token=` and are unchanged.
- **Beyond the entry, in my own test file (a flaw found once the first red cleared).** With the address fixed, two more arms went red: §2 "a machine credential is refused by the fence it always was" (:478) and §5 "a MACHINE may not withdraw" (:551). Both used `mem-r124`, the shared member token. Admission R5 (C-38.11) retired that token, so it is refused `MEMBER_TOKEN_RETIRED` before the conclude fence is reached. Both arms now use `prb-r124`, the `probe` class. Op-declarations admits `probe` to `conclude` and `withdrawconclusion`, and the store refuses it `MACHINE_CANNOT_CONCLUDE`. That is what the arms assert. Each change carries a dated `CORRECTED` comment. No assertion was weakened: the expected answers are unchanged.

**Deferred:** none.

**Found in other modules:** none. (The Miniflare bindings still name `MEMBER_TOKEN: "mem-r124"`. That is harmless and now unused by the suite.)

**Tests and checks run:**
- `conclude-project.test.mjs`: before, 0/1 (threw at `enrol`); after the lift, 73/2 (the two machine arms above); final `conclude-project: 75 pass, 0 fail` (75 is the REC-136 baseline in its header).
- queue `test/m/queue/`: tests 128, pass 128, fail 0. `test/docdates.mjs`: 1/0.
- Layer tests: none named in `build/manifest.md`. No provided service changed, so users' tests were not re-run.
- `format: 139 modules, 138 requirements files; 0 failures`
- `architecture: 28 product files, 81 relative imports (0 naming no tracked file, not judged); 0 failures`
- `coverage: 1 modules, 41 of 41 live requirement ids named by a test; 0 failures`
- `ownership: 1 files changed by queue between tranche/T39 and HEAD; 0 failures`

**Generated artifacts:** none written or staled (test-only change).

Size (session_01BUk7szvsRmbWApiCReZVmt): test runs 4, module lines 2920
