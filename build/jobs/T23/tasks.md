# tasks (T23)

**Status** · session_01VqVrXMfs3gGwxaoiG2Vk4Z · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** N497 (K1087, K1099; N469's rule), with K1138's re-scan:
- `bio-plane/test/m/tasks/grammar.test.mjs`:30 registers `producingGroup` under `instance-setup`, the module that registers it live (`bio-plane/src/setup.mjs`:1940), no longer under the retired `legacy-store`. No assertion changed.
- `bio-plane/src/tasks/index.mjs`:22 and :695: the ops are spread by control-plane's routes (`control-plane/dispatch.mjs`), no longer "the legacy store's dispatcher".
- Re-scan, same kind, re-worded (K1138): `index.mjs`:15–16 and :663–668 said queue still held the `tasks` table "until its job removes its copy"; queue now reaches tasks through `tasksOf`, so both are in the past tense. The guard they describe is unchanged and still tested (`inbox.test.mjs`, R8, whose title now says "as queue did in N363's coexistence"). `index.mjs`:115–118 (D-109) said the drain used "the SAME alarm the selection sweep uses", proved by `#armSweep`, which no longer exists; it now names the scheduler's one alarm and puts `#armSweep` in the past.
- Kept as provenance notes: `checks.mjs`:66 (moved from the catalogue) and :69 (legacy-checks' private `f`, as BOB's START names); `grammar.test.mjs`:3 (the retired `test/inbox.test.mjs`). No note of this module names `tools/`, `legacy-tests` or a T20-deleted file.

**Deferred.** None.

**Found in other modules (not changed; for BOB).**
- Generated artifact: the re-worded notes under `bio-plane/src/tasks/` stale the plane's bundle (`bio-plane/dist/bio-plane.bundled.mjs`); nothing regenerated (accepted red 12 until the layer's close).
- Possibly N469's kind elsewhere, seen while grepping, not checked against their dispatch: notes calling their ops "entries of the legacy store's op map (its dispatcher spreads them in)" in `credentials/index.mjs`:669, `host-governor/index.mjs`:266, `extraction/index.mjs`:1474, `citation/index.mjs`:736, `actions/index.mjs`:2368.

**Tests and checks.**
- `node --test bio-plane/test/m/tasks/`: tests 71, pass 71, fail 0.
- `node --test bio-plane/test/m/`: tests 5183, pass 5167, fail 5. All five are accepted by name: `control-plane/families.test.mjs`:47 (K1150, until control-plane's merge), `control-plane/inbox-door.test.mjs`:81 (red 9), `plane/worker.test.mjs`:39 (red 6, plane share), `queue/catalogue.test.mjs`:34 and :116 (red 13). (The other 11 are todo; none skipped or cancelled.)
- `checks/format.mjs`: 87 modules, 86 requirements files; 0 failures.
- `checks/architecture.mjs tasks`: 8 product files, 31 relative imports; 0 failures.
- `checks/coverage.mjs tasks`: 11 of 11 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs tasks tranche/T23`: 0 failures (re-run after the commit, below).

Size (session_01VqVrXMfs3gGwxaoiG2Vk4Z): test runs 2, module lines 955
