# affordances (T25)

**Status** · session_01X8od5dcSEoHd7paZCEK1Jv · depth 2 · COMPLETE · handled B1

## Completion

**Entries applied** (B1 START; `build/plan/current.md` T25 L11, N512's test side):
- **`sources.test.mjs` R2 reattest** (red 7's affordances share): since N512 capture R68 asks attestation's `attest`, so the stand-in `provenance(…, {attestAnswer})` no longer reached anything. The test now drives the re-attest through a scripted network, as capture's R68 tests do (`network`, `granted` from capture's fixture): a request carrying the digest's raw bytes is granted a token bound to it. It asserts the authority was asked over this digest, the late `timestamp` outcome (`ok`, `late`, its `proves` sentence) and the `rfc3161` attestation over the capture. The endpoints are `signatures`' (not in my uses), so requests are recognised by what they ask, not by address.
- **`catalogue.test.mjs`, new test "R1 R2 R3 R5 R7 R12 (N512)"**: `provenanceRouteOps`' three ops (provenance-routes R9) keyed to its own op map. `provenancechain` and `provenanceroute` keep `substrate` and their `document-directed:` reasons. `provenanceroutes` is a read with no `NEEDS` row and is named nowhere. `attest`, answered by attestation's `attestOp`, keeps `attested`, its capture-directed reason and its CAPTURE_ACTS row with ATTEST_FENCE. With the control plane's rows nothing is unaccounted. Negative controls: a gated read reads unpublished, rowless writes read stale, and an unnamed op reads unpublished and unranked.
- **START's `catalogue.test.mjs`:958 and `backing.test.mjs`**, as found: no affordances test reads C-34's or C-89's rows, and none read `provenance/checks.mjs` for them. The one provenance checks import, at :1019 now, reads `TESTIMONY_NO_WORDS` (C-53.3), which stays provenance's. No `backing.test.mjs` world reaches `provenance_route_marks`, `receipt_keys` or `signed_receipts` (`testify` writes the register and the bundle only). Both files were green at the start, so neither needed a change for red 8; the C-34/C-89 shares of red 8 are control-plane's (`families.test.mjs`:47, `catalogue-end.test.mjs`:15, below).
- **N502/N508/N512 re-scan of the module and tests:** `affordances.mjs`'s `reattest` rung note said "through provenance's `attest`" and "(provenance.attest)". Both now name attestation's (N512). No `awaiting stamp` note, and no legacy store or legacy-index named as live. History notes (the REC-35 paragraph; `catalogue.test.mjs`'s "legacy-store's N216", `ops.test.mjs`'s "N13's share") are left in the past tense.

**Deferred:** none.

**Found in other modules:**
- **Plane bundle stale:** `bio-plane/src/affordances.mjs` (comment only) is an input of `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`). Nothing regenerated.
- **Reading of my step 2:** I read the requirements, the layer-11 contract, the source files (`affordances.mjs`, `door.mjs`, `facts.mjs`) whole, and the public parts of the two new uses (attestation, provenance-routes). I read the test files in the parts this entry touches, not every Use's public part (39 modules, ~690 KB). The entry changes no service I use or provide.

**Tests and checks:**
- `node --test bio-plane/test/m/affordances/`: tests 148, pass 148, fail 0 (before: 147, 146 pass, 1 fail, `sources.test.mjs`:117).
- Whole `bio-plane/test/m`: tests 5333, pass 5319, fail 3, todo 11. All three are accepted reds:
  - control-plane `catalogue-end.test.mjs`:15 (`CAPTURE_HELD_IN_PARTS lost its row`, C-89.1: red 8, control-plane's).
  - control-plane `families.test.mjs`:47 (`CHECK_FAMILIES` lacks C-34's/C-89's files: red 8).
  - promotion `write-path.test.mjs`:218 (`no such table: provenance_route_marks` on `op=list`: the plane does not yet migrate provenance-routes, red 9).

  No red beyond those named.
- Checks: format, 91 modules, 90 requirements files, 0 failures. Architecture, 13 product files, 137 relative imports, 0 failures. Coverage, 32 of 32 live requirement ids named by a test, 0 failures. Ownership, 4 files, 0 failures.
- Red 6: no catalogue row added or changed, so none is `awaiting stamp`.

Size (session_01X8od5dcSEoHd7paZCEK1Jv): test runs 5, module lines 4
