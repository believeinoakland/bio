# T38 L8: requirement drafts (N779, N788, N790) — BOB #142, applied at L8's START (K2291)

Read on `tranche/T38`. Long lines: only the changing clause is quoted verbatim; the rest stands. "By key": a row's translation is that `words.json` key's `en`, verbatim, `{photo}` filled.

## 1. case-grammar (T38-19)

**R12, current (its T37 paragraph's opening):**
> (T37; N757; DEC-180 (4), K2108, K2206) A `document` row may state `obscured`: the photo travels as a copy with its marked areas obscured, never whole. The row then states `included: false`, and its `sha`, `text_sha`, `origin` and `archived_copy` stay the original's. … `label` the sentence the published case shows beside the material (`case-carriage`'s `OBSCURED_LABEL`). A row without it answers `obscured: null`.

**Proposed:**
> (T37; N757; DEC-180 (4), K2108, K2206; T38: N779, K2248) A `document` row may state `obscured`: the photo travels as its copy (`case-carriage` R11), carrying nothing of the original but its pixels, with its marked areas, if any, covered, never whole; a published case states it for every photo it carries *(not yet met: T38)*. The row then states `included: false`, and its `sha`, `text_sha`, `origin` and `archived_copy` stay the original's, which the group keeps with its metadata. … `label` the sentence the published case shows beside the material: `case-carriage`'s `OBSCURED_LABEL` when the photo is marked, else null (a copy with nothing covered) *(not yet met: T38)*. A row without it answers `obscured: null`.

Note: K2248, rule 8. Still optional; no format change (absent `obscured_label` reads null); "every photo" is enforced by case-disclosures R6. **Ask:** `photo.obscured.label` says "Faces and plates obscured", so it is untrue on an unmarked copy. The draft gives no label. If the public page should say "metadata removed", that needs a word from UX-DESIGN (send a NOTICE).

## 2. case-carriage (T38-11)

**Purpose, T37 bullet:** "… and the copy derived from them with each marked area covered, which a published case carries in place of the original." → "… and the copy derived from the marks that stand, nothing of the original but its pixels, each marked area covered; a published case carries every photo only as this copy (T38; N779, K2248) *(not yet met: T38)*. A mark is withdrawn, never erased (DEC-183)."

