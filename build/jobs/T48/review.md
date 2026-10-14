# review (T48)

**Status** · session_01QUuQMyy4adVnFw1qXKgtGc · depth 2 · COMPLETE · handled B3

## J1 · QUESTION

Best reading, applied: R34 puts `until` in the grant's answer and the member door's roster (R14). The recipient's own `grant` part in the copy (grant_id, recipient, issued_by, issued_at) is NOT given `until`, since R14 and R34 name only the roster. But screens-publish R18 says review-outside draws the link's end date 'from the same answer', which for a recipient is that own-grant part. If you want it there (one added key, same for both doors' definitions), say so and I add it with its test. Also for BOB: screens-publish today sends `until` as a date only (YYYY-MM-DD, review-copy.mjs:88-92); the plane now refuses that as REVIEW_BAD_UNTIL until screens-publish R18 sends the stamp form.

## Completion

**Read, whole:** `build/requirements/review.md`; my code (`index.mjs`, `checks.mjs`, `schema.mjs`) and all the module's tests under `bio-plane/test/m/review/` (P20, plan rule 2). Of the used modules only `record-core`'s `stampInstant` and `instantOrder` (its R47), the one service R34 touches. I did not read `build/layers.md` for layer 8's contract whole: R34 changes no boundary, and B2 (K3271) narrowed the set after I had begun. No helpers were used; no digest was written.

**Entry applied:** T48-44 (N1038, K3147): R34.
- `grant` takes `until`, checked after R6's refusals and before the mint: present and not a stamp-form instant (UTC, whole seconds or milliseconds, a real calendar instant), or not later than the act's own instant, is `REVIEW_BAD_UNTIL` (C-87.17, BOB's words), nothing written. Absent (null or not sent) is live until revoked; `""` is present and refused.
- `review_grants.until` (new column, added by `migrateReview`, never back-filled; old grants stay live). The grant's answer states `until` (null when absent); `boundTo` gains " It also ends at <until>." only when one is set.
- `liveGrant` (so `grantAdmitsCaseEdition`, R10's doors, the comment and the provider) answers null from `until` on, judged on the module's clock; nothing is written when it lapses. The member door's roster states each grant's `until`, `live` false from it on, and the recipient's own `grant` part states its own (B3, K3273). `revoke` of a lapsed grant still records. `reviewgrant` reads `until` from the body or the query beside `recipient`.
- No member-facing "labelled" in the module.

**Tests:** new `until.test.mjs`, 7 tests naming R34 (a host clock moved to and past `until`, dead answer byte-identical to a revoked grant's with the snapshot unchanged; no `until` stays live and an old store migrates; 20 bad values refused with nothing written; order against R6 and the mint; the roster; revoke of a lapsed grant; the ops). Mutation control: with the lapse test made always false, 4 of the 7 fail. `invariants.test.mjs` gains C-87.17 in the R23 table and its driver.
- `node --test bio-plane/test/m/review/`: tests 54, pass 54, fail 0 (re-run after B3's key).
- Users' tests: notice-producers 114/114, publication 145/146 (the one skipped is not a failure: fail 0), case-authoring 190/190, case-account 41/41, ratification 245/245. op-declarations (10 fail) and answer-envelope (2 fail): the same 12 failures with my change stashed (the registry-at-PR tests, T47's reds in the plan's rule 5), none mine.
- `node checks/run.mjs /home/user/bio`: format 0 failures; architecture 0 failures; coverage 32 failures, none in `review` (34 of 34 live ids named); channels 0 failures. `ownership.mjs review tranche/T48`: 6 files changed, 0 failures.

**Deferred:** none.

**Found in other modules:**
- `screens-publish` (review-copy.mjs:88–92) sends `until` as a date only (`YYYY-MM-DD`, with the date pasted into `recipient`); `review` now refuses that as `REVIEW_BAD_UNTIL` until its R18 sends the end of the day as a stamp-form instant. It is that module's entry.
- `screens-publish` R18 has `review-outside` draw the link's end date from the copy's answer. Question J1; BOB's B3 answer (K3273) adds `until` to the recipient's own `grant` part, applied.
- `op-declarations`: `reviewgrant`'s declared inputs, if it lists any, would need `until`; I found no listing of `recipient` there to extend, so nothing to report as stale.

Size (session_01QUuQMyy4adVnFw1qXKgtGc): test runs 9, module lines 1357

## J2 · COMPLETE

T48-44 applied (R34): grant takes until (REVIEW_BAD_UNTIL, C-87.17), recorded and answered in the grant, the roster and the recipient's own grant part (B3); lapsed grants are dead as revoked. Tests 54/54 in review (new until.test.mjs, 7 tests); format, architecture, coverage (34 of 34) and ownership 0 failures for review. Found in screens-publish: it sends a bare date, refused until its T48-75 entry. Details in the record.
