# reevaluation (T11)

**Status** · session_01HnoN5aneqU2Z7HVyorPUBY · depth 2 · COMPLETE · handled B2

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

## J3 · COMPLETE

**Completion (T11, layer 7).** Branch `job/T11/reevaluation`, tranche merged through B2 (K359).

**Entries applied**
- **N239** (Uses, record-core R47): `noticeSweep`'s pass-began stamp is now `stampInstant("second", now)`; no stamp in the module is spelled by hand.
- **N292** (R7–R8, inquiry R42): the `inquiry.onRaised` registration answers `r.raise({…})` whole, so `listeners_failed` reaches dispose's, divide's and a re-read's (`staled`) reply. Test fails on the old `.raised` line, passes now.
- **N210** (R26, R14's case half, R15 on a case notice), as K359 words it: `registerCaseParts(module, {parts, cases})`; the case half follows the leg half in `raiseNotices`' pass (cursor `case:<id>`, `CASE_CURSOR` exported); a part's pinned capture is `record.textAtSha(part, pin)`'s `content_hash` through `content.captureFor` (graded whole, machine viewer); one notice per (case, part, pinned capture, newer capture) in the new table `reevaluation_case_notices` (purge: whole-store only, since a case is no bundle), owners from `membership.projectOwners` read when raised; `notices()` lists it to those owners and machines only; `keepVersion` closes it, `adoptVersion` refuses it (`VERSION_ADOPT_UNWRITABLE`); `case_parts_absent` with none registered. R8's listeners hear a case notice as `kind: passage` with `case`.
- Improvement in my own module (K231): `onBasisChanged` mints no refusal of its own; it asks `membership.listenerRefusal` (R81).

**Marks for BOB to strike** (my work meets them): R8's `(not yet met: N292 …)`; R26's `(not yet met: N210)`; Uses record-core's `(not yet met: N239 …)`.

**Deferred:** none. R14–R17's other not-yet-met marks (REC-222's cites and claims, REC-223, K102) were not my entries this tranche.

**Found elsewhere / reports**
- `bio-plane/dist/bio-plane.bundled.mjs` (`not_product`, BOB's at layer close) is stale by this module's source change. No other generated artifact takes reevaluation's source.
- `publication` (layer 8): its START needs R41 `caseCitedParts` and R43 `ratifiedCases`, registered as `registerCaseParts("publication", {parts, cases})`. Note for it: `cases` paging treats a page shorter than `limit` as the end.
- No check row added or changed (nothing for promotion R34 to stamp).

**Tests and checks**
- `node --test bio-plane/test/m/reevaluation/`: tests 49, pass 49, fail 0, todo 0 (new: `caseparts.test.mjs` 7; `raise.test.mjs` +2; `sweep.test.mjs` +1).
- `node --test bio-plane/test/m/inquiry/` (uses the changed `onRaised` answer): tests 60, pass 60, fail 0.
- No layer tests named in `build/manifest.md`.
- `format`: 69 modules, 64 requirements files; 0 failures. `architecture reevaluation`: 11 product files, 45 relative imports; 0 failures. `coverage reevaluation`: 26 of 26 live ids named by a test; 0 failures. `ownership reevaluation tranche/T11`: 6 files; legacy-store 0/0, legacy-checks 0/0; 0 failures.
- SQL: no LIKE/GLOB added; every read goes through the cursor-iterating `#rows`/`#one`.

Size (session_01HnoN5aneqU2Z7HVyorPUBY): test runs 12, module lines 1634
