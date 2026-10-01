# connections (T21)

**Status** · session_01SjaX9oR1AMtsgg4jw4qwcL · depth 2 · WORKING · handled B0

## Completion (CONNECTIONS #9)

**Entries applied.**
- **N459** (K903 (4), K905, DEC-36; R20): `backlinks` now answers `out_of_view: true` when a citer the viewer may not see was withheld, and only that. It is asked by one ungated `EXISTS` over the same `refs`–`bundles` join as the gated read, taking exactly the rows that read leaves out (`(gate) IS NOT 1`, so a gate answering NULL counts as withheld too). It is skipped for a viewer who sees every bundle. No id, title, type, state, relation or count of the withheld citer reaches the answer: two hidden citers answer byte for byte as one. The key is absent when nothing was withheld. R20's test in `test/m/connections/edges.test.mjs` is extended. Hidden-citer arm: `out_of_view === true`, C's id absent from the whole answer, the answer's keys exactly `backlinks, ok, out_of_view, target`, the visible citers unchanged, a second hidden citer changing nothing. Negative controls: `r` with every citer visible, a machine viewer, a project's owner who sees its edge, and a target no one cites (`{ok, target, backlinks: []}` exactly) carry no `out_of_view` key. The unseen-target arm now uses a project bundle hidden from bob. The mark met: **R20 *(not yet met: T21)*** (BOB strikes it at the merge).
- **N464 with N458** (K899 (1)): I re-scanned my paths first. The scan found exactly BOB's seven lines, and every other "bundle" is an identifier, SQL, a file name or a comment. Changes: `index.mjs` `backlinks`' `detail` "pass target=<record id>" (the argument name `target` stays); the `projectLinks` notes "not registered to a record" and "some record has registered … no record claims"; `NO_DOCUMENT`'s detail "the source record's document"; `themes.mjs` C-81.8's two details "record id". Re-keyed `edges.test.mjs` R25 and `converts-links.test.mjs` (both pinned "not registered to a bundle"). R20's test also pins the new `detail`.
- **N469** (K931): `pair.mjs`:10 dropped the claim that `civicos-ui/check-refusal-codes.mjs` matches the helper. It now points at R35's test in `converts-position.test.mjs`, which checks each refusal's row. `schema.mjs`:170 "hygiene.test.mjs holds the list" now names `derive.test.mjs`' R36 test, which proves `connection_dirty` is whole-store only. The converted-from headers stay as listed. My re-scan of my paths found more stale live claims:
  - `checks.mjs`:322 ("DEC-49's guard judges", the deleted runner) re-worded to the form alone.
  - `converts-position.test.mjs`:1 ("the old suites stay unrun until the release deletes them") now says they were deleted in T20 by LEGACY-TESTS #18.
  - Present-tense notes about the check catalogue, retired at T19's close (K855): `checks.mjs`:9–13 and :280–284 (the catalogue "keeps its own copy", "connections' next job re-exports them"), `index.mjs`:14–16, and `themes.test.mjs`:125 (the withdrawal rows "are the catalogue's own"). Each now states the rows are this module's only copy.
  - No prose naming "the battery" in my paths.
- Paths: 2,679 lines (were 2,672).

**Deferred:** none.

**Found in other modules / generated artifacts (REPORT J1):**
- Stale: the plane's bundle `bio-plane/dist/bio-plane.bundled.mjs`, because `bio-plane/src/connections/index.mjs`, `themes.mjs`, `checks.mjs`, `pair.mjs` and `schema.mjs` changed.
- Readers whose answer changes: no module in the plane reads `backlinks`. `op=backlinks`' wire answer gains `out_of_view: true` for a viewer with a citer withheld, an additive key. legacy-ui's test mocks answer without it, which is unchanged and true for a viewer who sees everything. Showing the key is the UX stream's.

**Tests and checks.**
- `node --test test/m/connections/`: tests 107, pass 107, fail 0.
- `node --test test/m/` (bio-plane): tests 4684, pass 4622, fail 42. The red suites are filings (prepare, reads, approve-send, outward, sight, refusals, premise, packet), project-stage `stage.test.mjs`, intent `grammar.test.mjs` and control-plane `catalogue-end.test.mjs`. The same suites on the unchanged base (a worktree of this branch's merge of `tranche/T21`, before my commit) also fail 42 of 133. No new red. Their causes are `STATE_MOVE_UNDECLARED` on project moves, a `replace` of undefined, and `CAPTURE_HELD_BY_ANOTHER_BUNDLE`, all outside my paths.
- format: 86 modules, 84 requirements files; 0 failures. architecture: 20 product files, 71 relative imports; 0 failures. coverage: 61 of 61 live requirement ids named by a test; 0 failures. ownership: 10 files changed by connections between tranche/T21 and HEAD; 0 failures.

Size (session_01SjaX9oR1AMtsgg4jw4qwcL): test runs 6, module lines 2679
