# project-roster (T52)

**Status** · session_018BhcegMxh4iiztuNYqgHTJ · depth 2 · COMPLETE
**Sessions** · 1

## Completion (2026-10-27)

Entries applied: T52-99 (R45). `projectOwnerAdd`, `projectOwnerRemove` and `projectOwnerRescue` resolve a handle through one private `#memberOfHandle`: the founder's held handle (`member-roster` R59) answers the founder (`admin`, active), otherwise membership's `memberByHandle`. The acts then judge her as any member (TARGET_NOT_JOINED, ALREADY_AN_OWNER, NOT_AN_OWNER, rescue adds her as a joined owner). Test: `bio-plane/test/m/project-roster/founder-owner-handle.test.mjs` (add, remove and rescue, with the NO_SUCH_HANDLE control). Module suite: 129 pass, 0 fail.

Not done: nothing. Found in other modules: nothing.

**Met** · R45

Tests: 129/129. Checks: format, architecture, coverage, fixtures, words, ownership: no new finding.
Size (session_018BhcegMxh4iiztuNYqgHTJ): test runs 1, module lines 1729
