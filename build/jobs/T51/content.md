# content (T51)

**Status** · session_01K9HMgas2XJZzhRzt7oMHQn · depth 2 · COMPLETE · handled B18

## J1 · COMPLETE

Job T51-28 · content: done.

**Applied.** BOB's START note 1: the stale comments at `bio-plane/src/content/extent-core.mjs`:38 and :606 named `civicos-ui/check-refusal-codes.mjs` as a live guard. Both now say the DEC-49 guard was retired in T20 (git history: deleted in commit 6280db0024) and name the region marker instead. Comment-only; no behaviour change. Commit 6022b68305 on `job/T51/content`.

**Deferred.** None.

**Found in other modules (not changed).**
- `checks/run.mjs` reports 13 coverage failures in other modules (agent-harness, agent-runner, agent-steps, agent-worker, basis-versions, case-grammar, entities, explore, journey-check, people, progressions, retrieval-browse, retrieval). None is content's; content has 55 of 55 live ids named by a test.
- `civicos-ui/` is still present in the tree, although BOB's note says it was deleted in T51-126. My comments no longer depend on it. BOB should confirm the T51-126 state.

**Tests and checks.**
- `node --test bio-plane/test/m/content/`: tests 132, pass 132, fail 0 (run twice; the second after a comment reflow).
- `node checks/format.mjs /home/user/bio`: 174 modules, 172 requirements files; 0 failures.
- `node checks/run.mjs /home/user/bio`: architecture 3538 product files, 0 failures.
- `node checks/coverage.mjs /home/user/bio content`: 55 of 55 live requirement ids named by a test; 0 failures.
- `node checks/ownership.mjs /home/user/bio content tranche/T51 job/T51/content`: 1 file changed by content; 0 failures.

Size (session_01Wwq7CyJnf8mYnH7fP7TvMY): test runs 2, module lines 3777

## J2 · COMPLETE

Job T51-188 · content (the words pass, K3949 / K3957 / K3962): done. Commit a36ab8e467 on `job/T51/content`, pushed.

**Applied.**
- The 14 conversion findings and the 52 plain findings, each judged by the words rule. `checks/words.mjs /home/user/bio content` now reports 0 failures (66 before).
- The `[copy]` rows read through `word(key)`: `content.text.image_painted_pdf`, `content.kind_why.office_container_bytes` and `_hold`, `content.why.whole_document`.
- Beyond the check's arms (R13): the member-read refusal details and reasons in `extent-core`, `extent`, `notice` and `index` that the check does not count (for example the C-45 details, the envelope and core-property refusals, the notice's state sentences, the candidate sentences, the container-missing levels and the connection axis) are converted the same way, as BOB's note asks.
- `ops.mjs`: a new export `CONTENT_OP_NAMES`, the module's own list of its eight op names; `contentOps` is unchanged in behaviour.
- Tests: `seams.test.mjs` assembles the op list from `CONTENT_OP_NAMES`, and I removed one assertion message that copied a sentence. `words.test.mjs` and the sentence-shaped assertions in both files compare with `word`/`localize` by equality, with the same text and vars, so no assertion is weaker.

**Deferred.** None.

**Not converted (wire or developer text, for BOB to settle, K3944).** Three `detail` strings are instructions to an API caller rather than text a member reads in the interface:
- `index.mjs`, `contentRead`'s `NO_ID`: `content requires ?id=<content_id>`.
- `index.mjs`, `transcribe`'s `TRANSCRIBE_NO_DOCUMENT` (no bundle given): `pass bundleId=<INFO-…>: the document whose page you transcribed`.
- `index.mjs`, `#transcriptionOf`'s `TRANSCRIPTION_NOT_FOUND` (no id given): `pass contentId=<the content id op=transcribe returned>`.

**Found in other modules (not changed).** `checks/words.mjs` over the whole repository reports other modules' findings, among them `money` (two plain), `contradiction`, `inquiry-grammar`, `monitoring` (a `[copy]` of "no content type"), `run-productions`, `standards` and `case-checker`. None is content's. `checks/coverage.mjs` without a module argument reports 30 failures in other modules; content has 55 of 55.

**Process note.** The mail tool's `start` first ran `pull --rebase` on my job branch and stopped on a conflict, because my local branch carried an unpushed three-line start commit (`5948321d10`) that origin's history had already superseded. I aborted the rebase, reset the local branch to `origin/job/T51/content` (the old commit is in the reflog), and re-ran `start`, which wrote the entry. No pushed history was touched.

