# membership (T52)

**Status** · session_018BhcefkQnJJfBgtYuqcBsn · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

# membership · T52 report

**Entries applied.** T52-7 (W4, A-K8 (b)(c)): `projectInvite` resolves the founder's held handle to `admin` before `memberByHandle` (which is unchanged, R48), then refuses in order `THAT_IS_YOU`, `NOT_ACTIVE`, `ALREADY_INVITED` (invited, not joined), `ALREADY_A_PARTICIPANT` (joined or leaving). Each refusal carries a `detail` written with `localize`. Tests: new `t52-invite-refusals.test.mjs`. Two earlier tests that pinned the old codes (`participation.test.mjs`, `t45-project-guard.test.mjs`) now assert the R157 codes. Module tests and `members.test.mjs`: 191 pass.

**Not done / for other modules.**
- `project-roster/index.mjs` `projectOwnerAdd` (the owner-add arm named in the entry) still resolves with `memberByHandle`, so the founder's handle answers `NO_SUCH_HANDLE` and an invited-not-joined target answers `TARGET_NOT_JOINED`. That is project-roster's module job.
- Three new words (`membership.index.that_handle_is_yours`, `...that_member_is_already_invited`, `...that_member_is_already_in`) are not yet in setup-words' generated `rows.mjs`; its build step regenerates them at merge. The design sentences for A-K8 are owed (N829).

**Met** · R157

Tests: 191/191. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefkQnJJfBgtYuqcBsn): test runs 1, module lines 1685

## Completion (2026-10-27)

# membership · T52 report

**Entries applied.** T52-7 (W4, A-K8 (b)(c)): `projectInvite` resolves the founder's held handle to `admin` before `memberByHandle` (which is unchanged, R48), then refuses in order `THAT_IS_YOU`, `NOT_ACTIVE`, `ALREADY_INVITED` (invited, not joined), `ALREADY_A_PARTICIPANT` (joined or leaving). Each refusal carries a `detail` written with `localize`. Tests: new `t52-invite-refusals.test.mjs`. Two earlier tests that pinned the old codes (`participation.test.mjs`, `t45-project-guard.test.mjs`) now assert the R157 codes. Module tests and `members.test.mjs`: 191 pass.

**Not done / for other modules.**
- `project-roster/index.mjs` `projectOwnerAdd` (the owner-add arm named in the entry) still resolves with `memberByHandle`, so the founder's handle answers `NO_SUCH_HANDLE` and an invited-not-joined target answers `TARGET_NOT_JOINED`. That is project-roster's module job.
- Three new words (`membership.index.that_handle_is_yours`, `...that_member_is_already_invited`, `...that_member_is_already_in`) are not yet in setup-words' generated `rows.mjs`; its build step regenerates them at merge. The design sentences for A-K8 are owed (N829).

**Met** · R157

Tests: 191/191. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcefkQnJJfBgtYuqcBsn): test runs 2, module lines 1685
