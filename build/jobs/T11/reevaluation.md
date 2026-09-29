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

## J2 · QUESTION

Replaces J1 (the whole of it stands, with point 1 changed as below).

**The gap.** A case is not a bundle: it is a row of publication's own `cases` table (layer 8), so this module has no way to list the ratified cases, and R26's `fn({case, edition?})` answers one named case only. R14's case half needs the cases to ask about.

**My best reading, which I am building:** R26's registration carries a second function, `registerCaseParts(module, {parts, cases})`: `parts({case, edition?})` is publication R41 as worded; `cases({after, limit})` → `{cases: [case id], cursor}` answers the cases with a ratified edition in id order after `after`, at most `limit` (1–1,000), viewer-free, from publication's own table. The sweep's case half pages through `cases` with the cursor `case:<last case id>`, one case counting one toward `limit`, and asks `parts` for each. A registration missing either function is `LISTENER_MALFORMED` (through `listenerRefusal`, by passing it a function only when both are). If you would rather keep `fn` alone (for instance `fn({})` answering the list), say which and I will rewire; it touches only the registration. This needs publication R41 (or a new R) worded for `cases`.

Points 2–5 of J1 stand: pinned capture by `record.textAtSha` + `content_hash` + `content.captureFor`; one notice per (case, part, pinned capture, newer capture) in `reevaluation_case_notices`, listed only to the owners told (`membership.projectOwners`) and machines; `keepVersion` closes one, `adoptVersion` refuses it (a new edition is publication's); `case_parts_absent` with none registered.
