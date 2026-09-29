# ratification (T11)

**Status** · session_01TrJPeeGe3xdCv9sCLy1TBh · depth 2 · WORKING · handled B2

## Completion

**Entries applied.** N256 (ratification's share; K283). R5: the commit hands `commitEdition` the edges `publishedGraphEdges` classifies from the signed bytes, and its and the Worker's comments now state the rule as R5 and publication R22 word it (`serve` only to a published target; a reference to a target not yet published is held privately, its id never published, and becomes `serve` when the target is published) in place of "dropped". Tested live: a finding's reference to unpublished evidence puts nothing naming that evidence in the published graph (`published_edges`, `publishedManifest`, `publishedList`, `publishedEditions`). R16's end-to-end arm is written in full over the same classification (finding first, its evidence after: the held reference turns `serve`, a division's name edge stays, neither edition otherwise changes, a retry turns nothing twice) and is a `test.todo` until publication's N256 share merges: it fails today only because publication's `publishEdges` drops the reference. When publication merges, the `.todo` comes off (a one-word change in `ratify-op.test.mjs`).

**Not yet met marks.** R16's `not yet met: K102` stays until publication holds the reference; nothing this job met carries a mark.

**Deferred.** None of this module's own. R16's live arm waits on publication (above).

**Found in other modules.** None new. Publication's R22 held reference (N256, its share) is what R16 needs; it is in publication's own entries this layer.

**Generated artifacts.** None made stale: no bundled member includes `bio-plane/src/ratification/` (the plane's bundle is rebuilt by BOB at the layer close).

**Tests and checks.**
- `node --test test/m/ratification/` (in `bio-plane/`): tests 67, pass 66, fail 0, todo 1. No layer tests (manifest). No provided service changed.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs ratification`: 11 product files, 45 relative imports; 0 failures.
- `checks/coverage.mjs ratification`: 16 of 16 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs ratification tranche/T11`: 4 files changed; legacy-store, legacy-checks, legacy-index 0 lines added, 0 removed; 0 failures.

Size (session_01TrJPeeGe3xdCv9sCLy1TBh): test runs 3, module lines 3039

## J1 · COMPLETE

N256 (my share) applied: R5's held reference stated and tested live (a reference to unpublished evidence never enters the published graph); R16's end-to-end arm written in full as a test.todo, failing today only because publication's publishEdges drops the reference; drop its .todo once publication's N256 share merges (send me a CHANGE and I will). Tests 67: 66 pass, 0 fail, 1 todo. format, architecture, coverage (16/16), ownership: 0 failures. Nothing stale, nothing new to report. Record: build/jobs/T11/ratification.md.

## Completion (B2, CHANGE)

**Applied.** Merged `tranche/T11` (publication and reevaluation merged early, K365). (1) The fixture passes `reevaluation: { registerCaseParts: () => ({ ok: true }) }` in publication's deps, so publication's R41/R43 registration (K359) no longer creates a real reevaluation on the test host. (2) R16's end-to-end arm is live: a finding's reference to unpublished evidence is held privately (never in the published graph, R5), and publishing the evidence links it `serve` (`heldLinked: 1`), a division's name edge stays, neither edition otherwise changes, and a retry turns nothing twice.

**Not yet met marks.** R16 now holds; its `*(not yet met: K102)*` mark and the header's "Not yet met: R16" are in `build/requirements/ratification.md`, which is not this job's to write: for BOB to strike.

**Tests and checks.**
- `node --test test/m/ratification/` (in `bio-plane/`): tests 67, pass 67, fail 0, todo 0.
- `checks/format.mjs`: 69 modules, 64 requirements files; 0 failures.
- `checks/architecture.mjs ratification`: 11 product files, 45 relative imports; 0 failures.
- `checks/coverage.mjs ratification`: 16 of 16 live requirement ids named by a test; 0 failures.
- `checks/ownership.mjs ratification tranche/T11`: 5 files changed; legacy-store, legacy-checks, legacy-index 0 lines added, 0 removed; 0 failures.

**Correction to the first completion.** "Generated artifacts: none made stale" was loose: `bio-plane/dist/bio-plane.bundled.mjs` is built from the plane's source, which includes this module, so the comment edits stale its bytes. BOB rebuilds it at the layer close; nothing else is affected.

Size (session_01TrJPeeGe3xdCv9sCLy1TBh): test runs 5, module lines 3039
