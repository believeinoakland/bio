# provenance (T18)

**Status** · session_01Rbs8QkxyTpLKJbAeaFkrcp · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 3, provenance):
- ✱ C-24 `VERSION_CHAIN_CHECKS`, C-34 `ROUTE_MARK_CHECKS`, C-89 `ATTEST_CHECKS`, C-103 `PROVENANCE_ACT_CHECKS`, C-53 `TESTIMONY_CHECKS` (C-53.1–.9, .13) moved whole, headers included (352 lines), into `bio-plane/src/provenance/checks.mjs`; the catalogue's copy deleted (§12.2; no test importer of the copy remained outside `test/m/provenance`, re-pointed here). `index.mjs` imports and re-exports them. `store.mjs`' three imports of them (unused there) removed. Rows **awaiting stamp** (T19): C-24.1–.3, C-34.1–.4, C-53.1–.9, C-53.13, C-89.1, C-103.1–.7 (moved file; ids, codes, `where`s and translations unchanged).
- The legacy-index map's §4.4 plain move: `src/index.mjs`' `registeraudit` and `attest` arms moved to `bio-plane/src/provenance/ops.mjs` (`registerAuditOp`, `attestOp`, answers byte for byte), `index.mjs` rewired (5 lines added: the import and two dispatch lines; its stale `partsHeld` comment removed).
- K582: the register audit's `detail` and the `registerRows` comment no longer name `migrate.mjs`.
- Converts (provenance's shares, `build/jobs/T17/legacy-tests.md`): `versionchain` → `convert-versionchain.test.mjs` (R17, R18: 5 tests; D-221's search pin is retrieval's, the op's address normalisation control-plane's); `provenance-chain`, `provenance-marker` → `convert-chain-marker.test.mjs` (R19, R20, R22, R23, R41, R46: 10 tests; `op=release`, `op=list`/`op=audit` route blocks, `op=stats` are legacy-store/control-plane); `testify`, `mk6-bundle-names-no-author`, `framework-digest-audit` → `convert-testimony-digest.test.mjs` (R3, R28, R42, R43: 10 tests; body-synonym mapping to `claimedAuthor` is legacy-store's route, mk6's publication arm publication's). Old suites not deleted (K619).
- Improvement in my module: `attest`'s `CAPTURE_HELD_IN_PARTS` refusal now carries `code`, `check` (C-89.1) and `translation` (the Provides' "a refusal with a catalogue row carries its check id and translation"); tested (R31) and in `ops.test.mjs`.

**Not yet met marks met:** none newly (the entry named none).

**For BOB (requirements, not my paths):** "Checks carried here" (`provenance.md`:159) is met for C-24, C-34, C-53.1–.9/.13, C-89.1, C-103; Uses (:122) should drop the families from `legacy-checks` (now "`legacy-checks`: `EARNED_CAPTURE_CEILING`, `BASIS_GRADES`, `TESTIMONY_GRADE`, `isMachineIdentity`, `isPublicHttpsLocator`, `OBSERVATION_STATES`"). R3 is ambiguous for falsy non-`false` `authored` values (`0`, `""`, `"no"`): the fence treats any value other than absent/null/false as a claim (C-53.8); left as is, unasserted.

**Found in other modules / artifacts:**
- `agent-worker/dist/agent-worker.bundled.mjs` staled (inputs `bio-checks.mjs`, `provenance/checks.mjs`, `provenance/index.mjs`); bio-plane dist and `newgroup` release source likewise. Regenerate at the layer close (§14).
- The catalogue's `BASIS_VERSION_CHECKS` header says "on VERSION_CHAIN_CHECKS' precedent above": the family is no longer above (legacy-checks' next job).
- membership: 3 module tests (R83, R79, and promotion's R39/R45/R46 over MODULE_ORDER) fail against `modules.json`, also on `origin/tranche/T18` itself (measured in a clean worktree: membership 2 fail).

**Tests and checks run:**
- `node --test test/m/provenance/`: tests 95, pass 95, fail 0.
- membership, promotion, record-core, control-plane, ratification, affordances, instance-setup, filings, capture: tests 759, pass 756, fail 3 (the membership order failures above, not this job's).
- `format`: 0 failures · `architecture provenance`: 17 product files, 0 failures · `coverage provenance`: 51 of 51 live ids, 0 failures · `ownership provenance tranche/T18`: legacy-checks +0/−357, legacy-store +0/−10, legacy-index +5/−53, 0 failures.

Size (session_01Rbs8QkxyTpLKJbAeaFkrcp): test runs 9, module lines 3714
