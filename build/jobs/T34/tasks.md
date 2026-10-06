# tasks (T34)

**Status** · session_011DdbtwJUhTwJan4dKnywad · depth 2 · RUNNING until 2026-10-06T22:39:20Z (queue, control-plane, plane tests at HEAD and at tranche/T34 (users of tasks)) · handled B2

## J1 · QUESTION

Readings of R3, R13–R17 I am building on; each is BOB's to change. None stops the job.

1. **Check family id.** R17's rows need a family. Free ids on `tranche/T34` after C-137 (following): I take **C-138** (`bio-plane/src/tasks/checks.mjs`, already in control-plane's `CHECK_FAMILY_FILES`), rows `awaiting stamp` (accepted red 4). If another L11 job has claimed C-138, name the id and I re-key.
2. **The taker's own To do and `taskResolve` (R3).** "The taker's To do closes only by R15's record": `taskResolve` on it by anyone is refused with a new code, `CHECK_CLOSES_BY_RECORD` (its C-138 row), writing nothing. An addressee's untaken To do resolves through R3 as any task (assignee, or an administrator), closing that To do only.
3. **A taker or checker who is not an `active` member** (R14 "any active member"): answered `NO_SUCH_CHECK_REQUEST`, the one answer R14 gives for a request the caller may not act on. Sight for `checkRequest`, `checkTake`, `checkRecord` is `membership.inSight(target, "member:<by>")`.
4. **The requester among the addressees** (R13): addressed if `checkAddressees` answers them, as R13 states; not filtered out.
5. **`label` and `member` presence** (R13 `CHECK_ADDRESS_ONE`): a key counts as given unless null or absent, so `label: ""` with no member is `EXPERTISE_NO_LABEL` (membership's answer, passed through as it gives it); `member: ""` is `CHECK_MEMBER_REFUSED`.
6. **`expertise` (R15):** latest `expertiseList` event `confirmed` → `confirmed`; `declared` → `self-declared`; `withdrawn` (a confirmation withdrawn) or none → null, as `checkAddressees` reads `withdrawn` as not declared.
7. **The task grammar C-19.1 is unchanged** (`TASK_KIND_ENUM` stays `authority-undetermined`; R12 and grammar.test pin its words). `check-requested` To dos are written by the check acts, never by the drain, and never pass through C-19.1. The store's unique index "one live task per (refers_to, kind)" is narrowed to exclude `check-requested` (one To do per addressee per request on the same target): the old index is dropped and recreated with the narrower `WHERE`, idempotent at migrate.
8. **Ids:** a request is `chkreq-<16 random [a-z0-9]>`, a check `chk-<16>`; the To dos are TASK ids from record-core's opaque mint, as the drain mints them.
9. **History of a closed To do (R14):** `{at, event: "taken", actor: <taker id>, handle: <taker handle>}` appended, status `resolved`, `resolved_at` the take's instant.
