# leg-earning (T34)

**Status** · session_01FTMB4PQTNsZdpTB6CYLNQL · depth 2 · WORKING · handled B1

## Completion

**Entries applied.** T34-86 (DEC-149's L6 share; K1784, K1797): every member-facing string in `index.mjs` that called the group's Civicsmith "this instance" or "this plane" now says "your group's Civicsmith". BOB's grep named :715 and :725; reading the module whole found four more of the same kind, applied under the entry's "every member-facing string": the unreachable-grade `ceiling` sentence (:616, and its copy in R8's `#standardCeiling`, :785, "which this plane cannot produce") and case 1's and case 3's fetched-ceiling `why` (:648, :705, "the bytes as this instance fetched them"). The comment at :641 ("the strongest capture this plane produces") is not member-facing and stays. No meaning changed; no requirement changed.

**Tests.** New `test/m/leg-earning/words.test.mjs`: R1 (DEC-149) drives each capture case that writes a changed sentence (publisher-typed, measured transcription bound by the bytes, archive replay bound by the route, transcription bound by fidelity) and checks each `why` and the `ceiling` whole, and that no string field says "this/the instance|copy|plane"; R8 (DEC-149) the same for a held and an absent standard's `ceiling`. Both fail on the code before the change (checked: 0 pass, 2 fail) and pass after. `earned.test.mjs`'s doorbell test's negative check `/as this instance fetched them/` would have gone vacuous; it is now `/fetched them/`, holding the same meaning against the new wording.

**Deferred.** None.

**Found in other modules** (reported, J1):
- `inquiry` `test/m/inquiry/earned.test.mjs`:29 asserts `doesNotMatch(/as this instance fetched them/)` on leg-earning's `why`; after this change it can never fail (vacuous). Suggest `/fetched them/`, as here.
- `provenance` (L3, closed) `index.mjs`:899, :905: `captureGrade`'s `why` says "this instance fetched these bytes …", a member-facing string in DEC-149's sense not in any T34 share; for N664's T35 list.
- Generated artifacts made stale (mechanics §14): `bio-plane/dist/bio-plane.bundled.mjs` and `release/bio-plane.bundled.mjs` hold the old wording of these strings; BOB regenerates at the layer close.

**Ran.** `node --test test/m/leg-earning/`: tests 47, pass 47, fail 0. Users of the module (wording only, run anyway): inquiry tests 159, pass 158, fail 0 (one not run, as before); strength 138/138; action-plans 61/61. No layer tests are named in `build/manifest.md`. Checks: format "126 modules, 125 requirements files; 0 failures"; architecture "9 product files, 44 relative imports …; 0 failures"; coverage "12 of 12 live requirement ids named by a test; 0 failures"; ownership "0 failures".

Size (session_01FTMB4PQTNsZdpTB6CYLNQL): test runs 6, module lines 1349

## J1 · REPORT

Found outside leg-earning while applying T34-86 (details in my record's Completion): (1) inquiry test/m/inquiry/earned.test.mjs:29 doesNotMatch(/as this instance fetched them/) on leg-earning's why is now vacuous; suggest /fetched them/. (2) provenance (L3, closed) index.mjs:899, :905 captureGrade why says 'this instance fetched these bytes' — member-facing, DEC-149, no T34 share; for N664's T35 list. (3) Stale generated artifacts (§14): bio-plane/dist/bio-plane.bundled.mjs and release/bio-plane.bundled.mjs carry the old wording. Also: BOB's grep named :715, :725; four more of the same kind in leg-earning (:616, :648, :705, :785) were applied under the entry's 'every member-facing string'.
