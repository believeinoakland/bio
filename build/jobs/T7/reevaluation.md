# reevaluation (T7)

**Status** · session_01NEVHbroPLayAoiuTkg5UL2 · depth 2 · COMPLETE · handled B2

## J1 · QUESTION

My readings of what the requirements leave open. I am building on them now; each is a detail under P17 unless you say otherwise.

1. **R14, what raises a notice.** A bounded sweep, `raiseNotices({limit, after})` (op `reevaluationraise`, admin and daemon), that `scheduler` or `monitoring` calls: for every basis leg resting on a content row (inquiry R40), `content.noticeForRow` under a machine viewer; one notice row per (holder = the inquiry holding the leg, reference = (holder, ord, content id), newer capture) for each candidate whose `affects` is `affected` or `undetermined`; `chain_unread` and A/B raise none; an existing (holder, reference, newer capture) is never raised twice, open or closed. Reads (R1, R9, R11) write nothing (R18). Not built here, reported instead: the queue kind and mute (queue's `queuestate.mjs`), a published case's owners (publication, layer 8), and references other than inquiry basis legs (a case's cites, action legs, run legs: D-579, D-595, their modules). My table: `reevaluation_notices`.
2. **R15, adopt on a basis leg.** `adoptVersion` appends one version through `basis-versions.appendVersion` (its R28): the inquiry's live legs as written, the notice's leg re-pinned to the newer capture (`extent_capture`, its extent kept, `content_id` replaced by the candidate's held row or dropped), name `adopt-<first 8 hex of the newer capture>-<ord>` (a counter suffix when taken), a description naming both captures, state `suggested` as R28 fixes. The inquiry's live basis is untouched, so the old reference stays readable. Keep writes a closure row with who, when, why and both captures.
3. **R16, the four cascade events derived on read** (R18 lets me store none): `source_status` when the target is information whose document states `source_status` `modified` or `removed` (since: its `last_updated`); `wp_retraction` when the target is a work product whose state is `retracted` or `redistributed`; `annotation` when the target holds an annotation record `addressed` with `substantive: true` (since: that record's instant); `deletion` when the leg's target is no longer held (since: null, stated undetermined). `recordReevaluation` stores (dependent, target, source, since) with note, author and time; a cause whose `since` is not later than a recorded one's is listed under `closed`, with who and when.
4. **R17's shape.** A `weakened` obligation has the dependent as its own target (`target` = `bundle_id`, `legs: []`), `since` the ratified instant of the edition it is measured against, `axes` naming per axis the frozen and derived `{state, grade}`; weaker means both graded and the derived letter ranks below the frozen one. Read from promotion's fact `publishedRegistry` (the store provides it) and `strength.strengthOf`.
5. **New refusal family.** R15 and R16's codes (`MACHINE_CANNOT_ADOPT_VERSION`, `MACHINE_CANNOT_KEEP_VERSION`, `MACHINE_CANNOT_RECORD_REEVALUATION`, and their not-found/closed codes) as family C-110 held in the module (K174, K181 (2)); C-10.1, C-80.1 and C-80.2 move with their numbers. Tell me if intent already took C-110.
6. **R8's `listeners_failed` on dispose and divide.** Inquiry wraps my answer as `{source, since, raised}` from the array `onRaised` returns, so a failing listener cannot reach those replies without inquiry carrying it (a change to inquiry R42). Reopen (my object answer) and publication's direct call carry it. I will REPORT it for inquiry unless you rule otherwise.

## J2 · REPORT

What this job found in other modules, or made stale there. Each is described against that module's requirements; none is changed here.

1. **inquiry (N160, yours):** `listeners_failed` (R8) cannot reach `dispose`'s or `divide`'s reply, because inquiry R42 wraps the array `onRaised` returns as `{source: cause, since, raised}`.
2. **queue (layer 11):** R14's notices need a queue kind and a mute kind. The producer reads `reevaluationOf(ctx).notices({holder, state, after, limit, viewer})`. The queue door that offers ADOPT and KEEP (REC-202) calls `adoptVersion({notice, author, viewer})` and `keepVersion({notice, why, author, viewer})`.
3. **publication (layer 8):**
   - A published case's owners are told once per affected or undetermined cited part (R14's last clause). This needs the case's cited parts and its owners.
   - The edition arm of `publishCase` now calls `reevaluationOf(this.ctx).raise({target, source: "edition", since, edition, viewer})` in the store. That call moves with publication.
   - R17 reads the fact `publishedRegistry`, which the store provides until publication does.
4. **scheduler / monitoring (layer 10):** R14's sweep has no caller yet. Something must call `raiseNotices({limit, after})` (op `reevaluationraise`), following `cursor` until it is null, after a newer capture is read.
5. **Other references (D-579, D-595; actions, run-productions, citation):** R14 and R15 are built for inquiry basis legs only. A case's `cites`, an action's legs and a run's suggested legs raise nothing until those modules pin their capture and name a holder.
6. **content:** reevaluation calls `noticeForRow(row, viewer, memo)` for the question arm (R11) and the sweep (R14). content's comment names reevaluation as its caller, but content R29–R31 state only `passageNotice`. Proposed: state `noticeForRow` in content's Provides.
7. **record-core:** the D-256 audit (R12) scans `files.content` in SQL (`instr(content, …)`), as inquiry, retrieval and run-productions do. record-core R37's `files` contract names only `bundle_id`, `path` and `sha256`. Proposed: add `content`.
8. **promotion:** C-10.1 left the catalogue's `checkBundle`, so `CATALOG_VERSION` (`gate.mjs`, R34) is owed a bump. The gate (`runGate`) no longer runs C-10.1. The promotion step (errors refuse, replays exempt) and record-core's audit (every arm) now run it.
9. **legacy-index (layer 11):** new ops with no OPS row: `reevaluationraise` (admin, daemon; mutating), `reevaluationnotices` (admin, member, probe; read), `versionadopt` and `versionkeep` (member; mutating), `reevaluationrecord` (member; mutating), `reevaluationchanges` (admin, member, probe; read). Also the project-sight classes for `reevaluationnotices` (`holder`) and `reevaluationchanges` (`findings`, `contents`) in `PROJECT_NAMING_READS`, which is still legacy-store's.
10. **legacy-tests (layer 11):** reds this job adds on the old battery, measured against `tranche/T7`. All are pins on moved text or counts, and none is a behaviour change:
    - `versionnotice`: the C-80 family's row count (40/1).
    - `versionchain`: two source pins on `changedFromAudit` and `CHANGED_FROM_SENTENCE` (114/2).
    - `rec118-reeval-earned`: three more source pins on the moved resolver (23/6; the base is 26/3).
    - `severedhomes`: its callers count, re-pinned from 4 to 3 by this move (13/1 on both).
    - `check-firing`: C-10.1 through `checkBundle` (one new FAIL).
    - `derivation-bounds`: one more (the census and roster lose `reevaluations` and `changedFromAudit`; CLASS 30 → 28, CENSUS 161 → 159).
    - `d280-strengthbar`: SITE (c)'s source pin.
    - `reevaluation`: red on the base already (INQUIRY #1's J2.2), and unchanged.
    - The map §4 controls (`nc-d394`, `nc-rec118`, `nc-rec114`, `nc-rec119`) edit moved source.
11. **Generated artifacts (§14):** the plane bundle (its source) and agent-worker's bundle (`bio-checks.mjs` is an input, K189) are stale.
