# inquiry (T10)

**Status** · session_01HRS6LAssjHFRPkTUcmR4Aq · depth 2 · COMPLETE · handled B3

## J1 · REPORT

Early push for N186, as B1 asks: `actNoBasis(detail, extra?)` is now exported from `bio-plane/src/inquiry/index.mjs` (R45), at 104a5ad087 on `job/T10/inquiry`. `extra` now joins first, so it can never replace the refusal's own fields (R45's text; it could before). Tested by `test/m/inquiry/nobasis.test.mjs`; the module's 52 tests pass. basis-versions can import it once you merge me. The rest of the job continues on this branch.

## J2 · QUESTION

**N149 (R44: recording `member_user_agent` at creation). Where it is recorded, and from what.**

The trouble with R44's words ("the member-browser agent the inquiry's document records ... recorded when the inquiry is created"): an inquiry is created by `promotion.promote` from bytes the caller wrote, and a promotion step (promotion R39) may check and project but never rewrite those bytes. So inquiry cannot put the agent *into the document* at creation; only the author (the UI) or the control plane could, and a document line the caller writes is a claim the caller can invent (the same reason `migrationReplay` and `assistantPrincipal` are the control plane's stamps).

My reading, which I am building now:
1. The control plane stamps `memberUserAgent` on the promotion package, like `migrationReplay`: deleted first from every caller's body, and set only for a creation that arrives through a member's session, from that request's `User-Agent` header (the member's browser). That is one line in `legacy-index` (`src/index.mjs`, beside `migrationReplay`), not mine: I will REPORT it.
2. inquiry's projection (R12), on the creation of an inquiry (no head) that is not a replay and carries the stamp (a non-empty string, trimmed, at most 512 characters), writes it to a new table of its own, `inquiry_member_agents (bundle_id PRIMARY KEY, user_agent, at)`, declared to purge (R36). Never overwritten by a later revision. A division's children carry their parent's recorded agent (they are the same question asked in the same browser).
3. `memberUserAgent(id)` answers the recorded stamp; else, for an inquiry created before this, the document's own `member_user_agent` as today; else null. Never a default, never throws.

Proposed R44 text: "`memberUserAgent(id)` answers the member-browser agent recorded when the inquiry was created: the control plane's `memberUserAgent` stamp on the creating promotion (SOURCE-ACCESS; trimmed, at most 512 characters), which a division's children carry from their parent; else the agent its document records (`member_user_agent`, trimmed); else null, never a default. It never throws." And R36 gains `inquiry_member_agents`.

The alternative is that the UI (or the control plane) writes `member_user_agent:` into the creating document's bytes, and inquiry changes nothing; then R44's "recorded at creation" is legacy-index's or the UI's to build, not mine.

## J3 · QUESTION

**N183 (3) and R18: `exclusionsNaming` has a caller, so I have kept it.** N183 says it has none and R18 is marked retired on that ground. Measured on `tranche/T10` @ the merge I took (459c6711ee): `publication` calls it (`src/publication/index.mjs` 3073, `excludedBy`, publication R12 "from `inquiry`'s live exclusions"; its Uses names "`inquiry`: `exclusionsNaming` (R12)"), and `test/m/ratification/fixture.mjs` stubs it. Deleting it turned three of publication's module tests red (`test/m/publication/`: 47/3, R3, R12, R29: "this.inquiry.exclusionsNaming is not a function"). legacy-store's `excludedBy` is gone; publication's is the one that reads mine.

My reading, built and pushed (f9c71352c7): R18 is live again, and N183 (2)'s bound applies to it as to R41: every exclusion is still answered (publication R12 says "every case"), read a page at a time, at most 500 rows per statement, in (inquiry, ord) order. Tests: R18's arm restored, plus a paging arm (1,050 rows over three statements). Inquiry 59/59 and publication 53/53 pass.

Proposed R18 text (un-retiring it): "**R18** `exclusionsNaming(targetId, viewer)` answers every exclusion (`inquiry_exclusions`) naming the target that the viewer may see, each with its inquiry, edition, description, reason, author and date, in (inquiry, ord) order, read at most 500 rows per statement; an empty id answers an empty list and an absent viewer fails closed (R33). For `publication` (its R12)."

If you rule instead that it goes, publication's `excludedBy` needs its own read of `inquiry_exclusions` (R40 would have to name that table in the read contract) before I delete it.

## J4 · REPORT