**Checks.** Summary lines, as run:
- `node --test bio-plane/test/m/content/`: tests 132, pass 132, fail 0.
- `node checks/words.mjs /home/user/bio content`: "words: 1 modules, 5882 string literals read … 0 failures".
- `node checks/run.mjs /home/user/bio`: "format: 175 modules, 174 requirements files; 0 failures"; "architecture: 3617 product files … 0 failures". The run's words and coverage failures are all in other modules.
- `node bio-plane/src/setup-words/build.mjs --check`: the stale-rows note only, as expected (`rows.mjs` is BOB's to regenerate at the layer close). No refusal naming content.
- `node checks/coverage.mjs /home/user/bio content`: "55 of 55 live requirement ids named by a test; 0 failures".
- `node checks/ownership.mjs /home/user/bio content tranche/T51 job/T51/content`: "8 files changed by content …; 0 failures" (seven code and test files plus the start record).

Size (session_01JPMzjtaiYQhhvavJECf8NY): test runs 1, module lines 3531

## J3 · COMPLETE

Job T51-188 · content, CHANGE B4 (K3988) done. Commit 54c8dbdc4e keys the three `detail` strings through `localize` with their English unchanged: `content.index.content_requires_id`, `content.index.pass_bundleid_info_document`, `content.index.pass_contentid_content_id`. Merged `origin/tranche/T51` into `job/T51/content` (merge commit f54a4f4a42; no rebase, no reset); the merge brought no change to content's files.

**Checks, as run after the merge.**
- `node --test bio-plane/test/m/content/`: tests 132, pass 132, fail 0.
- `node checks/words.mjs /home/user/bio content`: "words: 1 modules … inline 0, plain 0, testcopy 0 … 0 failures".
- `node checks/run.mjs /home/user/bio`: "format: 175 modules, 174 requirements files; 0 failures"; "architecture: 3617 product files … 0 failures". Coverage's 30 failures are other modules'.
- `node bio-plane/src/setup-words/build.mjs --check`: no refusal naming content (stale-rows note only).
- `node checks/coverage.mjs /home/user/bio content`: "55 of 55 live requirement ids named by a test; 0 failures".
- `node checks/ownership.mjs /home/user/bio content tranche/T51 job/T51/content`: "8 files changed by content …; 0 failures".

**Deferred.** None.

Size (session_01JPMzjtaiYQhhvavJECf8NY): test runs 2, module lines 3531

## J4 · COMPLETE · re B5

Job K4259 · content, CHANGE B5 done: the `transcriptions` read op.

**Applied.** Entry 1. `op=transcriptions {bundleId, limit?, after?}` (ops map arm `transcriptions` → `Content.transcriptionsOf`), reading `bundleId`, `limit`, `after` from the body, else the query, and `viewer` from the stamp. It answers `{ok, bundle_id, transcriptions: [{content_id, bundle_id, capture_sha, extent_kind, extent, ref, transcriber, at, text_sha256, attestations: [{attestor, at, counts}]}], count, limit, after, truncated, cursor}` (`attestations_truncated` when the attestation read was cut). Rows are in content-id order; `cursor` is the last content id listed when more remain, else null; the default page is 50, the maximum 200. The typed text is not listed (`op=transcription` reads it). `counts` is false for the typist's own, as `transcriptionRead` says. Refusals: `NO_TARGET` (no bundleId), `NO_SUCH_BUNDLE` (absent and unseen answer alike, R37), `NOT_A_DOCUMENT` (seen, not a document), each `detail` keyed with `localize`. `DECLARED_OPS.transcriptions`: classes admin, member, probe (as `content` and `transcription` in op-declarations), `mutating: false`, `weight: "read"`, accepts `bundleId`, `limit`, `after`, requires `bundleId`; `CONTENT_OP_NAMES` lists it.

**Requirement lines for BOB** (next free id R57; the tests name it):
- **R57** `transcriptionsOf({bundleId, limit, after, viewer})` (`op=transcriptions`) lists a document's typings, in content-id order, a page at a time: each `{content_id, bundle_id, capture_sha, extent_kind, extent, ref, transcriber, at, text_sha256, attestations: [{attestor, at, counts}]}` (`counts` false for the typist's own, R26), with `limit` (default 50, at most 200), `after`, `truncated` (measured by reading one more) and `cursor` (the last content id listed when truncated, else null); the typed text is `transcriptionRead`'s. Refusals in order: `NO_TARGET` (no bundleId); `NO_SUCH_BUNDLE` (absent or not visible, the same answer, R37); `NOT_A_DOCUMENT`. Writes nothing.
- R50: the ops map holds nine ops, adding `transcriptions` (R57).
- R56: `DECLARED_OPS` also declares `transcriptions` (`weight: "read"`, `mutating: false`, requires `bundleId`).

