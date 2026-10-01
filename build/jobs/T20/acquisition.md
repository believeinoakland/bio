# acquisition (T20)

**Status** · session_0168H7EAyX21CBeSgd7swg8h · depth 2 · COMPLETE · handled B0

ACQUISITION #3, T20 layer 3. Started from `tranche/T20` @ 76a95e8021, merged `tranche/T20` @ ea33764093 (the plan's Jobs line and my START) before building.

## Entries applied

- **K850 / K873 (B1): C-68.1 minted at one site.** `bio-plane/src/acquisition/index.mjs` exports `evidenceStorageAbsent(op, error, {code = true})`, the one `is-storage-absent` region, reading `INSTALLATION_CHECKS` for the row and answering `{status: 503, body}`. With the default it answers the door's body exactly as control-plane's `storageAbsent` gives it today (`{ok, reason, code, check, translation, error, op}`, keys in that order); with `{code: false}` it answers `acquire`'s body unchanged (`{ok, reason, check, translation, op, error}`, no `code`). `acquire` now raises through it; its own region is gone, so the module holds exactly one. One export gives both bodies unchanged, so no QUESTION was needed. **For control-plane's L11 job:** `storageAbsent(op, error)` becomes `const a = evidenceStorageAbsent(op, error); return json(a.body, a.status);` (imported from `../acquisition/index.mjs`), and its own region and the `INSTALLATION_CHECKS` arm of `installationRow` are deleted.
- **The row's `where` moved with the region:** `src/acquisition/index.mjs acquire > is-storage-absent` became `src/acquisition/index.mjs evidenceStorageAbsent > is-storage-absent`, with its number and translation unchanged. This row change is `awaiting stamp` for T21 (current.md rule 4). The comment on `INSTALLATION_CHECKS` in `checks.mjs` was re-worded: the catalogue's copy is gone (K855), and the row now has one raiser that both callers call.
- **R29's C-68.1 clause, marked "not yet met: T20 layer 3", is met by this job's share.** Its tests (`test/m/acquisition/checks.test.mjs`): "R29 (C-68.1, K850): the exported raiser answers the door's body …" (byte-for-byte and in key order, for `capture`, `pdfstructure`, `acquire` and `attest` with each site's error, and `{code: false}`); "R29 (C-68.1, K850): acquire without evidence storage answers as before, byte for byte, …"; "R29 (C-68.1, K850): the module's source holds exactly one is-storage-absent region, inside evidenceStorageAbsent, …"; and the table test, whose `where` assertion is updated to the new region. The door's half (re-pointing `storageAbsent`) is control-plane's L11 job, so BOB strikes the mark when both halves have merged.

## Deferred

None.

## Found in other modules (REPORT J2)

1. **capture** (`bio-plane/src/capture/index.mjs`:605–:610, `pullKnock`). This is a third place that answers C-68.1. It reads acquisition's row and builds its own body: `{ok, reason, code, check, translation, status, knockId, detail}`, with no DEC-49 region and no `op` or `error`. Its body differs from both of the raiser's, so it cannot call the export without its answer changing. That change is BOB's call, measured against acquisition R29 ("minted at one region") and capture's own answer.
2. **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (owned by `not_product`, built from the plane's source) still carries the old `where` and `acquire`'s inline region. It is regenerated at the layer's close (manifest, Generated artifacts).
3. **acquisition's Provides** does not name `evidenceStorageAbsent`, though R29 says the module exports a raiser. A Provides line for it (signature and both bodies) is BOB's wording to add.

## Tests and checks

- `node --test test/m/acquisition/` (in `bio-plane/`): **59 pass, 0 fail** (56 before, plus 3 new).
- Every module that uses acquisition, plus control-plane (whose door is the other caller), all green: capture 94/0, control-plane 85/0, capture-requests 63/0, extraction 162/0, ratification 181/0, monitoring 72/0, instance-setup 85/0. `build/manifest.md` names no layer tests.
- `format`: 84 modules, 82 requirements files, 0 failures. `architecture acquisition`: 9 product files, 37 relative imports, 0 failures. `coverage acquisition`: 30 of 30 live ids named by a test, 0 failures. `ownership acquisition tranche/T20`: 0 failures (re-run after commit, below).

Size (session_0168H7EAyX21CBeSgd7swg8h): test runs 8, module lines 1281

## J1 · REPORT

Found in other modules (record, 'Found in other modules'): (1) capture's pullKnock (src/capture/index.mjs:605-:610) is a third C-68.1 minting site with its own body {ok, reason, code, check, translation, status, knockId, detail} and no DEC-49 region; it cannot call evidenceStorageAbsent without its answer changing, so whether and how it re-points is yours, against acquisition R29's one region. (2) Stale generated artifact: bio-plane/dist/bio-plane.bundled.mjs (not_product) still carries the old where and acquire's inline region; regenerate at the layer close. (3) acquisition's Provides does not yet name evidenceStorageAbsent(op, error, {code = true}) -> {status: 503, body}; a Provides line is your wording.
