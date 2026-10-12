# bundler (T47)

**Status** · session_015stLmywC6CUKSABSgnnE5y · depth 2 · WORKING · handled B1

## Completion (BUNDLER #17)

**Reading set** (mechanics §17; BOB measured it at 563 KB at the START). I read it all, whole: `build/requirements/bundler.md`; the public parts of `signatures` and `test-support`; layer 1's contract and "Helper modules" in `build/layers.md`; the plan's T47 rules and entry T47-4; and every file under the module's `paths` and `tests`. I read my own code and tests whole, not only what I changed (P20).

**Entries applied (T47-4).**
- **(N944) R30's T47 clause.** `release-assemble.mjs --sign` now takes the release's `signer` from the seed in use (signatures' `signerPublicLine`, its R35). Both signatures are verified by stock `ssh-keygen` against that key, and `RELEASE.json` is written with that key's line. If the current `RELEASE.json` names a `signer` with a different key, the run is refused with `[SIGNER_DISAGREES]`. The refusal names both keys (public halves only) and comes after every R22 check, before anything is signed, emitted or written. A `signer` that is absent, null or empty counts as no disagreement, and the derived line is written. The same key under another comment is accepted, and the seed's own line is written. Without `--sign` nothing changes: the release is completed for the signer `RELEASE.json` names (R23). The code name `SIGNER_DISAGREES` is BOB's wording.
- **(N950)** `fleetbundles.test.mjs`' agent-worker pin is re-pinned from 27 to 28 inputs, by name, as the committed manifest records them. One input arrives, the member's own `src/untested.mjs` (T46-19, R79's test-instance label). None leaves. This clears plan rule 5 (5).

**Tests.** A new test, "R30 (T47, N944)", states the clause and covers these cases:
- Another key is refused `SIGNER_DISAGREES`, naming both keys. Three forms are tried: another line, the other key under a comment, and a signer that is not a line. In each case nothing is signed, written or emitted, the seed is never printed, and the run is never refused as `PLANE_SIG_DOES_NOT_COVER_ASSET`.
- The control cases succeed: the same line, the same key under another comment, no signer, an empty signer, and no `RELEASE.json` at all. Each signs, verifies against the seed's key and writes the seed's line.
- Without `--sign`, the signer in `RELEASE.json` is kept.

R23's refusal test lost its two `--sign` cases that expected `PLANE_SIG_DOES_NOT_COVER_ASSET`, because the amended R30 changes them. Both are covered in the new test. Negative control: run against the pre-change script, the new test fails (`SIGNER_DISAGREES` not on stderr). It passes on the change.

**Fixed in my own module.**
- **R23's "before any write".** `NO_SEED` used to be refused only after `--emit-payload` / `--emit-plane` had written their files. The seed is now read, and its key derived, before those writes, so every `--sign` refusal comes before any write. A seed that is not an envelope is still `SIGNING_FAILED`.
- **R11's "one implementation" test read the four callers' source text** (BUNDLER #15 and #16 deferred this). It is now driven at the interface. In a fixture repository the module's reader is replaced by a marked one that also accepts a `#` line, which no other JSONC reader accepts, and every config carries such a line. `resolve-version`, `deploy`, `deploy-fleet --dry-run` and `release-assemble --dry-run` each run as usual, and each is recorded calling the reader. Negative control: when `deploy-fleet.mjs` was given a private reader, the test failed; the file was restored and checked with `cmp`.
- **`deploy-fleet.mjs`' header** still said a group's copy pulls from the public registry by digest (M-Q8). It now says that since K2912 the images are named on `ghcr.io/believeinoakland` and copied into each account's registry (K3028).
- The header of `release-assemble.mjs` now describes the signing workflow's step 4 with the derived signer.

**Not done: the Suggestions line (M-Q8).** BOB's START asks me to reword the requirements' Suggestions line saying group copies pull from Docker Hub. `build/requirements/bundler.md` is BOB's (mechanics §1; K20) and is outside my `paths`, so the ownership check would refuse the edit. I left it alone and sent the wording in J1 REPORT.

**Deferred.** Nothing.

**Found (to BOB, in J1 REPORT).**
1. The Suggestions wording above.
2. R31's figures for the layer close (one run on `job/T47/bundler`, members installed): agent-runner 60,832 B, 4 ms; agent-worker 298,850 B, 10 ms; file-scanner 176,562 B, 9 ms; ocr-worker 303,361 B, 12 ms; pdf-worker 2,465,783 B, 45 ms; sheet-worker 26,160 B, 2 ms; bio-plane 18,537,576 B (17.7 MiB), 540 ms. **bio-plane warns.** Its global scope is past R31's 500 ms warning budget (380–428 ms at T46). A warning is not a failure, and the platform allows 1 s.

**Ran.** First the installs: `npm ci --ignore-scripts` in `agent-runner` and `file-scanner`, so the byte arm runs for every member. Nothing tracked moved.
- `node --test bio-plane/test/m/bundler/`: tests 93, pass 93, fail 0, skipped 0.
- `bundle.test.mjs`, `deploybindings.test.mjs` (37 passed, 0 failed) and `resolveversion.test.mjs` (12 pass, 0 fail): all exit 0.
- `fleetbundles.test.mjs`: 149 pass, 0 fail, no SKIP.
- No layer tests are named in the manifest. No service I provide changed shape: R30's commands are run by the workflow, not used by another module.
- Checks: `format` 0 failures; `architecture` bundler 0 failures; `coverage` bundler 31 of 31 live ids, 0 failures; `ownership` bundler against `tranche/T47`, 5 files, 0 failures (after the commit).
- `checks/run.mjs`: architecture 0 failures, channels 0. Coverage has 3 failures, none of them bundler's: connection-grammar R21, jurisdictions R88, record-grammar R61 and R62, all ids left to their own L1 jobs.

Size (session_015stLmywC6CUKSABSgnnE5y): test runs 14, module lines 3433
