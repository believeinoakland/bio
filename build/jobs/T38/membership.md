# membership (T38)

**Status** · session_01P83PRD8HPZGBJ9ET2KJie5 · depth 2 · WORKING · handled B1

## J1 · QUESTION

N793's `NO_SUCH_MEMBER` helper has no requirement id in `requirements/membership.md`, so coverage cannot name it and its shape is unstated. My best reading, which I am building now (carry on unless you say otherwise):

1. A module-level function `noSuchMember(memberId, extra?) → refusal`, in R84/R87's form: `{ok: false, reason: "NO_SUCH_MEMBER", code: "NO_SUCH_MEMBER", check, translation, member, detail}`, `member` the id as asked (null when none), `detail` one fixed sentence, `extra` adding a caller's own fields and never replacing these. Writes nothing, never throws. membership's eight mints answer through it.
2. Its row is in `MEMBERSHIP_CHECKS` with the next free number of C-96 (this module's family for the acts on a member's row): **C-96.39**, `where` naming `noSuchMember > is-no-such-member`, a generic translation true at every site ("No active member of your group answers to that name or id here. Nothing was changed."-style). instance-setup's C-64.18 (whose translation speaks of translating the screens, untrue at the other sites) is then dropped by T38-23 and never reused, not moved. The comment at `checks.mjs`:264 is corrected.
3. Please add a requirement id for it (e.g. R121, R84's form), so a test can name it; until then I name the test after N793.

Alternative if you prefer: keep the id C-64.18 and move it here with a new translation (NOT_AN_ADMIN's C-96.1 precedent of a moved row keeping its id).

## J2 · REPORT

Phase 1 pushed on `job/T38/membership` @ 9f37ae62d5: project-roster can code against it.
- R116 `onProjectInvited(module, fn)`, R117 `onProjectHidden(module, fn)`: one registration each (R81), told inside the act after its writes (R117 after the reindex) with `{projectId, memberId, by, at}` / `{projectId, by, at}`; a whole number >= 1 is the count (`request: "granted"` / `requests_lapsed: n`), anything else, a throw or no listener reads 0. R32/R45 now close/lapse requests only through these (membership's inline `#lapseJoinRequests` call is gone; its copy of the request acts stays until your CHANGE).
- R118 `participationWrite(kind, {projectId, memberId, by, comment, at})` (`invite`, `ownerOn`, `ownerOff`, `rescue`), R119 `memberByHandle(handle)` (public; R32/R36 use it), R120 held by a test.
- N793: `noSuchMember(memberId, extra?)` exported, row C-96.39 (see my J1 QUESTION; building on that reading), all eight mints here through it.
- R83 re-pinned (`project-roster` after `membership`), module-order and t9 :188 green; tolerated by name as not yet built (T38_NEW) until T38-3 merges.
- R113: the existing bounded tests re-titled R113 (they were R82's).
Tests: membership 183/0 (`test/m/membership/` + `members.test.mjs`); also host-governor governor, instance-setup translations, tasks inbox, affordances t35-backing, control-plane, plane, answer-envelope, promotion: 554/0. Checks: format 0, architecture 0, ownership 0, coverage 85/87 (R114, R115 are phase 2, with the delete).

Two things for you (no action of mine):
1. Between my merge and T38-26 (plane, L11) nothing in the plane registers project-roster's R15/R16 listeners, so on the tranche an invitation will not close a request and hiding will not lapse requests; and once I delete the moved ops, `projectrequest*`, `projectdirectory`, `projectowner{add,remove,rescue}`, `projectvisibility`, `projectparticipants` leave `membershipOps` until plane spreads project-roster's map. Fine if intended; it is a window of L3–L10 where those ops are absent.
2. Pre-existing, not changed: `adminEndorse` and `adminRemove` answer NO_SUCH_MEMBER (and other target facts) before the caller's standing, against REC-159's own comment (index.mjs ~2117–2128) that standing comes first so nobody can probe the roster; t14-rows-remedy-order.test.mjs:198 pins R6's order. A requirement question, not mine to change; for next.md if you agree.
Size now 4084 lines (before the delete). Waiting on your CHANGE (project-roster merged) and the J1 answer.
