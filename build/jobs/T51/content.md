# content (T51)

**Status** · session_01P2JndhzMAdUJg3Zg8sCpBP · depth 2 · WORKING · handled B4

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
