# text-chain (T22)

**Status** · session_017vtxc1g46pax3uvWUKZx2s · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1, `build/plan/current.md` T22 layer 1). Comments only; no behaviour changed.
- **(1) N471.** `textchain.mjs`:425, C-35's minting note, now past-tense provenance: "minted with the old process's `node tools/mintid.mjs C` (floor C-34; that tool was retired in T19)".
- **(2) N480.** Every named line re-worded to what is true: :100 (the OCR decision is extraction's, `bio-plane/src/extraction/pipeline.mjs`; it was the wire's in the plane's old `index.mjs`); :1754–:1755 (`mergeTier3Text`, then in the old `index.mjs`, extraction's `pipeline.mjs` now); :1782–:1788 (`needsTier2` is extraction's; the note that `mergeTier2Text` was "NOT WIRED" and its call sites `index.mjs`'s was false: `pipeline.mjs` now calls `mergeTier2Text` and `tier2Note`, so it says it was not wired when it landed and is wired now, by extraction); :1843–:1857 (the corrected D-514 paragraph: one parenthesis says every `index.mjs` there is the plane's old one and both functions are extraction's now, and each list item reads "then `index.mjs`, extraction's now"; the quoted old sentence is kept as the quotation it is); :1869 (`tier-pagewise.test.mjs` was deleted in T17; the note now says the suite states the award's cases with its own literal texts, as that deleted file's note did, and that its measurement survives as extraction's `tier-pagewise.probe.mjs`, which is a probe and imports the rule).
- **Re-scan of my path** (every file name in `textchain.mjs` checked against the tree): one more note named a deleted file as live (N469's kind), :1315, "the same rule `schema.mjs` states": the plane's `schema.mjs` was deleted in T19 (c7071c3769); now "the plane's old `schema.mjs` (deleted in T19) stated". Every other file named exists (`pdf-worker/src/index.mjs`, `tier2-wire.test.mjs`, `query.mjs`, `calibration.mjs`, `pdfstructure.mjs`, the `docs/` files); provenance notes stay.

**`not yet met` marks:** none carried, none added.

**Deferred:** none.

**Other modules (REPORT J1):** `bio-plane/dist/bio-plane.bundled.mjs` and `.bundle.json` (`not_product`) stale: `src/textchain.mjs` changed (comments only). Not regenerated.

**Tests and checks:**
- `node --test test/m/text-chain/` (in `bio-plane/`): tests 112, pass 112, fail 0
- `node --test test/m/` (in `bio-plane/`): tests 4815, pass 4793, fail 2, skipped 0, todo 20; the 2 are the accepted membership R83 (`module-order.test.mjs`) and R79 (`t9-notice-sight-bounds.test.mjs`); test-support R2 passed here. No new red.
- `node checks/format.mjs`: 85 modules, 84 requirements files; 0 failures
- `node checks/architecture.mjs … text-chain`: 10 product files, 15 relative imports; 0 failures
- `node checks/coverage.mjs … text-chain`: 103 of 103 live requirement ids named by a test; 0 failures
- `node checks/ownership.mjs … text-chain tranche/T22`: 1 files changed; 0 failures

Size (session_017vtxc1g46pax3uvWUKZx2s): test runs 2, module lines 2032

## J1 · REPORT

Generated artifact staled: bio-plane/dist/bio-plane.bundled.mjs and .bundle.json (not_product): src/textchain.mjs changed (comments only). Not regenerated.