Found while applying N160; neither is mine to change.

1. **reevaluation** (its R8, against inquiry R42): its registration `inquiry.onRaised("reevaluation", … => r.raise({…}).raised)` (`src/reevaluation/index.mjs` 1167–1168) answers only the dependents, so its own `listeners_failed` never reaches a deferral's, a division's or a re-read's reply. Inquiry now carries a listener's answer `{raised, listeners_failed}` unchanged as `reevaluation.listeners_failed` (a bare array still reads as the dependents). The fix is one line there: answer `r.raise({…})` whole instead of `.raised`. Until then R8's "the act's reply names it under `reevaluation.listeners_failed`" holds for reopen but not for dispose, divide or a re-read. reevaluation's module tests pass either way (39/39).
2. **citation** (for its job, if not already known): on `tranche/T10` before my changes, `test/m/citation/` is 47/2 red (R5 "true exactly when the current state is retired…" and R6 "a citation exists only in the citing document's bytes…"). Unchanged by this job.

## J5 · COMPLETE

**Applied** (T10, layer 6; `tranche/T10` merged through B3):
- **N186 / R45**: `actNoBasis(detail, extra?)` exported (J1, pushed early); `extra` now joins first, so it never replaces the refusal's own fields.
- **N183**: (1) C-106.1's `where` names `#dispose > is-dispose-shared`. (2) `projectsDrawingOn` reads candidates a page at a time, at most 32 drawing on a member (`PROJECTS_DRAWING_MAX`), the first by id, with `truncated`; a severed citer takes no slot, so the bound never decides "more than one"; the R39 refusal says `truncated` and `bound` when its list was cut. `staled` reads the stale rows past the bound and the legs a page at a time, at most 500 per statement (`STALE_PAGE`), in (bundle, ord) order. (3) `exclusionsNaming` is kept (J3, K335: publication calls it) and paged the same way (R18 live again).
- **N160 / R42**: an `onRaised` listener's answer `{raised, listeners_failed}` is carried as `reevaluation.listeners_failed` through dispose, divide and a re-read; a throwing listener is named there and undoes nothing.
- **N202 / R42**: `onRaised` and `onGrounded` refuse through membership's `listenerRefusal` (R81), each a one-registration slot; `MODULE_ORDER` does not apply to a slot that takes one registration.
- **N149 / R44, R36** (J2, K334): the control plane's `memberUserAgent` stamp is recorded at an inquiry's creation in `inquiry_member_agents` (purge-declared; trimmed, at most 512 characters, no control characters; never overwritten; carried to a division's children); `memberUserAgent` answers it, else the document's `member_user_agent`, else null.
- **N142, N99, N151**: nothing left in inquiry. N142's inquiry share (`subjectEntityOf`, `onRaised`, `memberUserAgent`) was built in T7 (R42–R44). N99's narrow act is basis-versions'; inquiry reads no `extentRelation`. N151: extraction R58 now names `reading_text_source.chain`, which the earned registry reads as that contract states.
- **Own-module improvement**: inquiry imported retrieval's `SELECTION_ID_CHUNK`, which retrieval does not provide; it now holds its own `ID_CHUNK` (64, K57).

**Deferred**, with why: R31 (MK-5, K181: no opinion element exists yet). R36's move of the three `bundles` columns (N136, not in this plan).

**Found in other modules**: J4 (REPORT): reevaluation's registration drops its own `listeners_failed` (a one-line fix on its side); citation's two reds on `tranche/T10` before this job. No generated artifact is made stale (inquiry is in no member bundle).

**Tests and checks** (after merging `tranche/T10` through B3):
- `node --test bio-plane/test/m/inquiry/`: 59 tests, 59 pass, 0 fail. No layer tests are named in the manifest.
- The modules that use inquiry: `test/m/publication/` 53 pass, `reevaluation/` 39, `affordances/` 73, `case-authoring/` 38, `actions/` 30, `conformance/` 29, `consequences/` 22, all 0 fail; `citation/` 47/2, red on the base too (J4).
- `format`: 0 failures. `architecture … inquiry`: 0 failures. `coverage … inquiry`: 45 of 45 live ids named, 0 failures. `ownership … inquiry tranche/T10`: 8 files, legacy-store and legacy-checks 0 lines added or removed, 0 failures.

Size (session_01HRS6LAssjHFRPkTUcmR4Aq): test runs 16, module lines 3090
