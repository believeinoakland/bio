# membership (T38)

**Status** · session_01P83PRD8HPZGBJ9ET2KJie5 · depth 2 · WORKING · handled B0

## J1 · QUESTION

N793's `NO_SUCH_MEMBER` helper has no requirement id in `requirements/membership.md`, so coverage cannot name it and its shape is unstated. My best reading, which I am building now (carry on unless you say otherwise):

1. A module-level function `noSuchMember(memberId, extra?) → refusal`, in R84/R87's form: `{ok: false, reason: "NO_SUCH_MEMBER", code: "NO_SUCH_MEMBER", check, translation, member, detail}`, `member` the id as asked (null when none), `detail` one fixed sentence, `extra` adding a caller's own fields and never replacing these. Writes nothing, never throws. membership's eight mints answer through it.
2. Its row is in `MEMBERSHIP_CHECKS` with the next free number of C-96 (this module's family for the acts on a member's row): **C-96.39**, `where` naming `noSuchMember > is-no-such-member`, a generic translation true at every site ("No active member of your group answers to that name or id here. Nothing was changed."-style). instance-setup's C-64.18 (whose translation speaks of translating the screens, untrue at the other sites) is then dropped by T38-23 and never reused, not moved. The comment at `checks.mjs`:264 is corrected.
3. Please add a requirement id for it (e.g. R121, R84's form), so a test can name it; until then I name the test after N793.

Alternative if you prefer: keep the id C-64.18 and move it here with a new translation (NOT_AN_ADMIN's C-96.1 precedent of a moved row keeping its id).