**R1, the photo bullet: add at its end:**
> (T38; N779) A row listed `included: true` whose capture is a photo (R9's term) is not held: it is answered in `unheld` (`kind` `document`, why "a photo travels only as its copy"), so no original photo's bytes reach the published projection *(not yet met: T38)*.

**R8, clause:** "A photo carried as its copy (R1) carries none of R8's files, and an archive that also holds a photo this edition carries as its copy is carried for no material" → "(T38: N779) A photo, always carried as its copy (R1), carries none of R8's files, and an archive that also holds a photo this edition carries is carried for no material *(not yet met: T38)*".

**R9, current clauses:** "Refusals, in order, each writing nothing: `MACHINE_CANNOT_MARK` when `by` is absent or a machine identity" … "Otherwise it records the mark … derives the photo's copy (R11) … Marks are append-only: no act changes or removes one, and a later "nothing to obscure" never removes an area."
**Proposed:** "… `MACHINE_CANNOT_MARK_PHOTO` (N790, K2238: its own code, no other family's) *(not yet met: T38)* when `by` is absent or a machine identity …" and "Otherwise it records the mark …, derives the photo's copy from the marks that stand (R11), including after a mark with no area *(not yet met: T38)* … No act changes or erases a mark. A mark leaves the photo's copy only by a withdrawal (R14), and a later "nothing to obscure" never removes an area *(not yet met: T38)*."

**R10, current clause:** "`state` `marked` when any mark has an area, `nothing_to_obscure` when it has marks and none has an area, `unchecked` when it has none; `marks` each `{mark, areas, by, at}`, oldest first"
**Proposed:** "`state` read over the marks that stand (none withdrawn, R14): `marked` when any has an area, `nothing_to_obscure` when some stand and none has an area, `unchecked` when none stands; `marks` each `{mark, areas, by, at, withdrawn}`, oldest first, withdrawn ones included, `withdrawn` `{by, at, reason}` or null *(not yet met: T38)*".

**R11, current clause:** "After each mark that leaves the photo `marked`, its copy is derived … from the original's bytes … and every area of every mark the photo holds; when `obscureMark` answers, the copy … covers every area recorded up to and including that mark."
**Proposed:** "(T38; N779, K2248; DEC-183 (2)) After each mark and each withdrawal (R14) that leaves a mark standing, the photo's copy is derived by `image-cover.coverAreas` (its R1) from the original's bytes … and every area of every mark that stands, with `areas: []` when none has an area (a copy with nothing covered and, as with any copy, no metadata: `image-cover` R2); when the act answers, the copy `photoMarks` answers is that derivation. A photo with no standing mark has no copy (null) *(not yet met: T38)*." Also amend the refusal sentence "When `image-cover` refuses the cover by name …": "… whether the photo is marked or not *(not yet met: T38)*, the act stays recorded …".

**R12 (Invariants), current:** "(T37; DEC-180 (2), (3)) The marks are declared … and are append-only (`version_chain: true`): a test proves no act of this module rewrites or removes a mark row. No area's rectangle, kind or reason, and no maker, leaves the group in a case's bytes: …" **Proposed:**
> (T37; DEC-180 (2), (3); T38: DEC-183 (2)) The marks and their withdrawals (R14) are declared to `record-core` (`declareTable`) with their classes and are append-only (`version_chain: true`). A withdrawal is its own row naming the mark, beside it, and never changes or removes the mark row: a test proves no act of this module rewrites or removes a mark or withdrawal row *(not yet met: T38)*. No area's rectangle, kind or reason, no withdrawal's reason, and no maker leaves the group in a case's bytes *(not yet met: T38)*: the copy carries only the covered pixels (`image-cover` R2).

**R13, current clause:** "a row stating `obscured` whose `copy` is not the photo's current copy (R11), and a row carried whole (`included: true`) whose photo is now `marked` (R10)"
**Proposed:** "a row stating `obscured` whose `copy` is not the photo's current copy (R11), so a withdrawal since preparation is a lapse, and a photo row carried whole (`included: true`), always *(not yet met: T38)*".

**R14 (new):**
> **R14** (T38; N788; DEC-183 (2); K2220) `obscureMarkWithdraw({captureSha, mark, reason, by})` (`op=obscuremarkwithdraw`, in `caseCarriageOps` beside `obscuremark`; `by` from the query only, the rest from the body) withdraws one mark on a photo. The act may be done by the mark's maker or by any member who may see the photo (R9's sight). Refusals, in order, each writing nothing: `MACHINE_CANNOT_WITHDRAW_MARK` when `by` is absent or a machine identity; `NO_SUCH_PHOTO` as R9; `NO_SUCH_MARK` when `mark` is not a mark on that photo; `MARK_ALREADY_WITHDRAWN`, naming when it was withdrawn and by whom; `WITHDRAW_NO_REASON` when `reason` is absent, not a string, blank or over 2,000 characters. Otherwise it records `{withdrawal, mark, capture, reason, by, at}` (`at` record-core's instant) beside the mark (R12), re-derives the copy (R11) and answers `{ok: true, mark, withdrawal, state, copy, refused}` as R10 answers after the act. The new codes are rows of C-141, numbered at their stamp; their translations are BOB's drafts, re-wordable by the UX stream. *(not yet met: T38)*

**N790 (Suggestions):** a test that the composed catalogue holds each code once, so C-141 reaches the wire.

Note: K2220, K2238, K2248; DEC-183 (2). Keys: `photo.obscured.label` (= `OBSCURED_LABEL`); `act.owed_obscuremarkwithdraw.*` are op-declarations' (L11). **Ask:** (a) `words.json` holds **no** `photo.*` words for the withdrawal refusals, so the plan's "its refusals' words `words.json`'s `photo.*`" covers none of R14's codes. Draft the C-141 translations as BOB's and send a NOTICE to UX-DESIGN. (b) DEC-183 says "any member who may act on the case", but marks are kept per capture, not per case. The draft reads it as R9's sight; confirm. (c) R8 covers only photos *this edition carries*, so an archive holding an unrelated photo member would still publish that original with its metadata. Ask whether to fail closed on any image member.

## 3. public-read (T38-20)

**R23, current clause:** "(T37; N757) and, for each row carried as its copy, the copy as one file of kind `obscured` under that row's ref, at the SHA-256 `obscured.copy` names, read from the published projection by that hash, never the original's bytes, its extracted text, or an archive or container record of it (R32)"
**Proposed:** "(T37; N757; T38: N779, K2248) and, for each photo, which the case carries only as its copy, the copy as one file of kind `obscured` under that row's ref, at the SHA-256 `obscured.copy` names, read from the published projection by that hash, never the original's bytes, its metadata, its extracted text, or an archive or container record of it (R32); no route of this module serves a photo's original *(not yet met: T38)*" (rest stands).

Note: K2248, rule 8; rests on case-carriage R1 and case-disclosures R6. Test: a marked and a nothing-to-obscure photo; the bag carries only `obscured` files, none equal to an original, none with EXIF/XMP. No key. **Ask:** only if the job finds another route serving material bytes by hash.

## 4. case-disclosures (T38-12)

**R6, current:** the T37 "A marked photo" bullet, ending "A photo answered `nothing_to_obscure` or `unchecked`, whatever its format, is judged as any document and travels whole as taken (K1483; N779 not in T37)." **Proposed, replacing the bullet:**
> **A photo** (T37; N757; DEC-180 (3), (4); K2206; T38: N779, K2248; DEC-183 (1), K2220). A document material whose capture `case-carriage.photoMarks` (its R10) answers `photo: true` never travels whole *(not yet met: T38)*. In order: marks that cannot be read are `PHOTO_MARKS_UNDETERMINED`, naming the photo (fail closed). An `unchecked` photo (no standing mark) that any member's chain reaches is refused `PHOTO_UNCHECKED` (a new C-120 row, R22), naming each such photo and member *(not yet met: T38)*. A photo whose cover `image-cover` refused, marked or not, is `PHOTO_NOT_COVERABLE` when a load-bearing chain reaches it *(not yet met: T38)*; when only supporting chains reach it, it is listed `included: false` with no `obscured`. Otherwise (`marked` or `nothing_to_obscure`, with a copy) it is answered `included: false` with `obscured: {copy, label}`: `copy` its current copy's SHA-256, `label` `OBSCURED_LABEL` when `marked`, else null *(not yet met: T38)*. It is presentable through its copy and never `RELIED_ON_NOT_PRESENTABLE` for being held so. A withdrawn mark counts as withdrawn (`case-carriage` R14). Each refusal writes nothing.

**R22, current T37 sentence:** "(T37; N757; K2206) R6's `PHOTO_NOT_COVERABLE` and `PHOTO_MARKS_UNDETERMINED` are new rows of this family, numbered at their stamp, their translations BOB's drafts (below), re-wordable by the UX stream."
**Proposed, appended:** "(T38; DEC-183; K2220) R6's `PHOTO_UNCHECKED` is a new row of this family, numbered at its stamp. Its translation is `words.json`'s `photo.refused.unchecked`, and `PHOTO_NOT_COVERABLE`'s is now `photo.refused.format`. Both are read by key, protected, `{photo}` the photo named *(not yet met: T38)*." Table: re-word the `PHOTO_NOT_COVERABLE` row, and add `| (T38, at its stamp) | PHOTO_UNCHECKED | "Signing waits until every photo the case relies on is checked: {photo}." |`.

**R29, current clause:** "`words` `OBSCURED_LABEL` for a marked photo with a copy, for a refused cover the sentence that the case cannot rely on the photo … else null. `unchecked` counts the photos with no mark. An unchecked photo never refuses and never blocks signing: it is shown unchecked and travels whole as taken."
**Proposed:** "`words` `OBSCURED_LABEL` for a marked photo with a copy, `photo.refused.format` for a refused cover, `photo.refused.unchecked` for an unchecked photo, else null; `marks` with their withdrawals (`case-carriage` R10). `unchecked` counts the photos with no standing mark. An unchecked photo blocks signing (R6's `PHOTO_UNCHECKED`) and never travels *(not yet met: T38)*."

Note: DEC-183 (1), which supersedes K2206's "never blocks"; K2220, K2248. Keys used: `photo.refused.unchecked`, `photo.refused.format`, `photo.obscured.label`. R29 is **not** in the plan's `req:` (it lists R6, R22), but it holds the contradicting "never blocks signing" clause, so add R29 to T38-12's req. **Ask:** (a) What counts as "relies on"? The draft gates every photo any chain reaches (R29's `relied_on_by`; the Photos step lists them all). The alternative gates only load-bearing photos and leaves out unchecked supporting ones. (b) The `words.json` texts lack the house "Nothing was written."; keep them verbatim. (c) Re-wording C-120.17 after its stamp (T38-6) moves `CATALOG_VERSION` (rule 17); expected.

