# inquiry (T17)

**Status** · session_016XUVGj1ZVAVNGZpyXcL8vh · depth 2 · COMPLETE · handled B1

## J1 · COMPLETE

Commit `62f3a7a12c` on `job/T17/inquiry`.

**Entries applied.** N393 (K573): `bio-plane/test/content-capture-bound.test.mjs` converted into `bio-plane/test/m/inquiry/capture-bound.test.mjs` (13 tests, each naming R13, R6, R14, R15 or R32 in its title), over the old suite's corpus (a publisher-typed document, one OCR'd at C, one OCR'd at A, one with an unmeasured transcription, one never read), each chain written as a reading through extraction's own promotion projection (its R19, R20), each receipt through provenance, each leg through a real promotion. The fixture (`fixture.mjs`) now joins extraction to the promotion and takes a per-capture `chain` on `doc()`; no existing test changed behaviour.

**Which old assertions each new test carries.**
- §0 (the ground, the non-empty corpus): "R13 the corpus", plus extraction's three text-source rows for four read documents (§6's row count).
- §1 (the write: B refused C-2.8 naming both letters and the doctrine, C lands, D lands) and §3's pair (read letter = write-accepted letter): "R6 the write".
- §2's read half (present, null grade, `determined: false`, `CAPTURE_FIDELITY_UNMEASURED`, the empty level named, one capture): "R13 every transcription unmeasured". §2's write half (any letter refused C-2.8 as `UNDETERMINED, not <letter>`, never 'no capture held'; both repairs; no grade lands, the leg named and ungraded): "R6 R32 an unmeasured transcription", widened from B to every letter.
- §3 (the read: C, `CAPTURE_BOUNDED_BY_FIDELITY`, the why's two letters, the unreachable ceiling, through `earnedBasis`): "R13 R15 a document OCR'd at C" and "R15 earnedBasis".
- §4 (measured at A stays at the byte grade with no `bounded_by`; A refused; both directions): "R13 the weakest link both ways" and "R6 fidelity never raises".
- §5 (publisher-typed and never-read text earn the ceiling, its key set, B lands; the route-unrecorded `stated_as`/`route_basis`): "R13 over-strictness" and "R6 over-strictness".
- §6 (the census rule recomputed from `transcribed`/`derivation_cap` agrees with the registry for every document): "R13 the census's equivalence", reading extraction's `transcribedDocuments` (its R29) at its interface.
- New, which the old suite said it did not drive: a document with several captures ("R13 several captures": one measured transcription determines the ceiling; the strongest capture bounds the document), and R14's `legCapped` over the fidelity-bound and undetermined entries.

**Not carried, with why.**
- §7 (`op=versionstrength` says the unmeasured fidelity, not 'holds no captured bytes'): it is `strength`'s version-leg sentence (`src/strength/index.mjs`:388), not an inquiry interface. See Found below.
- The header's five negative-control arms (`nc-rec88.mjs`) and the digest probe (`rec88-baseline-probe.mjs`) edit source: dropped as instructed (P7). The retired PRISTINE digest pin stays retired (K457). The old suite and its helpers are left for legacy-tests.

**Deferred.** Nothing in this entry. N405 (the migrated `surfaced_in` decoration, K593) is not in my START or the plan's layer-6 entry, so I left it.

**Found in other modules.** `strength`: its version legs' capture arm has two empty levels (R13's undetermined entry and no bytes held); `test/m/strength/version.test.mjs`:137 drives only 'holds no captured bytes', and `pair.test.mjs`:35 drives the undetermined arm with a stand-in ceiling for the pair, not for a version leg. The old suite's §7 is the only test of the version-leg sentence for an unmeasured transcription; strength's conversion should carry it before legacy-tests deletes the old suite.

**Tests and checks.** `node --test test/m/inquiry/`: tests 92, pass 91, fail 0, todo 1 (R31, not yet met: MK-5). No layer tests named in the manifest; no service changed. `format`: 72 modules, 67 requirements files; 0 failures. `architecture inquiry`: 17 product files, 56 relative imports; 0 failures. `coverage inquiry`: 48 of 48 live requirement ids named by a test; 0 failures. `ownership inquiry tranche/T17`: 3 files changed; legacy-store 0 added, 0 removed; legacy-checks 0/0; 0 failures.

Size (session_016XUVGj1ZVAVNGZpyXcL8vh): test runs 6, module lines 228
