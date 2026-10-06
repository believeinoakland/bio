# credentials (T34)

**Status** · session_01D95uD2Xpjm9FPP1885hMkL · depth 2 · RUNNING until 2026-10-06T16:58:16Z (users' test suites, mine and the tranche's) · handled B4

## J1 · QUESTION

R34 asks the group key's table to be declared `export: "never"`, `sight: "admin"`. record-core's R21 (and its code, `index.mjs` ~1340) admits only `group`, `bundle`, `source` and `owner` for `sight`, so `declareTable` would refuse `TABLE_CLASS_UNKNOWN` and this module's start would throw.

**My best reading, which I am building now:** declare the group key's tables `export: "never"`, `sight: "group"` (as `keyed_services` is today). The key is never answered by any read, export or log whatever its sight; `groupKeyState` itself gives the full state to administrators only and `{on}` to other members (R34), so the administrator-only sight is enforced by the service, not by the class. If you want `sight: "admin"` as a class, it is a record-core R21 change (its job), and I would switch the declaration once it lands.

Two smaller readings, built the same way unless you say otherwise:
1. R36 `groupKeyNotice({member})` answers `due: true` exactly while the member has not recorded `groupKeyNoticeSeen`, whatever the group key's state; R35 refuses `GROUP_KEY_NOTICE_DUE` only on the group-key branch (a member's own reference is never held back by it). R32's standing mint does not refuse on the notice (R32's list of refusals does not name it); the model call goes through `accountFor`, which does.
2. R34: an active member who is not an administrator gets `{ok, on}` only; the group key's two switches (R37) are answered to administrators alone. A viewer who is not an active member is refused `NOT_AN_ADMIN` (through `membership.notAnAdmin`), writing nothing.