## 5. case-authoring (T38-13)

**R34, current clause:** "(T37; N757; DEC-180 (3); K2206) `photos`, `case-disclosures` R29's answer over the materials `publishCase` judged (the ceremony's Photos step), with `unchecked` counted: an unchecked photo is never among `blockers`, and `case-disclosures` R6's `PHOTO_NOT_COVERABLE` and `PHOTO_MARKS_UNDETERMINED` are, with R6's other refusals;"
**Proposed:** "(T37; N757; DEC-180 (3); K2206; T38: DEC-183 (1), K2220) `photos`, `case-disclosures` R29's answer over the materials `publishCase` judged (the ceremony's Photos step), with `unchecked` counted. Signing is refused while any photo the case relies on is unchecked: `case-disclosures` R6's `PHOTO_UNCHECKED` names each such photo (words `photo.refused.unchecked`) and is `first` when `op=publish` would refuse with it, else among `blockers` *(not yet met: T38)*. R6's `PHOTO_NOT_COVERABLE` (words `photo.refused.format`) and `PHOTO_MARKS_UNDETERMINED` are among `blockers` as well, with R6's other refusals;"

Note: DEC-183 (1). The gate is R6's refusal inside `publishCase` (R18): `op=publish` refuses, nothing is stored to sign; a withdrawal after preparation is publication's `PHOTO_MARKS_CHANGED_SINCE` via case-carriage R13. No new R; no ask. Test: an unchecked photo is `first`; "nothing to obscure" clears it.

