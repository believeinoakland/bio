# public-read (T18)

**Status** · session_01KuKtDiAMFXmj1s5RCFABoB · depth 2 · WORKING · handled B1

## Completion

**Entries applied** (`build/plan/current.md` layer 8, public-read; K651, rule (10)):
- **The split by copy** (no `from` for the store side; K624 (1)): `registerEvidenceBlock`, `#evidencePackage`, `publishedManifest`, `#frozenPairsByCase`, `verifySha`, `publishedList`, `publishedEditions`, `publishedCase`, `#deliveredBy`, `#looseEditionState`, `#resolveOneCase`, `#casesOfSha` (with their comments) copied from `publication/index.mjs` into `bio-plane/src/public-read/index.mjs`, as `PublicRead` with `publicReadOf(host, {publication})` and `publicReadOps` (`publishededitions`, `publishedcase`, `publishedmanifest`, `verify`, `publishedlist`). It reaches publication only through R53–R55 (`caseEditionState`, `soleCase`, `caseDocMemberFrozen`), `checks.mjs`' `rowOf`, `deliverer.mjs`, and R40's tables read in its own SQL; it owns no table and writes nothing (R16, tested with a proxy on publication). Nothing in `publication`'s paths was edited.
- **The legacy-index map's §4.4 move** (K649 (7); §12.2, `from` legacy-index): `verify` and `publishedmanifest` arms, the REC-22 note, and the `publishedcase`/`publishedbytes` dispatch line moved from `src/index.mjs` into `bio-plane/src/public-read/door.mjs` (`publicReadDoorOp`, the door's helpers handed in as `capturePublicOp`'s are); `index.mjs` has one import and one dispatch line in their place, and its `publishedRoutes` import is dropped (net: 2 lines added, 65 removed). `bindPublishedPlane`'s hand-over stays the door's.
- **Tests** copied and renamed into `bio-plane/test/m/public-read/`: `worker.test` (R5–R7), `relay.test` (R9), the R8–R11/R25–R28/R36 arms of `published.test` and the R34 arm of `invariants.test` (R1–R4, R8, R10–R16), and the R10 arms of `tensions.test` and `sources.test` (R3's tensions and `/5` blocks). The Worker tests' stub store is the op map as it will stand after publication's merge (`publicationOps` with `publicReadOps` beside it). New: `door.test` (the moved arms).
- **Converts** (ten, each one file `convert-<suite>.test.mjs`, the old suite not deleted, K619): `fence` (R1), `publish` (R2), `caseflip` (R3, R1, R4), `caseobject` (R4), `d442-publish-writes-nothing` (R3, R6), `casesign` (R6 with a real `ssh-keygen -Y verify`, R3), `ratify` (R1), `deliverer` (R2, R3, R6), `multifinding` (R3, R6, R4), `publishedcase` (R3, R5, R6). Shares not converted, each another module's: casesign's C-58.2 at ratify (ratification), deliverer's `deliveringPrincipal` source arms, multifinding's `op=ratify` answers and C-21.1 block, publishedcase's control-plane 401 arms and source-text arms. `publishedManifest` carries no `delivered_by` (R4 names none); deliverer's "on the manifest" is proved on the served case manifest and the container.
- **N242's share** (`plane().json(` hides `noPublishedPart` from the verdict reader, `worker.mjs`): already met by N297: `noPublishedPart` (`publication/worker.mjs`:88) answers the refusal itself and its one caller (:421) wraps it; pinned by the R5 arm (`noPublishedPart("x").ok === false`).
- **Rows:** no catalogue row moved or changed (C-44.2, C-68.5, C-98 stay in publication's table until T19), so none is `awaiting stamp`. No `not yet met` mark in this module.

**Deferred:**
- The R3 grammar readers (`caseTensionsOf`, `caseDocumentBlocks`) are imported through `publication/index.mjs`' re-export, since `case-grammar` runs concurrently and is not merged (rule (10)); publication keeps re-exporting them unchanged after its job, so this holds. Re-pointing them to `case-grammar` directly goes with this module's next job (T19), with the Worker files' move.

**Found, for BOB:**
- `publication`'s job: the copy holds two DEC-49 regions twice (`is-not-published`, `is-finding-in-several-cases`) until publication deletes its copies this layer; the guard runs only at the release (K619).
- Old suites that read `src/index.mjs`' text for the moved arms (e.g. `preauth-vocabulary`, `auth-surface`) may no longer find them there; they stay unrun (K653).
- Generated artifacts: none made stale (no bundle takes `src/index.mjs`, `public-read` or the publication files as input).

**Tests and checks:**
- `node --test bio-plane/test/m/public-read/`: tests 65, pass 65, fail 0.
- `test/m/` less public-read (every module, after the `index.mjs` edit): tests 3822, pass 3798, fail 2 (conformance R10 K680, R36 K658: the layer-7 baseline).
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … public-read`: 19 files, 0 failures. `checks/coverage.mjs … public-read`: 16 of 16, 0 failures. `checks/ownership.mjs … public-read tranche/T18`: 21 files, legacy-index 2 lines added (the import and the dispatch line), 65 removed, 0 failures.

Size (session_01KuKtDiAMFXmj1s5RCFABoB): test runs 16, module lines 1024
