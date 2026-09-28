# inquiry (T10)

**Status** · session_01HRS6LAssjHFRPkTUcmR4Aq · depth 2 · WORKING · handled B3

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
