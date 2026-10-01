# run-productions (T20)

**Status** · session_01HvRgF9mFJPqWdxmYKyyNUa · depth 2 · COMPLETE · handled B1

## J1 · REPORT

Found outside run-productions (none changed by me):

1. **Stale generated artifact** (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (owner `not_product`, `build/manifest.md`) embed `src/run-productions/index.mjs`, which this job changed (added `RunProductions.COUNT_KEYS` and made `counts(hid)` answer per key). Regenerate at the layer close (`bio-plane/`: `npm run build`). No other listed artifact takes run-productions as an input.
2. **For plane's T20 job (L11):** register the export as `recordOf(ctx).registerCounts("run-productions", [...RunProductions.COUNT_KEYS], (hid) => runProductionsOf(ctx).counts(hid))` and drop `held.mjs`:76 (`prod`), :96 and :140. The key order then moves from the literal places to R63's registration order, which plane R10 allows.

## J2 · COMPLETE

**Entries applied** (`build/plan/current.md` T20 L6, run-productions, K842, K861; B1 START):
- **R20** (K861, plane R10): `RunProductions.COUNT_KEYS` (`["proposedReadings", "suggestRefusals"]`, frozen), the `COUNT_KEYS` pattern of ai-runs and record-core, and `counts(hid)`, shaped as record-core R63's: it answers exactly the listed keys, in order. `proposedReadings` is `proposed_readings` less the rows whose `COALESCE(bundle_id, '')` is in `hid`; `suggestRefusals` is `suggest_refusals` less the rows whose `COALESCE(target, '')` is in `hid`. A null `hid` counts whole. The SQL is the existing `counts` (the one plane's held copy calls at `held.mjs`:76) unchanged. The only change: a figure whose table cannot be read is now left out (so R63 answers it null, never zero) instead of throwing the whole answer. The module registers nothing itself. Header's range is now R1–R20. **R20 is met in run-productions.** Its "not yet met" marker is yours to clear, now or when plane registers it.
- R20's tests, `bio-plane/test/m/run-productions/counts.test.mjs`, on the module's own fixture (proposals and stored refusals made through `extractPropose` and `suggest`, plus rows naming a hidden project, a document and a question inside it, and a bundle no longer held). Each is checked against the figures computed from the rows in JS through membership's `inSight`, not against the module's SQL:
  - "R20: the exported figure source answers exactly its listed keys …": whole for a null hid; through `hiddenBundles(member:bob)`, a member outside the hidden project counts none of its rows; a participant and a machine credential count whole; a refused viewer counts only the row naming no held bundle; it follows the tables; it writes nothing; an unreadable table is left out, never thrown.
  - "R20 R17: registered through record-core R63 under this module's name …": the name and keys are free; through R63 it answers both figures as plane's copy counts them, through the caller's sight; an unreadable figure is null.
  - "R20 R17 R64: in purge's proof …": through a stats source shaped like plane's, `op=stats` goes through bob's sight; the proof is asked whole before and after purges of a hidden document, a hidden question and the whole store; `removed.suggestRefusals` is the difference.

**Deferred:** none.

**Found in other modules:** J2 (stale `bio-plane/dist/bio-plane.bundled.mjs`; the registration line for plane's T20 job).

**Tests and checks:**
- `node --test bio-plane/test/m/run-productions/`: tests 39, pass 39, fail 0.
- The modules that use the export or import the module: `test/m/plane/` and `test/m/record-core/` tests 120, pass 120, fail 0; `test/m/control-plane/` and `test/m/skills/` tests 124, pass 124, fail 0.
- `checks/format.mjs`: 84 modules, 82 requirements files; 0 failures.
- `checks/architecture.mjs … run-productions`: 8 product files, 41 relative imports; 0 failures.
- `checks/coverage.mjs … run-productions`: 20 of 20 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs … run-productions tranche/T20`: 3 files changed; 0 failures.

Size (session_01HvRgF9mFJPqWdxmYKyyNUa): test runs 5, module lines 1358
