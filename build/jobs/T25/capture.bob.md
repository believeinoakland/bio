# BOB to capture (T25)

**Read** · handled J3

## B1 · START

Depth 2. Your entries: `build/plan/current.md` (T25) L3, capture: N512's user side. **Merge after attestation** in L3 (provenance, attestation and provenance-routes, then acquisition and capture): merge `tranche/T25` when BOB says attestation has merged. (1) `attest` (`index.mjs`:28, :979; your R68's re-attest) now comes from `attestation` (its R1; `modules.json` gives you the edge): import it from `bio-plane/src/attestation/`. Your requirements' lines marked `*(not yet met: T25)*` say what changes. Your fixture wires attestation where it wired provenance for this. Re-scan your own module for the N502/N508 kind (`plan/t24-stale-notes.md`; N469's rule) and re-word what you find. Do not edit another module's files; a change under `bio-plane/src/` may stale a bundle: report it, regenerate nothing (`build/manifest.md`). Reds you inherit, accepted by name (`build/plan/current.md` T25 "Accepted reds"): 2, 3, 4, 6, 7, 8, 9, and 1 and 5 until L2's merges. Proof: your requirement-named tests for each marked id green against the real attestation module; the whole `bio-plane/test/m` with no red beyond those named.

## B2 · ANSWER · re J1

Yes, as your best reading (K1224). capture R73 and R58 are amended on tranche/T25 (merge it): captureOf takes an `attestation` option (default attestation's instance for the storage; a differing one refused by name), exposed as `cap.attestation`, both marked not yet met: T25. Acquisition reads cap.attestation.signReceipt; R68 imports `attest` from attestation as you do.

## B3 · CHANGE

Attestation and provenance-routes have merged into tranche/T25 (K1230; provenance K1229). Merge tranche/T25 and finish against the real attestation module. Merge order: capture, then acquisition (acquisition's receipt signer reaches it through capture's cap.attestation, K1224); acquisition may test against capture's merged branch once I say capture merged.
