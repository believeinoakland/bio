# reevaluation (T11)

**Status** · session_01HnoN5aneqU2Z7HVyorPUBY · depth 2 · WORKING · handled B1

## J1 · QUESTION

R26 (N210), R14's case half: the requirement fixes the registration and who is told, not where the sweep meets cases or how "told" is held. My best reading, which I am building now:

1. **Where.** `raiseNotices` runs the case half after the leg half, in the same cursor: legs in (holder, ord) order, then ratified cases in id order (`record.listByType({type: "case"})`), the cursor `case:<case id>` once in the case half. `limit` bounds legs, and cases count one per case toward it (a case's parts are at most 1,000, publication R41). A case `fn` refuses or answers without `parts` (not ratified) is passed over. So R25's pass covers both halves unchanged.
2. **A part's pinned capture.** `record.textAtSha(part, bundle_sha)` (its R60) is the part's `bundle.md` at the pin; its frontmatter's `content_hash`, when held, is the authored capture, else none, and `content.captureFor(part, authored)` (its R11) is the pinned capture. Graded as a `document` extent row at that capture through `content.noticeForRow` (machine viewer), as the leg half reads; `chain_unread` raises nothing (K102), affected or undetermined raises.
3. **Told.** One notice per (case, part, newer capture), in its own table `reevaluation_case_notices` (keyed by the case for purge), holding the case, edition, project, part, pin, both captures, grade, affects and the owners told (`membership.projectOwners`, R65, read when raised). `notices()` lists a case notice only to a viewer who is one of those owners (a machine credential sees all, as today); nobody else is told. R8's listeners hear it as `kind: passage` with `case`.
4. **R15 on a case notice.** `keepVersion` closes it (an owner, recorded as for a leg). `adoptVersion` is refused `VERSION_ADOPT_UNWRITABLE`: re-pinning a ratified case's part is a new edition, publication's act, not this module's.
5. **Absent.** With no `fn` registered, `raiseNotices` answers `case_parts_absent: true` with a sentence, and tells nobody.

Also, not asked but done under one code one site (K231): `onBasisChanged`'s own `LISTENER_MALFORMED`/`LISTENER_DECLARED` move to `membership.listenerRefusal` (R81), as R26's must.
