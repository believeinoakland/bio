# attestation (T26)

**Status** · session_0176zF6WAnondSUb8eCPL194 · depth 2 · COMPLETE · handled B1

## Completion

Fix commit `7b8a5922bd` on `job/T26/attestation` (from `tranche/T26` @ `60a3668b15`).

**Entries applied.** N517 (accepted red 3), from BOB's B1 START:
- (1) The R9 probe. `test/m/attestation/invariants.test.mjs` used to probe `JSON.stringify` of each answer, so the fresh base64 bytes in a `signature` or `public_key` were probed as if they were text. The test now probes `textOf(answer)`: every string at any depth, including every key name, but not the values under `signature` and `public_key` (key material, left out by name). R9 and the module's code are unchanged. The probe's regex is unchanged.
- (2) Controls, in the same test. A guard asserts that the probed answers do carry a `signature`, so the left-out values are really present. Negative controls: a place in a sentence is still caught at the top level (`detail`), inside an array of objects (`attempts[].note`, `translation`) and in a signed `statement`. A `signature`/`public_key` holding `+ca/` and `/CA+` beside a clean sentence is not flagged. The same signature beside "fetched in California" is flagged.
- (3) Proof by repetition. `node --test test/m/attestation/invariants.test.mjs` passed **500 runs out of 500**. The old file (from `HEAD` before the fix) passed 100 runs out of 100, so the flake is rarer than K1234's "1 in 7". I measured the cause directly with a scratch script (not committed): over **1,000,000** fresh signed answers (`{ok, signature: 64 random bytes, key_id, public_key: 32 random bytes}`), the old probe flagged **515** and the new probe flagged **0**. That is about 1 in 2,000 per signed answer. R9's test probes about four answers that carry key material, so its old failure rate was about 1 in 500 runs.
- (4) Re-scan for the N502/N508 kind (N469's rule). I read every file of the module whole and found two stale notes. `checks.mjs` said C-89.1 "is `awaiting stamp` until T26's L2 (S3; accepted red 6)". It now says the row was re-pointed and stamped at 1.56.0 by T26's L2 (S3; K1247). `ops.mjs` said "The plane composes it (its L11 job; accepted red 9)". It now says `plane/door.mjs` composes it, as it has since that T25 L11 job. Nothing else names the legacy store's op map or a tranche's pending state. `index.mjs`' and `schema.mjs`' T25 notes are history, so they stay.

**Deferred.** None.

**Found in other modules.** The plane's bundle is stale: `fleetbundles.test.mjs` says `FAIL bio-plane: no staleness, …` on this commit and 0 fail on `tranche/T26`. The cause is the two comment edits in (4), in `src/attestation/checks.mjs` and `ops.mjs`. Its owner is `not_product`, and BOB regenerates it at the layer close. I regenerated nothing.

**Tests and checks** (on `7b8a5922bd`):
- `node --test bio-plane/test/m/attestation/`: 19 tests, 19 pass, 0 fail.
- `invariants.test.mjs` repeated: 500/500 pass (and the old file 100/100, for the record).
- `node --test bio-plane/test/m/`: 5341 tests, 5330 pass, 0 fail, 0 cancelled, 11 todo. No red, so red 3 is cleared and red 2 does not show in `test/m`.
- `checks/format.mjs`: 91 modules, 0 failures. `architecture.mjs`: 9 files, 27 imports, 0 failures. `coverage.mjs`: 10 of 10, 0 failures. `ownership.mjs … tranche/T26`: 4 files, 0 failures.

Size (session_0176zF6WAnondSUb8eCPL194): test runs 605, module lines 558

## J1 · COMPLETE

N517 done on job/T26/attestation (fix 7b8a5922bd). R9's probe now reads each answer's text (every string and key, at any depth) and leaves out only the values under signature and public_key; regex and R9 unchanged. Controls: a guard that signed answers are probed; a place is still caught in a sentence, in a nested note, in a translation and in a statement; a signature holding +ca/ is not flagged. Proof: invariants.test.mjs passed 500/500. Cause measured over 1,000,000 fresh signed answers: old probe 515 false hits, new 0 (about 1 in 2,000 per answer, so about 1 in 500 runs; the old file passed 100/100 here). Re-scan: checks.mjs's 'awaiting stamp until T26 L2' and ops.mjs's 'accepted red 9' re-worded to the past (K1247; plane/door.mjs). attestation 19/19; whole test/m 5341, 5330 pass, 0 fail, 11 todo (red 3 cleared). Checks: format, architecture, coverage and ownership each 0 failures. The plane bundle is stale through those two comment edits; I regenerated nothing. Record: build/jobs/T26/attestation.md.
