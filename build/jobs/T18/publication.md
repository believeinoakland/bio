# publication (T18)

**Status** · session_016L4akyaRuDoRatLzkuhVNa · depth 2 · COMPLETE · handled B2

## Completion

**Entries applied** (`build/plan/current.md` layer 8, publication; B1, B2; K651, K671, K688, K690):
- **The split's deletion (K624 (1)).** Deleted from `publication/index.mjs` every range case-grammar, public-read and project-stage copied: the format block's copy in `checks.mjs`, `blocks.mjs`, `tensions.mjs`, `fmSafe`, `SECTIONS`, `REAUTHORABLE_SECTIONS`, `signedCitations`, the attribution renderers, `publishedGraphEdges`; `#evidencePackage`, `publishedManifest`, `#frozenPairsByCase`, `verifySha`, `publishedList`, `publishedEditions`, `publishedCase`, `#looseEditionState`, `#resolveOneCase`, `#casesOfSha`; the stage constants and `projectStage` with its five private methods; the ops `publishededitions`, `publishedcase`, `publishedmanifest`, `verify`, `publishedlist`, `projectstage`; and the moved tests (`stage.test`, `worker.test`, `relay.test`, the moved arms of `published`, `casedoc`, `sources`, `tensions`). `index.mjs` and `checks.mjs` re-export `case-grammar` unchanged (a test pins each name to the same binding). K690: `reauthorSection` now reads case-grammar's `SECTIONS`, and the case document's reads its `signedCitations`. K688: no copy of `projectStage` is left in publication, so no path reaches the code that threw. A 17-line named copy of `registerEvidenceBlock` is kept (K625) until filings re-points; publication's next job deletes it. `index.mjs` is 3,943 → 2,757 lines.
- **K671 (B1's note), not the plan bullet's `store.mjs` edit:** `store.mjs` is untouched. legacy-store spreads `publicReadOps` and `projectStageOps` in layer 10. Until then the store's own op map answers none of the six moved ops, so the live plane's `verify`, `publishedcase`, `publishedbytes`, `publishedmanifest`, `publishedlist`, `publishededitions` and `projectstage` answer `unknown op` through the store. `test/m/` was run whole: no module test reached them through the store, so nothing needed re-pointing.
- **Rows.** C-44.2's and C-98.8's `where` now point at `src/public-read/index.mjs` (**awaiting stamp** for T19's promotion job, rule (4)). No row moved.
- **R53–R55 and R40 as widened** are named by tests: `services.test.mjs` (R53 whole, including its one write; R54; R55) and `casedoc.test.mjs` R40 (the seven tables and their columns). R54 and R55 were hardened to "never throws" as worded (a non-array list; a document that cannot be read).
- **The legacy-index map's §4.4 move (K649 (7)).** The `caseflags` and `casedocument` arms moved into `bio-plane/src/publication/door.mjs` (`publicationDoorOp`). The door hands in its envelope helpers, the reader stamp and resolution (`readerOf`), the secret's hash (`sha256Hex`) and the signing statement (`NS_RATIFY`, `caseRatifyStatement`), so publication takes no new use, and keeps none of `signatures`/`ooxml` once BOB moves `worker.mjs`, `container.mjs` and `inband.mjs`. `src/index.mjs`: 2 lines added (the import and one dispatch line), 76 removed.
- **Converts** (each `test/m/publication/convert-<suite>.test.mjs`; the old suite is not deleted, K619):
  - `d442-publish-writes-nothing`: R12, `excludedby` once per case, at each case's edition.
  - `casesign`: R1/R29, standing on an unsigned document for an administrator, the MEMBER binding, invited and joined non-owners and agent credentials, and every stranger byte for byte.
  - `ratify-authority`: R38, rests-on is the serve edges (a `relates_to` counts, a prepared case contributes nothing); R7/R38, the reads C-58.3 is built on are byte-identical whether a hidden project prepared a case.
  - `ratify-envelope`: R15, the store half. The op answers every body with its own reason and never `MANIFEST_NOT_RECORDED`.
  - `reviewcopy`: R1, a grant secret through the door: a live holder reads; revoked, another edition or a wrong secret reads as a stranger; only the fingerprint crosses. Proved in `door.test.mjs`.
  - `deliverer`: R1, the founder's standing; R28, a legacy document's deliverer undetermined; R14/R27, the deliverer read from the column alone.
  - `mk6-bundle-names-no-author`: R17/R25/R40, the whole-population arm. After a real publication at each attribution level, no published row or answer names the member.

**A flaw fixed in this module (R15, R24), found by the ratify-envelope convert:**
- a same-hash `recordcasemanifest` retry overwrote the recorded manifest;
- a hash that is not a SHA-256 was recorded;
- odd-typed bodies threw.

Now a retry answers `existed: true` and writes nothing, and a malformed body is `MALFORMED`.

**Deferred:** none.

**Not converted, each another module's:**
- ratify-envelope's Worker half (a silence and "no put" in `assembleCaseContainer`) is public-read R6's.
- casesign's probe credential refusal is control-plane's scratch confinement: publication's `viewerPredicate` gives every machine class sight.
- source-text arms are not converted, as the rules require.

**Found in other modules and elsewhere (REPORT):**
- **filings:** four arms are red until its layer-9 re-point (accepted by name, K651): `packet.test.mjs`:163, and `reads.test.mjs`:58, :94 and :106.
- **ratification:** `ratify-op.test.mjs`:203–211 is red until its planned re-point to public-read (K651).
- **Legacy suites (K653), unrun:**
  - `test/ratify-authority.test.mjs` §8 counts `export function publishedGraphEdges(` in `src/publication/index.mjs`; it now reads 0 (re-anchor to `src/case-grammar/index.mjs`, K690).
  - Suites that read the moved code's text (for example `preauth-vocabulary`, `auth-surface`, `case-opened`, `multicase`) may no longer find it in publication or `src/index.mjs`.
- **Generated artifact:** the plane bundle (`bio-plane/dist/bio-plane.bundled.mjs`, `not_product`) is stale from this job's `src/index.mjs` and publication edits. It is regenerated at the layer close (§14).
- **Wording, for BOB:** publication has no requirement sentence saying "the member id is never published". The mk6 convert proves it through R17 (MK-7 §4), R25 and R40.

**Tests and checks** (on `job/T18/publication` @ fd76dc6da7, after merging `tranche/T18` @ ba630ce2da):
- `node --test test/m/publication/`: tests 92, pass 90, fail 0, todo 2 (R30, R32 not yet met).
- `node --test test/m/`: tests 3912, pass 3883, fail 7, todo 22.
  - 2 are the layer-7 baseline (conformance R10 K680, doorbell R36 K658).
  - 4 are filings' (K651).
  - 1 is ratification's `ratify-op` (K651).
- No layer tests are named in the manifest.
- `format`: 82 modules, 0 failures.
- `architecture publication`: 26 files, 77 imports, 0 failures.
- `coverage publication`: 41 of 41, 0 failures.
- `ownership publication tranche/T18`: 23 files; legacy-index 2 lines added (the import and one dispatch line), 76 removed; 0 failures.

Size (session_016L4akyaRuDoRatLzkuhVNa): test runs 16, module lines 4,807 (`publication/` 4,544 with `worker.mjs` 711, `deliverer.mjs` 55, `container.mjs` 195, `inband.mjs` 68; 4,050 without the three Worker files BOB moves)