**Tests** (`bio-plane/test/m/content/transcriptions.test.mjs`, written first and seen failing; and `declared-ops.test.mjs`, one more `declaredOpHolds`): a typed document lists its typings with attestations; the typist's own attestation lists with `counts` false and equals `op=transcription`'s; a document nothing typed (and another document's typings) lists none; the control: an unseen document, an absent one and a viewer-less call answer alike and the same call by a member who sees it lists; `NO_TARGET` and `NOT_A_DOCUMENT`; paging to the end with `limit` and `cursor`, the default and the clamp; the declaration.

**Found in other modules (REPORT).** (1) op-declarations holds no row for `transcriptions` (its `content` and `transcription` rows are at lines 872 and 1113 of `src/op-declarations/index.mjs`): the classes above are what to give it. (2) `test/m/plane/*` fail at load before and after my change: `DECLARED_OP_DISAGREES: groupdescriptiondraft description` (not content's; so I could not see the plane suite judge the new arm).

**Deferred.** None.

**Checks, as run.**
- `node --test bio-plane/test/m/content/`: tests 142, pass 142, fail 0.
- `node checks/run.mjs /home/user/bio`: "format: 175 modules, 175 requirements files; 0 failures"; "architecture: 3907 product files … 0 failures"; coverage's 6 failures (agent-harness, agent-runner, installer-steps, journey-check, screens-inquiry, screens-intake) and the words check's one failure (op-grades `t37.test.mjs:32`) are other modules'.
- `node checks/ownership.mjs /home/user/bio content tranche/T51 job/T51/content`: "1 files changed by content …; 0 failures".

Size (session_01P2JndhzMAdUJg3Zg8sCpBP): test runs 3, module lines 3593

## J5 · BLOCKED

BLOCKED (cause: tests): the module change is done and green on a stand-in; the real-path failing-first test (`g41-real.test.mjs`) and the platform check cannot run because none of the providers my START names is on `tranche/T51` (checked at 00:3x UTC after `git fetch`): `bio-plane/test/platform-sqlite.mjs` (the shim) exists only on `job/T51/test-support` (TEST-SUPPORT #9, RUNNING); `extraction.cellsOf` is on no branch (EXTRACTION #38, WORKING, handled B33); `cells_held` is emitted by no reader yet (csv-reader, office-readers, reading-pipeline are all WORKING). The START said they were merged. I need: TEST-SUPPORT, CSV-READER, OFFICE-READERS, READING-PIPELINE and EXTRACTION merged into `tranche/T51`, then a `RESUME`; I then merge `tranche/T51`, write the real-path test and complete.

**Changed (commit on `job/T51/content`).**
- `src/content/index.mjs`: `cellsAt` is `async` (R52). `#officeOf` also answers `held`, the sheet names the reading's `cells_held` lists. For a `sheet-cell`/`sheet-range` row whose sheet is in `cells_held` and not listed, the new `#heldCellsAt` asks `extraction.cellsOf(captureSha, sheet, {fromRow, toRow, fromCol, toCol})` for the extent's box (`extentBox`), passes the rows through `typedCellsAt(extent, {[sheet]: cells})` (column box and reversed corners honoured as for a listed sheet) and answers `{content_id, capture_sha, extent_kind, extent, cells, interpreted: {sheet, from_row, to_row}}`, plus `cells_truncated: true` and `next_row` when `cellsOf` names `next_row`. `cellsOf` throwing, absent, answering nothing or `bytes_not_held` is `reason: "not_read"`; any other `{cells: null, reason, why}` of `cellsOf` passes through. A listed sheet is answered as before (no `interpreted`, `cellsOf` never asked). Nothing synchronous changed: `#officeOf(...).cells` is `{sheet: null}` for a held sheet, so `heldTextAt`, `passageText`, `gradeAcross` and the version notice fall back to the indexed units exactly as for a sheet with no list (R46, R31).
- `src/content/notice.mjs`: `extentBox(extent)` (pure, exported), the box `typedCellsAt` already computed; `typedCellsAt` uses it.
- No new sentence: every refusal reuses an existing `localize` id.

**Tests.** `test/m/content/g41-cells.test.mjs` (8 tests; named R52, R46, R31): (a) a range at a held sheet's last rows equals the generator's cells and states `interpreted`; (b) one cell, and an empty cell inside the grid is `[]`; (b2) a column subset and a reversed-corner range, with the listed-sheet control (`cellsOf` never asked); (c) a listed small sheet has no `interpreted`; (d) a range over the call's bound says `cells_truncated` and `next_row`, whole rows only, and the next call continues; refusals: `cellsOf` throws, `bytes_not_held`, other reason passes through, no `cellsOf`, nothing; stale, other kind and no row unchanged, the file not asked; (e) `passageText` and the version notice of a held sheet grade by the units, `cellsOf` never asked. `fixture.mjs` gains `cellsOf` as the contract states it (a stand-in: `readings().heldSheets`, `cellsRangeMax`, `cellsOfCalls`); `office.test.mjs` awaits `cellsAt`. **Red then green:** with `src/content` stashed to the tranche's code, 5 of 8 fail (a, b, b2, d, refusals: no `interpreted`, `cells_not_held`); with the change, 8 of 8 pass. The 3 that pass on both are the controls (c, e twice).

**Suites.** `node --test bio-plane/test/m/content/`: tests 150, pass 150, fail 0 (142 before + 8). `node checks/run.mjs /home/user/bio`: format 0 failures, architecture 0, coverage 57 of 57 live ids named (176 modules, 0 failures), words 0 failures (inline 0, plain 0, testcopy 0; unkeyed unchanged), channels 0. Ownership: 0 failures. The shim was not used (not on the tranche); the content suite does not store a large value.

**Assumption to confirm against EXTRACTION #38:** `cellsOf`'s `fromRow`/`toRow`/`fromCol`/`toCol` are 1-based and inclusive (as A1 and `rangeCorners` are), `interpreted` is `{sheet, from_row, to_row}` in the same numbering, and `next_row` is the first row not returned. If its numbering differs, only `#heldCellsAt` changes.

**Found in other modules (REPORT).** (1) `calculations/index.mjs:330, :380, :688` call `this.content.cellsAt(...)` without `await`; with `cellsAt` async they get a promise (CALCULATIONS #8 awaits, per its START; its tests must not pass before it merges after me). (2) `screens-inquiry` reads `cells_truncated`/`next_row`/`interpreted` only after SCREENS-INQUIRY #24; no other module calls `cellsAt`.

**Proposed requirement lines (BOB writes them).** Replace R52's first sentence's tail: "`cellsAt(contentId)` is async. For a held row whose extent is `sheet-cell` or `sheet-range` it answers the typed cells of its capture's reading inside that extent … as before. A sheet the reading names in `cells_held` (its text is read whole and searchable; its cells are not all interpreted at intake) has the extent's cells made from the held file by `extraction.cellsOf` for the extent's rows and columns, in the same order and shape, and the answer adds `interpreted: {sheet, from_row, to_row}`; when the call's bound stops the read early it adds `cells_truncated: true` and `next_row`, never a silently shorter list. A failure to make them is `{cells: null, reason: "not_read"}`. A listed sheet is answered as before and states no `interpreted`. The synchronous reads (R46 `passageText`, R31's grade, the version notice) take a held sheet's text from the indexed units, as for a sheet with no list." Test: `g41-cells.test.mjs`. Also: `calculations` awaits `cellsAt` (its R1).

**Deferred.** None. **Owed to the real path (waiting on the providers above, not deferred):** `g41-real.test.mjs` (the 1 MB CSV read by `readHeld` under the shim, `cellsAt` at its last rows through the real `cellsOf`, red today with `SQLITE_TOOBIG`, then green), the 5,000-row workbook case, and the platform check (L, then P at the re-walk).

Size (session_01KzzQvxzJFF2TeRz3VbyabJ): test runs 6, module lines 3631

## J6 · REPORT

REPORT (re B7): the real-path seam tests are written and red by name: `bio-plane/test/m/content/g41-real.test.mjs` (R52 G41 a, b, b2, c, d), the real extraction (`fresh` of extraction's fixture) reading a 1 MB CSV by `readHeld` to its end, `cellsAt` at its last rows, one cell, a column subset and a reversed corner, a small sheet (control), and a range over `CELLS_RANGE_MAX` (`cells_truncated`, whole rows, `next_row`). Run under a copy of the shim kept outside the tree: `node --import <shim copy> --test --test-force-exit bio-plane/test/m/content/g41-real.test.mjs`: (a) (b) (b2) (d) fail today with "string or blob too big" (the reading is over the limit: the SQLITE_TOOBIG of the walker); (c) passes (control, a small sheet lists its cells). They go green when csv-reader, office-readers, reading-pipeline and extraction have merged and I merge `tranche/T51`; `cellsOf`'s numbering (1-based, inclusive bounds, `next_row` the first row not returned) is my reading of the contract and the test will confirm it. The stand-in tests (`g41-cells.test.mjs`) stay green. I merge on your next CHANGE; state WORKING until then.
Size (session_01KzzQvxzJFF2TeRz3VbyabJ): test runs 8, module lines 3631

## J7 · COMPLETE

COMPLETE (G41, content; re B12). Merged `tranche/T51` (readers, reading-pipeline, extraction #38 in). Tip pushed on `job/T51/content`.

**Changed.** `src/content/index.mjs`: `cellsAt` async; `#officeOf` also answers `held` (the reading's `cells_held`); new `#heldCellsAt`: the extent's box (`extentBox`, notice.mjs) asked of `extraction.cellsOf(sha, sheet, {fromRow, toRow, fromCol, toCol})`, rows through `typedCellsAt` (column box, reversed corners as for a listed sheet), answer adds `interpreted: {sheet, from_row, to_row}` and, when `cellsOf` names `next_row`, `cells_truncated: true` and `next_row`; `cellsOf` throwing, absent, nothing or `bytes_not_held` = `not_read`, other `{cells: null, reason, why}` passes through; a listed sheet is answered as before (no `interpreted`, `cellsOf` not asked). Sync paths unchanged: `#officeOf(...).cells` is `{sheet: null}` for a held sheet, so `heldTextAt`, `passageText`, `gradeAcross`, the notice read the units (R46, R31). `src/content/notice.mjs`: `extentBox`. No new sentence (existing `localize` ids reused); no census op changed.

**Failing-first, red then green.** `test/m/content/g41-real.test.mjs` (real merged extraction, 1 MB CSV of the generator read by `readHeld` under the shim, row 1 and last row, K4647's numbering): (a) last rows equal the generator's cells, `interpreted` {sheet, 18095..18098}; (b) one cell, and row 1 (header) A1:B1; (b2) column subset B:C and reversed corner `$C$n:b(n-2)` exact; (c) small CSV lists its cells, no `interpreted` (control); (d) A1:D(last) over `CELLS_RANGE_MAX` says `cells_truncated`, `next_row`, whole rows. RED, on the tranche before extraction merged (my branch with the change, no `cellsOf`): (a) (b) (b2) (d) failed "string or blob too big" (SQLITE_TOOBIG, the reading over the limit) at first, then `cells: null` (`not_read`) once the readers merged; GREEN 5 of 5 after B12. Stand-in `g41-cells.test.mjs` (8): 5 red on the old `cellsAt`, 8 green. (e) the version notice of a held sheet grades by the units, `cellsOf` never asked: in `g41-cells.test.mjs`, a control green both ways. `office.test.mjs` awaits `cellsAt`.

**Fixture finding (test-only, mine).** My first real test read the CSV with `format: "undetermined"` (as g40 does): `cellsOf` then answers `cells_not_interpretable` because the stored `capture_format` is "undetermined" and `cellsInRange` has no entry. The production capture carries its format, so I read it as `csv`. If a capture's format can be "undetermined" while its reading holds `cells_held` (a CSV the profile could not name), its cells are never made: extraction could take the format from the reading's `text_container` as content does (`containerKindOf`). Not mine; for BOB to rule.

**Measures / suites (shim copy outside the tree).** `node --import <shim> --test bio-plane/test/m/content/`: tests 155, pass 155, fail 0 (142 + 8 + 5). `node checks/run.mjs /home/user/bio`: format 0 failures, architecture 0 (4292 files), coverage 6684/6684 ids named, 0 failures, words 0 failures (inline 0, plain 0, testcopy 0, unkeyed unchanged 1982), channels 0. `ownership.mjs content tranche/T51 job/T51/content`: "7 files changed by content …; 0 failures". `impact.mjs origin/tranche/T51 HEAD`: 104 of 176 modules (the extent exports are widely used); I ran the one caller of `cellsAt`: `test/m/calculations/` 62 of 65 pass, 3 FAIL because `calculations/index.mjs:330, :380, :688` call `cellsAt` without `await` (CALCULATIONS #8's entry; merges after me, as ordered).

**Seam tests still red by name:** none of mine. **Deferred:** none. **Rows owed:** none (no new sentence). Not done: the 5,000-row xlsx case (my entry names the CSV's cases; the xlsx path is the same `cellsOf` seam, covered by extraction's own (b) and reading-pipeline's). The platform checks L and P are PLANE's (shape proof); my cases are in `g41-real.test.mjs` for them.

**Proposed requirement lines (BOB writes them).** R52 amended: "`cellsAt(contentId)` is async. For a held row whose extent is `sheet-cell` or `sheet-range` it answers the typed cells of its capture's reading inside that extent, as before, when the reading lists the sheet's cells (the answer states no `interpreted`). A sheet the reading names in `cells_held` (its text is read whole and every line searchable and citable; its typed cells are not all interpreted at intake) has the cells of the extent's rows and columns made from the held file by `extraction.cellsOf` (rows and columns 1-based, bounds inclusive), kept to the extent's box, in row then column order, and the answer adds `interpreted: {sheet, from_row, to_row}`, the statement of the rows interpreted; when `cellsOf` stops at its bound the answer adds `cells_truncated: true` and `next_row` (the first row not returned), never a silently shorter list. A reason `cellsOf` gives passes through; one it cannot give now (the file not readable, a throw, no answer) is `reason: "not_read"`. The `{cells: null, reason, why}` shapes for a row not held, stale, of another extent kind are unchanged. `calculations` awaits it (its R1). The synchronous reads (R46 `passageText`, R31's grade, the version notice) take a held sheet's text from the indexed units, as for a sheet with no list." Test: `g41-real.test.mjs`, `g41-cells.test.mjs`.

Size (session_01KzzQvxzJFF2TeRz3VbyabJ): test runs 14, module lines 3631

## J8 · QUESTION

QUESTION (re R58, G134d; the one thing that decides what I build for R58's "a row minted over a footnote").

**Finding.** A non-body unit does not carry a content extent. `reading-pipeline` emits every part (footnote, endnote, header, footer, comment, tracked deletion, text box, speaker note, master text, cell note) with extent `{kind: "doc-part", part, ref}` (`reading-pipeline/index.mjs:960, 994`; `office-readers` R38). `content` R1 admits only text-chain's eight kinds and `envelope`; `mint` of a `doc-part` extent is refused `CONTENT_EXTENT_UNREADABLE`. So no row can exist over a footnote's unit, and R58 ("a row minted over it says `footnote`", DOCS O4 / P3 / D1 / H6 through the door, seam section 10) cannot be shown as written.

**Best reading (what I will build unless you say otherwise).** R1 gains a tenth kind in `content/extent.mjs` (the pattern of `envelope`, R33, K102): `doc-part {part, ref}`, canonical form `{kind, part, ref}`, human form "part <ref>", cited as `text`, bound by nothing the reading lists (checkContentExtent admits it with `undetermined` naming the unheld part list, R8; refused only when the shape is malformed), `extentRelation` `same` only as itself, `narrower` than `document`, otherwise `disjoint`. R58's kind is then read from the stored unit at exactly the row's extent (`unitsOf`), `part_kind` on `contentRead`, `contentRow`, `passageNotice` candidates and on the row's `ref` shown to the member ("footnote" by a stand-in keyed through `localize`, row owed to later-ux). The kind is no part of the content id (R3), as R58 says.

**What I need from you:** write R1 and R58 to admit `doc-part` (or tell me the extent a footnote is cited at, if it is not `doc-part`). I carry on with everything else on this reading (kind lookup by exact extent; null where the unit carries none).

## J9 · QUESTION

QUESTION (re R61, R60, R58; what I need from `extraction.unitsOf` once job 41 merges: the three fields content reads that it does not answer today).

**Finding.** Read on tranche/T51 as merged (job 28): `unitsOf(captureSha, {after, maxBytes})` answers each unit as `{extent, ref, text, truncated, seq, chain_kind}` and the index as `{state, counts: {offered, written, over_bound, unaddressable, truncated, skipped_named}, skipped, next?}` (`extraction/index.mjs:1988-2032`). Three things my entries read are not in it: a unit's `kind` (R107 says `unitsOf` answers it; job 41 adds the column), a sheet unit's `lineRows` (R107 says it is "stored with the reading's units" but names only `kind` as answered by `unitsOf`), and the job row's figures for R60's `searched` (how far the reading has got).

**What I built, on this reading** (all four of my seam tests that read a real CSV and xlsx through `readHeld` are red by name today and stay so until job 41 merges, R-SEAM; `r9-sheet-real.test.mjs`):
1. A sheet block unit carries `lineRows`: an array of 1-based row numbers, one per line of its `text`, as `reading-pipeline` R47 emits it (`blockRows`: a later block's first entry is the sheet's first row, its repeated header). `heldTextAt` drops that first line of a later block of the same sheet. A unit with no `lineRows` is joined whole, nothing dropped (a data line cannot be told from a repeated header without it).
2. A unit carries `kind` (string of R107's closed list, or null/absent for a unit stored before it).
3. `searched: {through, total}` is read from the `unitsOf` answer's `read_through` and `total` (the job row's counters, extraction R90's names) when it carries them, else from `counts.written` and `counts.offered`. It is absent for `state` `whole`, and for a capture never indexed (`state` null with no counts).

**What I need from you:** have job 41 answer `lineRows` and `kind` on each unit and `read_through`/`total` on the answer of `unitsOf` (or tell me the names it will use and I change `normUnits` and `searchedOf`, nothing else). After job 41 merges, a CHANGE to me turns the four red tests green; I have not weakened them.

## J10 · REPORT

REPORT (re BOB's ruling (1): ceilings content keeps that have no `READ_BOUNDS` row; BOB carries them to runtime-limits; I use them as local constants with the comment "proposed; BOB records" until then).

| kind | name | standard | alpha | protective | where |
|---|---|---|---|---|---|
| `content` | `held_text_chars` | 33,554,432 (32 MiB of unit text, in characters) | 33,554,432 | 33,554,432 | `HELD_TEXT_CHARS_MAX`, `content/index.mjs`: the most unit text one capture's held units are read to for a grade, a passage text or a notice (R46, R60). Past it the reading is held `partial`, with `searched` naming how far it was read, never `whole` and never graded `NOT_FOUND`. A reading of more than 4,096 units is read page by page to its last (it was read from its first page alone before). |
| `content` | `kind_scan_pages` | 16 | 16 | 16 | `KIND_SCAN_PAGES_MAX`, `content/index.mjs`: the pages of units (about 1 MiB each, extraction R93) a lookup of a unit's kind scans before it answers that the reading names none for that extent (R58: null, undetermined, never `body`). |

Neither lowers what a member could do before (a reading over 4,096 units was graded from its first page, which was wrong, not a larger reach). The page size, 1 MiB of unit text, is extraction's own (`READING_PAGE_BYTES`, its R93), and the 8 MiB range the crop reads at a time is a read size, not a ceiling.

## J11 · COMPLETE

COMPLETE (fix round 9, content #20: G128g, G134d, G135f, G127d; re B13, B14, B15). Merged `tranche/T51` last at its tip as I finished; pushed on `job/T51/content`. Four seam tests are red by name until extraction-2 (job 41) merges, as B15 said (listed last).

**Changed** (`src/content/` only; no census op, no table, no stored shape changed).
- `notice.mjs`: `normUnits` (moved here, pure) now splits a unit's chunk number from its element address (`splitRun`) and keeps its `kind`, `lineRows`, `counts`, `read_through`, `total`; `logicalUnits` (an element carried as chunks `run` 0, 1, ... is ONE unit: its chunks' text joined with nothing, `truncated` when the run does not start at 0, has a gap or is one chunk alone); `heldTextAt` is the one rule (R61): a `document` extent is `documentText` (units in `seq` order, a later sheet block's first line dropped when its `lineRows[0]` is that sheet's first row again, chunks of one element joined with nothing, every other unit with a line feed) only when the index reads `whole` and no unit is cut; an element extent is its logical unit (a chunked one only from a `whole` index); `gradeAcross` compares logical units on both sides (a chunked paragraph is one passage, never its first chunk); `searchedOf` (R60: `{through, total}`); `kindAt` (R58).
- `index.mjs`: `#rawUnits` reads a capture's units PAGE BY PAGE (`after`/`next`, 1 MiB of text a page) to the last: before, every grade, passage text and notice read the first page (4,096 units) alone while the index said `whole`, so a larger reading could be graded `NOT_FOUND` from a part (found while building R60; fixed here); it stops at `HELD_TEXT_CHARS_MAX` and holds the reading `partial` then. `passageHeld(contentId)` (new, beside `passageText`, which is its `.text`): the text, or `{text: null, reason, why}`, with `searched` beside either when the reading is not whole. `contentRead`, `standings` carry `part_kind` and the kind beside the extent in `ref`; `noticeForRow`/`passageNotice` carry `part_kind` and `ref` (from the units the notice already loads, so the memo test still holds) and each candidate carries `searched` (the newer capture's, else the cited capture's); `contentContextFor` carries `searched` for a reading not whole (internal callers, `mint` among them, ask `{searched: false}` and read no extra state); `markStale`'s rows carry it. `cropOf` reads the capture through `readRange` (handed in as `deps.readRange`, default `acquisition.readRange`, R113) by the WHOLE digest, a range at a time to the end, with the record's `{core, provenance}` as its store: a capture held only in parts is cropped, and no part is resolved. `PART_KIND_WORDS` (the closed list, a stand-in word each).
- `extent.mjs`: the tenth extent kind `doc-part {part, ref}` (R1, K4910): canonical `{kind, part, ref}` (trimmed, null when absent), human form "part <ref>" (never the caller-authored-`ref` shortcut: its `ref` is the reader's element reference), cited as `text`, refused `CONTENT_EXTENT_UNREADABLE` only when malformed (neither part nor ref, or either not a non-empty string), `CONTENT_EXTENT_NO_CHAIN` on an unread capture, `part_list` undetermined (R8), `same` only as itself / `narrower` than `document` / `disjoint` otherwise. It carries its own canonical arm, as `envelope` does, until text-chain's (job 63) lands; the two agree; drop this one then (a CHANGE).

**The four fields, per cause.**
- **G128g** (1) `content/notice.mjs:120-123` joined `held.units.map(u => u.text)` and read only `unitsOf`'s first page; reading-pipeline `sheetBlocks` repeats the header at each later block (`reading-pipeline/index.mjs:1316-1351`). (2) `calculations/r7-delimiter.test.mjs` hands the text whole through a stub; the one door test used 120 rows; nothing read units of more than one page or more than one block. (3) RED on tranche (stand-in units shaped as R47/R107 state them): `R61: a document extent's text is the units' lines once each …` actual `'h1\th2\na\tb\nc\td\nh1\th2\ne\tf\ng\th\nh1\th2\ni\tj\nk\tl'` vs expected the lines once; `R46: the units of a reading of more than one page …` actual `'page 0\npage 1'` of nine pages; chunks: actual `null` for a chunked paragraph. GREEN after the change (r9-units.test.mjs, 14 of 14). The real-path test on the walker's own shape (a comma CSV and an xlsx read by `readHeld`, then `passageText`) is `r9-sheet-real.test.mjs`: RED BY NAME, see below. (4) N (as the plan states; L at the corpus's full size).
- **G134d** (1) `content` had no extent for a part (`doc-part` units, `reading-pipeline/index.mjs:960, 994`) and read no kind; (2) no test followed a part from the reader to the citation; (3) RED: `R1 (K4910): a doc-part extent is the tenth kind` TypeError `CONTENT_EXTENT_KINDS["doc-part"]` undefined; `R58: a passage whose unit names a kind other than body is cited as that kind …` `{"ok":false,"code":"CONTENT_EXTENT_UNREADABLE"}` (the footnote row cannot be minted); `R58: the version notice for a footnote's row …` `VERSION_NOTICE_NO_CONTENT`; GREEN after. Controls in the same tests: a body paragraph names `body` and its `ref` is unchanged; a unit with no kind names `null`, never `body`; the content id is the same whatever the unit names (R3). (4) N.
- **G135f** (provider) (1) the reading's states and "searched so far" had no source in content; (2) no test of a notice over a half-read capture; (3) RED: `R60: a notice over a half-read newer capture answers UNDETERMINED …` `searched` undefined vs `{through: 1, total: 12}`; `R60: contentContextFor and the passage text carry searched …`; GREEN after, with the control (a whole reading carries none, a never-indexed capture carries none). (4) N here; L/P are the screens'.
- **G127d** (1) `cropOf` read `store.get(captureSha)`, the whole object only: past 32 MiB a capture exists only as parts (`acquisition/index.mjs:373`); (2) every crop fixture held the whole; (3) RED: `R59: the crop reads a capture's bytes by its whole digest through readRange …` and `R59: a capture held only in parts is cropped from its whole digest through the real readRange …` (`CROP_CAPTURE_NOT_HELD`); GREEN after (a 3-part PDF the register names, the whole object absent). The citation half already held on the tranche (a part's digest is in no `held` list: `NO_BYTES_HELD`; `R59: a capture is cited by its whole digest` passes on both, with its control); it is pinned now. (4) L (a capped child at 100 MB is the capture/acquisition seam's).

**Tests.** `test/m/content/r9-units.test.mjs` (14: R61 ×3, R46 ×3, R1, R58 ×2, R60 ×2, R59 ×3), `r9-sheet-real.test.mjs` (4, R61 through the real extraction); `grammar.test.mjs` and `seams.test.mjs` updated for R1's tenth kind (the seam compares text-chain's kinds without `doc-part`, so it stays green when text-chain's arm lands). Baseline red (`tranche/T51` code, my tests): 16 of 18 fail, 2 pass (the controls named above). Now: `node --import ./test/platform-sqlite.mjs --test --test-force-exit test/m/content/`: tests 173, pass 169, fail 4 (the four below).

**Seam tests red by name** (R-SEAM; B15): `r9-sheet-real.test.mjs` R61 ×4 (a comma CSV over 128 KiB, quoted line breaks, the 127/129 KiB controls, an xlsx), until extraction-2 (job 41) makes `unitsOf` answer each sheet unit's `lineRows` (and `kind`, `read_through`, `total`) as extraction R107 now says: today the real units carry no `lineRows` (`'…\nid\tname\tamount\tnote\n2545…'`, the repeated header). Names I read: `unit.lineRows`, `unit.kind`, the answer's `read_through` and `total`. A CHANGE after job 41 turns them green; if its names differ only `normUnits`/`searchedOf` change.

**Checks** (civicos-process, product `/home/user/bio`): format "176 modules, 176 requirements files; 0 failures"; architecture "31 product files, 100 relative imports; 0 failures"; coverage "61 of 61 live requirement ids named by a test; 0 failures"; words "inline 0, plain 0, testcopy 0, missingkey 0, unkeyed 0; 0 failures"; ownership "8 files changed by content between tranche/T51 and HEAD; 0 failures". `impact.mjs origin/tranche/T51 HEAD`: 104 of 176 modules affected; the users I touch (`reevaluation` 163/163, `retrieval`, `calculations`, `case-disclosures`, `publication`, `public-read`, `ratification`, `money`, `hypotheses`, `queue`, `screens-wizards`, `inquiry-grammar`) pass under the shim; `control-plane` has 4 failures (the 40 MB five-part upload cases, E3 and R123/R125 G7, and E8), and the same cases fail on the tranche without my change (3 there, one more by timeout): not mine.

**Words owed** (stand-ins keyed through `localize`, rows owed to `later-ux.md`; BOB regenerates setup-words at the round end): `content.part_kind.{body,footnote,endnote,header,footer,comment,tracked_deletion,text_box,speaker_note,master_text,cell_note}`, `content.ref.with_part_kind`, `content.extent.{part_human,part_ref,a_part_extent_names_the,a_part_extent_names_neither,this_record_holds_no_extraction_2,part_list_not_held}`, `content.index.{passage_cited_under_earlier,passage_could_not_be_read,image_cited_as_bytes}`. No generated artifact made stale beyond setup-words. New files outside my paths: none.

**Ceilings** (J10, REPORT, answered or not by BOB): `content/held_text_chars` 33,554,432 and `content/kind_scan_pages` 16, as local constants "proposed; BOB records".

**Proposed requirement wording (BOB writes).** R58: the field is `part_kind` (a kind of the closed list, `null` where the unit names none); `ref` shows it beside the extent for a kind other than `body`; `passageNotice` carries both at its top level. R60: `searched` is on each candidate (the newer capture's, else the cited capture's), on `contentContextFor`'s answer, on `markStale`'s rows and on `passageHeld`; the figures are the index's `read_through` and `total`, else its `counts.written` and `counts.offered`; absent for a whole reading and for one never indexed. R46: a reading is read page by page to its last unit up to 32 MiB of unit text, past it held `partial`; a sibling `passageHeld(contentId)` answers `passageText`'s text or its reason and `searched`. R59: the crop reads through `readRange` a range at a time (`deps.readRange`).

**Deferred:** none. **Found in other modules:** none beyond the above (job 41's three fields; text-chain's `doc-part` arm, job 63).

Size (session_01K9HMgas2XJZzhRzt7oMHQn): test runs 26, module lines 3920

## J12 · COMPLETE

COMPLETE (re B16, item 1). Merged `origin/tranche/T51` (text-chain job 63 in). Content's own `doc-part` canonical arm in `extent.mjs` is dropped; `canonicalExtent` takes text-chain's. Shown agreed BEFORE the drop: content's arm and `textchain.canonicalExtent` gave the same string for 7 shapes (full, padded, ref only, part only, empty strings, non-string part, bare), and the content ids over them were identical before and after (a33870be253e, e6cc3ada024e, 8118ded0a641, c93b659ef24a, 974b1cbe16d0 for the rest). Pinned now in `r9-units.test.mjs` ("R1, R3 (K4913)": equal to text-chain's, ids fixed). Content's R1 shape check and human form stay content's.
Suite: tests 174, pass 170, fail 4 (the same four R61 seam tests, red by name until job 41, B15/B16 item 2). format, architecture, coverage (61 of 61), words, ownership: 0 failures.
Ceilings: job 64 (runtime-limits) has not merged to `origin/tranche/T51` (no `content` rows in `read-bounds.mjs`); `HELD_TEXT_CHARS_MAX` and `KIND_SCAN_PAGES_MAX` stay local constants. I need a CHANGE when it merges to switch them to `boundOf("content", "held_text_chars")` and `("content", "kind_scan_pages")`.
Size (session_01K9HMgas2XJZzhRzt7oMHQn): test runs 28, module lines 3913

## J13 · COMPLETE

COMPLETE (re B17). Merged `origin/tranche/T51` (job 64 in). `HELD_TEXT_CHARS_MAX = boundOf("content", "held_text_chars")` and `KIND_SCAN_PAGES_MAX = boundOf("content", "kind_scan_pages")`, no literal; `runtime-limits` was already in content's `uses`, so no edge is owed. Suite: tests 174, pass 170, fail 4 (the R61 seam tests, red by name until job 41). format, architecture, coverage (61 of 61), words, ownership: 0 failures. Pushed.
Size (session_01K9HMgas2XJZzhRzt7oMHQn): test runs 30, module lines 3914

## J14 · COMPLETE

COMPLETE (re B18, R52 `cellsAt(contentId, {fromRow})`). Merged `origin/tranche/T51`. RED first: the two new tests in `g41-cells.test.mjs` failed on the old code (the window read from row 1 whatever `fromRow` said: actual cell `A1` where `A5` was asked; a null options object threw). GREEN: `cellsAt(id, {fromRow})` answers the extent's cells from `fromRow` (held sheet: `extraction.cellsOf` is asked from it, the answer's `interpreted.from_row` is it, `cells_truncated` and `next_row` as for the first window; listed sheet: the cells of rows from it); a `fromRow` that is not a whole number from 1 inside the extent's rows (a sheet-cell has one) is refused `reason: "from_row_outside_extent"`, stated, with the file not asked; none, null, `{}` or `{fromRow: null}` is the first window as before; other refusals come first. A 400-row range is read in 100 calls of four whole rows each, every row once in order (test). New sentence: stand-in `content.index.from_row_outside_extent` (row owed to later-ux).
Suite: tests 176, pass 172, fail 4 (the R61 seam tests, red by name until job 41). `test/m/calculations/` (the caller) 114 of 114. format, architecture, coverage (61 of 61), words, ownership: 0 failures. Pushed.
Size (session_01K9HMgas2XJZzhRzt7oMHQn): test runs 34, module lines 3925