## 6. image-cover

No change (rule 8): R1's empty `areas`, R2 on every answer, R3's `NOT_A_COVERABLE_FORMAT` (HEIC).

## 7. Outside L8's entries (for BOB)

- publication C-122.6 `PHOTO_MARKS_CHANGED_SINCE`: DEC-183 (4) owes `photo.refused.changed` as its words. publication has no T38 entry. Either add a line to an L8 job or carry it to `next.md`.
- `bio-plane/src/setup-words.mjs` (instance-setup R68, generated at `e08cd35ecb`) holds no `photo.*` word: jobs quote them verbatim citing the key; its owner regenerates the list.

## 8. Is `obscuremarkwithdraw` routed already? No.

- Not in `bio-plane/src` at all (grep). `caseCarriageOps` (`bio-plane/src/case-carriage/index.mjs`:668–676) maps only `obscuremark` and `photomarks`.
- The plan's "R18, K2226" is **plane** R18: `bio-plane/src/plane/store.mjs`:556–558 spreads `...caseCarriageOps(publicationOf(ctx).caseCarriage, url, body)`, so once case-carriage adds the arm (R14), the plane routes it with no plane change.
- `bio-plane/src/control-plane/` names no `obscuremark`; it stamps `by` and `viewer` from `OP_STAMPS`, which `op-declarations` derives from its `OP_FAMILIES` (`op-declarations/index.mjs`:411–416, family `case-carriage`, `actor: QUERY("by")`, `obscuremark: "member"`).
- So T38-15's declaration (`obscuremarkwithdraw: "member"`) likely completes the route; T38-16's share may be only an end-to-end test (`by` from the session). Confirm at L11's START.
