# content (T9)

**Status** · session_01PUL34UEysoG7a95WQqDU7t · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

N161: proposed Provides wording for `noticeForRow`, as a new id after R46 (I build and test it as **R47** meanwhile; renumber as you like).

> **noticeForRow(row, viewer, memo?) → notice or null** (N161) For a caller that has already read the rows it asks about from `content` through R45's read contract (reevaluation R11, R14).
> - **R47** `row` is `{content_id, capture_sha, bundle_id, extent_kind, extent, ref, cited_as}` with `extent` as stored (R45). Answers R29–R31's notice for that row, the same fields `passageNotice` answers apart from `ok`, `states`, `grades`, `wrote`, `proposal_only` and `visible_to`, with the version chains read for `viewer`. It asks no sight and has no C-80.3: the caller gates the row (R37). `memo`, a `Map` the caller holds for one read, carries the captures' text units between calls, so rows citing one newer capture read its units once; it holds nothing past that read. It writes nothing and never throws; a `row` that is not an object answers null.

My best reading, which I build on: `passageNotice` = the sight gate + C-80.3 + `noticeForRow` + the vocabularies and the three proposal sentences (today's code, unchanged in meaning). The Uses list would also name, for N202 and N252: `membership`: `listenerRefusal` (R81) and `MODULE_ORDER` (R83), for `onStale` (R41); `text-chain`: `rectSpace` and `RECT_USER_SPACE` (R87), which replace `content/extent.mjs`'s `extentSpace` (a non-string or empty space now reads unreadable (`null`), still refused C-45.13 and still `unreadable` to `extentRelation`, so no behaviour a test holds changes). Not blocking: I carry on with N215, N202 and N252.

## Completion

**Entries applied**
- **N215 (R46)** `passageText(contentId)`: a typing's text byte for byte; otherwise the text the capture's index (`extraction.unitsOf`) holds at exactly the row's extent. The "held whole at exactly this extent" rule is now ONE function, `heldTextAt` in `content/notice.mjs`, which R31's `gradeAcross` also reads its cited passage through, so a passage graded across versions and the passage text consequences reads are the same text by construction. Null for a row not held, a `bytes` row, a region with no unit at exactly its extent, a unit cut at the per-unit cap, a `document` extent whose index is not `whole`, a capture never indexed; writes nothing; never throws. `normUnits` now orders units by `seq` (R36 answers them so; R46 states the order). BOB may drop R46's "not yet met".
- **N161 (R47, K292)** `noticeForRow(row, viewer, memo?)` as worded: the notice body is a private method that `passageNotice` (gate, C-80.3, vocabularies) and `noticeForRow` (no gate) both call; `noticeForRow` answers null for a non-object row or a read that fails, and ignores a `memo` that is not a `Map`. BOB may drop R47's "not yet met".
- **N202** (its share): `onStale` asks `membership.listenerRefusal` (R81) before recording a registration, so `LISTENER_MALFORMED` and `LISTENER_DECLARED` are minted at membership's one site (content's own two sites are gone); the stale listeners run in `MODULE_ORDER` (R83), an unknown module last in registration order. `onReading`'s registration with extraction is unchanged (extraction's share).
- **N252**: `extentSpace` and `EXTENT_USER_SPACE` are gone from `content/extent.mjs`; the grammar reads text-chain's `rectSpace` and `RECT_USER_SPACE` (R87). One behaviour changed, a fix: a space that is not a non-empty string (`""`, `7`, `true`, `{}`, `["user"]`) is now unreadable, so refused C-45.13 and `unreadable` to `extentRelation`; before, `String(v)` read `["user"]` as user space and admitted it. My J1 said no tested behaviour changes, which held; this case was untested and is now tested (R10).

**Deferred:** none.

**Found in other modules** (reported to BOB in COMPLETE)
- **content R46, for BOB's judgement (not a defect in the code):** R46 reads the index as it stands, so for a STALE row (R22: the capture was re-read under another chain since the row was minted) `passageText` answers the new reading's text at that extent, which may not be the text the member cited. The requirement says so as worded; if consequences should instead get `null` (or the text as cited) for a stale row, that is a wording change to R46.
- **Pre-existing failures, identical with and without this job** (same `ok`/`not ok` set, measured on `tranche/T9` and on this branch): `test/m/connections/factory.test.mjs` "R24, R18, K155" (connections, capture R58, as CAPTURE #5 reported); `test/m/citation/invariants.test.mjs` "R5" (citation's retired-state census); legacy `test/derivation-bounds.test.mjs` and `test/fleetbundles.test.mjs`.
- **Generated artifact made stale:** `bio-plane/dist/bio-plane.bundled.mjs` (and its `.bundle.json`), which bundles `content/extent.mjs` (it still carries `extentSpace`). Not rebuilt (§14).

**Tests and checks**
- `node --test bio-plane/test/m/content/` (after merging `tranche/T9` with K292): tests 54, pass 54, fail 0, todo 0. New: `passage.test.mjs` (R46 ×2, R47), R41 (N202) in `reads.test.mjs`, N252's arms in R10 (`grammar.test.mjs`).
- The modules that use content, and the legacy tests that drive it (reevaluation, consequences, inquiry, citation, basis-versions, connections, conformance, actions, standards, run-productions, query-language, retrieval, observation-log, case-authoring, affordances; cite-extent, derivation-bounds, content-extent-leg, content-chain-kind, d419-content-crop, content-arm, gate-reads, fleetbundles): 615 tests, 608 pass, 4 fail, 3 todo, before and after alike (the four above). After the merge: reevaluation and consequences 61/61.
- `checks/format.mjs`: 0 failures. `checks/architecture.mjs … content`: 0 failures. `checks/coverage.mjs … content`: 47 of 47 live ids named, 0 failures. `checks/ownership.mjs … content tranche/T9`: 0 failures (legacy-store 0/0, legacy-checks 0/0).

Size (session_01PUL34UEysoG7a95WQqDU7t): test runs 7, module lines 2231
