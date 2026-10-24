# Diagnosis G89: an open notice raised UNDETERMINED keeps that grade after the newer copy is read

Worker: diagnosis (sonnet). Local only; no tracked file edited. Scratch: /tmp/claude-0/-home-user-bio/04e4e6df-d9f4-57e8-b7fc-97162c5ea1d5/scratchpad/zz-scratch-repro.test.mjs

## Is it real? Yes.

**Reproduction** (module harness `bio-plane/test/m/reevaluation/fixture.mjs`, real record-core, content, provenance, inquiry, as in `r7-sweep-unread.test.mjs`): a question cites page 2 of capture a (read); sweep completes; capture b is filed and received unread; tick raises the notice; then b is read (text differs); two more ticks; then `notices()` and `versionNotice()`. Outcome:
- raise: `UNDETERMINED / undetermined`
- `versionNotice({target})` after the reading: `newer_capture_matched`, `affects: affected` (the pull read regrades)
- `notices()` after the reading and two ticks: one notice, `open`, still `UNDETERMINED / undetermined`.
Not tried: the Miniflare door path (`t51-round7-seam.test.mjs` §G66 at line 626 ends at the raise, and does not read the copy afterwards). The module-level result is enough since the stored column is what the door serves.

## (1) Cause
`bio-plane/src/reevaluation/index.mjs`: `raiseNotices` 2335-2342 writes `grade` and `affects` once at insert (the notice id is `RN-` + hash of holder, ord, content, newer capture, so line 2336 `continue`s on any existing id and never updates it). `notices()` (2584-2597, `#noticeRows` 2546-2556, `#noticeView` ~2536) serves those stored columns, never `content.noticeForRow` again. Owner: `reevaluation` (layer 7). The text of R14 is "one notice per (holder, reference, newer capture)" and "closes ... a later read does not raise it again"; it does not say the grade is frozen or live. So this is not a defect against R14 as written but behaviour R14 does not require: R14 is silent on regrading. Also note R14 is a push of "graded affected or undetermined", and R21 (silence is earned; undetermined is "what could not be read") is arguably met only while the copy is unread; after the reading, "undetermined" is no longer true of the record.

Effect on a member: shown something wrong (stale), not stuck. The notice remains open and actionable: `adoptVersion` and `keepVersion` (R15) work; adopt re-pins to the newer capture regardless of grade. But the queue item says "undetermined" where the record now knows affected (or unaffected, where A/B would be a notice never raised: a notice that is really unaffected stays open, which is the worst case).

## Proposed change of meaning (BOB's / Bob's call)
Add to R14: an open notice's `grade` and `affects` are read live from `content` when served (`notices()`, queue rendering, `notice(id)`), the raise-time grade being kept as `raised_grade`; a closed notice keeps the grade it was closed under. Smaller alternative: the sweep updates an open row's grade when it was `undetermined` and now grades otherwise (a write on R18's list, R14 notices, already allowed). If it regrades to A/B, the notice stays open (do not auto-close; only a member's act closes) and says unaffected. R8's listeners are not re-told (one telling per raise); that is a second decision.

## (2) Why tests missed it
Every `raiseNotices` test asserts the grade at raise time; `r7-sweep-unread.test.mjs` "filed but not yet read" pins undetermined at raise and stops. The seam §G66 stops at the raise. No test reads the copy after the raise and then looks at the open notice. R14 states no regrade, so no test was owed.

## (3) Failing-first test
`bio-plane/test/m/reevaluation/r14-regrade-after-read.test.mjs` (module level, then a seam arm in `t51-round7-seam.test.mjs` at the §G66 test through `op=reevaluationnotices` / `op=queue`): the scratch scenario above; assert after the reading and a sweep tick that `notices()` row has `affects: "affected"` (and `grade` of the C/NOT_FOUND kind), still `open`, same notice id, count 1 (no second notice). Controls: a closed notice (kept before the reading) keeps `UNDETERMINED`; a notice raised `affected` is unchanged; an unrelated unread copy stays `undetermined`. Red today on the first assertion.

## (4) Platform check
L for the module test and the seam arm. P: on biosmoke8 (not touched here), one question with an UNDETERMINED notice whose newer copy is now read: `op=reevaluationnotices` grade after the redeploy. N for nothing else.
